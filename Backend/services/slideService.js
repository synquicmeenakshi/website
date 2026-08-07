/**
 * Slide (Synquic) — WhatsApp and email delivery.
 *   https://slide.synquic.com/developers
 *
 * Both channels are TEMPLATE-based. WhatsApp only accepts templates approved
 * through the dashboard, and email sends by templateId. Neither takes free-form
 * content, so the copy for client-facing messages lives in Slide, not here —
 * this module only supplies the variables.
 *
 * Everything is env-gated and fire-and-forget. A missing key, an unapproved
 * template or a 429 must never fail a booking: the consultation is already
 * persisted by the time any of this runs, and losing a booking to a messaging
 * error would repeat a bug this project has already had once.
 */

const BASE = process.env.SLIDE_BASE_URL || 'https://slide.synquic.com/api/v1';
const KEY = process.env.SLIDE_API_KEY || '';

const isConfigured = () => Boolean(KEY);

const cfg = {
  waTemplate: process.env.SLIDE_WA_TEMPLATE_BOOKING || '',
  waLang: process.env.SLIDE_WA_TEMPLATE_LANG || 'en',
  emailTemplate: process.env.SLIDE_EMAIL_TEMPLATE_BOOKING || '',
  fromName: process.env.SLIDE_EMAIL_FROM_NAME || 'Meenakshi',
  fromEmail: process.env.SLIDE_EMAIL_FROM_EMAIL || '',
  adminWaTemplate: process.env.SLIDE_WA_TEMPLATE_ADMIN || '',
  adminEmailTemplate: process.env.SLIDE_EMAIL_TEMPLATE_ADMIN || '',
  adminPhone: process.env.ADMIN_PHONE_NUMBER || '',
  adminEmail: process.env.ADMIN_EMAIL || ''
};

/** E.164 without the leading '+', which is what the API expects. */
function toE164(raw, defaultCountry = '91') {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  // A bare 10-digit Indian mobile arrives without a country code.
  if (digits.length === 10) digits = defaultCountry + digits;
  // Strip a leading 0 before the country code (0091…).
  digits = digits.replace(/^0+/, '');
  return digits;
}

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let payload = null;
  try { payload = JSON.parse(text); } catch (_) { payload = { raw: text }; }

  if (!res.ok) {
    const err = new Error(payload?.message || payload?.error || `Slide HTTP ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

/**
 * POST /whatsapp/send-template
 * @param {string} to        phone, any format
 * @param {string} templateName
 * @param {string[]} variables ordered body variables
 */
async function sendWhatsApp(to, templateName, variables = [], languageCode) {
  const phone = toE164(to);
  if (!phone) throw new Error('No usable phone number');
  if (!templateName) throw new Error('No WhatsApp template configured');

  return call('/whatsapp/send-template', {
    to: phone,
    templateName,
    languageCode: languageCode || cfg.waLang,
    components: variables.length
      ? [{ type: 'body', parameters: variables.map((v) => ({ type: 'text', text: String(v ?? '') })) }]
      : undefined
  });
}

/**
 * POST /email/send
 * @param {object} recipient { to, firstName }
 * @param {object} variables template variables
 */
async function sendEmail(recipient, templateId, variables = {}) {
  if (!recipient?.to) throw new Error('No recipient email');
  if (!templateId) throw new Error('No email template configured');

  return call('/email/send', {
    templateId,
    recipient,
    variables,
    fromName: cfg.fromName,
    ...(cfg.fromEmail ? { fromEmail: cfg.fromEmail } : {})
  });
}

/* ---- booking notifications ---------------------------------------------- */

const fmtDate = (iso, timeZone = 'Asia/Kolkata') => {
  if (!iso) return '';
  try {
    const [y, m, d] = String(iso).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', {
      timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (_) { return iso; }
};

/**
 * Fire the client's confirmations. Never throws.
 *
 * WhatsApp is the "prompt update" — short, template variables only.
 * Email is the "detailed update" — the template carries the long copy.
 */
function notifyBooking(consultation, { serviceTitle = '', timezone = 'Asia/Kolkata' } = {}) {
  if (!isConfigured()) {
    console.log(`📣 Slide not configured — skipping notifications for consultation ${consultation._id}`);
    return;
  }

  const when = `${fmtDate(consultation.appointmentDate)} at ${consultation.appointmentTime} ${timezone}`;

  // --- WhatsApp: prompt update -------------------------------------------
  if (consultation.phone && cfg.waTemplate) {
    sendWhatsApp(consultation.phone, cfg.waTemplate, [
      consultation.name,
      serviceTitle || consultation.area,
      fmtDate(consultation.appointmentDate),
      `${consultation.appointmentTime} ${timezone}`
    ]).then(
      (r) => console.log(`📲 WhatsApp confirmation sent (${r?.status || 'ok'}) for ${consultation._id}`),
      (e) => console.error(`WhatsApp confirmation failed for ${consultation._id}:`, e.message)
    );
  } else if (!cfg.waTemplate) {
    console.log('📲 SLIDE_WA_TEMPLATE_BOOKING not set — WhatsApp confirmation skipped');
  }

  // --- Email: detailed update --------------------------------------------
  if (consultation.email && cfg.emailTemplate) {
    sendEmail(
      { to: consultation.email, firstName: String(consultation.name || '').split(' ')[0] },
      cfg.emailTemplate,
      {
        name: consultation.name,
        service: serviceTitle || consultation.area,
        date: fmtDate(consultation.appointmentDate),
        time: consultation.appointmentTime,
        timezone,
        when,
        duration: String(consultation.durationMinutes || ''),
        amount: consultation.amount ? String(consultation.amount) : '',
        paymentStatus: consultation.paymentStatus,
        reference: String(consultation._id),
        dob: consultation.dob,
        tob: consultation.tob,
        pob: consultation.pob,
        language: consultation.language
      }
    ).then(
      () => console.log(`📧 Email confirmation sent for ${consultation._id}`),
      (e) => console.error(`Email confirmation failed for ${consultation._id}:`, e.message)
    );
  } else if (!cfg.emailTemplate) {
    console.log('📧 SLIDE_EMAIL_TEMPLATE_BOOKING not set — email confirmation skipped');
  }

  // --- Admin alert (optional) --------------------------------------------
  if (cfg.adminWaTemplate && cfg.adminPhone) {
    sendWhatsApp(cfg.adminPhone, cfg.adminWaTemplate, [
      consultation.name,
      serviceTitle || consultation.area,
      when
    ]).catch((e) => console.error('Admin WhatsApp alert failed:', e.message));
  }
  if (cfg.adminEmailTemplate && cfg.adminEmail) {
    sendEmail({ to: cfg.adminEmail, firstName: 'Admin' }, cfg.adminEmailTemplate, {
      name: consultation.name,
      service: serviceTitle || consultation.area,
      when,
      contact: consultation.phone || consultation.email,
      reference: String(consultation._id)
    }).catch((e) => console.error('Admin email alert failed:', e.message));
  }
}

module.exports = { isConfigured, sendWhatsApp, sendEmail, notifyBooking, toE164, cfg };

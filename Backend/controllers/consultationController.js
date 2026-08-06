/**
 * Consultation requests from the public booking form.
 *
 * Notification rule: a failed or unconfigured email must NEVER fail the
 * booking. Email credentials are frequently blank in this project, and the
 * form previously discarded every submission — losing one to an SMTP error
 * would repeat that bug in a new place. Sends are therefore fire-and-forget
 * after the document is safely persisted.
 */

const Consultation = require('../models/Consultation');
const MeenakshiService = require('../models/MeenakshiService');
const transporter = require('../config/emailConfig');
const availability = require('../services/availabilityService');

const emailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

function adminHtml(c) {
  const row = (label, value) => value
    ? `<tr><td style="padding:6px 14px 6px 0;color:#6b6b6b;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#111">${esc(value)}</td></tr>`
    : '';
  return `
    <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:24px">
      <p style="color:#9a7b2f;letter-spacing:.14em;text-transform:uppercase;font-size:12px;margin:0 0 4px">New consultation request</p>
      <h2 style="margin:0 0 20px;font-weight:500;color:#111">${esc(c.name)}</h2>
      <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px;width:100%">
        ${row('Contact', c.contact)}
        ${row('Area', c.area)}
        ${row('Language', c.language)}
        ${row('Preferred date', c.preferredDate)}
        ${row('Date of birth', c.dob)}
        ${row('Time of birth', c.tob)}
        ${row('Place of birth', c.pob)}
        ${row('Notes', c.notes)}
      </table>
      <p style="margin-top:24px;font-family:system-ui,sans-serif;font-size:12px;color:#6b6b6b">
        Received ${new Date(c.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST ·
        Reference ${esc(String(c._id))}
      </p>
    </div>`;
}

function clientHtml(c) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px">
      <p style="color:#9a7b2f;letter-spacing:.14em;text-transform:uppercase;font-size:12px;margin:0 0 4px">धन्यवाद</p>
      <h2 style="margin:0 0 16px;font-weight:500;color:#111">Your request has been received</h2>
      <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#333">
        Thank you, ${esc(c.name)}. We will confirm your appointment and send a secure payment link
        by WhatsApp and email within one working day.
      </p>
      <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#333">
        Consultation area: <strong>${esc(c.area)}</strong>
      </p>
      <p style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.6;color:#6b6b6b;margin-top:24px">
        Your details are held in strict confidence and are used only to prepare your reading.
      </p>
    </div>`;
}

function notify(consultation) {
  if (!emailConfigured()) {
    console.log(`📧 Email not configured — skipping notification for consultation ${consultation._id}`);
    return;
  }

  const adminTo = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: adminTo,
    subject: `New consultation request — ${consultation.name} (${consultation.area})`,
    html: adminHtml(consultation)
  }).catch((err) => console.error('Admin notification failed:', err.message));

  // The form accepts a phone number instead of an email, so an acknowledgement
  // is only possible for some requests.
  if (consultation.contactType === 'email' && isEmail(consultation.contact)) {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: consultation.contact,
      subject: 'Your consultation request — Meenakshi',
      html: clientHtml(consultation)
    }).catch((err) => console.error('Client acknowledgement failed:', err.message));
  }
}

/** GET /api/consultations/slots?date=YYYY-MM-DD — public. */
const getSlots = async (req, res) => {
  try {
    const { date, from, days, service, duration } = req.query;

    // Duration comes from the service record so the client cannot shorten a
    // booking to squeeze into a slot it does not fit.
    let mins = Number(duration) || 0;
    if (service) {
      const svc = await MeenakshiService.findOne({ slug: service, isActive: true }).select('duration').lean();
      if (svc) mins = svc.duration || 0;
    }

    if (from) {
      const range = await availability.slotsForRange(from, Number(days) || 30, mins);
      return res.json({ success: true, data: range });
    }
    const result = await availability.slotsForDate(date, mins);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/consultations/window — public. Earliest/latest bookable dates. */
const getWindow = async (req, res) => {
  try {
    res.json({ success: true, data: await availability.getWindow() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/consultations — public. */
const createConsultation = async (req, res) => {
  try {
    const {
      name, contact, dob, tob, pob,
      area, language, preferred, preferredDate, notes, consent,
      appointmentDate, appointmentTime, serviceSlug
    } = req.body;

    // Price and duration come from the service record, never from the request
    // body — otherwise a caller could set their own fee or shorten a session
    // to fit a slot it does not fit into.
    let amount = 0;
    let currency = 'INR';
    let durationMinutes = 0;
    if (serviceSlug) {
      const service = await MeenakshiService.findOne({ slug: serviceSlug, isActive: true }).lean();
      if (service) {
        amount = service.price || 0;
        currency = service.currency || 'INR';
        durationMinutes = service.duration || 0;
      }
    }

    // Never trust the client's view of availability — re-check server-side,
    // and check the whole duration, not just the start time.
    if (appointmentDate && appointmentTime) {
      const bookable = await availability.isSlotBookable(appointmentDate, appointmentTime, durationMinutes);
      if (!bookable) {
        return res.status(409).json({
          success: false,
          message: 'That time has just been taken. Please choose another slot.',
          code: 'SLOT_UNAVAILABLE'
        });
      }
    }

    const consultation = await Consultation.create({
      name,
      contact,
      dob,
      tob,
      pob,
      area,
      language: language || 'English',
      // the form field is named `preferred`; accept either
      preferredDate: preferredDate || preferred || '',
      notes: notes || '',
      consent: Boolean(consent),
      appointmentDate: appointmentDate || '',
      appointmentTime: appointmentTime || '',
      serviceSlug: serviceSlug || '',
      durationMinutes: durationMinutes || undefined,
      amount,
      currency,
      paymentStatus: amount > 0 ? 'pending' : 'not_required',
      source: 'meenakshi-web'
    });

    // Persisted — the request is safe from here on. Notify out of band.
    notify(consultation);

    res.status(201).json({
      success: true,
      message: 'Consultation request received',
      data: {
        id: consultation._id,
        status: consultation.status,
        amount: consultation.amount,
        currency: consultation.currency,
        paymentStatus: consultation.paymentStatus,
        appointmentDate: consultation.appointmentDate,
        appointmentTime: consultation.appointmentTime
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const fields = Object.keys(error.errors).reduce((acc, k) => {
        acc[k] = error.errors[k].message;
        return acc;
      }, {});
      return res.status(400).json({ success: false, message: 'Validation failed', fields });
    }
    console.error('createConsultation error:', error);
    res.status(500).json({ success: false, message: 'Could not submit your request' });
  }
};

/** GET /api/consultations — admin. */
const getAllConsultations = async (req, res) => {
  try {
    const { status, search, limit = 200 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: re }, { contact: re }, { area: re }, { pob: re }];
    }

    const consultations = await Consultation.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500))
      .lean();

    const counts = await Consultation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byStatus = counts.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {});

    res.json({ success: true, count: consultations.length, byStatus, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/consultations/:id — admin. */
const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id).lean();
    if (!consultation) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PATCH /api/consultations/:id — admin: status, confirmed slot, notes. */
const updateConsultation = async (req, res) => {
  try {
    const allowed = ['status', 'confirmedDate', 'confirmedTime', 'adminNotes',
      'appointmentDate', 'appointmentTime', 'paymentStatus'];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!consultation) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** DELETE /api/consultations/:id — admin. */
const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSlots,
  getWindow,
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
};

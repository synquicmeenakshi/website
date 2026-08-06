/**
 * Contact-page enquiries. Same discipline as consultations: persist first,
 * notify out of band, never let a mail failure lose the message.
 */

const MeenakshiEnquiry = require('../models/MeenakshiEnquiry');
const transporter = require('../config/emailConfig');

const emailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function notify(e) {
  if (!emailConfigured()) {
    console.log(`📧 Email not configured — skipping notification for enquiry ${e._id}`);
    return;
  }
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New enquiry — ${e.name}${e.subject ? ` (${e.subject})` : ''}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:24px">
        <p style="color:#9a7b2f;letter-spacing:.14em;text-transform:uppercase;font-size:12px;margin:0 0 4px">New enquiry</p>
        <h2 style="margin:0 0 16px;font-weight:500;color:#111">${esc(e.name)}</h2>
        <p style="font-family:system-ui,sans-serif;font-size:14px;color:#333">
          ${e.email ? `Email: ${esc(e.email)}<br/>` : ''}
          ${e.phone ? `Phone: ${esc(e.phone)}<br/>` : ''}
          ${e.subject ? `Subject: ${esc(e.subject)}` : ''}
        </p>
        <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111;white-space:pre-wrap">${esc(e.message)}</p>
      </div>`
  }).catch((err) => console.error('Enquiry notification failed:', err.message));
}

/** POST /api/enquiries — public. */
const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const enquiry = await MeenakshiEnquiry.create({
      name, email: email || '', phone: phone || '',
      subject: subject || '', message
    });
    notify(enquiry);
    res.status(201).json({ success: true, message: 'Enquiry received', data: { id: enquiry._id } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const fields = Object.keys(error.errors).reduce((a, k) => { a[k] = error.errors[k].message; return a; }, {});
      return res.status(400).json({ success: false, message: 'Validation failed', fields });
    }
    // pre('validate') hook throws a plain Error for the contact requirement
    if (/email address or phone/i.test(error.message || '')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('createEnquiry error:', error);
    res.status(500).json({ success: false, message: 'Could not send your message' });
  }
};

/** GET /api/enquiries — admin. */
const getAllEnquiries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: re }, { email: re }, { phone: re }, { subject: re }, { message: re }];
    }
    const data = await MeenakshiEnquiry.find(query).sort({ createdAt: -1 }).limit(500).lean();
    const counts = await MeenakshiEnquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({
      success: true, count: data.length,
      byStatus: counts.reduce((a, c) => { a[c._id] = c.count; return a; }, {}),
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PATCH /api/enquiries/:id — admin. */
const updateEnquiry = async (req, res) => {
  try {
    const payload = {};
    for (const k of ['status', 'adminNotes']) if (req.body[k] !== undefined) payload[k] = req.body[k];
    const doc = await MeenakshiEnquiry.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** DELETE /api/enquiries/:id — admin. */
const deleteEnquiry = async (req, res) => {
  try {
    const doc = await MeenakshiEnquiry.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createEnquiry, getAllEnquiries, updateEnquiry, deleteEnquiry };

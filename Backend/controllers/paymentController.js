/**
 * Razorpay payments for consultation bookings.
 *
 * The consultation is always persisted BEFORE payment is attempted. A failed,
 * cancelled or abandoned checkout therefore still leaves a record an admin can
 * follow up. This project has already lost every enquiry once by treating the
 * form as fire-and-forget; the payment step must not reintroduce that.
 *
 * If Razorpay keys are absent the endpoints report `configured: false` and the
 * booking is marked `not_required`, so the practice keeps taking bookings while
 * gateway onboarding is pending.
 */

const crypto = require('crypto');
const Consultation = require('../models/Consultation');

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const isConfigured = () => Boolean(KEY_ID && KEY_SECRET);

let razorpay = null;
function client() {
  if (!isConfigured()) return null;
  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  }
  return razorpay;
}

/** GET /api/payments/config — public. Lets the page know whether to show checkout. */
const getConfig = (req, res) => {
  res.json({ success: true, configured: isConfigured(), keyId: isConfigured() ? KEY_ID : null });
};

/**
 * POST /api/payments/order — public.
 * body: { consultationId }
 */
const createOrder = async (req, res) => {
  try {
    const { consultationId } = req.body;
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (consultation.paymentStatus === 'paid') {
      return res.status(409).json({ success: false, message: 'This booking is already paid' });
    }

    if (!isConfigured()) {
      // No gateway yet — let the booking stand rather than blocking it.
      consultation.paymentStatus = 'not_required';
      await consultation.save();
      return res.json({
        success: true, configured: false,
        message: 'Payments are not configured; booking recorded without payment',
        data: { consultationId: consultation._id }
      });
    }

    const amount = Number(consultation.amount || 0);
    if (!amount || amount <= 0) {
      consultation.paymentStatus = 'not_required';
      await consultation.save();
      return res.json({
        success: true, configured: true, skipped: true,
        message: 'No fee is set for this consultation',
        data: { consultationId: consultation._id }
      });
    }

    const order = await client().orders.create({
      amount: Math.round(amount * 100),          // paise
      currency: consultation.currency || 'INR',
      receipt: `consult_${consultation._id}`,
      notes: { consultationId: String(consultation._id), area: consultation.area }
    });

    consultation.orderId = order.id;
    consultation.paymentStatus = 'pending';
    await consultation.save();

    res.json({
      success: true,
      configured: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: KEY_ID,
        consultationId: consultation._id,
        name: consultation.name,
        contact: consultation.contact
      }
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, message: 'Could not start payment' });
  }
};

/**
 * POST /api/payments/verify — public.
 * body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * The signature is HMAC-SHA256 of "order_id|payment_id" keyed with the secret.
 * Verified server-side: a client claiming success proves nothing.
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }
    if (!isConfigured()) {
      return res.status(503).json({ success: false, message: 'Payments are not configured' });
    }

    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time compare — lengths must match first or timingSafeEqual throws.
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(String(razorpay_signature), 'utf8');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

    const consultation = await Consultation.findOne({ orderId: razorpay_order_id });

    if (!valid) {
      if (consultation) {
        consultation.paymentStatus = 'failed';
        await consultation.save();
      }
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'No booking matches that order' });
    }

    consultation.paymentStatus = 'paid';
    consultation.paymentId = razorpay_payment_id;
    consultation.paidAt = new Date();
    if (consultation.status === 'new') consultation.status = 'confirmed';
    await consultation.save();

    res.json({
      success: true,
      message: 'Payment verified',
      data: { consultationId: consultation._id, status: consultation.status }
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, message: 'Could not verify payment' });
  }
};

/** GET /api/payments/summary — admin. Revenue for the dashboard. */
const getSummary = async (req, res) => {
  try {
    const paid = await Consultation.find({ paymentStatus: 'paid' }).select('amount paidAt').lean();
    const total = paid.reduce((s, c) => s + (c.amount || 0), 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = paid
      .filter((c) => c.paidAt && new Date(c.paidAt) >= monthStart)
      .reduce((s, c) => s + (c.amount || 0), 0);

    const counts = await Consultation.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      configured: isConfigured(),
      data: {
        totalRevenue: total,
        monthRevenue: thisMonth,
        paidCount: paid.length,
        byPaymentStatus: counts.reduce((a, c) => { a[c._id] = c.count; return a; }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConfig, createOrder, verifyPayment, getSummary, isConfigured };

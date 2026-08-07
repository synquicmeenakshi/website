const mongoose = require('mongoose');

/**
 * A consultation request from the public booking form.
 *
 * Deliberately NOT the massage Appointment model. The form collects a single
 * `name`, a single `contact` field that accepts either a phone number or an
 * email, and birth details (date/time/place) that have no home in Appointment.
 * It also never asks the visitor to pick a slot — the form promises
 * confirmation "within one working day", so requests arrive unscheduled and an
 * admin assigns the date and time when confirming.
 *
 * That is why appointmentDate/Time equivalents here are optional admin fields
 * (confirmedDate / confirmedTime) rather than required booking input.
 */
const consultationSchema = new mongoose.Schema({
  // --- what the visitor submits -------------------------------------------
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 200
  },
  // Email and phone are now collected separately: the confirmation flow needs
  // both channels (a prompt WhatsApp message and a detailed email), which a
  // single either/or field cannot support.
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
    maxlength: 200
  },
  phone: {
    type: String,
    default: '',
    trim: true,
    maxlength: 60
  },
  // Retained as the display/search value and for records created before the
  // split. Derived from email/phone on save when not supplied.
  contact: {
    type: String,
    default: '',
    trim: true,
    maxlength: 200
  },
  // Derived on save so admin can filter/sort, and so notifications know
  // whether an acknowledgement email is even possible.
  contactType: {
    type: String,
    enum: ['email', 'phone', 'unknown'],
    default: 'unknown',
    index: true
  },

  dob: {
    type: String,
    required: [true, 'Date of birth is required'],
    trim: true
  },
  tob: {
    type: String,
    required: [true, 'Time of birth is required'],
    trim: true
  },
  pob: {
    type: String,
    required: [true, 'Place of birth is required'],
    trim: true,
    maxlength: 300
  },

  area: {
    type: String,
    required: [true, 'Consultation area is required'],
    trim: true,
    maxlength: 200
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  preferredDate: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000
  },
  consent: {
    type: Boolean,
    default: false
  },

  // --- the slot the visitor picked ------------------------------------------
  // Distinct from confirmedDate/Time below: these are what the visitor chose at
  // booking time; the confirmed pair is what an admin may later reassign.
  appointmentDate: {
    type: String,     // 'YYYY-MM-DD'
    default: '',
    index: true
  },
  appointmentTime: {
    type: String,     // 'HH:mm'
    default: ''
  },
  serviceSlug: {
    type: String,
    default: ''
  },
  // Copied from the service at booking time, not read live: changing a
  // service's duration later must not silently move an existing booking's
  // end time and start overlapping its neighbour.
  durationMinutes: {
    type: Number,
    default: 60,
    min: 0
  },

  // --- payment ---------------------------------------------------------------
  // 'not_required' covers the window where Razorpay keys are not configured:
  // the practice keeps taking bookings rather than the form failing.
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'not_required'],
    default: 'pending',
    index: true
  },
  amount: {
    type: Number,     // in rupees, not paise
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  orderId: {
    type: String,
    default: '',
    index: true
  },
  paymentId: {
    type: String,
    default: ''
  },
  paidAt: {
    type: Date,
    default: null
  },

  // --- admin-side ----------------------------------------------------------
  status: {
    type: String,
    enum: ['new', 'confirmed', 'completed', 'cancelled'],
    default: 'new',
    index: true
  },
  confirmedDate: {
    type: String,
    default: ''
  },
  confirmedTime: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000
  },

  source: {
    type: String,
    default: 'meenakshi-web'
  }
}, { timestamps: true });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s+\-()]{7,}$/;

consultationSchema.pre('validate', function (next) {
  // At least one way to reach the client. Enforced here rather than with
  // `required` on both, because older records carry only `contact`.
  if (!this.email && !this.phone && !this.contact) {
    return next(new Error('An email address or phone number is required'));
  }
  next();
});

consultationSchema.pre('save', function (next) {
  // Keep `contact` populated so admin search and the customer grouping keep
  // working across both the old and new shapes.
  if (!this.contact) this.contact = this.email || this.phone || '';

  const c = String(this.contact || '').trim();
  if (this.email && EMAIL_RE.test(this.email)) this.contactType = 'email';
  else if (this.phone && PHONE_RE.test(this.phone)) this.contactType = 'phone';
  else if (EMAIL_RE.test(c)) this.contactType = 'email';
  else if (PHONE_RE.test(c)) this.contactType = 'phone';
  else this.contactType = 'unknown';

  next();
});

consultationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);

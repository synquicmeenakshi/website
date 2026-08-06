const mongoose = require('mongoose');

/**
 * Contact-page enquiries. Separate from Consultation: an enquiry is a question,
 * not a booking, and has no birth details or slot.
 */
const meenakshiEnquirySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 200 },
  email: { type: String, default: '', trim: true, lowercase: true, maxlength: 200 },
  phone: { type: String, default: '', trim: true, maxlength: 60 },
  subject: { type: String, default: '', trim: true, maxlength: 200 },
  message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 5000 },

  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
    index: true
  },
  adminNotes: { type: String, default: '', trim: true, maxlength: 5000 },
  source: { type: String, default: 'meenakshi-web' }
}, { timestamps: true });

// At least one way to reply must be present — the form asks for either.
meenakshiEnquirySchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('An email address or phone number is required'));
  }
  next();
});

meenakshiEnquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('MeenakshiEnquiry', meenakshiEnquirySchema);

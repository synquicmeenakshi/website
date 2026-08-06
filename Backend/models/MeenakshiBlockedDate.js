const mongoose = require('mongoose');

/**
 * Dates the practice is unavailable — either the whole day, or specific slots.
 * Stored as a 'YYYY-MM-DD' string rather than a Date to sidestep the timezone
 * drift that plagues date-only values.
 */
const meenakshiBlockedDateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    index: true
  },
  isFullDay: { type: Boolean, default: true },
  slots: { type: [String], default: [] },   // used when isFullDay is false
  reason: { type: String, default: '', trim: true, maxlength: 300 },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

meenakshiBlockedDateSchema.index({ date: 1, isActive: 1 });

module.exports = mongoose.model('MeenakshiBlockedDate', meenakshiBlockedDateSchema);

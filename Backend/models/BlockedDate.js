const mongoose = require('mongoose');

const blockedDateSchema = new mongoose.Schema({
  // The blocked date
  date: {
    type: Date,
    required: [true, 'Date is required']
  },

  // Specific time slots blocked (empty array means whole day is blocked)
  blockedTimeSlots: {
    type: [String],
    default: [] // Empty = whole day blocked, otherwise only these slots are blocked
  },

  // Is whole day blocked? (computed from blockedTimeSlots being empty)
  isFullDayBlocked: {
    type: Boolean,
    default: true
  },

  // Reason for blocking (optional)
  reason: {
    type: String,
    trim: true,
    default: ''
  },

  // Who blocked it
  blockedBy: {
    type: String,
    default: 'admin'
  },

  // Is it active (can be used to temporarily unblock)
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to set isFullDayBlocked based on blockedTimeSlots
blockedDateSchema.pre('save', function(next) {
  this.isFullDayBlocked = !this.blockedTimeSlots || this.blockedTimeSlots.length === 0;
  next();
});

// Index for faster queries (removed unique constraint since same date can have different time slots)
blockedDateSchema.index({ date: 1 });
blockedDateSchema.index({ isActive: 1 });
blockedDateSchema.index({ date: 1, blockedTimeSlots: 1 });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);

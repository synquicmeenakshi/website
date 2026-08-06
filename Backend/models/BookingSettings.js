const mongoose = require('mongoose');

// Schema for day-wise schedule
const dayScheduleSchema = new mongoose.Schema({
  isWorking: {
    type: Boolean,
    default: true
  },
  timeSlots: {
    type: [String],
    default: []
  }
}, { _id: false });

const bookingSettingsSchema = new mongoose.Schema({
  // Settings type identifier
  settingsType: {
    type: String,
    default: 'booking',
    unique: true
  },

  // Default time slots (fallback if day-specific not set)
  timeSlots: {
    type: [String],
    default: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30']
  },

  // Day-wise working schedule (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  weeklySchedule: {
    sunday: {
      type: dayScheduleSchema,
      default: { isWorking: false, timeSlots: [] }
    },
    monday: {
      type: dayScheduleSchema,
      default: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] }
    },
    tuesday: {
      type: dayScheduleSchema,
      default: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] }
    },
    wednesday: {
      type: dayScheduleSchema,
      default: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] }
    },
    thursday: {
      type: dayScheduleSchema,
      default: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] }
    },
    friday: {
      type: dayScheduleSchema,
      default: { isWorking: true, timeSlots: ['12:30', '1:30', '2:30', '3:30', '4:30', '5:30'] }
    },
    saturday: {
      type: dayScheduleSchema,
      default: { isWorking: false, timeSlots: [] }
    }
  },

  // Minimum advance booking (in hours)
  minAdvanceBooking: {
    type: Number,
    default: 24
  },

  // Maximum advance booking (in days)
  maxAdvanceBooking: {
    type: Number,
    default: 30
  },

  // Is booking enabled
  isBookingEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingSettings', bookingSettingsSchema);

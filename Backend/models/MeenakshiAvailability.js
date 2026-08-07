const mongoose = require('mongoose');

/**
 * The weekly consulting schedule — a singleton.
 *
 * Deliberately separate from Meenakshi's BookingSettings, which is bound to
 * the massage Appointment model and its Europe/Brussels assumptions. This one
 * is the source of truth for which slots the Meenakshi booking page offers.
 */
const daySchema = new mongoose.Schema({
  isWorking: { type: Boolean, default: true },
  slots: { type: [String], default: [] }   // 'HH:mm', 24-hour
}, { _id: false });

const DEFAULT_SLOTS = ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'];

const meenakshiAvailabilitySchema = new mongoose.Schema({
  settingsKey: { type: String, default: 'meenakshi', unique: true, index: true },

  weeklySchedule: {
    sunday: { type: daySchema, default: () => ({ isWorking: false, slots: [] }) },
    monday: { type: daySchema, default: () => ({ isWorking: true, slots: DEFAULT_SLOTS }) },
    tuesday: { type: daySchema, default: () => ({ isWorking: true, slots: DEFAULT_SLOTS }) },
    wednesday: { type: daySchema, default: () => ({ isWorking: true, slots: DEFAULT_SLOTS }) },
    thursday: { type: daySchema, default: () => ({ isWorking: true, slots: DEFAULT_SLOTS }) },
    friday: { type: daySchema, default: () => ({ isWorking: true, slots: DEFAULT_SLOTS }) },
    saturday: { type: daySchema, default: () => ({ isWorking: true, slots: DEFAULT_SLOTS }) }
  },

  slotMinutes: { type: Number, default: 60 },

  // The site tells visitors a consultation is prepared in advance, so the
  // earliest bookable day is offset rather than "today".
  leadTimeDays: { type: Number, default: 4 },

  // How far ahead the calendar opens.
  horizonDays: { type: Number, default: 60 },

  timezone: { type: String, default: 'Asia/Kolkata' }
}, { timestamps: true });

meenakshiAvailabilitySchema.statics.DEFAULT_SLOTS = DEFAULT_SLOTS;

module.exports = mongoose.model('MeenakshiAvailability', meenakshiAvailabilitySchema);

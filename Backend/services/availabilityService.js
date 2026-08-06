/**
 * Slot availability for the Meenakshi booking page.
 *
 * A slot is offered only if all of these hold:
 *   - the weekday is a working day in the weekly schedule
 *   - the slot is listed for that weekday
 *   - the date is within [today + leadTimeDays, today + horizonDays]
 *   - the date is not fully blocked, and the slot is not individually blocked
 *   - no other consultation already holds it
 *
 * "Already holds it" counts bookings that are paid, or awaiting payment and
 * recent. An abandoned checkout must not sterilise a slot forever, so pending
 * holds expire — see HOLD_MINUTES.
 */

const MeenakshiAvailability = require('../models/MeenakshiAvailability');
const MeenakshiBlockedDate = require('../models/MeenakshiBlockedDate');
const Consultation = require('../models/Consultation');

const HOLD_MINUTES = 20;

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Today in the business timezone, as 'YYYY-MM-DD'. */
function todayInZone(timezone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

/** Add days to a 'YYYY-MM-DD' string without tripping over local time. */
function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function weekdayKey(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return DAY_KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

async function getSettings() {
  let doc = await MeenakshiAvailability.findOne({ settingsKey: 'meenakshi' });
  if (!doc) doc = await MeenakshiAvailability.create({ settingsKey: 'meenakshi' });
  return doc;
}

/** The bookable window, as { min, max } 'YYYY-MM-DD'. */
async function getWindow() {
  const s = await getSettings();
  const today = todayInZone(s.timezone);
  return {
    min: addDays(today, s.leadTimeDays),
    max: addDays(today, s.horizonDays),
    leadTimeDays: s.leadTimeDays,
    timezone: s.timezone
  };
}

/** Slots already spoken for on a date. */
async function takenSlots(date) {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);

  const held = await Consultation.find({
    appointmentDate: date,
    status: { $ne: 'cancelled' },
    $or: [
      { paymentStatus: { $in: ['paid', 'not_required'] } },
      { paymentStatus: 'pending', createdAt: { $gte: cutoff } }
    ]
  }).select('appointmentTime').lean();

  return new Set(held.map((h) => h.appointmentTime).filter(Boolean));
}

/**
 * Available slots for one date.
 * Returns { date, available: [], all: [], reason? }
 */
async function slotsForDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    return { date, available: [], all: [], reason: 'Invalid date' };
  }

  const s = await getSettings();
  const { min, max } = await getWindow();

  if (date < min) return { date, available: [], all: [], reason: `Earliest available date is ${min}` };
  if (date > max) return { date, available: [], all: [], reason: 'That date is beyond the booking window' };

  const day = s.weeklySchedule?.[weekdayKey(date)];
  if (!day || !day.isWorking) return { date, available: [], all: [], reason: 'Not a working day' };

  const all = [...(day.slots || [])].sort();

  const block = await MeenakshiBlockedDate.findOne({ date, isActive: true }).lean();
  if (block?.isFullDay) return { date, available: [], all, reason: block.reason || 'Unavailable' };

  const blocked = new Set(block?.slots || []);
  const taken = await takenSlots(date);

  const available = all.filter((t) => !blocked.has(t) && !taken.has(t));
  return { date, available, all };
}

/** Availability across a range, for painting a calendar. */
async function slotsForRange(fromDate, days = 30) {
  const out = [];
  for (let i = 0; i < Math.min(days, 90); i++) {
    const d = addDays(fromDate, i);
    // eslint-disable-next-line no-await-in-loop
    const r = await slotsForDate(d);
    out.push({ date: d, count: r.available.length });
  }
  return out;
}

/** Guard used at booking time — never trust the client's view of a slot. */
async function isSlotBookable(date, time) {
  const r = await slotsForDate(date);
  return r.available.includes(time);
}

module.exports = {
  getSettings, getWindow, slotsForDate, slotsForRange, isSlotBookable,
  todayInZone, addDays, HOLD_MINUTES
};

/**
 * Slot availability for the Meenakshi booking page.
 *
 * A slot start S is offered for a consultation of D minutes only if all hold:
 *   - the weekday is a working day in the weekly schedule
 *   - S is one of that weekday's configured slot starts
 *   - the whole of [S, S+D) is covered by CONSECUTIVE configured slots, so a
 *     long consultation cannot be booked across a break in the day
 *   - the date is within [today + leadTimeDays, today + horizonDays]
 *   - the date is not fully blocked, and no slot the booking spans is blocked
 *   - [S, S+D) does not overlap an existing booking's own [start, start+its
 *     duration) interval
 *
 * That last pair is the point: a 120-minute consultation booked at 11:00 must
 * remove 12:00 from the list. Treating a booking as occupying exactly one slot
 * silently double-books the practitioner as soon as any service is longer than
 * one slot.
 *
 * "Already booked" counts bookings that are paid, or awaiting payment and
 * recent. An abandoned checkout must not sterilise a slot forever, hence
 * HOLD_MINUTES.
 */

const MeenakshiAvailability = require('../models/MeenakshiAvailability');
const MeenakshiBlockedDate = require('../models/MeenakshiBlockedDate');
const Consultation = require('../models/Consultation');

const HOLD_MINUTES = 20;
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/* ---- time helpers -------------------------------------------------------- */

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

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

/**
 * The UTC instant at which `date`/`time` occurs in `timeZone`.
 *
 * Derived rather than assumed: the business timezone is configurable, so a
 * hardcoded +05:30 would quietly produce wrong instants for any other zone,
 * and wrong ones across a DST boundary. Two passes converge because the offset
 * changes by at most an hour or so.
 */
function zonedToUtc(date, time, timeZone) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  let utc = Date.UTC(y, mo - 1, d, h, mi);

  for (let i = 0; i < 2; i++) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).formatToParts(new Date(utc));

    const get = (t) => Number(parts.find((p) => p.type === t)?.value);
    const asZone = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
    const wanted = Date.UTC(y, mo - 1, d, h, mi, 0);
    const drift = asZone - wanted;
    if (drift === 0) break;
    utc -= drift;
  }
  return new Date(utc).toISOString();
}

/* ---- settings ------------------------------------------------------------ */

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
    slotMinutes: s.slotMinutes,
    timezone: s.timezone
  };
}

/** Busy intervals on a date, in minutes-from-midnight, business timezone. */
async function busyIntervals(date, slotMinutes, excludeId) {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);

  const held = await Consultation.find({
    appointmentDate: date,
    status: { $ne: 'cancelled' },
    $or: [
      { paymentStatus: { $in: ['paid', 'not_required'] } },
      { paymentStatus: 'pending', createdAt: { $gte: cutoff } }
    ]
  }).select('appointmentTime durationMinutes _id').lean();

  return held
    .filter((h) => !excludeId || String(h._id) !== String(excludeId))
    .filter((h) => h.appointmentTime)
    .map((h) => {
      const start = toMinutes(h.appointmentTime);
      // Legacy bookings predate durationMinutes; assume one slot.
      const dur = h.durationMinutes || slotMinutes || 60;
      return [start, start + dur];
    });
}

const overlaps = (aStart, aEnd, [bStart, bEnd]) => aStart < bEnd && bStart < aEnd;

/**
 * Available slots for one date.
 *
 * @param {string} date 'YYYY-MM-DD'
 * @param {number} [durationMinutes] length of the consultation being booked
 * @returns {{date, timezone, slotMinutes, available: Array<{time,iso}>, all: string[], reason?: string}}
 */
async function slotsForDate(date, durationMinutes, excludeId) {
  const s = await getSettings();
  const tz = s.timezone;
  const slotMinutes = s.slotMinutes || 60;
  const empty = (reason, all = []) => ({ date, timezone: tz, slotMinutes, available: [], all, reason });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return empty('Invalid date');

  const { min, max } = await getWindow();
  if (date < min) return empty(`Earliest available date is ${min}`);
  if (date > max) return empty('That date is beyond the booking window');

  const day = s.weeklySchedule?.[weekdayKey(date)];
  if (!day || !day.isWorking) return empty('Not a working day');

  const all = [...(day.slots || [])].filter(Boolean).sort();
  if (!all.length) return empty('No times configured for this day');

  const block = await MeenakshiBlockedDate.findOne({ date, isActive: true }).lean();
  if (block?.isFullDay) return empty(block.reason || 'Unavailable', all);

  const blocked = new Set(block?.slots || []);
  const busy = await busyIntervals(date, slotMinutes, excludeId);

  const duration = Math.max(Number(durationMinutes) || slotMinutes, slotMinutes);
  const startSet = new Set(all.map(toMinutes));

  const available = [];
  for (const time of all) {
    const start = toMinutes(time);
    const end = start + duration;

    // Every slot-sized step the booking covers must itself be a configured
    // start, so a long session cannot straddle a break in the day.
    const stepsNeeded = Math.ceil(duration / slotMinutes);
    let covered = true;
    for (let k = 0; k < stepsNeeded; k++) {
      const step = start + k * slotMinutes;
      if (!startSet.has(step) || blocked.has(toHHMM(step))) { covered = false; break; }
    }
    if (!covered) continue;

    if (busy.some((iv) => overlaps(start, end, iv))) continue;

    available.push({ time, iso: zonedToUtc(date, time, tz) });
  }

  return { date, timezone: tz, slotMinutes, available, all };
}

/**
 * Availability across a range, for painting a calendar.
 *
 * Three queries for the whole month, not three per day. Looping slotsForDate
 * issued roughly 90 sequential round trips for a 31-day month — imperceptible
 * against a local mongod, but four to six seconds against Atlas, which is long
 * enough that the grid renders every day disabled while it waits.
 */
async function slotsForRange(fromDate, days = 30, durationMinutes) {
  const span = Math.min(Math.max(Number(days) || 30, 1), 90);
  const dates = Array.from({ length: span }, (_, i) => addDays(fromDate, i));

  const s = await getSettings();
  const tz = s.timezone;
  const slotMinutes = s.slotMinutes || 60;
  const duration = Math.max(Number(durationMinutes) || slotMinutes, slotMinutes);

  const today = todayInZone(tz);
  const min = addDays(today, s.leadTimeDays);
  const max = addDays(today, s.horizonDays);

  const [blocks, held] = await Promise.all([
    MeenakshiBlockedDate.find({ date: { $in: dates }, isActive: true }).lean(),
    Consultation.find({
      appointmentDate: { $in: dates },
      status: { $ne: 'cancelled' },
      $or: [
        { paymentStatus: { $in: ['paid', 'not_required'] } },
        { paymentStatus: 'pending', createdAt: { $gte: new Date(Date.now() - HOLD_MINUTES * 60 * 1000) } }
      ]
    }).select('appointmentDate appointmentTime durationMinutes').lean()
  ]);

  const blockByDate = new Map(blocks.map((b) => [b.date, b]));
  const busyByDate = new Map();
  for (const h of held) {
    if (!h.appointmentTime) continue;
    const start = toMinutes(h.appointmentTime);
    const arr = busyByDate.get(h.appointmentDate) || [];
    arr.push([start, start + (h.durationMinutes || slotMinutes)]);
    busyByDate.set(h.appointmentDate, arr);
  }

  return dates.map((date) => {
    if (date < min || date > max) return { date, count: 0 };

    const day = s.weeklySchedule?.[weekdayKey(date)];
    if (!day || !day.isWorking) return { date, count: 0 };

    const all = [...(day.slots || [])].filter(Boolean).sort();
    if (!all.length) return { date, count: 0 };

    const block = blockByDate.get(date);
    if (block?.isFullDay) return { date, count: 0 };

    const blocked = new Set(block?.slots || []);
    const busy = busyByDate.get(date) || [];
    const startSet = new Set(all.map(toMinutes));
    const steps = Math.ceil(duration / slotMinutes);

    let count = 0;
    for (const time of all) {
      const start = toMinutes(time);
      let covered = true;
      for (let k = 0; k < steps; k++) {
        const step = start + k * slotMinutes;
        if (!startSet.has(step) || blocked.has(toHHMM(step))) { covered = false; break; }
      }
      if (!covered) continue;
      if (busy.some((iv) => overlaps(start, start + duration, iv))) continue;
      count++;
    }
    return { date, count };
  });
}

/** Guard used at booking time — never trust the client's view of a slot. */
async function isSlotBookable(date, time, durationMinutes, excludeId) {
  const r = await slotsForDate(date, durationMinutes, excludeId);
  return r.available.some((s) => s.time === time);
}

module.exports = {
  getSettings, getWindow, slotsForDate, slotsForRange, isSlotBookable,
  todayInZone, addDays, zonedToUtc, HOLD_MINUTES
};

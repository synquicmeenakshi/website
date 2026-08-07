/**
 * Compatibility layer so the existing BookingManagement admin screen can drive
 * Meenakshi availability without being rewritten.
 *
 * That screen was built against ZenYourLife's /blocked-dates contract, which
 * names things differently (`timeSlots` vs `slots`, `isFullDayBlocked` vs
 * `isFullDay`) and is backed by models tied to the massage Appointment flow.
 * Rather than rebuild a working 1,800-line UI, this translates its requests
 * onto the Meenakshi models — which are the ones the booking page actually
 * reads, and which carry the duration and timezone logic the old path lacks.
 *
 * Unlike the original /blocked-dates routes, everything here is behind auth.
 */

const MeenakshiAvailability = require('../models/MeenakshiAvailability');
const MeenakshiBlockedDate = require('../models/MeenakshiBlockedDate');
const availability = require('../services/availabilityService');

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Meenakshi settings -> the shape BookingManagement expects. */
function toLegacySettings(doc) {
  const weeklySchedule = {};
  for (const d of DAYS) {
    const day = doc.weeklySchedule?.[d] || { isWorking: false, slots: [] };
    weeklySchedule[d] = { isWorking: Boolean(day.isWorking), timeSlots: day.slots || [] };
  }
  return {
    _id: doc._id,
    settingsType: 'meenakshi',
    weeklySchedule,
    // A union of every configured time, which the screen uses to offer
    // per-slot blocking.
    timeSlots: [...new Set(DAYS.flatMap((d) => doc.weeklySchedule?.[d]?.slots || []))].sort(),
    slotMinutes: doc.slotMinutes,
    leadTimeDays: doc.leadTimeDays,
    horizonDays: doc.horizonDays,
    timezone: doc.timezone
  };
}

const toLegacyBlocked = (b) => ({
  _id: b._id,
  date: b.date,
  blockedTimeSlots: b.slots || [],
  isFullDayBlocked: Boolean(b.isFullDay),
  reason: b.reason || '',
  isActive: b.isActive !== false,
  createdAt: b.createdAt
});

/* ---- settings ------------------------------------------------------------ */

const getSettings = async (req, res) => {
  try {
    const doc = await availability.getSettings();
    res.json({ success: true, data: toLegacySettings(doc) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PUT /settings — merges, so fields the old screen knows nothing about survive. */
const updateSettings = async (req, res) => {
  try {
    const doc = await availability.getSettings();
    const { weeklySchedule, slotMinutes, leadTimeDays, horizonDays, timezone } = req.body || {};

    if (weeklySchedule) {
      for (const d of DAYS) {
        const incoming = weeklySchedule[d];
        if (!incoming) continue;
        doc.weeklySchedule[d] = {
          isWorking: Boolean(incoming.isWorking),
          slots: incoming.timeSlots || incoming.slots || []
        };
      }
      doc.markModified('weeklySchedule');
    }
    if (slotMinutes !== undefined) doc.slotMinutes = slotMinutes;
    if (leadTimeDays !== undefined) doc.leadTimeDays = leadTimeDays;
    if (horizonDays !== undefined) doc.horizonDays = horizonDays;
    if (timezone) doc.timezone = timezone;

    await doc.save();
    res.json({ success: true, data: toLegacySettings(doc) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** PUT /settings/day/:day */
const updateDay = async (req, res) => {
  try {
    const day = String(req.params.day || '').toLowerCase();
    if (!DAYS.includes(day)) {
      return res.status(400).json({ success: false, message: `Unknown day: ${day}` });
    }
    const doc = await availability.getSettings();
    const { isWorking, timeSlots, slots } = req.body || {};

    doc.weeklySchedule[day] = {
      isWorking: isWorking !== undefined ? Boolean(isWorking) : doc.weeklySchedule[day]?.isWorking,
      slots: timeSlots || slots || doc.weeklySchedule[day]?.slots || []
    };
    doc.markModified('weeklySchedule');
    await doc.save();

    res.json({ success: true, data: toLegacySettings(doc) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ---- blocked dates ------------------------------------------------------- */

const listBlocked = async (req, res) => {
  try {
    const docs = await MeenakshiBlockedDate.find({}).sort({ date: 1 }).lean();
    res.json({ success: true, count: docs.length, data: docs.map(toLegacyBlocked) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBlocked = async (req, res) => {
  try {
    const { date, blockedTimeSlots, isFullDayBlocked, slots, isFullDay, reason } = req.body || {};
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const normalised = String(date).slice(0, 10);
    const wantedSlots = blockedTimeSlots || slots || [];
    const fullDay = isFullDayBlocked !== undefined
      ? Boolean(isFullDayBlocked)
      : (isFullDay !== undefined ? Boolean(isFullDay) : wantedSlots.length === 0);

    // One document per date keeps the availability lookup a single query; a
    // second block on the same date merges its slots rather than colliding.
    const existing = await MeenakshiBlockedDate.findOne({ date: normalised });
    const merged = existing && !fullDay
      ? [...new Set([...(existing.slots || []), ...wantedSlots])]
      : wantedSlots;

    const doc = await MeenakshiBlockedDate.findOneAndUpdate(
      { date: normalised },
      { date: normalised, isFullDay: fullDay, slots: merged, reason: reason || '', isActive: true },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, data: toLegacyBlocked(doc) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteBlocked = async (req, res) => {
  try {
    const doc = await MeenakshiBlockedDate.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Unblocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleBlocked = async (req, res) => {
  try {
    const doc = await MeenakshiBlockedDate.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    doc.isActive = !doc.isActive;
    await doc.save();
    res.json({ success: true, data: toLegacyBlocked(doc) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** DELETE /:id/slot/:slot — unblock one time within a date. */
const deleteBlockedSlot = async (req, res) => {
  try {
    const doc = await MeenakshiBlockedDate.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    const slot = decodeURIComponent(req.params.slot);
    doc.slots = (doc.slots || []).filter((s) => s !== slot);

    // A per-slot block with nothing left in it is just noise.
    if (!doc.isFullDay && doc.slots.length === 0) {
      await doc.deleteOne();
      return res.json({ success: true, message: 'Unblocked', removed: true });
    }
    await doc.save();
    res.json({ success: true, data: toLegacyBlocked(doc) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /available-slots/:date — kept for parity with the old contract. */
const availableSlots = async (req, res) => {
  try {
    const r = await availability.slotsForDate(req.params.date);
    res.json({
      success: true,
      data: {
        date: r.date,
        availableSlots: r.available.map((s) => s.time),
        timezone: r.timezone,
        reason: r.reason
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings, updateSettings, updateDay,
  listBlocked, createBlocked, deleteBlocked, toggleBlocked, deleteBlockedSlot,
  availableSlots
};

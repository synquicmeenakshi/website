/** Admin management of the weekly schedule and blocked dates. */

const MeenakshiAvailability = require('../models/MeenakshiAvailability');
const MeenakshiBlockedDate = require('../models/MeenakshiBlockedDate');
const availability = require('../services/availabilityService');

/** GET /api/availability/settings — admin. */
const getSettings = async (req, res) => {
  try {
    res.json({ success: true, data: await availability.getSettings() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PUT /api/availability/settings — admin. */
const updateSettings = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.settingsKey;

    const doc = await MeenakshiAvailability.findOneAndUpdate(
      { settingsKey: 'meenakshi' },
      payload,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** GET /api/availability/blocked — admin. */
const listBlocked = async (req, res) => {
  try {
    const data = await MeenakshiBlockedDate.find({}).sort({ date: 1 }).lean();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/availability/blocked — admin. */
const createBlocked = async (req, res) => {
  try {
    const { date, isFullDay, slots, reason } = req.body;
    // One document per date keeps the availability lookup a single query.
    const doc = await MeenakshiBlockedDate.findOneAndUpdate(
      { date },
      { date, isFullDay: isFullDay !== false, slots: slots || [], reason: reason || '', isActive: true },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** DELETE /api/availability/blocked/:id — admin. */
const deleteBlocked = async (req, res) => {
  try {
    const doc = await MeenakshiBlockedDate.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings, listBlocked, createBlocked, deleteBlocked };

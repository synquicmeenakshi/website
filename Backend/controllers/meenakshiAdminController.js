/**
 * Admin CRUD for the Meenakshi content collections.
 *
 * One generic handler set over a small registry, because all six collections
 * want the same list/create/update/delete/reorder behaviour and hand-writing
 * six near-identical controllers is how they drift apart.
 *
 * Every mutation invalidates the public content cache.
 */

const MeenakshiService = require('../models/MeenakshiService');
const MeenakshiTestimonial = require('../models/MeenakshiTestimonial');
const MeenakshiFaq = require('../models/MeenakshiFaq');
const MeenakshiJourneyStep = require('../models/MeenakshiJourneyStep');
const MeenakshiLegalPage = require('../models/MeenakshiLegalPage');
const MeenakshiSettings = require('../models/MeenakshiSettings');
const { invalidate } = require('./meenakshiContentController');

const REGISTRY = {
  services: { model: MeenakshiService, sort: { displayOrder: 1 } },
  testimonials: { model: MeenakshiTestimonial, sort: { displayOrder: 1 } },
  faqs: { model: MeenakshiFaq, sort: { groupOrder: 1, displayOrder: 1 } },
  journey: { model: MeenakshiJourneyStep, sort: { displayOrder: 1 } },
  legal: { model: MeenakshiLegalPage, sort: { displayOrder: 1 } }
};

const resolve = (req, res) => {
  const entry = REGISTRY[req.params.collection];
  if (!entry) {
    res.status(404).json({ success: false, message: `Unknown collection: ${req.params.collection}` });
    return null;
  }
  return entry;
};

/** GET /api/meenakshi/admin/:collection — all documents, including inactive. */
const list = async (req, res) => {
  const entry = resolve(req, res);
  if (!entry) return;
  try {
    const docs = await entry.model.find({}).sort(entry.sort).lean();
    res.json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/meenakshi/admin/:collection */
const create = async (req, res) => {
  const entry = resolve(req, res);
  if (!entry) return;
  try {
    const doc = await entry.model.create(req.body);
    invalidate();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** PUT /api/meenakshi/admin/:collection/:id */
const update = async (req, res) => {
  const entry = resolve(req, res);
  if (!entry) return;
  try {
    const doc = await entry.model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    invalidate();
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/** DELETE /api/meenakshi/admin/:collection/:id */
const remove = async (req, res) => {
  const entry = resolve(req, res);
  if (!entry) return;
  try {
    const doc = await entry.model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    invalidate();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PATCH /api/meenakshi/admin/:collection/reorder  body: { ids: [...] } */
const reorder = async (req, res) => {
  const entry = resolve(req, res);
  if (!entry) return;
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids must be an array' });
    }
    await Promise.all(ids.map((id, i) =>
      entry.model.findByIdAndUpdate(id, { displayOrder: i })
    ));
    invalidate();
    res.json({ success: true, message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---- settings singleton -------------------------------------------------- */

/** GET /api/meenakshi/admin/settings */
const getSettings = async (req, res) => {
  try {
    let doc = await MeenakshiSettings.findOne({ settingsKey: 'meenakshi' });
    if (!doc) doc = await MeenakshiSettings.create({ settingsKey: 'meenakshi' });
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** PUT /api/meenakshi/admin/settings */
const updateSettings = async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload.settingsKey;
    delete payload._id;

    const doc = await MeenakshiSettings.findOneAndUpdate(
      { settingsKey: 'meenakshi' },
      payload,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    invalidate();
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { list, create, update, remove, reorder, getSettings, updateSettings };

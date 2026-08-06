const mongoose = require('mongoose');

/**
 * Site-wide brand facts and the trust markers that repeat across pages —
 * everything that lived in src/data/site.js, plus the booking policy and
 * inclusions from journey.js and the booking form's consultation areas.
 *
 * A singleton: exactly one document, keyed by settingsKey: 'meenakshi'.
 *
 * Pair-style content (ethics, policy, included) is stored as {heading, body}
 * for a sane admin editor; the public API converts each back to the
 * [heading, body] tuple the frontend components already destructure.
 */
const pairSchema = new mongoose.Schema({
  heading: { type: String, default: '', trim: true },
  body: { type: String, default: '', trim: true }
}, { _id: false });

const meenakshiSettingsSchema = new mongoose.Schema({
  settingsKey: {
    type: String,
    default: 'meenakshi',
    unique: true,
    index: true
  },

  brand: {
    name: { type: String, default: 'Meenakshi' },
    tag: { type: String, default: 'Sacred Sciences' },
    roles: { type: [String], default: [] },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    phoneHref: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },

  proof: {
    type: [{
      value: { type: String, default: '' },
      label: { type: String, default: '' },
      deva: { type: String, default: '' },
      _id: false
    }],
    default: []
  },

  assurances: { type: [String], default: [] },
  marquee: { type: [String], default: [] },

  lineages: {
    type: [{
      n: { type: String, default: '' },
      name: { type: String, default: '' },
      deva: { type: String, default: '' },
      note: { type: String, default: '' },
      answers: { type: String, default: '' },
      _id: false
    }],
    default: []
  },

  why: {
    type: [{
      n: { type: String, default: '' },
      title: { type: String, default: '' },
      body: { type: String, default: '' },
      _id: false
    }],
    default: []
  },

  ethics: { type: [pairSchema], default: [] },
  policy: { type: [pairSchema], default: [] },
  included: { type: [pairSchema], default: [] },

  consultAreas: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('MeenakshiSettings', meenakshiSettingsSchema);

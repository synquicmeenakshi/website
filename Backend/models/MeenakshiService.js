const mongoose = require('mongoose');

/**
 * The eight disciplines shown at /services and /services/:slug.
 *
 * Field names deliberately mirror the frontend's src/data/services.js exactly
 * (n, lede, intro, img, alt, scene, sceneAlt, questions, items) so the public
 * payload can be dropped straight into the existing components with no
 * reshaping and therefore no UI change.
 */
const meenakshiServiceSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  n: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  short: {
    type: String,
    default: '',
    trim: true
  },
  deva: {
    type: String,
    default: '',
    trim: true
  },
  lede: {
    type: String,
    default: '',
    trim: true
  },
  intro: {
    type: String,
    default: '',
    trim: true
  },
  img: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  scene: {
    type: String,
    default: ''
  },
  sceneAlt: {
    type: String,
    default: ''
  },
  questions: {
    type: [String],
    default: []
  },
  items: {
    type: [String],
    default: []
  },
  displayOrder: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MeenakshiService', meenakshiServiceSchema);

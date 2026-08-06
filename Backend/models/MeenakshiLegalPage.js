const mongoose = require('mongoose');

/**
 * The five legal pages, rendered through one route and one template at
 * /legal/:slug.
 *
 * Sections are stored structurally ({heading, paragraphs[]}) rather than as an
 * HTML blob, because the frontend template renders each heading and paragraph
 * itself. The public API flattens each to the [heading, ...paragraphs] tuple
 * the existing template already expects.
 */
const sectionSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true
  },
  paragraphs: {
    type: [String],
    default: []
  }
}, { _id: false });

const meenakshiLegalPageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  lede: {
    type: String,
    default: '',
    trim: true
  },
  updated: {
    type: String,
    default: '',
    trim: true
  },
  sections: {
    type: [sectionSchema],
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

module.exports = mongoose.model('MeenakshiLegalPage', meenakshiLegalPageSchema);

const mongoose = require('mongoose');

/**
 * FAQs across three placements:
 *
 *   placement 'faq'  — the grouped set on the FAQ section (`group` names the
 *                      heading it sits under). A subset also appears in the
 *                      shorter home-page accordion, flagged by showOnHome and
 *                      ordered by homeOrder.
 *   placement 'book' — the four shown beside the booking form. Separate
 *                      questions, not a subset of the above.
 */
const meenakshiFaqSchema = new mongoose.Schema({
  q: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  a: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  group: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  placement: {
    type: String,
    enum: ['faq', 'book'],
    default: 'faq',
    index: true
  },
  showOnHome: {
    type: Boolean,
    default: false,
    index: true
  },
  homeOrder: {
    type: Number,
    default: 0
  },
  groupOrder: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('MeenakshiFaq', meenakshiFaqSchema);

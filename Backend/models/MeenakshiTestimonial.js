const mongoose = require('mongoose');

/**
 * Client testimonials.
 *
 * `short` is the trimmed version used in the constellation on the home page,
 * where seven cards share one viewport; `quote` is the full text. Both are
 * stored because the frontend picks between them per placement.
 *
 * One document may carry isFeatured — it renders as FEATURED_QUOTE.
 */
const meenakshiTestimonialSchema = new mongoose.Schema({
  short: {
    type: String,
    required: [true, 'Short quote is required'],
    trim: true
  },
  quote: {
    type: String,
    required: [true, 'Full quote is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  cat: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  service: {
    type: String,
    default: '',
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
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

module.exports = mongoose.model('MeenakshiTestimonial', meenakshiTestimonialSchema);

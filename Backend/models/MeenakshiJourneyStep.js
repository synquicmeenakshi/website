const mongoose = require('mongoose');

/**
 * The eight steps of a consultation, shown on /journey and in the home-page
 * strip. `aside` is the detail a visitor asks about once they have read the
 * step itself.
 */
const meenakshiJourneyStepSchema = new mongoose.Schema({
  n: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Step body is required'],
    trim: true
  },
  aside: {
    type: String,
    default: '',
    trim: true
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

module.exports = mongoose.model('MeenakshiJourneyStep', meenakshiJourneyStepSchema);

const mongoose = require('mongoose');

// Section schema for accordion items
const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const legalPageSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: true,
    enum: ['privacy-policy', 'terms-and-conditions', 'cookie-policy', 'dpa']
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'fr', 'de', 'nl']
  },
  pageTitle: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: String,
    default: 'December 2024'
  },
  introduction: String,
  sections: [sectionSchema],
  disclaimer: {
    title: String,
    content: String
  },
  parties: {
    controller: {
      name: String,
      role: String,
      email: String
    },
    processor: {
      name: String,
      role: String
    }
  },
  additionalSections: [sectionSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique pageType + language combination
legalPageSchema.index({ pageType: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('LegalPage', legalPageSchema);

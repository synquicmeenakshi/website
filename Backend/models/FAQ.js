const mongoose = require('mongoose');

// Translation schema for multilingual FAQ support
const faqTranslationSchema = new mongoose.Schema({
  question: String,
  answer: String
}, { _id: false });

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'FAQ question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'FAQ answer is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['massage', 'rental'],
    required: [true, 'FAQ category is required'],
    index: true
  },
  // Translations for FR, DE, NL, ES (EN is default in question/answer)
  translations: {
    fr: faqTranslationSchema,
    de: faqTranslationSchema,
    nl: faqTranslationSchema,
    es: faqTranslationSchema
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient category-based queries
faqSchema.index({ category: 1, displayOrder: 1 });

module.exports = mongoose.model('FAQ', faqSchema);

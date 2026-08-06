const mongoose = require('mongoose');

// Translation cache schema to store translated content
const translationSchema = new mongoose.Schema({
  // Original text (used as lookup key)
  originalText: {
    type: String,
    required: true,
    index: true
  },
  // Source language (default English)
  sourceLanguage: {
    type: String,
    default: 'en'
  },
  // Target language code (de, es, fr, etc.)
  targetLanguage: {
    type: String,
    required: true,
    index: true
  },
  // Translated text
  translatedText: {
    type: String,
    required: true
  },
  // Content type for categorization (service, property, testimonial, etc.)
  contentType: {
    type: String,
    enum: ['service', 'property', 'testimonial', 'page_content', 'general'],
    default: 'general'
  },
  // Reference to original document (optional)
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  // Field name in the original document
  fieldName: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
translationSchema.index({ originalText: 1, targetLanguage: 1 }, { unique: true });
translationSchema.index({ referenceId: 1, targetLanguage: 1, fieldName: 1 });

// Static method to find cached translation
translationSchema.statics.findTranslation = async function(originalText, targetLanguage) {
  return this.findOne({ originalText, targetLanguage });
};

// Static method to save translation to cache
translationSchema.statics.saveTranslation = async function(data) {
  const existing = await this.findOne({
    originalText: data.originalText,
    targetLanguage: data.targetLanguage
  });

  if (existing) {
    existing.translatedText = data.translatedText;
    existing.updatedAt = new Date();
    return existing.save();
  }

  return this.create(data);
};

// Static method to get all translations for a document
translationSchema.statics.getDocumentTranslations = async function(referenceId, targetLanguage) {
  return this.find({ referenceId, targetLanguage });
};

// Static method to clear translations for a document (when content is updated)
translationSchema.statics.clearDocumentTranslations = async function(referenceId) {
  return this.deleteMany({ referenceId });
};

const Translation = mongoose.model('Translation', translationSchema);

module.exports = Translation;

const mongoose = require('mongoose');

const benefitItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  }
});

const targetAudienceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  }
});

// Translation schema for ServicePageContent
const servicePageTranslationSchema = new mongoose.Schema({
  benefits: [{
    description: String
  }],
  targetAudience: [{
    description: String
  }],
  benefitsTitle: String,
  targetAudienceTitle: String
}, { _id: false });

const servicePageContentSchema = new mongoose.Schema({
  benefits: [benefitItemSchema],
  targetAudience: [targetAudienceItemSchema],
  benefitsTitle: {
    type: String,
    default: "Benefits You'll Feel"
  },
  targetAudienceTitle: {
    type: String,
    default: "Who It's For"
  },

  // Translations for different languages
  translations: {
    fr: servicePageTranslationSchema,
    de: servicePageTranslationSchema,
    nl: servicePageTranslationSchema,
    es: servicePageTranslationSchema
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServicePageContent', servicePageContentSchema);

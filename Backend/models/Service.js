const mongoose = require('mongoose');

// Translation schema for multi-language support
const translationSchema = new mongoose.Schema({
  title: String,
  description: String,
  benefits: [{
    title: String,
    description: String
  }],
  targetAudience: [{
    title: String,
    description: String
  }],
  contentSections: [{
    title: String,
    description: String
  }]
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true
  },
  // Translations for different languages (fr, de, nl, es)
  // English is the default stored in title/description fields
  translations: {
    fr: translationSchema,
    de: translationSchema,
    nl: translationSchema,
    es: translationSchema
  },
  category: {
    type: String,
    enum: ['massage', 'facial', 'pmu', 'therapy'],
    default: 'massage'
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  price: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'm1.png'
  },
  imageUrl: {
    type: String,
    default: '' // URL to uploaded service card thumbnail image
  },
  bannerImageUrl: {
    type: String,
    default: '' // URL to uploaded banner image for ParticularService page
  },
  // Content sections for detailed descriptions (e.g., "Energy points: We work with basalt stones...")
  contentSections: [{
    title: String,
    description: String
  }],
  // Benefits for ParticularService page (simple benefit cards)
  benefits: [{
    title: String,
    description: String,
    icon: String
  }],
  // Who it's for section
  targetAudience: [{
    title: String,
    description: String,
    icon: String
  }],
  // Gallery images for ParticularService page
  serviceImages: [{
    url: String,
    caption: String
  }],
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

module.exports = mongoose.model('Service', serviceSchema);

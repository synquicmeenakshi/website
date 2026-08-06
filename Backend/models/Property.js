const mongoose = require('mongoose');

// Translation schema for property multi-language support
const propertyTranslationSchema = new mongoose.Schema({
  name: String,
  description: String,
  priceUnit: String,
  parking: String,
  cleanliness: {
    title: String,
    description: String
  },
  amenities: [String],
  // Overview section translations
  overview: {
    title: String,
    description1: String,
    description2: String,
    highlights: [String],
    // Features cards translations
    features: [{
      title: String,
      description: String
    }]
  },
  // Location section translations
  location: {
    title: String,
    description: String,
    places: [{
      title: String
    }]
  }
}, { _id: false });

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  // Translations for different languages (fr, de, nl, es)
  // English is the default stored in main fields
  translations: {
    fr: propertyTranslationSchema,
    de: propertyTranslationSchema,
    nl: propertyTranslationSchema,
    es: propertyTranslationSchema
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  currency: {
    type: String,
    default: '€'
  },
  priceUnit: {
    type: String,
    default: 'per night'
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: 1
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: 1
  },
  parking: {
    type: String,
    default: 'No parking'
  },
  mapUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'Apat1.png'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  galleryImages: {
    type: [String],
    default: []
  },
  cleanliness: {
    title: { type: String, default: 'Cleanliness' },
    description: { type: String, default: 'Professionally cleaned and sanitized before every stay.' }
  },
  amenities: {
    type: [String],
    default: []
  },
  hostName: {
    type: String,
    default: ''
  },
  // Overview section content
  overview: {
    title: { type: String, default: '' },
    description1: { type: String, default: '' },
    description2: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    features: [{
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      imageUrl: { type: String, default: '' }
    }]
  },
  // Location section content
  location: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    mapEmbedUrl: { type: String, default: '' },
    places: [{
      title: { type: String, default: '' },
      imageUrl: { type: String, default: '' }
    }]
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Translation schema for section settings
const sectionSettingsTranslationSchema = new mongoose.Schema({
  title: String,
  description: String
}, { _id: false });

// Section Settings Schema for header content
const sectionSettingsSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    required: true,
    unique: true,
    enum: ['apartments', 'villas', 'studios']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Translations for different languages (fr, de, nl)
  translations: {
    fr: sectionSettingsTranslationSchema,
    de: sectionSettingsTranslationSchema,
    nl: sectionSettingsTranslationSchema
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Property = mongoose.model('Property', propertySchema);
const SectionSettings = mongoose.model('SectionSettings', sectionSettingsSchema);

module.exports = { Property, SectionSettings };

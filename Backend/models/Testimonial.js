const mongoose = require('mongoose');

// Translation schema for multi-language support
const testimonialTranslationSchema = new mongoose.Schema({
  text: String,
  role: String
}, { _id: false });

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    trim: true,
    default: ''
  },
  text: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true
  },
  // Translations for different languages (fr, de, nl, es)
  // English is the default stored in text/role fields
  translations: {
    fr: testimonialTranslationSchema,
    de: testimonialTranslationSchema,
    nl: testimonialTranslationSchema,
    es: testimonialTranslationSchema
  },
  photo: {
    type: String,
    default: 'profile1.png'
  },
  photoUrl: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  // Property reference - links testimonial to specific property
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  // Property name for easier filtering (denormalized for performance)
  propertyName: {
    type: String,
    default: '',
    trim: true
  },
  // Category - massage or rental
  category: {
    type: String,
    enum: ['massage', 'rental'],
    default: 'massage'
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

module.exports = mongoose.model('Testimonial', testimonialSchema);

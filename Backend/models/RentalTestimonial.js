const mongoose = require('mongoose');

// Translation schema for multi-language support
const rentalTestimonialTranslationSchema = new mongoose.Schema({
  text: String,
  role: String
}, { _id: false });

const rentalTestimonialSchema = new mongoose.Schema({
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
    fr: rentalTestimonialTranslationSchema,
    de: rentalTestimonialTranslationSchema,
    nl: rentalTestimonialTranslationSchema,
    es: rentalTestimonialTranslationSchema
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

module.exports = mongoose.model('RentalTestimonial', rentalTestimonialSchema);

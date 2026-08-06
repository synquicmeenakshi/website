const mongoose = require('mongoose');

// Overview Card Schema
const overviewCardSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, { _id: false });

// Translation schema for overview section
const overviewTranslationSchema = new mongoose.Schema({
  badge: String,
  title1: String,
  title2: String,
  description1: String,
  description2: String,
  cards: [{
    title: String,
    description: String
  }]
}, { _id: false });

// Rental Page Overview Settings Schema
const rentalOverviewSettingsSchema = new mongoose.Schema({
  // Main section content
  badge: {
    type: String,
    default: 'Overview'
  },
  title1: {
    type: String,
    default: 'Find a Space That Feels'
  },
  title2: {
    type: String,
    default: 'Like Your Island Home'
  },
  description1: {
    type: String,
    default: "Lanzarote isn't just a destination — it's a rhythm. Volcanic cliffs, whitewashed villages, black-sand beaches, and quiet pockets of calm you won't find anywhere else. Our curated stays are designed to help you slip into that rhythm effortlessly."
  },
  description2: {
    type: String,
    default: "Whether you want ocean views, total seclusion, or a modern base close to Lanzarote's cultural spots, you'll find a place here that feels comfortably yours."
  },
  // Feature cards (2 cards)
  cards: {
    type: [overviewCardSchema],
    default: [
      { title: 'Private Villas', description: 'Spacious, private, and perfect for families or long stays.', imageUrl: '' },
      { title: 'Coastal Living', description: 'Slow living surrounded by volcanic landscapes.', imageUrl: '' }
    ]
  },
  // Translations for different languages
  translations: {
    fr: overviewTranslationSchema,
    de: overviewTranslationSchema,
    nl: overviewTranslationSchema,
    es: overviewTranslationSchema
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const RentalOverviewSettings = mongoose.model('RentalOverviewSettings', rentalOverviewSettingsSchema);

module.exports = { RentalOverviewSettings };

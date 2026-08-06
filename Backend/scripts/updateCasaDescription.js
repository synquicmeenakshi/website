const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenurlife';

const { RentalOverviewSettings } = require('../models/RentalPageSettings');

async function updateCasaDescription() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the rental overview settings
    const settings = await RentalOverviewSettings.findOne();

    if (!settings) {
      console.log('No rental overview settings found');
      return;
    }

    console.log('Current cards:', JSON.stringify(settings.cards, null, 2));

    // Find and update the Casa Artevista card
    const casaCardIndex = settings.cards.findIndex(card =>
      card.title.toLowerCase().includes('casa')
    );

    if (casaCardIndex !== -1) {
      settings.cards[casaCardIndex].description = 'Guests enjoy a private terrace with hottub and huge rooftop terrace with spectacular mountain and sea view.';
      await settings.save();
      console.log('✓ Updated Casa Artevista description successfully!');
      console.log('New description:', settings.cards[casaCardIndex].description);
    } else {
      console.log('Casa card not found in the overview cards');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateCasaDescription();

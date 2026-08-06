// Script to update property nearby places with exact locations
// Run: node scripts/updatePropertyImages.js

require('dotenv').config();
const mongoose = require('mongoose');
const { Property } = require('../models/Property');

const updatePropertyImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update Villa Zen Your Life - Playa Blanca
    // Exact nearby locations from booking.com
    const villaUpdate = await Property.findOneAndUpdate(
      { name: { $regex: /villa.*zen/i } },
      {
        $set: {
          'location.title': 'Prime Location in Playa Blanca',
          'location.description': 'Villa Zen Your Life is perfectly situated in the sunny south of Lanzarote, just 25 minutes walk from Marina Rubicon and close to beautiful beaches.',
          'location.places': [
            {
              title: 'Playa Dorada - 1.7 km',
              imageUrl: ''
            },
            {
              title: 'Marina Rubicon - 2 km',
              imageUrl: ''
            },
            {
              title: 'Playa Flamingo - 3.2 km',
              imageUrl: ''
            }
          ]
        }
      },
      { new: true }
    );

    if (villaUpdate) {
      console.log('✅ Updated Villa Zen Your Life (Playa Blanca):');
      console.log('   - Playa Dorada (1.7 km) - Golden sand beach');
      console.log('   - Marina Rubicon (2 km) - Luxury marina');
      console.log('   - Playa Flamingo (3.2 km) - Family beach');
    } else {
      console.log('❌ Villa Zen Your Life not found');
    }

    // Update Casa Artevista - Tabayesco
    // Exact nearby locations from booking.com
    const casaUpdate = await Property.findOneAndUpdate(
      { name: { $regex: /casa.*artevista/i } },
      {
        $set: {
          'location.title': 'Peaceful Retreat in Tabayesco Valley',
          'location.description': 'Casa Artevista is nestled in the charming village of Tabayesco, just 19 minutes walk from Playa de la Garita beach and close to famous attractions.',
          'location.places': [
            {
              title: 'Playa de la Garita - 1 km',
              imageUrl: ''
            },
            {
              title: 'Jardin de Cactus - 7.1 km',
              imageUrl: ''
            },
            {
              title: 'Jameos del Agua - 7.5 km',
              imageUrl: ''
            }
          ]
        }
      },
      { new: true }
    );

    if (casaUpdate) {
      console.log('✅ Updated Casa Artevista (Tabayesco):');
      console.log('   - Playa de la Garita (1 km) - Nearest beach');
      console.log('   - Jardin de Cactus (7.1 km) - Cactus garden');
      console.log('   - Jameos del Agua (7.5 km) - Lava cave');
    } else {
      console.log('❌ Casa Artevista not found');
    }

    console.log('\n✅ Property nearby places updated with exact distances!');

  } catch (error) {
    console.error('Error updating properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updatePropertyImages();

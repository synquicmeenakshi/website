/**
 * Script to update both Villa Meenakshi and Casa Artevista with property-specific location data
 * Run this with: node scripts/updatePropertiesLocation.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { Property } = require('../models/Property');

// Villa Meenakshi - Modern luxury villa with beach access
const villaZenLocation = {
  title: 'Prime Location',
  description: 'Experience modern luxury at Villa Meenakshi, perfectly positioned near Lanzarote\'s pristine beaches and volcanic landscapes. Enjoy easy access to top attractions while retreating to your private paradise.',
  mapEmbedUrl: '', // Add your Google Maps embed URL here
  places: [
    {
      title: 'Pristine Beaches Nearby',
      imageUrl: ''
    },
    {
      title: 'Volcanic Landscape Views',
      imageUrl: ''
    },
    {
      title: 'Local Attractions & Dining',
      imageUrl: ''
    }
  ]
};

// Casa Artevista - Traditional Canarian charm in Tabayesco village
const casaArtevistaLocation = {
  title: 'Authentic Lanzarote',
  description: 'Nestled in the charming village of Tabayesco, Casa Artevista offers panoramic views of Lanzarote\'s stunning volcanic landscape. Experience authentic Canarian life while being just a short drive from beaches and local attractions.',
  mapEmbedUrl: '', // Add your Google Maps embed URL here
  places: [
    {
      title: 'Tabayesco Village',
      imageUrl: ''
    },
    {
      title: 'Volcanic Landscape Views',
      imageUrl: ''
    },
    {
      title: 'Local Restaurants & Shops',
      imageUrl: ''
    }
  ]
};

async function updatePropertiesLocation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update Villa Meenakshi
    const villaZen = await Property.findOne({
      name: { $regex: /zen.*life/i }
    });

    if (villaZen) {
      villaZen.location = villaZenLocation;
      await villaZen.save();
      console.log('✅ Villa Meenakshi location updated!');
      console.log(`   Description: ${villaZenLocation.description.substring(0, 50)}...`);
    } else {
      console.log('⚠️  Villa Meenakshi not found');
    }

    // Update Casa Artevista
    const casaArtevista = await Property.findOne({
      name: { $regex: /artevista/i }
    });

    if (casaArtevista) {
      casaArtevista.location = casaArtevistaLocation;
      await casaArtevista.save();
      console.log('✅ Casa Artevista location updated!');
      console.log(`   Description: ${casaArtevistaLocation.description.substring(0, 50)}...`);
    } else {
      console.log('⚠️  Casa Artevista not found');
    }

    // List all properties
    console.log('\n📋 All properties in database:');
    const allProperties = await Property.find({}, 'name location.title location.description');
    allProperties.forEach(p => {
      console.log(`   - ${p.name}`);
      if (p.location?.description) {
        console.log(`     Location: ${p.location.description.substring(0, 60)}...`);
      }
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePropertiesLocation();

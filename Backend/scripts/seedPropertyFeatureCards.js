/**
 * Script to populate default feature cards for property overview sections
 * Run this with: node scripts/seedPropertyFeatureCards.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { Property } = require('../models/Property');

const defaultFeatureCards = [
  {
    title: 'Private terrace',
    description: 'Private terrace with panoramic ocean views',
    imageUrl: '' // Admin can upload/add image URL later
  },
  {
    title: 'Airy bedroom',
    description: 'Airy bedroom with queen bed & quality linens',
    imageUrl: ''
  },
  {
    title: 'Open-plan living room',
    description: 'Open-plan living room with natural light',
    imageUrl: ''
  },
  {
    title: 'Fully equipped kitchen',
    description: 'Fully equipped kitchen (coffee maker included — priorities, right?)',
    imageUrl: ''
  }
];

async function seedFeatureCards() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all properties
    const properties = await Property.find({});
    let updated = 0;

    for (const property of properties) {
      // Only update if features are empty or don't exist
      if (!property.overview?.features || property.overview.features.length === 0) {
        await Property.findByIdAndUpdate(property._id, {
          $set: {
            'overview.features': defaultFeatureCards
          }
        });
        updated++;
        console.log(`✅ Added feature cards to: ${property.name}`);
      } else {
        console.log(`⏭️  Skipped ${property.name} - already has ${property.overview.features.length} feature cards`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total properties: ${properties.length}`);
    console.log(`   Updated with feature cards: ${updated}`);
    console.log(`   Skipped (already has cards): ${properties.length - updated}`);
    console.log('\n✅ Feature cards seeded successfully!');
    console.log('💡 Now you can edit these cards in the admin panel under each property\'s Overview section');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding feature cards:', error);
    process.exit(1);
  }
}

seedFeatureCards();

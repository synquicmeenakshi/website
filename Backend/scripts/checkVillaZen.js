const mongoose = require('mongoose');
require('dotenv').config();
const { Property } = require('../models/Property');

async function checkProperty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const property = await Property.findOne({ name: { $regex: /zen.*life/i } });

    if (property) {
      console.log('\n📋 Property Name:', property.name);
      console.log('📝 Overview Title:', property.overview?.title || 'NOT SET');
      console.log('\n📄 Description 1:');
      console.log(property.overview?.description1 || 'NOT SET');
      console.log('\n📄 Description 2:');
      console.log(property.overview?.description2 || 'NOT SET');
      console.log('\n✨ Highlights:', property.overview?.highlights?.length || 0, 'items');
      if (property.overview?.highlights) {
        property.overview.highlights.forEach((h, i) => {
          console.log(`  ${i + 1}. ${h}`);
        });
      }
      console.log('\n📸 Features:', property.overview?.features?.length || 0, 'cards');
    } else {
      console.log('❌ Property not found');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProperty();

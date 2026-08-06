/**
 * Check Property collection translations
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { Property } = require('../models/Property');

    const count = await Property.countDocuments();
    const properties = await Property.find().limit(5);

    console.log('📋 Property Collection:');
    console.log('   Total documents:', count);

    if (properties.length > 0) {
      const sample = properties[0];
      console.log('   Sample property:', sample.name);
      console.log('   Has translations:', sample.translations ? Object.keys(sample.translations).join(', ').toUpperCase() : 'None');
      console.log('   Supports ES?:', sample.translations?.es ? '✅ Yes' : '❌ No');

      if (sample.translations?.es) {
        console.log('   ES Name:', sample.translations.es.name || 'Not set');
        console.log('   ES Description:', sample.translations.es.description?.substring(0, 50) + '...' || 'Not set');
      }

      console.log('\n📊 Summary:');
      let withES = 0;
      let withoutES = 0;

      for (const prop of properties) {
        if (prop.translations?.es?.name) {
          withES++;
        } else {
          withoutES++;
        }
      }

      console.log(`   Properties with ES: ${withES}/${properties.length}`);
      console.log(`   Properties without ES: ${withoutES}/${properties.length}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();

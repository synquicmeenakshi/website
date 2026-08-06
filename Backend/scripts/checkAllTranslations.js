/**
 * Script to check translation status across all database collections
 * Run with: node scripts/checkAllTranslations.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkAllTranslations() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Checking all database collections for dynamic content...\n');

    // Check all relevant collections
    const collections = [
      { name: 'RentalOverviewSettings', model: require('../models/RentalPageSettings').RentalOverviewSettings },
      { name: 'Property', model: require('../models/Property') },
      { name: 'Service', model: require('../models/Service') },
      { name: 'Testimonial', model: require('../models/Testimonial') },
      { name: 'RentalTestimonial', model: require('../models/RentalTestimonial') },
      { name: 'FAQ', model: require('../models/FAQ') }
    ];

    let totalNeedsTranslation = 0;
    let totalHasTranslation = 0;

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        const all = await collection.model.find().limit(10);

        console.log(`📋 ${collection.name}:`);
        console.log(`   Total documents: ${count}`);

        if (count === 0) {
          console.log(`   Status: ⚪ Empty collection\n`);
          continue;
        }

        let hasTranslations = 0;
        let noTranslations = 0;

        for (const doc of all) {
          if (doc.translations && Object.keys(doc.translations).length > 0) {
            hasTranslations++;
          } else {
            noTranslations++;
          }
        }

        if (hasTranslations > 0) {
          const sample = all.find(d => d.translations);
          const langs = Object.keys(sample.translations);
          console.log(`   Has translations: ✅ (${langs.join(', ').toUpperCase()})`);
          console.log(`   Documents with translations: ${hasTranslations}/${Math.min(count, 10)}`);
          totalHasTranslation += count;
        } else {
          console.log(`   Has translations: ❌ No translations found`);
          console.log(`   ⚠️  Needs translation: ${count} documents`);
          totalNeedsTranslation += count;
        }
        console.log('');
      } catch (err) {
        console.log(`📋 ${collection.name}: Error - ${err.message}\n`);
      }
    }

    console.log('━'.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Collections with translations: ${totalHasTranslation > 0 ? 'Yes' : 'No'}`);
    console.log(`   ❌ Documents needing translation: ${totalNeedsTranslation}`);
    console.log('━'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
checkAllTranslations();

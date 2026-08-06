/**
 * Check specific service translation details
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('../models/Service');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const service = await Service.findById('692adac8cf795cf5e8e72a13');

    if (!service) {
      console.log('Service not found');
      process.exit(1);
    }

    console.log('Service:', service.title);
    console.log('\nTranslations object:', service.translations ? 'EXISTS' : 'MISSING');

    if (service.translations) {
      console.log('\nLanguages available:');
      for (const lang of ['fr', 'de', 'nl', 'es']) {
        if (service.translations[lang]) {
          console.log(`  ${lang.toUpperCase()}: ✅`);
          console.log(`    title: ${service.translations[lang].title || 'MISSING'}`);
          console.log(`    description: ${service.translations[lang].description ? service.translations[lang].description.substring(0, 50) + '...' : 'MISSING'}`);
        } else {
          console.log(`  ${lang.toUpperCase()}: ❌ MISSING`);
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();

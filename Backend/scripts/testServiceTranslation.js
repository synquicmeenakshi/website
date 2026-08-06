/**
 * Test Service Translation
 * Translates ONE service to verify the approach works
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');
const { translateWithDeepL } = require('../services/autoTranslateService');

async function testTranslation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the first service
    const service = await Service.findById('692adac8cf795cf5e8e72a13');

    if (!service) {
      console.log('❌ Service not found');
      process.exit(1);
    }

    console.log(`📋 Testing translation for: "${service.title}"`);
    console.log(`   Description: ${service.description.substring(0, 100)}...`);
    console.log('');

    // Initialize translations if needed
    if (!service.translations) {
      service.translations = {};
    }

    // Test translating to Dutch (NL)
    const testLang = 'nl';

    if (!service.translations[testLang]) {
      service.translations[testLang] = {};
    }

    console.log(`🌐 Testing translation to ${testLang.toUpperCase()}...\n`);

    // Translate description
    if (!service.translations[testLang].description) {
      console.log('Translating description...');
      try {
        // Import the translate function properly
        const axios = require('axios');
        const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

        const response = await axios.post(DEEPL_API_URL, null, {
          params: {
            auth_key: process.env.DEEPL_API_KEY,
            text: service.description,
            source_lang: 'EN',
            target_lang: 'NL'
          }
        });

        if (response.data && response.data.translations && response.data.translations[0]) {
          service.translations[testLang].description = response.data.translations[0].text;
          console.log(`✅ Description translated: ${service.translations[testLang].description.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    // Save
    await service.save();
    console.log('\n💾 Service saved successfully!');

    // Verify
    const updated = await Service.findById('692adac8cf795cf5e8e72a13');
    console.log('\n📊 Verification:');
    console.log(`   NL Title: ${updated.translations?.nl?.title || 'MISSING'}`);
    console.log(`   NL Description: ${updated.translations?.nl?.description ? updated.translations.nl.description.substring(0, 100) + '...' : 'MISSING'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testTranslation();

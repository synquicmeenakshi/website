/**
 * Translate ALL Properties - Name, Description, Amenities
 * For all languages: FR, DE, NL, ES
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Property } = require('../models/Property');

const LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

const DEEPL_LANG_MAP = {
  'fr': 'FR',
  'de': 'DE',
  'nl': 'NL',
  'es': 'ES'
};

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: process.env.DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: DEEPL_LANG_MAP[targetLang]
      }
    });

    if (response.data && response.data.translations && response.data.translations[0]) {
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    console.error(`      ❌ Translation error: ${error.message}`);
    return text;
  }
}

async function translateArray(arr, targetLang) {
  if (!arr || arr.length === 0) {
    return [];
  }

  const translated = [];
  for (const item of arr) {
    const trans = await translateText(item, targetLang);
    translated.push(trans);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  return translated;
}

async function translateAllProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    const properties = await Property.find();
    console.log(`📋 Found ${properties.length} properties\n`);
    console.log('━'.repeat(80));

    let stats = { total: properties.length, translated: 0, skipped: 0, errors: 0 };

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`\n[${i + 1}/${properties.length}] ${property.name}`);
      console.log('─'.repeat(80));

      if (!property.translations) {
        property.translations = {};
      }

      let propertyModified = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        if (!property.translations[lang]) {
          property.translations[lang] = {};
        }

        // Translate NAME
        if (!property.translations[lang].name || property.translations[lang].name.trim() === '') {
          console.log(`      🌐 Translating name...`);
          property.translations[lang].name = await translateText(property.name, lang);
          console.log(`      ✅ Name: ${property.translations[lang].name}`);
          propertyModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`      ✓ Name exists: ${property.translations[lang].name}`);
          stats.skipped++;
        }

        // Translate DESCRIPTION
        if (!property.translations[lang].description || property.translations[lang].description.trim() === '') {
          console.log(`      🌐 Translating description...`);
          property.translations[lang].description = await translateText(property.description, lang);
          console.log(`      ✅ Description (${property.translations[lang].description.length} chars)`);
          propertyModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`      ✓ Description exists`);
          stats.skipped++;
        }

        // Translate PRICE UNIT
        if (property.priceUnit && (!property.translations[lang].priceUnit || property.translations[lang].priceUnit.trim() === '')) {
          console.log(`      🌐 Translating price unit...`);
          property.translations[lang].priceUnit = await translateText(property.priceUnit, lang);
          console.log(`      ✅ Price unit translated`);
          propertyModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (property.priceUnit) {
          console.log(`      ✓ Price unit exists`);
          stats.skipped++;
        }

        // Translate AMENITIES (array)
        if (property.amenities && property.amenities.length > 0) {
          if (!property.translations[lang].amenities || property.translations[lang].amenities.length === 0) {
            console.log(`      🌐 Translating ${property.amenities.length} amenities...`);
            property.translations[lang].amenities = await translateArray(property.amenities, lang);
            console.log(`      ✅ Amenities translated`);
            propertyModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ Amenities exist (${property.translations[lang].amenities.length} items)`);
            stats.skipped++;
          }
        }

        // Translate CLEANLINESS object
        if (property.cleanliness) {
          if (!property.translations[lang].cleanliness) {
            property.translations[lang].cleanliness = {};
          }

          if (!property.translations[lang].cleanliness.title || property.translations[lang].cleanliness.title.trim() === '') {
            console.log(`      🌐 Translating cleanliness title...`);
            property.translations[lang].cleanliness.title = await translateText(property.cleanliness.title, lang);
            console.log(`      ✅ Cleanliness title translated`);
            propertyModified = true;
            stats.translated++;
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            console.log(`      ✓ Cleanliness title exists`);
            stats.skipped++;
          }

          if (!property.translations[lang].cleanliness.description || property.translations[lang].cleanliness.description.trim() === '') {
            console.log(`      🌐 Translating cleanliness description...`);
            property.translations[lang].cleanliness.description = await translateText(property.cleanliness.description, lang);
            console.log(`      ✅ Cleanliness description translated`);
            propertyModified = true;
            stats.translated++;
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            console.log(`      ✓ Cleanliness description exists`);
            stats.skipped++;
          }
        }
      }

      if (propertyModified) {
        try {
          await property.save();
          console.log(`\n   💾 Saved successfully`);
        } catch (error) {
          console.error(`\n   ❌ Save error: ${error.message}`);
          stats.errors++;
        }
      } else {
        console.log(`\n   ⊘ No changes needed`);
      }
    }

    console.log('\n' + '━'.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('━'.repeat(80));
    console.log(`   Properties processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ⊘ Already existed: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ Property translation complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting property translation...\n');
translateAllProperties();

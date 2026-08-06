/**
 * Fix RentalOverviewSettings - Add translations to document without them
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { RentalOverviewSettings } = require('../models/RentalPageSettings');

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

async function fixRentalOverviewSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const settings = await RentalOverviewSettings.find();
    console.log(`📋 Found ${settings.length} RentalOverviewSettings documents\n`);

    for (let i = 0; i < settings.length; i++) {
      const doc = settings[i];
      console.log(`[${i + 1}/${settings.length}] Checking document...`);

      if (!doc.translations || Object.keys(doc.translations).length === 0) {
        console.log('   ⚠️  Missing translations! Adding now...\n');

        doc.translations = {};

        for (const lang of LANGUAGES) {
          console.log(`   ${lang.toUpperCase()}:`);
          doc.translations[lang] = {};

          if (doc.badge) {
            doc.translations[lang].badge = await translateText(doc.badge, lang);
            console.log(`      ✅ Badge translated`);
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          if (doc.title1) {
            doc.translations[lang].title1 = await translateText(doc.title1, lang);
            console.log(`      ✅ Title1 translated`);
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          if (doc.title2) {
            doc.translations[lang].title2 = await translateText(doc.title2, lang);
            console.log(`      ✅ Title2 translated`);
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          if (doc.description1) {
            doc.translations[lang].description1 = await translateText(doc.description1, lang);
            console.log(`      ✅ Description1 translated`);
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          if (doc.description2) {
            doc.translations[lang].description2 = await translateText(doc.description2, lang);
            console.log(`      ✅ Description2 translated`);
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          if (doc.cards && doc.cards.length > 0) {
            doc.translations[lang].cards = [];
            for (const card of doc.cards) {
              const translatedCard = {
                title: await translateText(card.title, lang),
                description: await translateText(card.description, lang)
              };
              doc.translations[lang].cards.push(translatedCard);
              await new Promise(resolve => setTimeout(resolve, 400));
            }
            console.log(`      ✅ Cards translated (${doc.cards.length} cards)`);
          }

          console.log('');
        }

        await doc.save();
        console.log('   💾 Saved successfully!\n');
      } else {
        console.log('   ✓ Already has translations\n');
      }
    }

    console.log('━'.repeat(80));
    console.log('✅ RentalOverviewSettings fix complete!');
    console.log('━'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Fixing RentalOverviewSettings...\n');
fixRentalOverviewSettings();

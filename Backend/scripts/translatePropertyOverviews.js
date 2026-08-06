/**
 * Script to translate property overview sections to all languages
 * Translates: title, description1, description2, highlights
 * Run: node backend/scripts/translatePropertyOverviews.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { Property } = require('../models/Property');

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const TARGET_LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_LANGUAGE_MAP = { 'fr': 'FR', 'de': 'DE', 'nl': 'NL', 'es': 'ES' };
const RATE_LIMIT_DELAY_MS = 600;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, targetLang, retryCount = 0) {
  if (!text || text.trim() === '' || !DEEPL_API_KEY) {
    return text;
  }

  try {
    console.log(`    🌐 ${targetLang}: "${text.substring(0, 40)}..."`);

    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: DEEPL_LANGUAGE_MAP[targetLang]
      }
    });

    await sleep(RATE_LIMIT_DELAY_MS);

    if (response.data?.translations?.[0]) {
      const translated = response.data.translations[0].text;
      console.log(`    ✅ ${targetLang}: "${translated.substring(0, 40)}..."`);
      return translated;
    }
    return text;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      const waitTime = (retryCount + 1) * 10000;
      console.log(`    ⏳ Rate limited, waiting ${waitTime/1000}s...`);
      await sleep(waitTime);
      return translateText(text, targetLang, retryCount + 1);
    }
    console.error(`    ❌ Error: ${error.message}`);
    return text;
  }
}

async function translateArray(arr, targetLang) {
  const results = [];
  for (const item of arr) {
    results.push(await translateText(item, targetLang));
  }
  return results;
}

const translatePropertyOverviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const properties = await Property.find({});
    console.log(`📦 Found ${properties.length} properties to translate\n`);

    for (const property of properties) {
      if (!property.overview) {
        console.log(`⚠️  ${property.name} has no overview, skipping`);
        continue;
      }

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 Property: ${property.name}`);

      // Get or create translations object
      const translations = property.translations || { fr: {}, de: {}, nl: {}, es: {} };

      // Ensure all language objects exist
      for (const lang of TARGET_LANGUAGES) {
        if (!translations[lang]) translations[lang] = {};
        if (!translations[lang].overview) translations[lang].overview = {};
      }

      const overview = property.overview;

      // Fix the English overview first - change year-round to heated
      if (overview.description1) {
        overview.description1 = overview.description1
          .replace(/year-round outdoor pool/gi, 'heated outdoor pool')
          .replace(/a year-round outdoor pool/gi, 'a heated outdoor pool');
      }
      if (overview.highlights) {
        overview.highlights = overview.highlights.map(h =>
          h.replace(/Year-round outdoor swimming pool/gi, 'Heated outdoor swimming pool')
           .replace(/year-round/gi, 'heated')
        );
      }

      // Translate overview title
      if (overview.title) {
        console.log('\n  Translating title...');
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].overview.title = await translateText(overview.title, lang);
        }
      }

      // Translate description1
      if (overview.description1) {
        console.log('\n  Translating description1...');
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].overview.description1 = await translateText(overview.description1, lang);
        }
      }

      // Translate description2
      if (overview.description2) {
        console.log('\n  Translating description2...');
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].overview.description2 = await translateText(overview.description2, lang);
        }
      }

      // Translate highlights array
      if (overview.highlights && overview.highlights.length > 0) {
        console.log('\n  Translating highlights...');
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].overview.highlights = await translateArray(overview.highlights, lang);
        }
      }

      // Save the updated property
      property.translations = translations;
      property.overview = overview; // Save the fixed English overview
      await property.save();

      console.log(`\n  ✅ ${property.name} overview translations saved!`);
    }

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All property overview translations complete!');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

translatePropertyOverviews();

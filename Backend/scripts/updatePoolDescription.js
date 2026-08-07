/**
 * Script to update Villa Meenakshi pool description
 * Changes "year-round outdoor pool" to "heated outdoor pool"
 * Run: node backend/scripts/updatePoolDescription.js
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
    console.log(`  🌐 Translating to ${targetLang}...`);

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
      console.log(`  ✅ ${targetLang}: "${translated.substring(0, 60)}..."`);
      return translated;
    }
    return text;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      const waitTime = (retryCount + 1) * 10000;
      console.log(`  ⏳ Rate limited, waiting ${waitTime/1000}s...`);
      await sleep(waitTime);
      return translateText(text, targetLang, retryCount + 1);
    }
    console.error(`  ❌ Error: ${error.message}`);
    return text;
  }
}

const updatePoolDescription = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Villa Meenakshi
    const villa = await Property.findOne({ name: 'Villa Meenakshi' });

    if (!villa) {
      console.log('❌ Villa Meenakshi not found');
      mongoose.connection.close();
      process.exit(1);
    }

    console.log('📦 Found Villa Meenakshi');
    console.log('Current description:', villa.description);
    console.log('');

    // Update English description - change "year-round outdoor pool" to "heated outdoor pool"
    const newDescription = villa.description
      .replace(/year-round outdoor pool/gi, 'heated outdoor pool')
      .replace(/outdoor pool that is open year-round/gi, 'heated outdoor pool')
      .replace(/outdoor pool open year-round/gi, 'heated outdoor pool')
      .replace(/pool that is open year-round/gi, 'heated pool')
      .replace(/open year-round/gi, 'heated');

    console.log('New English description:', newDescription);
    console.log('');

    // Update the English description
    villa.description = newDescription;

    // Regenerate translations for the description
    console.log('📦 Regenerating translations...\n');

    const translations = villa.translations || { fr: {}, de: {}, nl: {}, es: {} };

    // Ensure all language objects exist
    for (const lang of TARGET_LANGUAGES) {
      if (!translations[lang]) translations[lang] = {};
    }

    // Translate the new description to all languages
    for (const lang of TARGET_LANGUAGES) {
      translations[lang].description = await translateText(newDescription, lang);
    }

    // Keep other translation fields intact, just update description
    villa.translations = translations;

    await villa.save();

    console.log('\n✅ Villa Meenakshi updated successfully!');
    console.log('Pool is now described as "heated" in all languages.');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

updatePoolDescription();

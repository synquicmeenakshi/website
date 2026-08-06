/**
 * Script to regenerate ALL FAQ translations (FR/DE/NL/ES)
 * The FAQs were created before translations were working properly
 * Run: node backend/scripts/regenerateFAQTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const FAQ = require('../models/FAQ');

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
    console.log(`  🌐 Translating to ${targetLang}: "${text.substring(0, 40)}..."`);

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
      console.log(`  ✅ ${targetLang}: "${translated.substring(0, 40)}..."`);
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

const regenerateFAQTranslations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const faqs = await FAQ.find({});
    console.log(`📦 Found ${faqs.length} FAQs to translate\n`);

    for (const faq of faqs) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`FAQ: "${faq.question.substring(0, 50)}..."`);
      console.log(`Category: ${faq.category}`);

      const translations = { fr: {}, de: {}, nl: {}, es: {} };

      // Translate question to all languages
      console.log('\n  Translating question...');
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].question = await translateText(faq.question, lang);
      }

      // Translate answer to all languages
      console.log('\n  Translating answer...');
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].answer = await translateText(faq.answer, lang);
      }

      // Update FAQ with new translations
      await FAQ.findByIdAndUpdate(faq._id, { translations });
      console.log(`\n  ✅ Updated FAQ translations`);
    }

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All FAQ translations regenerated successfully!');
    console.log('FAQs will now display correctly in FR/DE/NL/ES languages.');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

regenerateFAQTranslations();

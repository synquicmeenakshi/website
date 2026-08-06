/**
 * Force re-translate all FAQ questions and answers
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const FAQ = require('../models/FAQ');

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

async function forceTranslateFAQs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    const faqs = await FAQ.find();
    console.log(`📋 Found ${faqs.length} FAQs\n`);
    console.log('━'.repeat(80));

    let stats = { total: faqs.length, translated: 0, errors: 0 };

    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      console.log(`\n[${i + 1}/${faqs.length}] ${faq.question.substring(0, 60)}...`);
      console.log('─'.repeat(80));

      if (!faq.translations) {
        faq.translations = {};
      }

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        if (!faq.translations[lang]) {
          faq.translations[lang] = {};
        }

        // FORCE translate question
        console.log(`      🌐 Translating question...`);
        faq.translations[lang].question = await translateText(faq.question, lang);
        console.log(`      ✅ Question: "${faq.translations[lang].question.substring(0, 50)}..."`);
        stats.translated++;
        await new Promise(resolve => setTimeout(resolve, 300));

        // FORCE translate answer
        console.log(`      🌐 Translating answer...`);
        faq.translations[lang].answer = await translateText(faq.answer, lang);
        console.log(`      ✅ Answer translated (${faq.translations[lang].answer.length} chars)`);
        stats.translated++;
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      try {
        await faq.save();
        console.log(`\n   💾 Saved successfully`);
      } catch (error) {
        console.error(`\n   ❌ Save error: ${error.message}`);
        stats.errors++;
      }
    }

    console.log('\n' + '━'.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('━'.repeat(80));
    console.log(`   FAQs processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ FAQ translation complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Force translating all FAQs...\n');
forceTranslateFAQs();

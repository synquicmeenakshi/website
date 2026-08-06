/**
 * Translate ALL FAQs - Question and Answer
 * For all languages: FR, DE, NL, ES
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

async function translateAllFAQs() {
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

    let stats = { total: faqs.length, translated: 0, skipped: 0, errors: 0 };

    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i];
      console.log(`\n[${i + 1}/${faqs.length}] ${faq.question.substring(0, 60)}...`);
      console.log('─'.repeat(80));

      if (!faq.translations) {
        faq.translations = {};
      }

      let faqModified = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        if (!faq.translations[lang]) {
          faq.translations[lang] = {};
        }

        // Translate QUESTION
        if (!faq.translations[lang].question || faq.translations[lang].question.trim() === '') {
          console.log(`      🌐 Translating question...`);
          faq.translations[lang].question = await translateText(faq.question, lang);
          console.log(`      ✅ Question translated`);
          faqModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`      ✓ Question exists`);
          stats.skipped++;
        }

        // Translate ANSWER
        if (!faq.translations[lang].answer || faq.translations[lang].answer.trim() === '') {
          console.log(`      🌐 Translating answer...`);
          faq.translations[lang].answer = await translateText(faq.answer, lang);
          console.log(`      ✅ Answer translated (${faq.translations[lang].answer.length} chars)`);
          faqModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`      ✓ Answer exists`);
          stats.skipped++;
        }
      }

      if (faqModified) {
        try {
          await faq.save();
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
    console.log(`   FAQs processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ⊘ Already existed: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ FAQ translation complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting FAQ translation...\n');
translateAllFAQs();

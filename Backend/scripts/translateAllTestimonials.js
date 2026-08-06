/**
 * Translate ALL Testimonials - Text and Role
 * For all languages: FR, DE, NL, ES
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Testimonial = require('../models/Testimonial');

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

async function translateAllTestimonials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    const testimonials = await Testimonial.find();
    console.log(`📋 Found ${testimonials.length} testimonials\n`);
    console.log('━'.repeat(80));

    let stats = { total: testimonials.length, translated: 0, skipped: 0, errors: 0 };

    for (let i = 0; i < testimonials.length; i++) {
      const testimonial = testimonials[i];
      const name = testimonial.name || `Testimonial ${i + 1}`;
      console.log(`\n[${i + 1}/${testimonials.length}] ${name}`);
      console.log('─'.repeat(80));

      if (!testimonial.translations) {
        testimonial.translations = {};
      }

      let testimonialModified = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        if (!testimonial.translations[lang]) {
          testimonial.translations[lang] = {};
        }

        // Translate TEXT
        if (!testimonial.translations[lang].text || testimonial.translations[lang].text.trim() === '') {
          console.log(`      🌐 Translating text...`);
          testimonial.translations[lang].text = await translateText(testimonial.text, lang);
          console.log(`      ✅ Text translated (${testimonial.translations[lang].text.length} chars)`);
          testimonialModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`      ✓ Text exists`);
          stats.skipped++;
        }

        // Translate ROLE
        if (testimonial.role) {
          if (!testimonial.translations[lang].role || testimonial.translations[lang].role.trim() === '') {
            console.log(`      🌐 Translating role...`);
            testimonial.translations[lang].role = await translateText(testimonial.role, lang);
            console.log(`      ✅ Role translated`);
            testimonialModified = true;
            stats.translated++;
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            console.log(`      ✓ Role exists`);
            stats.skipped++;
          }
        }
      }

      if (testimonialModified) {
        try {
          await testimonial.save();
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
    console.log(`   Testimonials processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ⊘ Already existed: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ Testimonial translation complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting testimonial translation...\n');
translateAllTestimonials();

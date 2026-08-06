/**
 * Translate ServicePageContent document - Add translations for FR, DE, NL, ES
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ServicePageContent = require('../models/ServicePageContent');

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

async function translateServicePageContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    const servicePages = await ServicePageContent.find();
    console.log(`📋 Found ${servicePages.length} ServicePageContent documents\n`);
    console.log('━'.repeat(80));

    let stats = { total: servicePages.length, translated: 0, skipped: 0, errors: 0 };

    for (let i = 0; i < servicePages.length; i++) {
      const doc = servicePages[i];
      console.log(`\n[${i + 1}/${servicePages.length}] ServicePageContent Document`);
      console.log('─'.repeat(80));

      if (!doc.translations) {
        doc.translations = {};
      }

      let docModified = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        if (!doc.translations[lang]) {
          doc.translations[lang] = {};
        }

        // Translate benefitsTitle
        if (doc.benefitsTitle && (!doc.translations[lang].benefitsTitle || doc.translations[lang].benefitsTitle.trim() === '')) {
          console.log(`      🌐 Translating benefits title...`);
          doc.translations[lang].benefitsTitle = await translateText(doc.benefitsTitle, lang);
          console.log(`      ✅ Benefits title translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.benefitsTitle) {
          console.log(`      ✓ Benefits title already exists`);
          stats.skipped++;
        }

        // Translate targetAudienceTitle
        if (doc.targetAudienceTitle && (!doc.translations[lang].targetAudienceTitle || doc.translations[lang].targetAudienceTitle.trim() === '')) {
          console.log(`      🌐 Translating target audience title...`);
          doc.translations[lang].targetAudienceTitle = await translateText(doc.targetAudienceTitle, lang);
          console.log(`      ✅ Target audience title translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.targetAudienceTitle) {
          console.log(`      ✓ Target audience title already exists`);
          stats.skipped++;
        }

        // Translate benefits array
        if (doc.benefits && doc.benefits.length > 0) {
          if (!doc.translations[lang].benefits || doc.translations[lang].benefits.length === 0) {
            console.log(`      🌐 Translating benefits...`);
            doc.translations[lang].benefits = [];

            for (const benefit of doc.benefits) {
              const translatedDesc = await translateText(benefit.description, lang);
              doc.translations[lang].benefits.push({ description: translatedDesc });
              await new Promise(resolve => setTimeout(resolve, 300));
            }

            console.log(`      ✅ Benefits translated (${doc.benefits.length} items)`);
            docModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ Benefits already exist`);
            stats.skipped++;
          }
        }

        // Translate targetAudience array
        if (doc.targetAudience && doc.targetAudience.length > 0) {
          if (!doc.translations[lang].targetAudience || doc.translations[lang].targetAudience.length === 0) {
            console.log(`      🌐 Translating target audience...`);
            doc.translations[lang].targetAudience = [];

            for (const item of doc.targetAudience) {
              const translatedDesc = await translateText(item.description, lang);
              doc.translations[lang].targetAudience.push({ description: translatedDesc });
              await new Promise(resolve => setTimeout(resolve, 300));
            }

            console.log(`      ✅ Target audience translated (${doc.targetAudience.length} items)`);
            docModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ Target audience already exists`);
            stats.skipped++;
          }
        }
      }

      if (docModified) {
        try {
          await doc.save();
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
    console.log(`   ServicePageContent documents processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ⊘ Already existed: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ ServicePageContent translation complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting ServicePageContent translation...\n');
translateServicePageContent();

/**
 * Translate ALL Services - Description, Benefits (objects), TargetAudience (objects)
 * For all languages: FR, DE, NL, ES
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');

const LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

const DEEPL_LANG_MAP = {
  'fr': 'FR',
  'de': 'DE',
  'nl': 'NL',
  'es': 'ES'
};

// Helper function to translate text
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

// Helper function to translate array of benefit/target audience objects
async function translateObjectArray(arr, targetLang) {
  if (!arr || arr.length === 0) {
    return [];
  }

  const translated = [];
  for (const item of arr) {
    const translatedItem = {
      title: await translateText(item.title, targetLang),
      description: await translateText(item.description, targetLang),
      icon: item.icon // Keep icon as-is
    };
    translated.push(translatedItem);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  return translated;
}

async function translateAllServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    const services = await Service.find();
    console.log(`📋 Found ${services.length} services\n`);
    console.log('━'.repeat(80));

    let stats = {
      total: services.length,
      translated: 0,
      skipped: 0,
      errors: 0
    };

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      console.log(`\n[${i + 1}/${services.length}] ${service.title}`);
      console.log('─'.repeat(80));

      // Initialize translations object
      if (!service.translations) {
        service.translations = {};
      }

      let serviceModified = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        // Initialize language object
        if (!service.translations[lang]) {
          service.translations[lang] = {};
        }

        // 1. Translate TITLE
        if (!service.translations[lang].title || service.translations[lang].title.trim() === '') {
          console.log(`      🌐 Translating title...`);
          service.translations[lang].title = await translateText(service.title, lang);
          console.log(`      ✅ Title: ${service.translations[lang].title}`);
          serviceModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`      ✓ Title: ${service.translations[lang].title}`);
          stats.skipped++;
        }

        // 2. Translate DESCRIPTION
        if (!service.translations[lang].description || service.translations[lang].description.trim() === '') {
          console.log(`      🌐 Translating description...`);
          service.translations[lang].description = await translateText(service.description, lang);
          console.log(`      ✅ Description (${service.translations[lang].description.length} chars)`);
          serviceModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`      ✓ Description exists`);
          stats.skipped++;
        }

        // 3. Translate BENEFITS (array of objects)
        if (service.benefits && service.benefits.length > 0) {
          if (!service.translations[lang].benefits || service.translations[lang].benefits.length === 0) {
            console.log(`      🌐 Translating ${service.benefits.length} benefits...`);
            service.translations[lang].benefits = await translateObjectArray(service.benefits, lang);
            console.log(`      ✅ Benefits translated`);
            serviceModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ Benefits exist (${service.translations[lang].benefits.length} items)`);
            stats.skipped++;
          }
        } else {
          console.log(`      ⊘ No benefits to translate`);
        }

        // 4. Translate TARGET AUDIENCE (array of objects)
        if (service.targetAudience && service.targetAudience.length > 0) {
          if (!service.translations[lang].targetAudience || service.translations[lang].targetAudience.length === 0) {
            console.log(`      🌐 Translating ${service.targetAudience.length} target audiences...`);
            service.translations[lang].targetAudience = await translateObjectArray(service.targetAudience, lang);
            console.log(`      ✅ Target audience translated`);
            serviceModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ Target audience exists (${service.translations[lang].targetAudience.length} items)`);
            stats.skipped++;
          }
        } else {
          console.log(`      ⊘ No target audience to translate`);
        }

        // 5. Translate CONTENT SECTIONS (array of objects)
        if (service.contentSections && service.contentSections.length > 0) {
          if (!service.translations[lang].contentSections || service.translations[lang].contentSections.length === 0) {
            console.log(`      🌐 Translating ${service.contentSections.length} content sections...`);
            service.translations[lang].contentSections = await translateObjectArray(service.contentSections, lang);
            console.log(`      ✅ Content sections translated`);
            serviceModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ Content sections exist`);
            stats.skipped++;
          }
        }
      }

      // Save service if modified
      if (serviceModified) {
        try {
          await service.save();
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
    console.log(`   Services processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ⊘ Already existed: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ Translation complete! Test individual pages:');
    console.log('   https://zenyourlife.be/service/692adac8cf795cf5e8e72a13?lang=nl');
    console.log('   https://zenyourlife.be/service/692adac8cf795cf5e8e72a13?lang=es');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting service translation...\n');
translateAllServices();

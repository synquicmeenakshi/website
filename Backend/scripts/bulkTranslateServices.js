/**
 * Bulk Auto-Translate Services Collection
 * Translates missing fields for all services: description, benefits, targetAudience
 * For languages: FR, DE, NL, ES
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('../models/Service');
const { autoTranslateService } = require('../services/autoTranslateService');

const LANGUAGES = ['fr', 'de', 'nl', 'es'];

async function bulkTranslateServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ Error: DEEPL_API_KEY not found in environment variables');
      console.log('   Please add DEEPL_API_KEY to your .env file');
      process.exit(1);
    }

    const services = await Service.find();
    console.log(`📋 Found ${services.length} services to process\n`);
    console.log('━'.repeat(80));

    let totalTranslated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      console.log(`\n[${i + 1}/${services.length}] Processing: "${service.title}"`);
      console.log('─'.repeat(80));

      let serviceUpdated = false;

      // Initialize translations object if it doesn't exist
      if (!service.translations) {
        service.translations = {};
        console.log('   ℹ️  Created translations object');
      }

      // Translate for each language
      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        // Initialize language object if it doesn't exist
        if (!service.translations[lang]) {
          service.translations[lang] = {};
          console.log(`      ℹ️  Created ${lang} translations object`);
        }

        let langUpdated = false;

        // Translate title (usually just copy the English title)
        if (!service.translations[lang].title || service.translations[lang].title.trim() === '') {
          console.log(`      🌐 Translating title...`);
          try {
            const translated = await autoTranslateService(service, lang);
            if (translated && translated.translations && translated.translations[lang]) {
              service.translations[lang].title = translated.translations[lang].title || service.title;
              langUpdated = true;
              totalTranslated++;
              console.log(`      ✅ Title translated`);
            }
          } catch (error) {
            console.log(`      ⚠️  Title translation failed: ${error.message}`);
            totalErrors++;
          }
        } else {
          console.log(`      ✓ Title already exists`);
          totalSkipped++;
        }

        // Translate description
        if (!service.translations[lang].description || service.translations[lang].description.trim() === '') {
          console.log(`      🌐 Translating description...`);
          try {
            const translated = await autoTranslateService(service, lang);
            if (translated && translated.translations && translated.translations[lang]) {
              service.translations[lang].description = translated.translations[lang].description || service.description;
              langUpdated = true;
              totalTranslated++;
              console.log(`      ✅ Description translated`);
            }
          } catch (error) {
            console.log(`      ⚠️  Description translation failed: ${error.message}`);
            totalErrors++;
          }
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`      ✓ Description already exists`);
          totalSkipped++;
        }

        // Translate benefits array
        if (!service.translations[lang].benefits || service.translations[lang].benefits.length === 0) {
          if (service.benefits && service.benefits.length > 0) {
            console.log(`      🌐 Translating ${service.benefits.length} benefits...`);
            try {
              const translated = await autoTranslateService(service, lang);
              if (translated && translated.translations && translated.translations[lang] && translated.translations[lang].benefits) {
                service.translations[lang].benefits = translated.translations[lang].benefits;
                langUpdated = true;
                totalTranslated++;
                console.log(`      ✅ Benefits translated`);
              }
            } catch (error) {
              console.log(`      ⚠️  Benefits translation failed: ${error.message}`);
              totalErrors++;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log(`      ⊘ No benefits to translate`);
          }
        } else {
          console.log(`      ✓ Benefits already exist`);
          totalSkipped++;
        }

        // Translate targetAudience array
        if (!service.translations[lang].targetAudience || service.translations[lang].targetAudience.length === 0) {
          if (service.targetAudience && service.targetAudience.length > 0) {
            console.log(`      🌐 Translating ${service.targetAudience.length} target audiences...`);
            try {
              const translated = await autoTranslateService(service, lang);
              if (translated && translated.translations && translated.translations[lang] && translated.translations[lang].targetAudience) {
                service.translations[lang].targetAudience = translated.translations[lang].targetAudience;
                langUpdated = true;
                totalTranslated++;
                console.log(`      ✅ Target audience translated`);
              }
            } catch (error) {
              console.log(`      ⚠️  Target audience translation failed: ${error.message}`);
              totalErrors++;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log(`      ⊘ No target audience to translate`);
          }
        } else {
          console.log(`      ✓ Target audience already exists`);
          totalSkipped++;
        }

        if (langUpdated) {
          serviceUpdated = true;
        }
      }

      // Save service if any translations were added
      if (serviceUpdated) {
        try {
          await service.save();
          console.log(`\n   💾 Service "${service.title}" saved successfully`);
        } catch (error) {
          console.error(`\n   ❌ Error saving service: ${error.message}`);
          totalErrors++;
        }
      } else {
        console.log(`\n   ⊘ No updates needed for "${service.title}"`);
      }

      console.log('─'.repeat(80));
    }

    console.log('\n' + '━'.repeat(80));
    console.log('📊 TRANSLATION SUMMARY:');
    console.log('━'.repeat(80));
    console.log(`   Total services processed: ${services.length}`);
    console.log(`   ✅ Translations added: ${totalTranslated}`);
    console.log(`   ⊘ Already existed (skipped): ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log('━'.repeat(80));

    if (totalErrors === 0) {
      console.log('✅ All services translated successfully!');
    } else {
      console.log('⚠️  Some translations failed. Check the log above for details.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting bulk service translation...\n');
bulkTranslateServices();

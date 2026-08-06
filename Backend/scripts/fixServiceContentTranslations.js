require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Service = require('../models/Service');

const MONGODB_URI = process.env.MONGODB_URI;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

const LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_LANG_MAP = {
  fr: 'FR',
  de: 'DE',
  nl: 'NL',
  es: 'ES'
};

async function translateText(text, targetLang) {
  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: DEEPL_LANG_MAP[targetLang]
      }
    });
    return response.data.translations[0].text;
  } catch (error) {
    console.error(`Error translating to ${targetLang}:`, error.message);
    return text;
  }
}

async function fixServiceContentTranslations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const services = await Service.find({});
    console.log(`Found ${services.length} services\n`);

    for (const service of services) {
      console.log(`\n📦 Processing: ${service.title}`);

      if (!service.contentSections || service.contentSections.length === 0) {
        console.log(`   ⚠️  No content sections, skipping...`);
        continue;
      }

      let updated = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   🌍 Checking ${lang.toUpperCase()}...`);

        if (!service.translations?.[lang]?.contentSections) {
          console.log(`   ⚠️  No translations found for ${lang}`);
          continue;
        }

        // Check if descriptions need to be added
        const needsDescriptions = service.translations[lang].contentSections.some(
          section => !section.description && !section.content
        );

        if (!needsDescriptions) {
          console.log(`   ✓ Descriptions already exist for ${lang}`);
          continue;
        }

        // Translate descriptions from English contentSections
        for (let i = 0; i < service.contentSections.length; i++) {
          const englishSection = service.contentSections[i];
          const translatedSection = service.translations[lang].contentSections[i];

          if (!translatedSection) continue;

          // Get the description/content from English
          const englishText = englishSection.description || englishSection.content;

          if (!englishText) {
            console.log(`   ⚠️  No English description for section ${i + 1}`);
            continue;
          }

          // Translate and add description
          if (!translatedSection.description && !translatedSection.content) {
            console.log(`   📝 Translating section ${i + 1}: "${englishSection.title}"`);
            const translatedText = await translateText(englishText, lang);
            service.translations[lang].contentSections[i].description = translatedText;
            updated = true;
            console.log(`   ✅ Added description for section ${i + 1}`);
            await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
          }
        }
      }

      if (updated) {
        service.markModified('translations');
        await service.save();
        console.log(`   💾 Saved translations for: ${service.title}`);
      } else {
        console.log(`   ℹ️  No updates needed for: ${service.title}`);
      }
    }

    console.log('\n\n✅ All service content translations fixed!');
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

fixServiceContentTranslations();

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
    return text; // Return original text if translation fails
  }
}

async function translateContentSections(sections, targetLang) {
  if (!sections || sections.length === 0) return [];

  const translatedSections = [];
  for (const section of sections) {
    const translatedSection = {
      title: await translateText(section.title, targetLang),
      content: await translateText(section.content, targetLang)
    };
    translatedSections.push(translatedSection);
    console.log(`  ✓ Translated section: "${section.title}" → "${translatedSection.title}"`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Rate limiting
  }
  return translatedSections;
}

async function translateAllServiceContentSections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const services = await Service.find({});
    console.log(`Found ${services.length} services\n`);

    for (const service of services) {
      console.log(`\n📦 Processing: ${service.title}`);
      console.log(`   ID: ${service._id}`);

      // Check if contentSections exist
      if (!service.contentSections || service.contentSections.length === 0) {
        console.log(`   ⚠️  No content sections found, skipping...`);
        continue;
      }

      console.log(`   Found ${service.contentSections.length} content sections`);

      // Initialize translations object if it doesn't exist
      if (!service.translations) {
        service.translations = {};
      }

      let updated = false;

      // Translate content sections for each language
      for (const lang of LANGUAGES) {
        console.log(`\n   🌍 Translating to ${lang.toUpperCase()}...`);

        // Initialize language object if it doesn't exist
        if (!service.translations[lang]) {
          service.translations[lang] = {};
        }

        // Check if contentSections already translated
        if (service.translations[lang].contentSections &&
            service.translations[lang].contentSections.length > 0) {
          console.log(`   ✓ Content sections already translated for ${lang}, skipping...`);
          continue;
        }

        // Translate content sections
        const translatedSections = await translateContentSections(service.contentSections, lang);
        service.translations[lang].contentSections = translatedSections;
        updated = true;
        console.log(`   ✅ Translated ${translatedSections.length} content sections for ${lang}`);
      }

      if (updated) {
        service.markModified('translations');
        await service.save();
        console.log(`   💾 Saved translations for: ${service.title}`);
      } else {
        console.log(`   ℹ️  No updates needed for: ${service.title}`);
      }
    }

    console.log('\n\n✅ All service content sections translated successfully!');
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

translateAllServiceContentSections();

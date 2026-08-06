/**
 * Migration Script: Add translations to existing data using DeepL API
 *
 * This script will:
 * 1. Fetch all Services, Testimonials, Properties without translations
 * 2. Use DeepL API to translate them to FR, DE, NL
 * 3. Save translations back to MongoDB
 *
 * Run with: node scripts/migrateTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Import models
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const { Property, SectionSettings } = require('../models/Property');
const RentalTestimonial = require('../models/RentalTestimonial');

// DeepL API configuration
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const TARGET_LANGUAGES = ['fr', 'de', 'nl'];

const DEEPL_LANGUAGE_MAP = {
  'fr': 'FR',
  'de': 'DE',
  'nl': 'NL'
};

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(text, targetLang) {
  if (!text || text.trim() === '' || !DEEPL_API_KEY) {
    return text;
  }

  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: DEEPL_LANGUAGE_MAP[targetLang] || targetLang.toUpperCase()
      }
    });

    if (response.data && response.data.translations && response.data.translations[0]) {
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    console.error(`  [DeepL Error] ${targetLang}:`, error.message);
    return text;
  }
}

/**
 * Translate to all target languages
 */
async function translateToAllLanguages(text) {
  if (!text || text.trim() === '') {
    return { fr: '', de: '', nl: '' };
  }

  const translations = {};
  for (const lang of TARGET_LANGUAGES) {
    translations[lang] = await translateWithDeepL(text, lang);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return translations;
}

/**
 * Migrate Services
 */
async function migrateServices() {
  console.log('\n📦 Migrating Services...');
  const services = await Service.find({});
  let migrated = 0;

  for (const service of services) {
    // Skip if already has translations
    if (service.translations && service.translations.fr && service.translations.fr.title) {
      console.log(`  ⏭️  Skipping (already translated): ${service.title}`);
      continue;
    }

    console.log(`  🔄 Translating: ${service.title}`);

    const translations = { fr: {}, de: {}, nl: {} };

    // Translate title
    if (service.title) {
      const titleTrans = await translateToAllLanguages(service.title);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].title = titleTrans[lang];
      }
    }

    // Translate description
    if (service.description) {
      const descTrans = await translateToAllLanguages(service.description);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].description = descTrans[lang];
      }
    }

    // Translate benefits
    if (service.benefits && service.benefits.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].benefits = [];
      }

      for (const benefit of service.benefits) {
        const titleTrans = benefit.title ? await translateToAllLanguages(benefit.title) : { fr: '', de: '', nl: '' };
        const descTrans = benefit.description ? await translateToAllLanguages(benefit.description) : { fr: '', de: '', nl: '' };

        for (const lang of TARGET_LANGUAGES) {
          translations[lang].benefits.push({
            title: titleTrans[lang],
            description: descTrans[lang]
          });
        }
      }
    }

    // Translate targetAudience
    if (service.targetAudience && service.targetAudience.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].targetAudience = [];
      }

      for (const audience of service.targetAudience) {
        const titleTrans = audience.title ? await translateToAllLanguages(audience.title) : { fr: '', de: '', nl: '' };
        const descTrans = audience.description ? await translateToAllLanguages(audience.description) : { fr: '', de: '', nl: '' };

        for (const lang of TARGET_LANGUAGES) {
          translations[lang].targetAudience.push({
            title: titleTrans[lang],
            description: descTrans[lang]
          });
        }
      }
    }

    // Translate contentSections
    if (service.contentSections && service.contentSections.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].contentSections = [];
      }

      for (const section of service.contentSections) {
        const titleTrans = section.title ? await translateToAllLanguages(section.title) : { fr: '', de: '', nl: '' };
        const descTrans = section.description ? await translateToAllLanguages(section.description) : { fr: '', de: '', nl: '' };

        for (const lang of TARGET_LANGUAGES) {
          translations[lang].contentSections.push({
            title: titleTrans[lang],
            description: descTrans[lang]
          });
        }
      }
    }

    await Service.findByIdAndUpdate(service._id, { translations });
    console.log(`  ✅ Done: ${service.title}`);
    migrated++;
  }

  console.log(`📦 Services: ${migrated} migrated, ${services.length - migrated} skipped`);
}

/**
 * Migrate Testimonials
 */
async function migrateTestimonials() {
  console.log('\n💬 Migrating Testimonials...');
  const testimonials = await Testimonial.find({});
  let migrated = 0;

  for (const testimonial of testimonials) {
    // Skip if already has translations
    if (testimonial.translations && testimonial.translations.fr && testimonial.translations.fr.text) {
      console.log(`  ⏭️  Skipping (already translated): ${testimonial.name}`);
      continue;
    }

    console.log(`  🔄 Translating: ${testimonial.name}`);

    const translations = { fr: {}, de: {}, nl: {} };

    // Translate text
    if (testimonial.text) {
      const textTrans = await translateToAllLanguages(testimonial.text);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].text = textTrans[lang];
      }
    }

    // Translate role (if not a username)
    if (testimonial.role && !testimonial.role.startsWith('@')) {
      const roleTrans = await translateToAllLanguages(testimonial.role);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].role = roleTrans[lang];
      }
    } else {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].role = testimonial.role || '';
      }
    }

    await Testimonial.findByIdAndUpdate(testimonial._id, { translations });
    console.log(`  ✅ Done: ${testimonial.name}`);
    migrated++;
  }

  console.log(`💬 Testimonials: ${migrated} migrated, ${testimonials.length - migrated} skipped`);
}

/**
 * Migrate Rental Testimonials
 */
async function migrateRentalTestimonials() {
  console.log('\n💬 Migrating Rental Testimonials...');
  const testimonials = await RentalTestimonial.find({});
  let migrated = 0;

  for (const testimonial of testimonials) {
    // Skip if already has translations
    if (testimonial.translations && testimonial.translations.fr && testimonial.translations.fr.text) {
      console.log(`  ⏭️  Skipping (already translated): ${testimonial.name}`);
      continue;
    }

    console.log(`  🔄 Translating: ${testimonial.name}`);

    const translations = { fr: {}, de: {}, nl: {} };

    // Translate text
    if (testimonial.text) {
      const textTrans = await translateToAllLanguages(testimonial.text);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].text = textTrans[lang];
      }
    }

    // Translate role (if not a username)
    if (testimonial.role && !testimonial.role.startsWith('@')) {
      const roleTrans = await translateToAllLanguages(testimonial.role);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].role = roleTrans[lang];
      }
    } else {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].role = testimonial.role || '';
      }
    }

    await RentalTestimonial.findByIdAndUpdate(testimonial._id, { translations });
    console.log(`  ✅ Done: ${testimonial.name}`);
    migrated++;
  }

  console.log(`💬 Rental Testimonials: ${migrated} migrated, ${testimonials.length - migrated} skipped`);
}

/**
 * Migrate Properties
 */
async function migrateProperties() {
  console.log('\n🏠 Migrating Properties...');
  const properties = await Property.find({});
  let migrated = 0;

  for (const property of properties) {
    // Skip if already has translations
    if (property.translations && property.translations.fr && property.translations.fr.description) {
      console.log(`  ⏭️  Skipping (already translated): ${property.name}`);
      continue;
    }

    console.log(`  🔄 Translating: ${property.name}`);

    const translations = { fr: {}, de: {}, nl: {} };

    // Keep name as-is (proper noun)
    for (const lang of TARGET_LANGUAGES) {
      translations[lang].name = property.name || '';
    }

    // Translate description
    if (property.description) {
      const descTrans = await translateToAllLanguages(property.description);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].description = descTrans[lang];
      }
    }

    // Translate priceUnit
    if (property.priceUnit) {
      const priceTrans = await translateToAllLanguages(property.priceUnit);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].priceUnit = priceTrans[lang];
      }
    }

    // Translate parking
    if (property.parking) {
      const parkingTrans = await translateToAllLanguages(property.parking);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].parking = parkingTrans[lang];
      }
    }

    // Translate cleanliness
    if (property.cleanliness) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].cleanliness = {};
      }

      if (property.cleanliness.title) {
        const titleTrans = await translateToAllLanguages(property.cleanliness.title);
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].cleanliness.title = titleTrans[lang];
        }
      }

      if (property.cleanliness.description) {
        const descTrans = await translateToAllLanguages(property.cleanliness.description);
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].cleanliness.description = descTrans[lang];
        }
      }
    }

    // Translate amenities
    if (property.amenities && property.amenities.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].amenities = [];
      }

      for (const amenity of property.amenities) {
        const amenityTrans = await translateToAllLanguages(amenity);
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].amenities.push(amenityTrans[lang]);
        }
      }
    }

    await Property.findByIdAndUpdate(property._id, { translations });
    console.log(`  ✅ Done: ${property.name}`);
    migrated++;
  }

  console.log(`🏠 Properties: ${migrated} migrated, ${properties.length - migrated} skipped`);
}

/**
 * Migrate Section Settings
 */
async function migrateSectionSettings() {
  console.log('\n⚙️  Migrating Section Settings...');
  const settings = await SectionSettings.find({});
  let migrated = 0;

  for (const setting of settings) {
    // Skip if already has translations
    if (setting.translations && setting.translations.fr && setting.translations.fr.title) {
      console.log(`  ⏭️  Skipping (already translated): ${setting.sectionType}`);
      continue;
    }

    console.log(`  🔄 Translating: ${setting.sectionType}`);

    const translations = { fr: {}, de: {}, nl: {} };

    // Translate title
    if (setting.title) {
      const titleTrans = await translateToAllLanguages(setting.title);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].title = titleTrans[lang];
      }
    }

    // Translate description
    if (setting.description) {
      const descTrans = await translateToAllLanguages(setting.description);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].description = descTrans[lang];
      }
    }

    await SectionSettings.findByIdAndUpdate(setting._id, { translations });
    console.log(`  ✅ Done: ${setting.sectionType}`);
    migrated++;
  }

  console.log(`⚙️  Section Settings: ${migrated} migrated, ${settings.length - migrated} skipped`);
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Translation Migration...');
  console.log('================================');

  if (!DEEPL_API_KEY) {
    console.error('❌ Error: DEEPL_API_KEY not found in .env file');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Run migrations
    await migrateServices();
    await migrateTestimonials();
    await migrateRentalTestimonials();
    await migrateProperties();
    await migrateSectionSettings();

    console.log('\n================================');
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the migration
runMigration();

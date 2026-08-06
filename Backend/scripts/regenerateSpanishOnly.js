/**
 * Script to regenerate ONLY Spanish translations for existing content
 * This is more efficient as it only adds Spanish to items that already have FR/DE/NL
 * Run: node backend/scripts/regenerateSpanishOnly.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const { Property, SectionSettings } = require('../models/Property');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const RATE_LIMIT_DELAY_MS = 600;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateToSpanish(text, retryCount = 0) {
  if (!text || text.trim() === '' || !DEEPL_API_KEY) {
    return text;
  }

  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: 'ES'
      }
    });

    await sleep(RATE_LIMIT_DELAY_MS);

    if (response.data?.translations?.[0]) {
      console.log(`  ✅ ES: "${response.data.translations[0].text.substring(0, 40)}..."`);
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      const waitTime = (retryCount + 1) * 10000;
      console.log(`  ⏳ Rate limited, waiting ${waitTime/1000}s...`);
      await sleep(waitTime);
      return translateToSpanish(text, retryCount + 1);
    }
    console.error(`  ❌ Error: ${error.message}`);
    return text;
  }
}

async function translateArrayToSpanish(texts) {
  const results = [];
  for (const text of texts) {
    results.push(await translateToSpanish(text));
  }
  return results;
}

const regenerateSpanishTranslations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Properties
    console.log('📦 Adding Spanish to Properties...');
    const properties = await Property.find({});
    for (const property of properties) {
      console.log(`\n  Property: ${property.name}`);

      const translations = property.translations || { fr: {}, de: {}, nl: {}, es: {} };
      if (!translations.es) translations.es = {};

      // Copy property name (keep as-is)
      translations.es.name = property.name || '';

      // Translate fields
      if (property.description) {
        console.log('    Translating description...');
        translations.es.description = await translateToSpanish(property.description);
      }
      if (property.priceUnit) {
        console.log('    Translating priceUnit...');
        translations.es.priceUnit = await translateToSpanish(property.priceUnit);
      }
      if (property.parking) {
        console.log('    Translating parking...');
        translations.es.parking = await translateToSpanish(property.parking);
      }
      if (property.cleanliness) {
        translations.es.cleanliness = {};
        if (property.cleanliness.title) {
          translations.es.cleanliness.title = await translateToSpanish(property.cleanliness.title);
        }
        if (property.cleanliness.description) {
          translations.es.cleanliness.description = await translateToSpanish(property.cleanliness.description);
        }
      }
      if (property.amenities?.length > 0) {
        console.log('    Translating amenities...');
        translations.es.amenities = await translateArrayToSpanish(property.amenities);
      }

      await Property.findByIdAndUpdate(property._id, { translations });
      console.log(`  ✅ Updated ${property.name}`);
    }

    // Section Settings
    console.log('\n📦 Adding Spanish to Section Settings...');
    const sectionSettings = await SectionSettings.find({});
    for (const settings of sectionSettings) {
      console.log(`\n  Section: ${settings.sectionType}`);

      const translations = settings.translations || { fr: {}, de: {}, nl: {}, es: {} };
      if (!translations.es) translations.es = {};

      if (settings.title) {
        translations.es.title = await translateToSpanish(settings.title);
      }
      if (settings.description) {
        translations.es.description = await translateToSpanish(settings.description);
      }

      await SectionSettings.findByIdAndUpdate(settings._id, { translations });
      console.log(`  ✅ Updated ${settings.sectionType}`);
    }

    // Services
    console.log('\n📦 Adding Spanish to Services...');
    const services = await Service.find({});
    for (const service of services) {
      console.log(`\n  Service: ${service.title}`);

      const translations = service.translations || { fr: {}, de: {}, nl: {}, es: {} };
      if (!translations.es) translations.es = {};

      if (service.title) {
        translations.es.title = await translateToSpanish(service.title);
      }
      if (service.description) {
        translations.es.description = await translateToSpanish(service.description);
      }

      // Benefits
      if (service.benefits?.length > 0) {
        translations.es.benefits = [];
        for (const benefit of service.benefits) {
          translations.es.benefits.push({
            title: benefit.title ? await translateToSpanish(benefit.title) : '',
            description: benefit.description ? await translateToSpanish(benefit.description) : ''
          });
        }
      }

      // Target Audience
      if (service.targetAudience?.length > 0) {
        translations.es.targetAudience = [];
        for (const audience of service.targetAudience) {
          translations.es.targetAudience.push({
            title: audience.title ? await translateToSpanish(audience.title) : '',
            description: audience.description ? await translateToSpanish(audience.description) : ''
          });
        }
      }

      // Content Sections
      if (service.contentSections?.length > 0) {
        translations.es.contentSections = [];
        for (const section of service.contentSections) {
          translations.es.contentSections.push({
            title: section.title ? await translateToSpanish(section.title) : '',
            description: section.description ? await translateToSpanish(section.description) : ''
          });
        }
      }

      await Service.findByIdAndUpdate(service._id, { translations });
      console.log(`  ✅ Updated ${service.title}`);
    }

    // Testimonials
    console.log('\n📦 Adding Spanish to Testimonials...');
    try {
      const testimonials = await Testimonial.find({});
      for (const testimonial of testimonials) {
        console.log(`\n  Testimonial: ${testimonial.name}`);

        const translations = testimonial.translations || { fr: {}, de: {}, nl: {}, es: {} };
        if (!translations.es) translations.es = {};

        if (testimonial.text) {
          translations.es.text = await translateToSpanish(testimonial.text);
        }
        if (testimonial.role && !testimonial.role.startsWith('@')) {
          translations.es.role = await translateToSpanish(testimonial.role);
        } else {
          translations.es.role = testimonial.role || '';
        }

        await Testimonial.findByIdAndUpdate(testimonial._id, { translations });
        console.log(`  ✅ Updated ${testimonial.name}`);
      }
    } catch (e) {
      console.log('⚠️  Testimonial error:', e.message);
    }

    // FAQs
    console.log('\n📦 Adding Spanish to FAQs...');
    try {
      const faqs = await FAQ.find({});
      for (const faq of faqs) {
        console.log(`\n  FAQ: ${faq.question?.substring(0, 30)}...`);

        const translations = faq.translations || { fr: {}, de: {}, nl: {}, es: {} };
        if (!translations.es) translations.es = {};

        if (faq.question) {
          translations.es.question = await translateToSpanish(faq.question);
        }
        if (faq.answer) {
          translations.es.answer = await translateToSpanish(faq.answer);
        }

        await FAQ.findByIdAndUpdate(faq._id, { translations });
        console.log(`  ✅ Updated FAQ`);
      }
    } catch (e) {
      console.log('⚠️  FAQ error:', e.message);
    }

    console.log('\n\n✅ All Spanish translations added successfully!');
    console.log('Spanish (ES) language should now work like FR/DE/NL.');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

regenerateSpanishTranslations();

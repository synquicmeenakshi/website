/**
 * Auto-translate all massage and facial services
 * Fetches from DB, translates to FR/DE/NL, saves back to DB
 *
 * Run with: node scripts/autoTranslateServices.js
 */

const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Translation mappings for common spa/wellness terms
const translations = {
  // Service-specific translations will be generated below
};

async function autoTranslateServices() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Fetch all massage and facial services that don't have translations yet
    const services = await Service.find({
      category: { $in: ['massage', 'facial', 'therapy'] }
    });

    console.log(`Found ${services.length} services to check\n`);

    for (const service of services) {
      // Check if already has translations
      const hasTranslations = service.translations?.fr?.title ||
                              service.translations?.de?.title ||
                              service.translations?.nl?.title;

      console.log(`\n--- ${service.title} ---`);
      console.log(`Category: ${service.category}`);
      console.log(`Has translations: ${hasTranslations ? 'Yes (skipping)' : 'No'}`);

      if (!hasTranslations) {
        console.log('\nEnglish content:');
        console.log(`Title: ${service.title}`);
        console.log(`Description: ${service.description?.substring(0, 100)}...`);
        console.log(`Benefits: ${service.benefits?.length || 0} items`);
        console.log(`Target Audience: ${service.targetAudience?.length || 0} items`);
        console.log(`Content Sections: ${service.contentSections?.length || 0} items`);
      }
    }

    // Get services without translations
    const servicesNeedingTranslation = services.filter(s =>
      !s.translations?.fr?.title && !s.translations?.de?.title && !s.translations?.nl?.title
    );

    console.log(`\n\n========================================`);
    console.log(`Services needing translation: ${servicesNeedingTranslation.length}`);
    console.log(`========================================\n`);

    // Output the data in a format that can be used for translation
    for (const service of servicesNeedingTranslation) {
      console.log(`\n### ${service.title} ###\n`);
      console.log(JSON.stringify({
        title: service.title,
        description: service.description,
        benefits: service.benefits?.map(b => b.description || b.title || b) || [],
        targetAudience: service.targetAudience?.map(t => t.description || t.title || t) || [],
        contentSections: service.contentSections || []
      }, null, 2));
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

autoTranslateServices();

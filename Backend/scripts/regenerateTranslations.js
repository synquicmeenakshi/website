/**
 * Script to regenerate translations for all content including Spanish
 * Run: node backend/scripts/regenerateTranslations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Property, SectionSettings } = require('../models/Property');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const FAQ = require('../models/FAQ');
const {
  autoTranslateProperty,
  autoTranslateSectionSettings,
  autoTranslateService,
  autoTranslateTestimonial,
  autoTranslateFAQ
} = require('../services/autoTranslateService');

const regenerateTranslations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Regenerate Property translations
    console.log('\n📦 Regenerating Property translations...');
    const properties = await Property.find({});
    for (const property of properties) {
      console.log(`  Translating property: ${property.name}`);
      const translations = await autoTranslateProperty(property.toObject());
      await Property.findByIdAndUpdate(property._id, { translations });
    }
    console.log(`✅ Updated ${properties.length} properties`);

    // Regenerate Section Settings translations
    console.log('\n📦 Regenerating Section Settings translations...');
    const sectionSettings = await SectionSettings.find({});
    for (const settings of sectionSettings) {
      console.log(`  Translating section: ${settings.sectionType}`);
      const translations = await autoTranslateSectionSettings(settings.toObject());
      await SectionSettings.findByIdAndUpdate(settings._id, { translations });
    }
    console.log(`✅ Updated ${sectionSettings.length} section settings`);

    // Regenerate Service translations
    console.log('\n📦 Regenerating Service translations...');
    const services = await Service.find({});
    for (const service of services) {
      console.log(`  Translating service: ${service.title}`);
      const translations = await autoTranslateService(service.toObject());
      await Service.findByIdAndUpdate(service._id, { translations });
    }
    console.log(`✅ Updated ${services.length} services`);

    // Regenerate Testimonial translations
    console.log('\n📦 Regenerating Testimonial translations...');
    try {
      const testimonials = await Testimonial.find({});
      for (const testimonial of testimonials) {
        console.log(`  Translating testimonial from: ${testimonial.name}`);
        const translations = await autoTranslateTestimonial(testimonial.toObject());
        await Testimonial.findByIdAndUpdate(testimonial._id, { translations });
      }
      console.log(`✅ Updated ${testimonials.length} testimonials`);
    } catch (e) {
      console.log('⚠️  Testimonial model not found or error:', e.message);
    }

    // Regenerate FAQ translations
    console.log('\n📦 Regenerating FAQ translations...');
    try {
      const faqs = await FAQ.find({});
      for (const faq of faqs) {
        console.log(`  Translating FAQ: ${faq.question?.substring(0, 30)}...`);
        const translations = await autoTranslateFAQ(faq.toObject());
        await FAQ.findByIdAndUpdate(faq._id, { translations });
      }
      console.log(`✅ Updated ${faqs.length} FAQs`);
    } catch (e) {
      console.log('⚠️  FAQ model not found or error:', e.message);
    }

    console.log('\n✅ All translations regenerated successfully!');
    console.log('Spanish (ES) translations are now available.');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error regenerating translations:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

regenerateTranslations();

/**
 * Check FAQ and Testimonial translations
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 Checking FAQ and Testimonial translations...\n');

    const FAQ = require('../models/FAQ');
    const Testimonial = require('../models/Testimonial');
    const RentalTestimonial = require('../models/RentalTestimonial');

    // Check FAQs
    const faqs = await FAQ.find().limit(3);
    console.log('📋 FAQ Collection:');
    console.log('   Total:', await FAQ.countDocuments());
    if (faqs.length > 0) {
      const sample = faqs[0];
      console.log('   Sample question:', sample.question.substring(0, 50) + '...');
      console.log('   Has translations:', sample.translations ? Object.keys(sample.translations).join(', ').toUpperCase() : 'None');
      console.log('   Supports ES?:', sample.translations?.es ? '✅ Yes' : '❌ No');
    }
    console.log('');

    // Check Testimonials
    const testimonials = await Testimonial.find().limit(3);
    console.log('📋 Testimonial Collection (Massage):');
    console.log('   Total:', await Testimonial.countDocuments());
    if (testimonials.length > 0) {
      const sample = testimonials[0];
      console.log('   Sample name:', sample.name);
      console.log('   Has translations:', sample.translations ? Object.keys(sample.translations).join(', ').toUpperCase() : 'None');
      console.log('   Supports ES?:', sample.translations?.es ? '✅ Yes' : '❌ No');
    }
    console.log('');

    // Check Rental Testimonials
    const rentalTestimonials = await RentalTestimonial.find().limit(3);
    console.log('📋 RentalTestimonial Collection:');
    console.log('   Total:', await RentalTestimonial.countDocuments());
    if (rentalTestimonials.length > 0) {
      const sample = rentalTestimonials[0];
      console.log('   Sample name:', sample.name);
      console.log('   Has translations:', sample.translations ? Object.keys(sample.translations).join(', ').toUpperCase() : 'None');
      console.log('   Supports ES?:', sample.translations?.es ? '✅ Yes' : '❌ No');
    }

    console.log('\n' + '━'.repeat(60));
    console.log('Summary: All collections need Spanish (ES) translations added!');
    console.log('━'.repeat(60));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();

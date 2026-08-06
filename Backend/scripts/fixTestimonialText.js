require('dotenv').config();
const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixTestimonial() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the testimonial with the incorrect Dutch text
    const testimonial = await Testimonial.findOne({
      'translations.nl.feedback': { $regex: /Zeer tevreden.*ik het aan/i }
    });

    if (!testimonial) {
      console.log('❌ Testimonial not found. Searching by name Hulusi...');
      const testimonialByName = await Testimonial.findOne({
        name: 'Hulusi'
      });

      if (testimonialByName) {
        console.log('✅ Found testimonial by name:', testimonialByName.name);
        console.log('Current NL feedback:', testimonialByName.translations?.nl?.feedback);

        // Update the Dutch translation
        if (testimonialByName.translations && testimonialByName.translations.nl) {
          testimonialByName.translations.nl.feedback = 'Zeer tevreden, ik raad het aan';
          await testimonialByName.save();
          console.log('✅ Testimonial updated successfully!');
          console.log('New NL feedback:', testimonialByName.translations.nl.feedback);
        }
      } else {
        console.log('❌ No testimonial found with name Hulusi');
        console.log('\nListing all testimonials:');
        const allTestimonials = await Testimonial.find({});
        allTestimonials.forEach((t, index) => {
          console.log(`${index + 1}. ${t.name} - ${t.translations?.nl?.feedback || t.feedback}`);
        });
      }
    } else {
      console.log('✅ Found testimonial:', testimonial.name);
      console.log('Current NL feedback:', testimonial.translations.nl.feedback);

      // Update the Dutch translation
      testimonial.translations.nl.feedback = 'Zeer tevreden, ik raad het aan';
      await testimonial.save();

      console.log('✅ Testimonial updated successfully!');
      console.log('New NL feedback:', testimonial.translations.nl.feedback);
    }

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTestimonial();

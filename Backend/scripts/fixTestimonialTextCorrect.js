require('dotenv').config();
const mongoose = require('mongoose');
const Testimonial = require('../models/Testimonial');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixTestimonial() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the testimonial with name Hulusi
    const testimonial = await Testimonial.findOne({ name: 'Hulusi' });

    if (!testimonial) {
      console.log('❌ Testimonial not found with name Hulusi');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ Found testimonial:', testimonial.name);
    console.log('Current text:', testimonial.text);
    console.log('Current NL translation:', testimonial.translations?.nl?.text);

    // Update the main text field (English)
    testimonial.text = 'Very satisfied, I highly recommend it!';

    // Update all translations
    if (!testimonial.translations) {
      testimonial.translations = {};
    }

    // Update NL translation
    if (!testimonial.translations.nl) {
      testimonial.translations.nl = {};
    }
    testimonial.translations.nl.text = 'Zeer tevreden, ik raad het aan';
    testimonial.translations.nl.role = 'Klant';

    // Update DE translation
    if (!testimonial.translations.de) {
      testimonial.translations.de = {};
    }
    testimonial.translations.de.text = 'Sehr zufrieden, ich empfehle es sehr';
    testimonial.translations.de.role = 'Kunde';

    // Update FR translation
    if (!testimonial.translations.fr) {
      testimonial.translations.fr = {};
    }
    testimonial.translations.fr.text = 'Très satisfait, je le recommande vivement';
    testimonial.translations.fr.role = 'Client';

    // Update ES translation
    if (!testimonial.translations.es) {
      testimonial.translations.es = {};
    }
    testimonial.translations.es.text = 'Muy satisfecho, lo recomiendo mucho';
    testimonial.translations.es.role = 'Cliente';

    // Mark translations as modified
    testimonial.markModified('translations');

    await testimonial.save();

    console.log('\n✅ Testimonial updated successfully!');
    console.log('New text:', testimonial.text);
    console.log('New NL translation:', testimonial.translations.nl.text);
    console.log('New DE translation:', testimonial.translations.de.text);
    console.log('New FR translation:', testimonial.translations.fr.text);
    console.log('New ES translation:', testimonial.translations.es.text);

    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTestimonial();

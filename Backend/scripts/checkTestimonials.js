/**
 * Script to check current testimonials in database
 * Run: node backend/scripts/checkTestimonials.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const checkTestimonials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');

    const testimonials = await collection.find({}).toArray();
    console.log(`Found ${testimonials.length} testimonials:\n`);

    for (const t of testimonials) {
      const hasNL = t.translations?.nl?.text ? 'Has NL' : 'No NL';
      console.log(`Name: "${t.name}"`);
      console.log(`  Category: ${t.category}`);
      console.log(`  Property: ${t.propertyName || 'N/A'}`);
      console.log(`  Text: "${t.text?.substring(0, 50)}..."`);
      console.log(`  ${hasNL}`);
      console.log('');
    }

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkTestimonials();

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkContentStructure() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get the Refreshing service
    const service = await Service.findOne({ title: 'Refreshing' });

    if (!service) {
      console.log('Service not found');
      return;
    }

    console.log('Service Title:', service.title);
    console.log('\n=== ENGLISH CONTENT SECTIONS ===');
    if (service.contentSections && service.contentSections.length > 0) {
      service.contentSections.forEach((section, index) => {
        console.log(`\nSection ${index + 1}:`);
        console.log('Title:', section.title);
        console.log('Content:', section.content);
        console.log('Description:', section.description);
        console.log('Full object:', JSON.stringify(section, null, 2));
      });
    } else {
      console.log('No content sections found');
    }

    console.log('\n=== DUTCH TRANSLATION ===');
    if (service.translations?.nl?.contentSections) {
      service.translations.nl.contentSections.forEach((section, index) => {
        console.log(`\nSection ${index + 1}:`);
        console.log('Title:', section.title);
        console.log('Content:', section.content);
        console.log('Description:', section.description);
        console.log('Full object:', JSON.stringify(section, null, 2));
      });
    } else {
      console.log('No Dutch content sections found');
    }

    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkContentStructure();

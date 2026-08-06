/**
 * Script to restore all services to active status
 * Run: node scripts/restoreAllServices.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

async function restoreAllServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all services to be active
    const result = await Service.updateMany(
      {}, // match all services
      { $set: { isActive: true } }
    );

    console.log(`✅ Restored ${result.modifiedCount} services to active status`);

    // List all services
    const services = await Service.find({}).select('title isActive');
    console.log('\nAll services:');
    services.forEach(s => {
      console.log(`  - ${s.title}: ${s.isActive ? 'Active' : 'Inactive'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

restoreAllServices();

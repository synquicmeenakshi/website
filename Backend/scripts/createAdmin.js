/**
 * Script to create admin user
 * Run: node backend/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Credentials come from the environment and are never committed.
    // Validate before connecting so a missing value fails immediately.
    const { ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } = process.env;

    if (!ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
      console.error('❌ ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must both be set.');
      console.error('   ADMIN_SEED_EMAIL=admin@example.com ADMIN_SEED_PASSWORD=... node Backend/scripts/createAdmin.js');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminData = {
      email: ADMIN_SEED_EMAIL,
      password: ADMIN_SEED_PASSWORD,
      name: 'Meenakshi Admin',
      role: 'super-admin',
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email:', adminData.email);
      console.log('Would you like to update the password? (Run with UPDATE=true)');

      if (process.env.UPDATE === 'true') {
        existingAdmin.password = adminData.password;
        await existingAdmin.save();
        console.log('✅ Admin password updated successfully');
        console.log('Email:', adminData.email);
        console.log('Password: (set from ADMIN_SEED_PASSWORD)');
      }
    } else {
      // Create new admin
      const admin = new Admin(adminData);
      await admin.save();

      console.log('✅ Admin created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:', adminData.email);
      console.log('Password: (set from ADMIN_SEED_PASSWORD)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Change the password after first login');
    }

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();

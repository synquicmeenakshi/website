/**
 * Script to create admin user
 * Run: node backend/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminData = {
      email: 'admin@zenyourlife.be',
      password: 'ZenYourLife@Admin2026!', // Strong password
      name: 'ZenYourLife Admin',
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
        console.log('Password:', adminData.password);
      }
    } else {
      // Create new admin
      const admin = new Admin(adminData);
      await admin.save();

      console.log('✅ Admin created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:', adminData.email);
      console.log('Password:', adminData.password);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Save these credentials securely!');
      console.log('⚠️  Change the password after first login');
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

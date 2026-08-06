const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');
const Enrollment = require('./models/Enrollment');

const checkEnrollments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully\n');

    const enrollments = await Enrollment.find().populate('service');

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 TOTAL ENROLLMENTS IN DATABASE:', enrollments.length);
    console.log('═══════════════════════════════════════════════════════\n');

    if (enrollments.length === 0) {
      console.log('❌ No enrollments found in database');
    } else {
      enrollments.forEach((enrollment, index) => {
        console.log(`\n━━━━━━━━━━ ENROLLMENT ${index + 1} ━━━━━━━━━━`);
        console.log('🆔 Enrollment ID:', enrollment.enrollmentId);
        console.log('📅 Database ID:', enrollment._id);
        console.log('👤 Full Name:', enrollment.fullName);
        console.log('📧 Email:', enrollment.email);
        console.log('📱 Phone:', enrollment.phoneNumber);
        console.log('💆 Service:', enrollment.serviceTitle);
        console.log('📅 Date:', new Date(enrollment.appointmentDate).toLocaleDateString());
        console.log('⏰ Time:', enrollment.appointmentTime);
        console.log('✅ Status:', enrollment.status);
        console.log('🕐 Created:', new Date(enrollment.createdAt).toLocaleString());
      });
    }

    // Check Counter collection
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findById('enrollmentId');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔢 COUNTER INFORMATION:');
    console.log('═══════════════════════════════════════════════════════');
    if (counter) {
      console.log('Current Sequence Number:', counter.seq);
      console.log('Next Enrollment ID will be:', counter.seq + 1);
    } else {
      console.log('❌ Counter not initialized yet');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkEnrollments();

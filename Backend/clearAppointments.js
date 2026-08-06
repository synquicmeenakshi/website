require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

const clearAllAppointments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');

    // Delete all appointments
    const result = await Appointment.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} appointments from database`);

    console.log('✨ Database is now clean and ready for fresh testing!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing appointments:', error);
    process.exit(1);
  }
};

clearAllAppointments();

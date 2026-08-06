const mongoose = require('mongoose');
require('dotenv').config();

const { seedLegalPages } = require('./seeds/legalPagesSeed');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedLegalPages();
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

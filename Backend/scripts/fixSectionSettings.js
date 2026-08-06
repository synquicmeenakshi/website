const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected');
  const db = mongoose.connection.db;

  // Add Spanish to section settings translations
  const result = await db.collection('sectionsettings').updateOne(
    { sectionType: 'apartments' },
    { $set: { 'translations.es': { title: 'Alojamientos', description: '.' } } }
  );
  console.log('Section settings ES:', result.modifiedCount > 0 ? 'UPDATED' : 'NOT FOUND');

  await mongoose.disconnect();
}
run().catch(console.error);

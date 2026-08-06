const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const services = await Service.find().limit(5);
  for (const s of services) {
    console.log('\nService:', s.title);
    if (s.contentSections?.length) {
      console.log('  EN contentSections[0]:', JSON.stringify(s.contentSections[0]));
    }
    const fr = s.translations?.fr;
    if (fr?.contentSections?.length) {
      console.log('  FR contentSections[0]:', JSON.stringify(fr.contentSections[0]));
    } else {
      console.log('  FR contentSections: empty/missing');
    }
  }
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });

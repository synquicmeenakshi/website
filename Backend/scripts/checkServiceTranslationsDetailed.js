/**
 * Detailed check of service translations - shows which fields are in English vs translated
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');

const LANGS = ['fr', 'de', 'nl', 'es'];

function isSameAsEnglish(translated, english) {
  if (!translated || !english) return false;
  return translated.trim() === english.trim();
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const services = await Service.find().sort({ displayOrder: 1 });
  console.log(`Found ${services.length} services\n`);
  console.log('═'.repeat(90));

  let totalIssues = 0;

  for (const service of services) {
    const issues = [];

    for (const lang of LANGS) {
      const t = service.translations?.[lang];
      if (!t) { issues.push(`${lang.toUpperCase()}: NO TRANSLATIONS`); continue; }

      // Check title
      if (!t.title) issues.push(`${lang.toUpperCase()}.title: MISSING`);
      else if (isSameAsEnglish(t.title, service.title)) issues.push(`${lang.toUpperCase()}.title: UNTRANSLATED (EN)`);

      // Check description
      if (!t.description) issues.push(`${lang.toUpperCase()}.description: MISSING`);
      else if (isSameAsEnglish(t.description, service.description)) issues.push(`${lang.toUpperCase()}.description: UNTRANSLATED (EN)`);

      // Check benefits
      if (service.benefits?.length > 0) {
        if (!t.benefits?.length) issues.push(`${lang.toUpperCase()}.benefits: MISSING`);
        else if (t.benefits[0]?.description && isSameAsEnglish(t.benefits[0].description, service.benefits[0]?.description))
          issues.push(`${lang.toUpperCase()}.benefits: UNTRANSLATED (EN)`);
      }

      // Check targetAudience
      if (service.targetAudience?.length > 0) {
        if (!t.targetAudience?.length) issues.push(`${lang.toUpperCase()}.targetAudience: MISSING`);
        else if (t.targetAudience[0]?.description && isSameAsEnglish(t.targetAudience[0].description, service.targetAudience[0]?.description))
          issues.push(`${lang.toUpperCase()}.targetAudience: UNTRANSLATED (EN)`);
      }

      // Check contentSections
      if (service.contentSections?.length > 0) {
        if (!t.contentSections?.length) issues.push(`${lang.toUpperCase()}.contentSections: MISSING`);
        else {
          const firstCS = t.contentSections[0];
          const enCS = service.contentSections[0];
          if (!firstCS.description) issues.push(`${lang.toUpperCase()}.contentSections[0].description: MISSING`);
          else if (isSameAsEnglish(firstCS.description, enCS?.description))
            issues.push(`${lang.toUpperCase()}.contentSections: UNTRANSLATED (EN)`);
          if (isSameAsEnglish(firstCS.title, enCS?.title))
            issues.push(`${lang.toUpperCase()}.contentSections[0].title: UNTRANSLATED (EN)`);
        }
      }
    }

    if (issues.length === 0) {
      console.log(`✅ ${service.title}`);
    } else {
      console.log(`\n❌ ${service.title} (${service._id})`);
      issues.forEach(i => console.log(`   ⚠️  ${i}`));
      totalIssues += issues.length;
    }
  }

  console.log('\n' + '═'.repeat(90));
  console.log(`\nTotal issues: ${totalIssues}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

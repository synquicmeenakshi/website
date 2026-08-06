const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');

const LANGS = ['fr', 'de', 'nl', 'es'];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const services = await Service.find();

  console.log('TRANSLATION COVERAGE REPORT\n' + '═'.repeat(80));

  for (const s of services) {
    console.log(`\n📦 ${s.title}`);
    for (const lang of LANGS) {
      const t = s.translations?.[lang];
      if (!t) { console.log(`  ${lang.toUpperCase()}: ❌ MISSING`); continue; }
      const checks = {
        title: t.title ? (t.title !== s.title ? '✅' : '~') : '❌',
        desc: t.description ? (t.description !== s.description ? '✅' : '~') : '❌',
        benefits: s.benefits?.length ? (t.benefits?.length > 0 ? '✅' : '❌') : '-',
        audience: s.targetAudience?.length ? (t.targetAudience?.length > 0 ? '✅' : '❌') : '-',
        content: s.contentSections?.length ? (t.contentSections?.length > 0 && t.contentSections[0]?.description ? '✅' : '❌') : '-',
      };
      const allGood = Object.values(checks).every(v => v === '✅' || v === '-' || v === '~');
      const line = `  ${lang.toUpperCase()}: title=${checks.title} desc=${checks.desc} benefits=${checks.benefits} audience=${checks.audience} contentSections=${checks.content}`;
      console.log(allGood ? line : line + ' ⚠️');
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('Legend: ✅=translated ~ =brand-name (same OK) ❌=missing -=no source data');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

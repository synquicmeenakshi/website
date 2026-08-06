/**
 * COMPREHENSIVE TRANSLATION VERIFICATION
 * Reads every record, every translatable field, every language from the DB.
 * Shows actual stored values (truncated to 80 chars). No guessing, no hallucination.
 *
 * Collections: FAQ, Service, Property
 * Languages: fr, de, nl, es
 * Output: console + backend/scripts/translationReport.txt
 *
 * Run: node backend/scripts/verifyAllTranslations.js
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const FAQ = require('../models/FAQ');
const Service = require('../models/Service');
const { Property } = require('../models/Property');

const LANGS = ['fr', 'de', 'nl', 'es'];
const REPORT_FILE = path.join(__dirname, 'translationReport.txt');

const lines = [];
function out(line = '') {
  lines.push(line);
  process.stdout.write(line + '\n');
}

function val(v) {
  if (v === undefined || v === null) return '[MISSING]';
  const s = String(v).trim();
  if (!s) return '[EMPTY]';
  return s.length > 80 ? s.slice(0, 80) + '…' : s;
}

function statusOf(translatedStr, englishVal) {
  if (translatedStr === '[MISSING]' || translatedStr === '[EMPTY]') return '❌';
  if (translatedStr === val(englishVal)) return '~'; // same as English (may be brand name)
  return '✅';
}

// ──────────────────────────────────────────────────────────────────────────────
// FAQs
// ──────────────────────────────────────────────────────────────────────────────
async function checkFAQs() {
  out('\n' + '═'.repeat(90));
  out('📋 FAQs');
  out('═'.repeat(90));

  const faqs = await FAQ.find().sort({ category: 1, displayOrder: 1 });
  out(`Total FAQs in DB: ${faqs.length}\n`);

  let issues = 0;

  for (const faq of faqs) {
    out(`\n${'─'.repeat(90)}`);
    out(`ID: ${faq._id}  |  Category: ${faq.category}`);
    out(`EN Question: ${val(faq.question)}`);

    const t = faq.translations || {};

    for (const field of ['question', 'answer']) {
      const enVal = faq[field];
      out(`\n  [${field}]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.[field]);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }
  }

  out(`\n📊 FAQ missing (❌): ${issues}`);
  return issues;
}

// ──────────────────────────────────────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────────────────────────────────────
async function checkServices() {
  out('\n\n' + '═'.repeat(90));
  out('💆 Services');
  out('═'.repeat(90));

  const services = await Service.find().sort({ displayOrder: 1 });
  out(`Total Services in DB: ${services.length}\n`);

  let issues = 0;

  for (const svc of services) {
    out(`\n${'─'.repeat(90)}`);
    out(`ID: ${svc._id}`);
    out(`EN Title: ${val(svc.title)}`);

    const t = svc.translations || {};

    // title
    {
      const enVal = svc.title;
      out(`\n  [title]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.title);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // description
    {
      const enVal = svc.description;
      out(`\n  [description]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.description);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // benefits
    for (let i = 0; i < (svc.benefits?.length || 0); i++) {
      const b = svc.benefits[i];
      for (const subf of ['title', 'description']) {
        if (!b[subf]) continue;
        out(`\n  [benefits[${i}].${subf}]`);
        out(`    EN : ${val(b[subf])}`);
        for (const lang of LANGS) {
          const tStr = val(t[lang]?.benefits?.[i]?.[subf]);
          const st = statusOf(tStr, b[subf]);
          if (st === '❌') issues++;
          out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
        }
      }
    }

    // targetAudience
    for (let i = 0; i < (svc.targetAudience?.length || 0); i++) {
      const a = svc.targetAudience[i];
      for (const subf of ['title', 'description']) {
        if (!a[subf]) continue;
        out(`\n  [targetAudience[${i}].${subf}]`);
        out(`    EN : ${val(a[subf])}`);
        for (const lang of LANGS) {
          const tStr = val(t[lang]?.targetAudience?.[i]?.[subf]);
          const st = statusOf(tStr, a[subf]);
          if (st === '❌') issues++;
          out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
        }
      }
    }

    // contentSections
    for (let i = 0; i < (svc.contentSections?.length || 0); i++) {
      const s = svc.contentSections[i];
      for (const subf of ['title', 'description']) {
        if (!s[subf]) continue;
        out(`\n  [contentSections[${i}].${subf}]`);
        out(`    EN : ${val(s[subf])}`);
        for (const lang of LANGS) {
          const tStr = val(t[lang]?.contentSections?.[i]?.[subf]);
          const st = statusOf(tStr, s[subf]);
          if (st === '❌') issues++;
          out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
        }
      }
    }
  }

  out(`\n📊 Service missing (❌): ${issues}`);
  return issues;
}

// ──────────────────────────────────────────────────────────────────────────────
// Properties
// ──────────────────────────────────────────────────────────────────────────────
async function checkProperties() {
  out('\n\n' + '═'.repeat(90));
  out('🏠 Properties');
  out('═'.repeat(90));

  const properties = await Property.find().sort({ displayOrder: 1 });
  out(`Total Properties in DB: ${properties.length}\n`);

  let issues = 0;

  for (const prop of properties) {
    out(`\n${'─'.repeat(90)}`);
    out(`ID: ${prop._id}`);
    out(`Name: ${prop.name}`);

    const t = prop.translations || {};

    // Simple scalar fields
    const scalarFields = [
      ['description', prop.description],
      ['priceUnit', prop.priceUnit],
      ['parking', prop.parking],
    ];
    for (const [fieldName, enVal] of scalarFields) {
      if (!enVal) continue;
      out(`\n  [${fieldName}]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.[fieldName]);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // amenities[]
    for (let i = 0; i < (prop.amenities?.length || 0); i++) {
      const enVal = prop.amenities[i];
      if (!enVal) continue;
      out(`\n  [amenities[${i}]]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const arr = t[lang]?.amenities;
        const tStr = val(Array.isArray(arr) ? arr[i] : undefined);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // cleanliness
    for (const subf of ['title', 'description']) {
      const enVal = prop.cleanliness?.[subf];
      if (!enVal) continue;
      out(`\n  [cleanliness.${subf}]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.cleanliness?.[subf]);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // overview scalar fields
    for (const subf of ['title', 'description1', 'description2']) {
      const enVal = prop.overview?.[subf];
      if (!enVal) continue;
      out(`\n  [overview.${subf}]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.overview?.[subf]);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // overview.highlights[]
    for (let i = 0; i < (prop.overview?.highlights?.length || 0); i++) {
      const enVal = prop.overview.highlights[i];
      if (!enVal) continue;
      out(`\n  [overview.highlights[${i}]]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const arr = t[lang]?.overview?.highlights;
        const tStr = val(Array.isArray(arr) ? arr[i] : undefined);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // overview.features[]
    for (let i = 0; i < (prop.overview?.features?.length || 0); i++) {
      const f = prop.overview.features[i];
      for (const subf of ['title', 'description']) {
        const enVal = f[subf];
        if (!enVal) continue;
        out(`\n  [overview.features[${i}].${subf}]`);
        out(`    EN : ${val(enVal)}`);
        for (const lang of LANGS) {
          const arr = t[lang]?.overview?.features;
          const tStr = val(Array.isArray(arr) ? arr[i]?.[subf] : undefined);
          const st = statusOf(tStr, enVal);
          if (st === '❌') issues++;
          out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
        }
      }
    }

    // location scalar fields
    for (const subf of ['title', 'description']) {
      const enVal = prop.location?.[subf];
      if (!enVal) continue;
      out(`\n  [location.${subf}]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const tStr = val(t[lang]?.location?.[subf]);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }

    // location.places[]
    for (let i = 0; i < (prop.location?.places?.length || 0); i++) {
      const enVal = prop.location.places[i]?.title;
      if (!enVal) continue;
      out(`\n  [location.places[${i}].title]`);
      out(`    EN : ${val(enVal)}`);
      for (const lang of LANGS) {
        const arr = t[lang]?.location?.places;
        const tStr = val(Array.isArray(arr) ? arr[i]?.title : undefined);
        const st = statusOf(tStr, enVal);
        if (st === '❌') issues++;
        out(`    ${lang.toUpperCase()}: [${st}] ${tStr}`);
      }
    }
  }

  out(`\n📊 Property missing (❌): ${issues}`);
  return issues;
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  out('TRANSLATION VERIFICATION REPORT');
  out(`Generated: ${new Date().toISOString()}`);
  out('Legend: ✅=translated  ~ =same as EN (may be intentional brand name)  ❌=missing/empty\n');

  await mongoose.connect(process.env.MONGODB_URI);
  out('✅ Connected to MongoDB');

  const faqIssues = await checkFAQs();
  const svcIssues = await checkServices();
  const propIssues = await checkProperties();

  const total = faqIssues + svcIssues + propIssues;

  out('\n\n' + '═'.repeat(90));
  out('FINAL SUMMARY');
  out('═'.repeat(90));
  out(`  FAQ missing (❌):      ${faqIssues}`);
  out(`  Service missing (❌):  ${svcIssues}`);
  out(`  Property missing (❌): ${propIssues}`);
  out(`  TOTAL MISSING:         ${total}`);
  if (total === 0) {
    out('\n  ✅ All translations present!');
  } else {
    out(`\n  ⚠️  ${total} fields need attention. Search "❌" in the report.`);
  }
  out('═'.repeat(90));

  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8');
  console.log(`\n📄 Full report saved to: ${REPORT_FILE}`);

  process.exit(0);
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });

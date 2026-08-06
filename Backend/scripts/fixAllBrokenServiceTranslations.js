/**
 * Fix ALL broken service translations
 * Forces re-translation for any field where the stored value matches the English source
 * Uses correct DeepL API format (Authorization header, JSON body)
 * Run: node backend/scripts/fixAllBrokenServiceTranslations.js
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');

const LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_LANG_MAP = { fr: 'FR', de: 'DE', nl: 'NL', es: 'ES' };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, targetLang, retryCount = 0) {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;
  try {
    const response = await axios.post(
      DEEPL_API_URL,
      { text: [text], source_lang: 'EN', target_lang: DEEPL_LANG_MAP[targetLang] },
      { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    await sleep(350);
    const translated = response.data?.translations?.[0]?.text;
    if (!translated) return text;
    console.log(`    ✅ ${targetLang}: "${translated.substring(0, 60)}"`);
    return translated;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      const wait = (retryCount + 1) * 10000;
      console.log(`    ⏳ Rate limited, waiting ${wait / 1000}s...`);
      await sleep(wait);
      return translateText(text, targetLang, retryCount + 1);
    }
    console.error(`    ❌ DeepL error (${targetLang}): ${error.response?.status} ${error.message}`);
    return text;
  }
}

function isSameAsEnglish(a, b) {
  if (!a || !b) return true; // treat missing as needing translation
  return a.trim() === b.trim();
}

async function translateObjArray(enArr, targetLang) {
  const result = [];
  for (const item of enArr) {
    const obj = {};
    if (item.title) { obj.title = await translateText(item.title, targetLang); await sleep(150); }
    if (item.description) { obj.description = await translateText(item.description, targetLang); await sleep(150); }
    if (item.icon) obj.icon = item.icon;
    result.push(obj);
  }
  return result;
}

async function translateStrArray(enArr, targetLang) {
  const result = [];
  for (const str of enArr) {
    result.push(await translateText(str, targetLang));
    await sleep(150);
  }
  return result;
}

async function main() {
  console.log('🚀 Starting comprehensive service translation fix...\n');

  if (!process.env.DEEPL_API_KEY) {
    console.error('❌ DEEPL_API_KEY not found'); process.exit(1);
  }

  // Quick API test
  try {
    const test = await axios.post(DEEPL_API_URL,
      { text: ['Hello'], target_lang: 'FR' },
      { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    console.log(`✅ DeepL API test OK: "Hello" → "${test.data.translations[0].text}"\n`);
  } catch (e) {
    console.error(`❌ DeepL API test failed: ${e.response?.status} ${e.message}`); process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const services = await Service.find();
  let totalFixed = 0;

  for (const service of services) {
    if (!service.translations) service.translations = {};
    let modified = false;

    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📦 ${service.title}`);

    for (const lang of LANGUAGES) {
      if (!service.translations[lang]) service.translations[lang] = {};
      const t = service.translations[lang];
      let langFixed = false;

      // title
      if (isSameAsEnglish(t.title, service.title)) {
        console.log(`  🌐 ${lang.toUpperCase()}.title...`);
        t.title = await translateText(service.title, lang);
        modified = true; langFixed = true; totalFixed++;
      }

      // description
      if (isSameAsEnglish(t.description, service.description)) {
        console.log(`  🌐 ${lang.toUpperCase()}.description...`);
        t.description = await translateText(service.description, lang);
        modified = true; langFixed = true; totalFixed++;
      }

      // benefits
      if (service.benefits?.length > 0 && (
        !t.benefits?.length ||
        (t.benefits[0] && isSameAsEnglish(t.benefits[0].description, service.benefits[0]?.description))
      )) {
        console.log(`  🌐 ${lang.toUpperCase()}.benefits (${service.benefits.length} items)...`);
        t.benefits = await translateObjArray(service.benefits, lang);
        modified = true; langFixed = true; totalFixed++;
      }

      // targetAudience
      if (service.targetAudience?.length > 0 && (
        !t.targetAudience?.length ||
        (t.targetAudience[0] && isSameAsEnglish(t.targetAudience[0].description, service.targetAudience[0]?.description))
      )) {
        console.log(`  🌐 ${lang.toUpperCase()}.targetAudience (${service.targetAudience.length} items)...`);
        t.targetAudience = await translateObjArray(service.targetAudience, lang);
        modified = true; langFixed = true; totalFixed++;
      }

      // contentSections
      if (service.contentSections?.length > 0 && (
        !t.contentSections?.length ||
        !t.contentSections[0]?.description ||
        isSameAsEnglish(t.contentSections[0]?.description, service.contentSections[0]?.description) ||
        isSameAsEnglish(t.contentSections[0]?.title, service.contentSections[0]?.title)
      )) {
        console.log(`  🌐 ${lang.toUpperCase()}.contentSections (${service.contentSections.length} items)...`);
        t.contentSections = await translateObjArray(service.contentSections, lang);
        modified = true; langFixed = true; totalFixed++;
      }

      if (!langFixed) {
        console.log(`  ✓ ${lang.toUpperCase()}: all translations OK`);
      }
    }

    if (modified) {
      service.markModified('translations');
      await service.save();
      console.log(`  💾 Saved: ${service.title}`);
    } else {
      console.log(`  ⊘ No changes needed`);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`✅ Done! Fixed ${totalFixed} translation fields.`);
  process.exit(0);
}

main().catch(e => { console.error('\n❌ Fatal:', e.message); process.exit(1); });

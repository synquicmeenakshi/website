/**
 * Fix empty title fields within already-translated benefits and targetAudience arrays.
 * The description was translated correctly but title was stored as "" (empty string).
 * Run: node backend/scripts/fixMissingArrayTitles.js
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Service = require('../models/Service');

const LANGS = ['fr', 'de', 'nl', 'es'];
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
    return response.data?.translations?.[0]?.text || text;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      await sleep((retryCount + 1) * 10000);
      return translateText(text, targetLang, retryCount + 1);
    }
    console.error(`  ❌ ${targetLang}: ${error.response?.status} ${error.message}`);
    return text;
  }
}

async function main() {
  console.log('🔧 Fixing empty titles in translated benefits/targetAudience arrays...\n');

  // Test API first
  try {
    const r = await axios.post(DEEPL_API_URL,
      { text: ['Test'], target_lang: 'FR' },
      { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    console.log(`✅ DeepL OK: "Test" → "${r.data.translations[0].text}"\n`);
  } catch (e) {
    console.error('❌ DeepL API failed:', e.message); process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const services = await Service.find();
  let totalFixed = 0;

  for (const svc of services) {
    let modified = false;
    if (!svc.translations) continue;

    for (const lang of LANGS) {
      const t = svc.translations[lang];
      if (!t) continue;

      // Fix benefits titles
      if (svc.benefits?.length > 0 && t.benefits?.length > 0) {
        for (let i = 0; i < svc.benefits.length; i++) {
          const enTitle = svc.benefits[i]?.title;
          const tTitle = t.benefits[i]?.title;
          if (enTitle && (!tTitle || tTitle.trim() === '')) {
            console.log(`  🌐 ${svc.title} | ${lang.toUpperCase()} | benefits[${i}].title`);
            const translated = await translateText(enTitle, lang);
            console.log(`    EN: "${enTitle}" → ${lang.toUpperCase()}: "${translated}"`);
            if (!t.benefits[i]) t.benefits[i] = {};
            t.benefits[i].title = translated;
            modified = true;
            totalFixed++;
          }
        }
      }

      // Fix targetAudience titles
      if (svc.targetAudience?.length > 0 && t.targetAudience?.length > 0) {
        for (let i = 0; i < svc.targetAudience.length; i++) {
          const enTitle = svc.targetAudience[i]?.title;
          const tTitle = t.targetAudience[i]?.title;
          if (enTitle && (!tTitle || tTitle.trim() === '')) {
            console.log(`  🌐 ${svc.title} | ${lang.toUpperCase()} | targetAudience[${i}].title`);
            const translated = await translateText(enTitle, lang);
            console.log(`    EN: "${enTitle}" → ${lang.toUpperCase()}: "${translated}"`);
            if (!t.targetAudience[i]) t.targetAudience[i] = {};
            t.targetAudience[i].title = translated;
            modified = true;
            totalFixed++;
          }
        }
      }
    }

    if (modified) {
      svc.markModified('translations');
      await svc.save();
      console.log(`  💾 Saved: ${svc.title}\n`);
    }
  }

  console.log(`\n✅ Done. Fixed ${totalFixed} empty title fields.`);
  process.exit(0);
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });

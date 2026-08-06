/**
 * Fix services where contentSections translations contain the original English text
 * Detects untranslated contentSections by comparing title with English source
 * Run: node backend/scripts/fixUntranslatedContentSections.js
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
    const response = await axios.post(DEEPL_API_URL,
      { text: [text], source_lang: 'EN', target_lang: DEEPL_LANG_MAP[targetLang] },
      { headers: { 'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    await sleep(400);
    return response.data?.translations?.[0]?.text || text;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      await sleep((retryCount + 1) * 8000);
      return translateText(text, targetLang, retryCount + 1);
    }
    console.error(`  ❌ Error: ${error.message}`);
    return text;
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const services = await Service.find();
  console.log(`Found ${services.length} services\n`);

  let fixed = 0;

  for (const service of services) {
    if (!service.contentSections?.length) continue;

    let modified = false;
    if (!service.translations) service.translations = {};

    for (const lang of LANGUAGES) {
      if (!service.translations[lang]) service.translations[lang] = {};
      const t = service.translations[lang];

      // Check if contentSections need translation:
      // 1. Missing entirely
      // 2. Has wrong length vs source
      // 3. First item title matches English (not translated)
      const needsTranslation = !t.contentSections?.length ||
        t.contentSections.length !== service.contentSections.length ||
        (t.contentSections[0]?.title === service.contentSections[0]?.title) ||
        !t.contentSections[0]?.description;

      if (needsTranslation) {
        console.log(`  🌐 Translating ${lang.toUpperCase()} contentSections for "${service.title}"...`);
        t.contentSections = [];
        for (const s of service.contentSections) {
          const item = {};
          if (s.title) { item.title = await translateText(s.title, lang); await sleep(200); }
          if (s.description) { item.description = await translateText(s.description, lang); await sleep(200); }
          t.contentSections.push(item);
        }
        console.log(`  ✅ ${lang.toUpperCase()}: ${t.contentSections.length} sections translated`);
        modified = true;
        fixed++;
      } else {
        // Verify description exists in each item
        const missingDesc = t.contentSections.some(cs => !cs.description);
        if (missingDesc) {
          console.log(`  🌐 Fixing ${lang.toUpperCase()} contentSections descriptions for "${service.title}"...`);
          t.contentSections = [];
          for (const s of service.contentSections) {
            const item = {};
            if (s.title) { item.title = await translateText(s.title, lang); await sleep(200); }
            if (s.description) { item.description = await translateText(s.description, lang); await sleep(200); }
            t.contentSections.push(item);
          }
          console.log(`  ✅ ${lang.toUpperCase()}: fixed`);
          modified = true;
          fixed++;
        }
      }
    }

    if (modified) {
      service.markModified('translations');
      await service.save();
      console.log(`💾 Saved: ${service.title}\n`);
    }
  }

  console.log(`\n✅ Done. Fixed contentSections for ${fixed} language-service combinations.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

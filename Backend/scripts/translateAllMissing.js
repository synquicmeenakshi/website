/**
 * Comprehensive Translation Script - Fills ALL missing translations
 * Services: title, description, benefits, targetAudience, contentSections
 * Properties: name, description, priceUnit, parking, amenities, cleanliness,
 *             overview (title, description1, description2, highlights, features),
 *             location (title, description, places)
 * Run: node backend/scripts/translateAllMissing.js
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Service = require('../models/Service');
const { Property } = require('../models/Property');

const LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_LANG_MAP = { fr: 'FR', de: 'DE', nl: 'NL', es: 'ES' };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, targetLang, retryCount = 0) {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;

  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: process.env.DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: DEEPL_LANG_MAP[targetLang]
      }
    });
    await sleep(400);
    if (response.data?.translations?.[0]) {
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      const wait = (retryCount + 1) * 8000;
      console.log(`      ⏳ Rate limited, waiting ${wait / 1000}s...`);
      await sleep(wait);
      return translateText(text, targetLang, retryCount + 1);
    }
    console.error(`      ❌ Translation error (${targetLang}): ${error.message}`);
    return text;
  }
}

async function translateArray(arr, targetLang) {
  const result = [];
  for (const item of arr) {
    result.push(await translateText(item, targetLang));
    await sleep(200);
  }
  return result;
}

// ──────────────────────────────────────────────────────────────
// SERVICES
// ──────────────────────────────────────────────────────────────

async function translateServices() {
  console.log('\n' + '═'.repeat(80));
  console.log('📦 TRANSLATING SERVICES');
  console.log('═'.repeat(80));

  const services = await Service.find();
  console.log(`Found ${services.length} services\n`);

  let totalTranslated = 0;
  let totalSkipped = 0;

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    console.log(`\n[${i + 1}/${services.length}] ${service.title}`);
    console.log('─'.repeat(60));

    if (!service.translations) service.translations = {};
    let modified = false;

    for (const lang of LANGUAGES) {
      console.log(`  ${lang.toUpperCase()}:`);
      if (!service.translations[lang]) service.translations[lang] = {};
      const t = service.translations[lang];

      // title
      if (!t.title?.trim()) {
        t.title = await translateText(service.title, lang);
        console.log(`    ✅ title: "${t.title.substring(0, 50)}"`);
        modified = true; totalTranslated++;
      } else {
        console.log(`    ⊘ title: exists`);
        totalSkipped++;
      }

      // description
      if (!t.description?.trim()) {
        t.description = await translateText(service.description, lang);
        console.log(`    ✅ description (${t.description.length} chars)`);
        modified = true; totalTranslated++;
      } else {
        console.log(`    ⊘ description: exists`);
        totalSkipped++;
      }

      // benefits
      if (service.benefits?.length > 0) {
        if (!t.benefits?.length) {
          t.benefits = [];
          for (const b of service.benefits) {
            const item = {};
            if (b.title) { item.title = await translateText(b.title, lang); await sleep(200); }
            if (b.description) { item.description = await translateText(b.description, lang); await sleep(200); }
            if (b.icon) item.icon = b.icon;
            t.benefits.push(item);
          }
          console.log(`    ✅ benefits (${t.benefits.length} items)`);
          modified = true; totalTranslated++;
        } else {
          console.log(`    ⊘ benefits: exists (${t.benefits.length} items)`);
          totalSkipped++;
        }
      }

      // targetAudience
      if (service.targetAudience?.length > 0) {
        if (!t.targetAudience?.length) {
          t.targetAudience = [];
          for (const a of service.targetAudience) {
            const item = {};
            if (a.title) { item.title = await translateText(a.title, lang); await sleep(200); }
            if (a.description) { item.description = await translateText(a.description, lang); await sleep(200); }
            if (a.icon) item.icon = a.icon;
            t.targetAudience.push(item);
          }
          console.log(`    ✅ targetAudience (${t.targetAudience.length} items)`);
          modified = true; totalTranslated++;
        } else {
          console.log(`    ⊘ targetAudience: exists (${t.targetAudience.length} items)`);
          totalSkipped++;
        }
      }

      // contentSections (fix: uses .description not .content)
      if (service.contentSections?.length > 0) {
        if (!t.contentSections?.length) {
          t.contentSections = [];
          for (const s of service.contentSections) {
            const item = {};
            if (s.title) { item.title = await translateText(s.title, lang); await sleep(200); }
            if (s.description) { item.description = await translateText(s.description, lang); await sleep(200); }
            t.contentSections.push(item);
          }
          console.log(`    ✅ contentSections (${t.contentSections.length} items)`);
          modified = true; totalTranslated++;
        } else {
          console.log(`    ⊘ contentSections: exists (${t.contentSections.length} items)`);
          totalSkipped++;
        }
      }
    }

    if (modified) {
      service.markModified('translations');
      await service.save();
      console.log(`  💾 Saved`);
    } else {
      console.log(`  ⊘ No changes needed`);
    }
  }

  console.log(`\n📊 Services: ${totalTranslated} fields translated, ${totalSkipped} skipped`);
}

// ──────────────────────────────────────────────────────────────
// PROPERTIES
// ──────────────────────────────────────────────────────────────

async function translateProperties() {
  console.log('\n' + '═'.repeat(80));
  console.log('🏠 TRANSLATING PROPERTIES');
  console.log('═'.repeat(80));

  const properties = await Property.find();
  console.log(`Found ${properties.length} properties\n`);

  let totalTranslated = 0;
  let totalSkipped = 0;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    console.log(`\n[${i + 1}/${properties.length}] ${property.name}`);
    console.log('─'.repeat(60));

    if (!property.translations) property.translations = {};
    let modified = false;

    for (const lang of LANGUAGES) {
      console.log(`  ${lang.toUpperCase()}:`);
      if (!property.translations[lang]) property.translations[lang] = {};
      const t = property.translations[lang];

      // name (keep as-is for proper nouns, don't translate)
      if (!t.name) {
        t.name = property.name;
        modified = true; totalTranslated++;
        console.log(`    ✅ name (kept as-is): "${t.name}"`);
      } else {
        console.log(`    ⊘ name: exists`);
        totalSkipped++;
      }

      // description
      if (!t.description?.trim()) {
        t.description = await translateText(property.description, lang);
        console.log(`    ✅ description (${t.description.length} chars)`);
        modified = true; totalTranslated++;
      } else {
        console.log(`    ⊘ description: exists`);
        totalSkipped++;
      }

      // priceUnit
      if (property.priceUnit && !t.priceUnit?.trim()) {
        t.priceUnit = await translateText(property.priceUnit, lang);
        console.log(`    ✅ priceUnit: "${t.priceUnit}"`);
        modified = true; totalTranslated++;
      } else if (property.priceUnit) {
        console.log(`    ⊘ priceUnit: exists`);
        totalSkipped++;
      }

      // parking
      if (property.parking && !t.parking?.trim()) {
        t.parking = await translateText(property.parking, lang);
        console.log(`    ✅ parking: "${t.parking}"`);
        modified = true; totalTranslated++;
      } else if (property.parking) {
        console.log(`    ⊘ parking: exists`);
        totalSkipped++;
      }

      // amenities
      if (property.amenities?.length > 0) {
        if (!t.amenities?.length) {
          t.amenities = await translateArray(property.amenities, lang);
          console.log(`    ✅ amenities (${t.amenities.length} items)`);
          modified = true; totalTranslated++;
        } else {
          console.log(`    ⊘ amenities: exists (${t.amenities.length} items)`);
          totalSkipped++;
        }
      }

      // cleanliness
      if (property.cleanliness) {
        if (!t.cleanliness) t.cleanliness = {};
        if (!t.cleanliness.title?.trim() && property.cleanliness.title) {
          t.cleanliness.title = await translateText(property.cleanliness.title, lang);
          console.log(`    ✅ cleanliness.title: "${t.cleanliness.title}"`);
          modified = true; totalTranslated++;
        } else {
          console.log(`    ⊘ cleanliness.title: exists`);
          totalSkipped++;
        }
        if (!t.cleanliness.description?.trim() && property.cleanliness.description) {
          t.cleanliness.description = await translateText(property.cleanliness.description, lang);
          console.log(`    ✅ cleanliness.description (${t.cleanliness.description.length} chars)`);
          modified = true; totalTranslated++;
        } else {
          console.log(`    ⊘ cleanliness.description: exists`);
          totalSkipped++;
        }
      }

      // overview
      if (property.overview) {
        if (!t.overview) t.overview = {};

        if (property.overview.title && !t.overview.title?.trim()) {
          t.overview.title = await translateText(property.overview.title, lang);
          console.log(`    ✅ overview.title: "${t.overview.title.substring(0, 50)}"`);
          modified = true; totalTranslated++;
        } else if (property.overview.title) {
          console.log(`    ⊘ overview.title: exists`);
          totalSkipped++;
        }

        if (property.overview.description1 && !t.overview.description1?.trim()) {
          t.overview.description1 = await translateText(property.overview.description1, lang);
          console.log(`    ✅ overview.description1 (${t.overview.description1.length} chars)`);
          modified = true; totalTranslated++;
        } else if (property.overview.description1) {
          console.log(`    ⊘ overview.description1: exists`);
          totalSkipped++;
        }

        if (property.overview.description2 && !t.overview.description2?.trim()) {
          t.overview.description2 = await translateText(property.overview.description2, lang);
          console.log(`    ✅ overview.description2 (${t.overview.description2.length} chars)`);
          modified = true; totalTranslated++;
        } else if (property.overview.description2) {
          console.log(`    ⊘ overview.description2: exists`);
          totalSkipped++;
        }

        if (property.overview.highlights?.length > 0) {
          if (!t.overview.highlights?.length) {
            t.overview.highlights = await translateArray(property.overview.highlights, lang);
            console.log(`    ✅ overview.highlights (${t.overview.highlights.length} items)`);
            modified = true; totalTranslated++;
          } else {
            console.log(`    ⊘ overview.highlights: exists (${t.overview.highlights.length} items)`);
            totalSkipped++;
          }
        }

        // overview.features
        if (property.overview.features?.length > 0) {
          if (!t.overview.features?.length) {
            t.overview.features = [];
            for (const f of property.overview.features) {
              const item = {};
              if (f.title) { item.title = await translateText(f.title, lang); await sleep(200); }
              if (f.description) { item.description = await translateText(f.description, lang); await sleep(200); }
              t.overview.features.push(item);
            }
            console.log(`    ✅ overview.features (${t.overview.features.length} items)`);
            modified = true; totalTranslated++;
          } else {
            console.log(`    ⊘ overview.features: exists (${t.overview.features.length} items)`);
            totalSkipped++;
          }
        }
      }

      // location
      if (property.location) {
        if (!t.location) t.location = {};

        if (property.location.title && !t.location.title?.trim()) {
          t.location.title = await translateText(property.location.title, lang);
          console.log(`    ✅ location.title: "${t.location.title}"`);
          modified = true; totalTranslated++;
        } else if (property.location.title) {
          console.log(`    ⊘ location.title: exists`);
          totalSkipped++;
        }

        if (property.location.description && !t.location.description?.trim()) {
          t.location.description = await translateText(property.location.description, lang);
          console.log(`    ✅ location.description (${t.location.description.length} chars)`);
          modified = true; totalTranslated++;
        } else if (property.location.description) {
          console.log(`    ⊘ location.description: exists`);
          totalSkipped++;
        }

        if (property.location.places?.length > 0) {
          if (!t.location.places?.length) {
            t.location.places = [];
            for (const p of property.location.places) {
              const item = {};
              if (p.title) { item.title = await translateText(p.title, lang); await sleep(200); }
              t.location.places.push(item);
            }
            console.log(`    ✅ location.places (${t.location.places.length} items)`);
            modified = true; totalTranslated++;
          } else {
            console.log(`    ⊘ location.places: exists (${t.location.places.length} items)`);
            totalSkipped++;
          }
        }
      }
    }

    if (modified) {
      property.markModified('translations');
      await property.save();
      console.log(`  💾 Saved`);
    } else {
      console.log(`  ⊘ No changes needed`);
    }
  }

  console.log(`\n📊 Properties: ${totalTranslated} fields translated, ${totalSkipped} skipped`);
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log('🚀 Starting comprehensive translation fill...\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await translateServices();
    await translateProperties();

    console.log('\n' + '═'.repeat(80));
    console.log('✅ ALL TRANSLATIONS COMPLETE!');
    console.log('═'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

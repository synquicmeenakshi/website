/**
 * Translate PageContent document - Add translations for FR, DE, NL, ES
 */

const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const PageContent = require('../models/PageContent');

const LANGUAGES = ['fr', 'de', 'nl', 'es'];
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

const DEEPL_LANG_MAP = {
  'fr': 'FR',
  'de': 'DE',
  'nl': 'NL',
  'es': 'ES'
};

async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  try {
    const response = await axios.post(DEEPL_API_URL, null, {
      params: {
        auth_key: process.env.DEEPL_API_KEY,
        text: text,
        source_lang: 'EN',
        target_lang: DEEPL_LANG_MAP[targetLang]
      }
    });

    if (response.data && response.data.translations && response.data.translations[0]) {
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    console.error(`      ❌ Translation error: ${error.message}`);
    return text;
  }
}

async function translatePageContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    if (!process.env.DEEPL_API_KEY) {
      console.error('❌ DEEPL_API_KEY not found in .env file');
      process.exit(1);
    }

    const pageContents = await PageContent.find();
    console.log(`📋 Found ${pageContents.length} PageContent documents\n`);
    console.log('━'.repeat(80));

    let stats = { total: pageContents.length, translated: 0, skipped: 0, errors: 0 };

    for (let i = 0; i < pageContents.length; i++) {
      const doc = pageContents[i];
      const pageId = doc.pageId || `Page ${i + 1}`;
      console.log(`\n[${i + 1}/${pageContents.length}] ${pageId}`);
      console.log('─'.repeat(80));

      if (!doc.translations) {
        doc.translations = {};
      }

      let docModified = false;

      for (const lang of LANGUAGES) {
        console.log(`\n   ${lang.toUpperCase()}:`);

        if (!doc.translations[lang]) {
          doc.translations[lang] = {};
        }

        // Translate hero section
        if (!doc.translations[lang].hero) {
          doc.translations[lang].hero = {};
        }

        if (doc.hero?.title && (!doc.translations[lang].hero.title || doc.translations[lang].hero.title.trim() === '')) {
          console.log(`      🌐 Translating hero title...`);
          doc.translations[lang].hero.title = await translateText(doc.hero.title, lang);
          console.log(`      ✅ Hero title translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.hero?.title) {
          console.log(`      ✓ Hero title already exists`);
          stats.skipped++;
        }

        if (doc.hero?.subtitle && (!doc.translations[lang].hero.subtitle || doc.translations[lang].hero.subtitle.trim() === '')) {
          console.log(`      🌐 Translating hero subtitle...`);
          doc.translations[lang].hero.subtitle = await translateText(doc.hero.subtitle, lang);
          console.log(`      ✅ Hero subtitle translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.hero?.subtitle) {
          console.log(`      ✓ Hero subtitle already exists`);
          stats.skipped++;
        }

        if (doc.hero?.badgeText && (!doc.translations[lang].hero.badgeText || doc.translations[lang].hero.badgeText.trim() === '')) {
          console.log(`      🌐 Translating hero badge...`);
          doc.translations[lang].hero.badgeText = await translateText(doc.hero.badgeText, lang);
          console.log(`      ✅ Hero badge translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.hero?.badgeText) {
          console.log(`      ✓ Hero badge already exists`);
          stats.skipped++;
        }

        if (doc.hero?.buttonText && (!doc.translations[lang].hero.buttonText || doc.translations[lang].hero.buttonText.trim() === '')) {
          console.log(`      🌐 Translating hero button...`);
          doc.translations[lang].hero.buttonText = await translateText(doc.hero.buttonText, lang);
          console.log(`      ✅ Hero button translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.hero?.buttonText) {
          console.log(`      ✓ Hero button already exists`);
          stats.skipped++;
        }

        // Translate statistics
        if (doc.statistics && doc.statistics.length > 0) {
          if (!doc.translations[lang].statistics) {
            doc.translations[lang].statistics = [];
          }

          for (let j = 0; j < doc.statistics.length; j++) {
            const stat = doc.statistics[j];

            if (!doc.translations[lang].statistics[j]) {
              doc.translations[lang].statistics[j] = {};
            }

            if (stat.value) {
              doc.translations[lang].statistics[j].value = stat.value;
            }

            if (stat.label && (!doc.translations[lang].statistics[j].label || doc.translations[lang].statistics[j].label.trim() === '')) {
              console.log(`      🌐 Translating statistic ${j + 1} label...`);
              doc.translations[lang].statistics[j].label = await translateText(stat.label, lang);
              console.log(`      ✅ Statistic ${j + 1} label translated`);
              docModified = true;
              stats.translated++;
              await new Promise(resolve => setTimeout(resolve, 300));
            } else if (stat.label) {
              console.log(`      ✓ Statistic ${j + 1} label already exists`);
              stats.skipped++;
            }
          }
        }

        // Translate section headers
        if (!doc.translations[lang].sectionHeaders) {
          doc.translations[lang].sectionHeaders = {};
        }

        if (doc.sectionHeaders?.services) {
          if (!doc.translations[lang].sectionHeaders.services) {
            doc.translations[lang].sectionHeaders.services = {};
          }

          if (doc.sectionHeaders.services.title && (!doc.translations[lang].sectionHeaders.services.title || doc.translations[lang].sectionHeaders.services.title.trim() === '')) {
            console.log(`      🌐 Translating services section title...`);
            doc.translations[lang].sectionHeaders.services.title = await translateText(doc.sectionHeaders.services.title, lang);
            console.log(`      ✅ Services section title translated`);
            docModified = true;
            stats.translated++;
            await new Promise(resolve => setTimeout(resolve, 300));
          } else if (doc.sectionHeaders.services.title) {
            console.log(`      ✓ Services section title already exists`);
            stats.skipped++;
          }

          if (doc.sectionHeaders.services.subtitle && (!doc.translations[lang].sectionHeaders.services.subtitle || doc.translations[lang].sectionHeaders.services.subtitle.trim() === '')) {
            console.log(`      🌐 Translating services section subtitle...`);
            doc.translations[lang].sectionHeaders.services.subtitle = await translateText(doc.sectionHeaders.services.subtitle, lang);
            console.log(`      ✅ Services section subtitle translated`);
            docModified = true;
            stats.translated++;
            await new Promise(resolve => setTimeout(resolve, 300));
          } else if (doc.sectionHeaders.services.subtitle) {
            console.log(`      ✓ Services section subtitle already exists`);
            stats.skipped++;
          }
        }

        // Translate SEO
        if (!doc.translations[lang].seo) {
          doc.translations[lang].seo = {};
        }

        if (doc.seo?.metaTitle && (!doc.translations[lang].seo.metaTitle || doc.translations[lang].seo.metaTitle.trim() === '')) {
          console.log(`      🌐 Translating SEO meta title...`);
          doc.translations[lang].seo.metaTitle = await translateText(doc.seo.metaTitle, lang);
          console.log(`      ✅ SEO meta title translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.seo?.metaTitle) {
          console.log(`      ✓ SEO meta title already exists`);
          stats.skipped++;
        }

        if (doc.seo?.metaDescription && (!doc.translations[lang].seo.metaDescription || doc.translations[lang].seo.metaDescription.trim() === '')) {
          console.log(`      🌐 Translating SEO meta description...`);
          doc.translations[lang].seo.metaDescription = await translateText(doc.seo.metaDescription, lang);
          console.log(`      ✅ SEO meta description translated`);
          docModified = true;
          stats.translated++;
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (doc.seo?.metaDescription) {
          console.log(`      ✓ SEO meta description already exists`);
          stats.skipped++;
        }

        if (doc.seo?.keywords && doc.seo.keywords.length > 0) {
          if (!doc.translations[lang].seo.keywords || doc.translations[lang].seo.keywords.length === 0) {
            console.log(`      🌐 Translating SEO keywords...`);
            doc.translations[lang].seo.keywords = [];
            for (const keyword of doc.seo.keywords) {
              const translated = await translateText(keyword, lang);
              doc.translations[lang].seo.keywords.push(translated);
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            console.log(`      ✅ SEO keywords translated (${doc.seo.keywords.length} keywords)`);
            docModified = true;
            stats.translated++;
          } else {
            console.log(`      ✓ SEO keywords already exist`);
            stats.skipped++;
          }
        }
      }

      if (docModified) {
        try {
          await doc.save();
          console.log(`\n   💾 Saved successfully`);
        } catch (error) {
          console.error(`\n   ❌ Save error: ${error.message}`);
          stats.errors++;
        }
      } else {
        console.log(`\n   ⊘ No changes needed`);
      }
    }

    console.log('\n' + '━'.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('━'.repeat(80));
    console.log(`   PageContent documents processed: ${stats.total}`);
    console.log(`   ✅ Fields translated: ${stats.translated}`);
    console.log(`   ⊘ Already existed: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('━'.repeat(80));

    console.log('\n✅ PageContent translation complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting PageContent translation...\n');
translatePageContent();

/**
 * Seed the Meenakshi collections FROM the frontend's own data files.
 *
 * The point of importing rather than retyping: the seeded content is by
 * construction identical to what the site renders today, so switching the
 * frontend from static imports to the API cannot change a single character.
 *
 * Idempotent — upserts by natural key, so it is safe to re-run.
 *
 *   node scripts/seedMeenakshi.js
 *   node scripts/seedMeenakshi.js --force   (overwrite existing docs)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const { pathToFileURL } = require('url');

const MeenakshiService = require('../models/MeenakshiService');
const MeenakshiTestimonial = require('../models/MeenakshiTestimonial');
const MeenakshiFaq = require('../models/MeenakshiFaq');
const MeenakshiJourneyStep = require('../models/MeenakshiJourneyStep');
const MeenakshiLegalPage = require('../models/MeenakshiLegalPage');
const MeenakshiSettings = require('../models/MeenakshiSettings');

const DATA_DIR = path.resolve(__dirname, '../../frontend/src/data');
const force = process.argv.includes('--force');

// The data files are ES modules; this script is CommonJS. Dynamic import
// bridges the two, and pathToFileURL keeps it working on Windows paths.
const load = (file) => import(pathToFileURL(path.join(DATA_DIR, file)).href);

/** [heading, ...rest] tuple -> {heading, body} / {heading, paragraphs} */
const toPair = ([heading, body]) => ({ heading, body });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const [services, testimonials, faq, journey, legal, site] = await Promise.all([
    load('services.js'),
    load('testimonials.js'),
    load('faq.js'),
    load('journey.js'),
    load('legal.js'),
    load('site.js')
  ]);

  const report = [];

  /* ---- services ---------------------------------------------------------- */
  let n = 0;
  for (const [i, s] of services.SERVICES.entries()) {
    const doc = {
      slug: s.slug,
      n: s.n,
      title: s.title,
      short: s.short || '',
      deva: s.deva || '',
      lede: s.lede || '',
      intro: s.intro || '',
      img: s.img || '',
      alt: s.alt || '',
      scene: s.scene || '',
      sceneAlt: s.sceneAlt || '',
      questions: s.questions || [],
      items: s.items || [],
      displayOrder: i,
      isActive: true
    };
    const existing = await MeenakshiService.findOne({ slug: s.slug });
    if (existing && !force) continue;
    await MeenakshiService.findOneAndUpdate({ slug: s.slug }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  report.push(['Services', n, services.SERVICES.length]);

  /* ---- testimonials ------------------------------------------------------ */
  n = 0;
  const allTestimonials = [
    ...testimonials.TESTIMONIALS.map((t, i) => ({ ...t, isFeatured: false, displayOrder: i })),
    { ...testimonials.FEATURED_QUOTE, isFeatured: true, displayOrder: 999 }
  ];
  for (const t of allTestimonials) {
    const key = { name: t.name, short: t.short };
    const existing = await MeenakshiTestimonial.findOne(key);
    if (existing && !force) continue;
    await MeenakshiTestimonial.findOneAndUpdate(key, {
      short: t.short,
      quote: t.quote,
      name: t.name,
      cat: t.cat || '',
      city: t.city || '',
      service: t.service || '',
      isFeatured: t.isFeatured,
      displayOrder: t.displayOrder,
      isActive: true
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  report.push(['Testimonials', n, allTestimonials.length]);

  /* ---- faqs -------------------------------------------------------------- */
  // FAQ_HOME is a hand-picked subset of FAQ_GROUPS, referenced by index in the
  // source. Match on question text so the selection survives reordering.
  const homeQuestions = new Map(faq.FAQ_HOME.map((item, i) => [item.q, i]));
  n = 0;
  let total = 0;

  for (const [gi, group] of faq.FAQ_GROUPS.entries()) {
    for (const [ii, item] of group.items.entries()) {
      total++;
      const key = { q: item.q, placement: 'faq' };
      const existing = await MeenakshiFaq.findOne(key);
      if (existing && !force) continue;
      await MeenakshiFaq.findOneAndUpdate(key, {
        q: item.q,
        a: item.a,
        group: group.group,
        placement: 'faq',
        showOnHome: homeQuestions.has(item.q),
        homeOrder: homeQuestions.has(item.q) ? homeQuestions.get(item.q) : 0,
        groupOrder: gi,
        displayOrder: ii,
        isActive: true
      }, { upsert: true, new: true, setDefaultsOnInsert: true });
      n++;
    }
  }

  for (const [i, item] of faq.BOOK_FAQ.entries()) {
    total++;
    const key = { q: item.q, placement: 'book' };
    const existing = await MeenakshiFaq.findOne(key);
    if (existing && !force) continue;
    await MeenakshiFaq.findOneAndUpdate(key, {
      q: item.q,
      a: item.a,
      group: '',
      placement: 'book',
      showOnHome: false,
      displayOrder: i,
      isActive: true
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  report.push(['FAQs', n, total]);

  /* ---- journey ----------------------------------------------------------- */
  n = 0;
  for (const [i, step] of journey.JOURNEY.entries()) {
    const key = { n: step.n };
    const existing = await MeenakshiJourneyStep.findOne(key);
    if (existing && !force) continue;
    await MeenakshiJourneyStep.findOneAndUpdate(key, {
      n: step.n,
      title: step.title,
      body: step.body,
      aside: step.aside || '',
      displayOrder: i,
      isActive: true
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  report.push(['Journey steps', n, journey.JOURNEY.length]);

  /* ---- legal pages ------------------------------------------------------- */
  n = 0;
  const legalEntries = Object.entries(legal.LEGAL);
  for (const [i, [slug, page]] of legalEntries.entries()) {
    const existing = await MeenakshiLegalPage.findOne({ slug });
    if (existing && !force) continue;
    await MeenakshiLegalPage.findOneAndUpdate({ slug }, {
      slug,
      title: page.title,
      lede: page.lede || '',
      updated: page.updated || '',
      // source shape is [heading, ...paragraphs]
      sections: (page.sections || []).map(([heading, ...paragraphs]) => ({ heading, paragraphs })),
      displayOrder: i,
      isActive: true
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    n++;
  }
  report.push(['Legal pages', n, legalEntries.length]);

  /* ---- settings singleton ------------------------------------------------ */
  const existingSettings = await MeenakshiSettings.findOne({ settingsKey: 'meenakshi' });
  if (!existingSettings || force) {
    await MeenakshiSettings.findOneAndUpdate({ settingsKey: 'meenakshi' }, {
      settingsKey: 'meenakshi',
      brand: site.BRAND,
      proof: site.PROOF,
      assurances: site.ASSURANCES,
      marquee: site.MARQUEE,
      lineages: site.LINEAGES,
      why: site.WHY,
      ethics: site.ETHICS.map(toPair),
      policy: journey.POLICY.map(toPair),
      included: journey.INCLUDED.map(toPair),
      consultAreas: services.CONSULT_AREAS
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    report.push(['Settings', 1, 1]);
  } else {
    report.push(['Settings', 0, 1]);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(force ? 'Mode: --force (overwriting)' : 'Mode: skip existing (use --force to overwrite)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const [label, written, totalCount] of report) {
    console.log(`${label.padEnd(16)} ${String(written).padStart(3)} written / ${totalCount} in source`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  try { await mongoose.connection.close(); } catch (_) {}
  process.exit(1);
});

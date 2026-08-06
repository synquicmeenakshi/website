/**
 * Public content API for the Meenakshi site.
 *
 * The single job of the serialisers below is to hand back the EXACT shapes the
 * frontend's src/data/*.js modules export today — same keys, same nesting, same
 * tuple-vs-object choices. The frontend merges this over its static defaults,
 * so any deviation here shows up as a visual change on a live site. Hence the
 * explicit field picking rather than returning raw documents.
 */

const MeenakshiService = require('../models/MeenakshiService');
const MeenakshiTestimonial = require('../models/MeenakshiTestimonial');
const MeenakshiFaq = require('../models/MeenakshiFaq');
const MeenakshiJourneyStep = require('../models/MeenakshiJourneyStep');
const MeenakshiLegalPage = require('../models/MeenakshiLegalPage');
const MeenakshiSettings = require('../models/MeenakshiSettings');

/* ---- serialisers --------------------------------------------------------- */

const service = (s) => ({
  slug: s.slug,
  n: s.n,
  title: s.title,
  short: s.short,
  deva: s.deva,
  lede: s.lede,
  intro: s.intro,
  img: s.img,
  alt: s.alt,
  scene: s.scene,
  sceneAlt: s.sceneAlt,
  questions: s.questions || [],
  items: s.items || [],
  // Commercial fields — the proposal requires duration and pricing per service.
  price: s.price || 0,
  duration: s.duration || 0,
  currency: s.currency || 'INR'
});

const testimonial = (t) => ({
  short: t.short,
  quote: t.quote,
  name: t.name,
  cat: t.cat,
  city: t.city,
  service: t.service
});

const qa = (f) => ({ q: f.q, a: f.a });

const journeyStep = (j) => ({
  n: j.n,
  title: j.title,
  body: j.body,
  aside: j.aside
});

// {heading, body} -> [heading, body]
const pair = (p) => [p.heading, p.body];

// {heading, paragraphs[]} -> [heading, ...paragraphs]
const section = (s) => [s.heading, ...(s.paragraphs || [])];

/* ---- cache ---------------------------------------------------------------
   Content changes rarely and every visitor requests it on first paint, so the
   assembled payload is cached in-process and cleared by any admin write (see
   invalidate(), called from the admin controller). */

let cache = null;
let cachedAt = 0;
const TTL_MS = 5 * 60 * 1000;

const invalidate = () => { cache = null; cachedAt = 0; };

/* ---- assembly ------------------------------------------------------------ */

async function build() {
  const [services, testimonials, faqs, journey, legalPages, settings] = await Promise.all([
    MeenakshiService.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    MeenakshiTestimonial.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    MeenakshiFaq.find({ isActive: true }).sort({ groupOrder: 1, displayOrder: 1 }).lean(),
    MeenakshiJourneyStep.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    MeenakshiLegalPage.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    MeenakshiSettings.findOne({ settingsKey: 'meenakshi' }).lean()
  ]);

  // FAQ_GROUPS: preserve group order and grouping
  const groups = [];
  const groupIndex = new Map();
  for (const f of faqs.filter((f) => f.placement === 'faq')) {
    if (!groupIndex.has(f.group)) {
      groupIndex.set(f.group, groups.length);
      groups.push({ group: f.group, items: [] });
    }
    groups[groupIndex.get(f.group)].items.push(qa(f));
  }

  const faqHome = faqs
    .filter((f) => f.placement === 'faq' && f.showOnHome)
    .sort((a, b) => a.homeOrder - b.homeOrder)
    .map(qa);

  const bookFaq = faqs
    .filter((f) => f.placement === 'book')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(qa);

  // LEGAL is keyed by slug, not an array
  const legal = {};
  for (const p of legalPages) {
    legal[p.slug] = {
      title: p.title,
      lede: p.lede,
      updated: p.updated,
      sections: (p.sections || []).map(section)
    };
  }

  const featured = testimonials.find((t) => t.isFeatured);

  const s = settings || {};

  return {
    services: services.map(service),
    consultAreas: s.consultAreas || [],

    testimonials: testimonials.filter((t) => !t.isFeatured).map(testimonial),
    featuredQuote: featured ? testimonial(featured) : null,

    faqGroups: groups,
    faqHome,
    bookFaq,

    journey: journey.map(journeyStep),
    policy: (s.policy || []).map(pair),
    included: (s.included || []).map(pair),

    legal,

    brand: s.brand || null,
    proof: (s.proof || []).map((p) => ({ value: p.value, label: p.label, deva: p.deva })),
    assurances: s.assurances || [],
    marquee: s.marquee || [],
    lineages: (s.lineages || []).map((l) => ({
      n: l.n, name: l.name, deva: l.deva, note: l.note, answers: l.answers
    })),
    why: (s.why || []).map((w) => ({ n: w.n, title: w.title, body: w.body })),
    ethics: (s.ethics || []).map(pair)
  };
}

/* ---- handlers ------------------------------------------------------------ */

/** GET /api/meenakshi/content — everything the site needs, in one request. */
const getContent = async (req, res) => {
  try {
    const fresh = req.query.fresh === '1';
    if (!fresh && cache && Date.now() - cachedAt < TTL_MS) {
      return res.json({ success: true, cached: true, data: cache });
    }

    const data = await build();
    cache = data;
    cachedAt = Date.now();

    res.json({ success: true, cached: false, data });
  } catch (error) {
    console.error('getContent error:', error);
    res.status(500).json({ success: false, message: 'Failed to load content', error: error.message });
  }
};

module.exports = { getContent, invalidate, build };

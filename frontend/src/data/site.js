/* Brand facts, contact details and the trust markers that repeat across the
   site. Everything here is taken from the client presentation.

   Each export is served from the database when available (see content-store.js);
   the values written here are the fallback used if the API is unreachable. */

import { get } from '../content-store.js'

const BRAND_FALLBACK = {
  name: 'Meenakshi',
  tag: 'Sacred Sciences',
  roles: ['Occult Sciences Expert', 'Spiritual Consultant', 'Destiny Strategist'],
  email: 'cncelestials@gmail.com',
  phone: '+91 91191 38356',
  phoneHref: 'tel:+919119138356',
  whatsapp: 'https://wa.me/919119138356',
  instagram: 'https://instagram.com',
}

const PROOF_FALLBACK = [
  { value: '5+', label: 'Years of professional practice', deva: 'अनुभव' },
  { value: '300+', label: 'Individuals & businesses guided', deva: 'मार्गदर्शन' },
  { value: '60 min', label: 'Every private consultation, or longer', deva: 'परामर्श' },
  { value: '15 days', label: 'Post-consultation support included', deva: 'सहयोग' },
]

const ASSURANCES_FALLBACK = [
  'By appointment only',
  'Online worldwide',
  'Completely confidential',
  'English & Hindi',
]

const MARQUEE_FALLBACK = [
  'Astrology',
  'Numerology',
  'Vastu Shastra',
  'Rune Card Reading',
  'Karma Alignment',
  'Swar Vigyan',
  'Graphology',
  'Spiritual Remedies',
]

/* The four lineages Meenakshi practises within. `answers` is the question the
   system is actually reached for, which is what makes four similar-sounding
   names distinguishable to someone who has not studied any of them. */
const LINEAGES_FALLBACK = [
  {
    n: '01',
    name: 'Vedic Jyotish',
    deva: 'ज्योतिष',
    note: 'The classical foundation of the chart',
    answers: 'What is the shape of this life — its strengths, its resistances, its recurring themes?',
  },
  {
    n: '02',
    name: 'Dasha Jyotish',
    deva: 'दशा',
    note: 'Timing through planetary periods',
    answers: 'Which period are you standing in, and what does it favour before it turns?',
  },
  {
    n: '03',
    name: 'Bhrigu Nandi Nadi',
    deva: 'नाड़ी',
    note: 'Reading karma through planetary pairs',
    answers: 'Why does the same situation keep returning, and what is it asking to be settled?',
  },
  {
    n: '04',
    name: 'Krishnamurti Paddhati',
    deva: 'के॰पी॰',
    note: 'KP, for precise event timing',
    answers: 'Will this specific thing happen, and if so, when — to the month rather than the year?',
  },
]

const WHY_FALLBACK = [
  {
    n: '01',
    title: 'Authentic multi-disciplinary expertise',
    body: 'Eight disciplines read together rather than a single methodology, so the answer comes from more than one direction.',
  },
  {
    n: '02',
    title: 'Personalised guidance',
    body: 'No two lives are alike. Every consultation is built on your birth details, your circumstances and the questions you actually have.',
  },
  {
    n: '03',
    title: 'Ancient wisdom, practical direction',
    body: 'Traditional knowledge, presented plainly, so you can act on it in your personal, professional and business life.',
  },
  {
    n: '04',
    title: 'Ethical and confidential',
    body: 'Complete confidentiality, respect and integrity. A safe space for an open conversation.',
  },
  {
    n: '05',
    title: 'Personalised remedies',
    body: 'Recommendations designed around your circumstances, never generic prescriptions, and never compulsory.',
  },
  {
    n: '06',
    title: 'Trusted by 300+ clients',
    body: 'Individuals, families, entrepreneurs and business owners have come here for clarity and moved forward with confidence.',
  },
  {
    n: '07',
    title: 'A commitment to your growth',
    body: 'The purpose is not to interpret possibilities but to leave you with clarity you can act on.',
  },
]

const ETHICS_FALLBACK = [
  ['Integrity', 'Every consultation is conducted with honesty and the highest professional standards. Guidance is offered in good faith, from traditional knowledge and careful analysis.'],
  ['Confidentiality', 'All personal information, discussions, reports and recommendations are treated with the utmost confidentiality at every stage.'],
  ['Personalised guidance', 'Recommendations are tailored to your circumstances rather than drawn from generic interpretations or standardised advice.'],
  ['Respect and compassion', 'Every client is treated with dignity and empathy, regardless of age, gender, nationality, religion, culture or personal belief.'],
  ['Responsible recommendations', 'Remedies are offered as complementary spiritual practices, never as a substitute for professional medical, legal or financial advice.'],
  ['Transparency', 'Fees, services and process are communicated clearly before booking. We do not promise outcomes or encourage unrealistic expectations.'],
  ['Client empowerment', 'The purpose of every session is clarity and informed decision-making, respecting your free will and personal responsibility.'],
  ['Continuous learning', 'An ongoing study of Astrology, Numerology, Vastu Shastra and the traditional metaphysical sciences, refined to serve clients better.'],
]

/* ---- live content, with the above as fallback ------------------ */

export const BRAND = get('brand', BRAND_FALLBACK)
export const PROOF = get('proof', PROOF_FALLBACK)
export const ASSURANCES = get('assurances', ASSURANCES_FALLBACK)
export const MARQUEE = get('marquee', MARQUEE_FALLBACK)
export const LINEAGES = get('lineages', LINEAGES_FALLBACK)
export const WHY = get('why', WHY_FALLBACK)
export const ETHICS = get('ethics', ETHICS_FALLBACK)

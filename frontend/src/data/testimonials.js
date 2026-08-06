import { get } from '../content-store.js'

/* Client testimonials. Names are shortened at their request, which is stated
   on the page rather than implied.

   `short` is the version used in the constellation on the home page, where
   seven cards share one viewport and a full paragraph will not fit. `quote` is
   the full text, kept for anywhere with room to run it. */

const TESTIMONIALS_FALLBACK = [
  {
    short: 'She does not simply predict. She explains the why, and gives you something to do about it.',
    quote:
      'She does not simply predict. She explains the why, and gives you something practical to do about it. That is what brought clarity to my career decisions.',
    name: 'Anjali M.',
    cat: 'Entrepreneur',
    city: 'Pune',
    service: 'Astrology',
  },
  {
    short: 'Simple, inexpensive, specific. Six months on, the difference in the team is undeniable.',
    quote:
      'We consulted her before restructuring the family business. The numerology and Vastu corrections were simple, inexpensive and specific. Six months on, the difference in the team is undeniable.',
    name: 'R. Khandelwal',
    cat: 'Business Owner',
    city: 'Jaipur',
    service: 'Numerology & Vastu',
  },
  {
    short: 'No fear, no pressure, no upselling. Just a calm, intelligent reading of my chart.',
    quote:
      'What struck me most was how unhurried it felt. No fear, no pressure, no upselling. Just a calm, intelligent reading of my chart.',
    name: 'Sneha T.',
    cat: 'Individual',
    city: 'Bengaluru',
    service: 'Birth Chart Analysis',
  },
  {
    short: 'Her recommendations never required demolition or expense, only alignment.',
    quote:
      'She guided us on the muhurat for our daughter\u2019s wedding and on the new house. Her recommendations never required demolition or expense, only alignment.',
    name: 'The Vermas',
    cat: 'Family',
    city: 'Delhi NCR',
    service: 'Muhurat & Vastu',
  },
  {
    short: 'I could ask questions while actually implementing the remedies, not just be left with a report.',
    quote:
      'The fifteen days of follow-up is what sets this apart. I could ask questions while actually implementing the remedies, instead of being left with a report and no context.',
    name: 'Karthik S.',
    cat: 'Individual',
    city: 'Chennai',
    service: 'Spiritual Remedies',
  },
  {
    short: 'I came in sceptical and left with a plan. The advice was accurate, and usable.',
    quote:
      'I came in sceptical and left with a plan. Whatever you believe about the method, the reading of my situation was accurate and the advice was usable.',
    name: 'Farhan Q.',
    cat: 'Professional',
    city: 'Hyderabad',
    service: 'Career Guidance',
  },
]

/* The brightest star in the asterism. */
const FEATURED_QUOTE_FALLBACK = {
  short: 'It was not a prediction. It was someone finally explaining the map.',
  quote: 'It was not a prediction. It was someone finally explaining the map.',
  name: 'Neha I.',
  cat: 'Individual',
  city: 'Mumbai',
  service: 'Birth Chart Analysis',
}

/* ---- live content, with the above as fallback ------------------ */

export const TESTIMONIALS = get('testimonials', TESTIMONIALS_FALLBACK)
export const FEATURED_QUOTE = get('featuredQuote', FEATURED_QUOTE_FALLBACK)

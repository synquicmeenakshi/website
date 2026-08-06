/* Primary navigation.

   Each dropdown is one `panel`, read left to right:

     lead      a picture card carrying the section's own pitch
     main      the real destinations, each with a thumbnail
     more      everything else, as plain arrow links
     featured  one thing worth reading, given its own card

   Titles carry *asterisks* around the words that set in italic, parsed by Em()
   in Header.jsx — that keeps this file plain data with no JSX in it.

   Every `to` resolves to a real route, and every #anchor exists on the page it
   names.

   Testimonials and the FAQ are deliberately absent: they are sections of the
   home page a visitor scrolls into, not destinations worth a menu item. The
   footer still links to both for anyone who wants to jump straight there. */

export const NAV = [
  {
    label: 'Services',
    full: 'Consultations & Services',
    to: '/services',
    panel: {
      lead: {
        eyebrow: 'Eight disciplines',
        title: 'One life, read from *more than one direction*',
        copy: 'Astrology maps the whole; the other seven answer questions it cannot reach alone.',
        cta: 'See all services',
        to: '/services',
        img: '/img/in-hawamahal.jpg',
        alt: 'Hawa Mahal, Jaipur',
        pos: 'center 40%',
      },
      main: {
        group: 'Most asked for',
        items: [
          {
            label: 'Astrology',
            sub: 'Birth chart, career, marriage, timing',
            to: '/services/astrology',
            img: '/img/scene-astrology.png',
          },
          {
            label: 'Numerology',
            sub: 'Names, dates and the numbers you trade under',
            to: '/services/numerology',
            img: '/img/scene-numerology.png',
          },
          {
            label: 'Vastu Shastra',
            sub: 'Homes, offices and plots, without demolition',
            to: '/services/vastu-shastra',
            img: '/img/temple-hall.jpg',
          },
        ],
      },
      more: {
        group: 'Also available',
        items: [
          { label: 'Rune Card Reading', to: '/services/rune-card-reading' },
          { label: 'Karma Alignment', to: '/services/karma-alignment' },
          { label: 'Swar Vigyan', to: '/services/swar-vigyan' },
          { label: 'Spiritual Remedies & Counselling', to: '/services/spiritual-remedies' },
          { label: 'Graphology', to: '/services/graphology' },
        ],
      },
      featured: {
        group: 'Not sure which?',
        to: '/contact',
        img: '/img/ritual-brass.jpg',
        alt: 'Incense resting in a brass bowl',
        title: 'Ask *before* you book',
        sub: 'Describe the situation and we will name the consultation that fits, or tell you that you do not need one.',
        cta: 'Write to us',
      },
    },
  },

  {
    label: 'About',
    full: 'Meet Meenakshi',
    to: '/about',
    panel: {
      lead: {
        eyebrow: 'The practitioner',
        title: 'Where ancient wisdom *meets modern success*',
        copy: 'Five years of practice, three hundred clients, and four classical lineages behind every reading.',
        cta: 'Read her story',
        to: '/about',
        img: '/img/portrait-hero.png',
        alt: 'Meenakshi, spiritual consultant',
        pos: 'center 25%',
      },
      main: {
        group: 'Her practice',
        items: [
          {
            label: 'The lineages',
            sub: 'Vedic Jyotish, Dasha, Bhrigu Nandi Nadi, KP',
            to: '/about#lineages',
            img: '/img/scene-astrology.png',
          },
          {
            label: 'Why clients choose her',
            sub: 'Seven commitments held to on every reading',
            to: '/about#why',
            img: '/img/temple-arch.jpg',
          },
          {
            label: 'Code of ethics',
            sub: 'Integrity, confidentiality, no false promises',
            to: '/legal/code-of-ethics',
            img: '/img/ritual-plate.jpg',
          },
        ],
      },
      more: {
        group: 'Elsewhere',
        items: [
          { label: 'Her philosophy', to: '/about#philosophy' },
          { label: 'Your consultation journey', to: '/journey' },
          { label: 'Contact', to: '/contact' },
        ],
      },
      featured: {
        group: 'In her words',
        to: '/about#philosophy',
        img: '/img/scene-numerology.png',
        alt: 'Meenakshi working through a chart',
        title: 'Destiny reveals the path. *Alignment* creates the outcome.',
        sub: 'The philosophy behind every consultation, and why prediction alone is never the point.',
        cta: 'Her philosophy',
      },
    },
  },

  {
    label: 'Journey',
    full: 'Your Consultation Journey',
    to: '/journey',
    panel: {
      lead: {
        eyebrow: 'What actually happens',
        title: 'Eight steps, *booking to follow-up*',
        copy: 'Including the four to five day wait, and exactly what happens during it.',
        cta: 'See the journey',
        to: '/journey',
        img: '/img/temple-arch.jpg',
        alt: 'A stone archway in a temple corridor',
        pos: 'center 45%',
      },
      main: {
        group: 'The stages',
        items: [
          {
            label: 'Before the session',
            sub: 'Booking, your details, the preparation',
            to: '/journey#before',
            img: '/img/ritual-incense.jpg',
          },
          {
            label: 'The consultation',
            sub: 'Sixty minutes or more, one to one',
            to: '/journey#session',
            img: '/img/temple-hall.jpg',
          },
          {
            label: 'Afterwards',
            sub: 'Your report and fifteen days of support',
            to: '/journey#after',
            img: '/img/pen-writing.jpg',
          },
        ],
      },
      more: {
        group: 'Practical',
        items: [
          { label: 'Booking & cancellation policy', to: '/journey#policy' },
          { label: 'Refund policy', to: '/legal/refund-policy' },
          { label: 'Terms & conditions', to: '/legal/terms-and-conditions' },
        ],
      },
      featured: {
        group: 'Ready',
        to: '/book',
        img: '/img/in-diya-plate.jpg',
        alt: 'A lit diya on a plate of flowers',
        title: 'Book a *private consultation*',
        sub: 'Appointments are typically available within four to five days of confirmation.',
        cta: 'Start booking',
      },
    },
  },

  { label: 'Contact', full: 'Contact', to: '/contact' },
]

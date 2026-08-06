/* ============================================================
   ASK MEENAKSHI — the engine
   ============================================================

   A retrieval desk, not a language model. Everything it says is written in
   src/data/knowledge.js or computed here from the visitor's own date, so it
   cannot invent a fee, a policy or a promise the site does not make — which is
   the one thing a guidance practice cannot afford from a chat window.

   Order of resolution, first hit wins:

     1. courtesies      hello, thanks, bye
     2. a date          → sun sign, element, lord, mulank and life path,
                          computed here and honest about needing time and place
     3. "which one"     → the ROUTER table, situation to discipline
     4. the entries     → keyword and phrase scoring over the knowledge base
     5. nothing         → say so plainly, and offer the things it does know

   No network, no key, no telemetry: it runs entirely in the page. */

import { ENTRIES, ROUTER, SIGNS, GRAHAS, BHAVAS, NUMBER_MEANINGS, OPENERS } from '../data/knowledge.js'
import { SERVICES, bySlug } from '../data/services.js'
import { BRAND } from '../data/site.js'

/* ---- text ------------------------------------------------------ */

const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did', 'to', 'of',
  'in', 'on', 'at', 'for', 'with', 'and', 'or', 'but', 'if', 'it', 'its', 'this', 'that', 'these',
  'those', 'i', 'me', 'my', 'you', 'your', 'we', 'us', 'our', 'she', 'her', 'he', 'his', 'they',
  'them', 'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'about', 'from',
  'how', 'what', 'when', 'where', 'who', 'which', 'why', 'please', 'tell', 'know', 'want', 'need',
  'get', 'give', 'there', 'have', 'has', 'had', 'so', 'any', 'some', 'much', 'many', 'more',
])

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9ऀ-ॿ\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/* Enough stemming to match "languages" against "language" and "houses" against
   "house". A real stemmer would be a dependency to save four lines. */
const stem = (w) => {
  if (w.length <= 4) return w
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y'
  if (/(ses|xes|zes|ches|shes)$/.test(w)) return w.slice(0, -2)
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

const words = (s) =>
  norm(s)
    .split(' ')
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map(stem)

/* ---- dates ------------------------------------------------------
   People type a birth date every way there is. Four shapes cover it. */

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]

export function parseDate(raw) {
  const s = norm(raw)
  let m

  // 1994-03-12
  if ((m = s.match(/\b(19\d{2}|20\d{2})[/-](\d{1,2})[/-](\d{1,2})\b/))) {
    return check(+m[3], +m[2], +m[1])
  }
  // 12/03/1994 and 12-3-94 — day first, which is how it is written here
  if ((m = s.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/))) {
    let y = +m[3]
    if (y < 100) y += y > 30 ? 1900 : 2000
    return check(+m[1], +m[2], y)
  }
  // 12 march 1994  /  12th march
  if ((m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?\s*(\d{4})?\b/))) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3))
    if (mi >= 0) return check(+m[1], mi + 1, m[3] ? +m[3] : null)
  }
  // march 12 1994
  if ((m = s.match(/\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/))) {
    const mi = MONTHS.indexOf(m[1].slice(0, 3))
    if (mi >= 0) return check(+m[2], mi + 1, m[3] ? +m[3] : null)
  }
  return null
}

function check(d, mo, y) {
  if (!(d >= 1 && d <= 31 && mo >= 1 && mo <= 12)) return null
  if (y != null && (y < 1900 || y > 2100)) return null
  return { d, mo, y }
}

/* Tropical boundaries — the ones a date alone can give. The sidereal caveat
   travels with the answer rather than being quietly dropped. */
export function sunSign(d, mo) {
  return (
    SIGNS.find((s) => {
      const [fm, fd] = s.from
      const [tm, td] = s.to
      if (fm === tm) return mo === fm && d >= fd && d <= td
      return (mo === fm && d >= fd) || (mo === tm && d <= td)
    }) || SIGNS[9]
  )
}

const reduce1 = (n) => {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((a, c) => a + +c, 0)
  }
  return n
}

export const mulank = (d) => reduce1(d)
export const lifePath = (d, mo, y) => reduce1(reduce1(d) + reduce1(mo) + reduce1(y))

/* ---- the reply shapes ------------------------------------------ */

const reply = (text, links = [], chips = []) => ({ text, links, chips })

function dateReply({ d, mo, y }) {
  const sign = sunSign(d, mo)
  const lines = [
    `Born ${d} ${MONTHS[mo - 1][0].toUpperCase() + MONTHS[mo - 1].slice(1)}${y ? ' ' + y : ''} — the Sun was in **${sign.en}**, ${sign.vd} · ${sign.dv}. ${sign.el} sign, ruled by ${sign.lord}: ${sign.traits}.`,
  ]

  if (y) {
    const lp = lifePath(d, mo, y)
    const mk = mulank(d)
    lines.push(
      `Numerology from the same date: mulank **${mk}** (${NUMBER_MEANINGS[mk]}) and life path **${lp}** (${NUMBER_MEANINGS[lp]}).`,
    )
  } else {
    lines.push('Add the year and I will work out your mulank and life path number too.')
  }

  lines.push(
    'Two honest caveats. Vedic charts are sidereal, so the Sun often sits one sign earlier than the Western date suggests — and the Sun is one of nine grahas. Your lagna, your Moon and the dasha you are running need a birth **time** and **place**, and that is a reading rather than a chat.',
  )

  return reply(lines.join('\n\n'), [
    ['Book a consultation', '/book'],
    ['Astrology consultation', '/services/astrology'],
    ['Numerology consultation', '/services/numerology'],
  ], ['What is a dasha?', 'Why does birth time matter?', 'What does a session cost?'])
}

/* A named house, sign or graha is a lookup, not a search — and answering
   "the 7th house" with the general list of twelve would be a worse answer than
   the one the visitor could have found themselves. */
function lookupReply(raw, q) {
  const house = q.match(/\b(\d{1,2})\s*(?:st|nd|rd|th)?\s+(?:house|bhava)\b/) ||
    q.match(/\b(?:house|bhava)\s+(\d{1,2})\b/)
  if (house) {
    const n = +house[1]
    if (n >= 1 && n <= 12) {
      const [name, governs] = BHAVAS[n - 1]
      return reply(
        `The **${name}** governs ${governs}.\n\nWhich planets sit there, which sign it falls in and which dasha is running decide whether that department is easy or expensive for you — and all three need your birth time.`,
        [['Astrology consultation', '/services/astrology'], ['Book a consultation', '/book']],
        ['What is a dasha?', 'Why does birth time matter?'],
      )
    }
  }

  const sign = SIGNS.find((s) => {
    const t = ` ${q} `
    return t.includes(` ${s.en.toLowerCase()} `) || t.includes(` ${s.vd.toLowerCase()} `) || raw.includes(s.dv)
  })
  if (sign) {
    return reply(
      `**${sign.en}** — ${sign.vd} · ${sign.dv}. A ${sign.el.toLowerCase()} sign ruled by ${sign.lord}: ${sign.traits}.\n\nRemember that a sun sign is one placement out of a chart of nine. Your lagna and your Moon usually describe you far better, and both need a birth time and place.`,
      [['Astrology consultation', '/services/astrology'], ['Book a consultation', '/book']],
      ['What is a lagna?', 'What is a dasha?', 'Read my date of birth'],
    )
  }

  const graha = GRAHAS.find((g) => {
    const t = ` ${q} `
    return t.includes(` ${g.en.toLowerCase()} `) || t.includes(` ${g.vd.toLowerCase()} `)
  })
  // "sun sign" and "moon sign" are asking about a rashi, not about the graha
  const asksGraha =
    graha &&
    // these belong to entries of their own — "mercury retrograde" is a
    // question about retrogression, not a request for Mercury's portfolio
    !/\b(sign|rashi|sade sati|retrograde|vakri|transit|gochar)\b/.test(q) &&
    (/\b(planet|graha|mean|signif|govern|about|effect|dosha|weak|strong|bad|good|period|dasha|do|does|say)\b/.test(q) ||
      q.split(' ').length <= 4)
  if (asksGraha) {
    return reply(
      `**${graha.en}** — ${graha.vd} · ${graha.dv}${graha.day !== '—' ? `, ${graha.day}` : ''}. It governs ${graha.governs}.\n\nWhether it helps or obstructs you depends on the house it sits in, the sign it is in and whether its dasha is running — which is chart work rather than a general rule.`,
      [['Astrology consultation', '/services/astrology'], ['Book a consultation', '/book']],
      ['What is a dasha?', 'What is sade sati?'],
    )
  }

  return null
}

function routerReply(q) {
  const t = norm(q)
  const hits = ROUTER.filter((r) => r.k.some((k) => t.includes(k)))
  if (!hits.length) return null

  const first = hits[0]
  const s = bySlug(first.slug)
  if (!s) return null

  const also = hits
    .slice(1, 3)
    .map((h) => bySlug(h.slug))
    .filter((x) => x && x.slug !== s.slug)

  const text = [
    `That is **${s.title}** — ${first.why}.`,
    s.lede,
    also.length
      ? `${also.map((a) => a.title).join(' and ')} would add to it if the question widens.`
      : 'Most consultations draw on more than one discipline where it helps; you are not choosing a box.',
  ].join('\n\n')

  return reply(
    text,
    [
      [s.title, `/services/${s.slug}`],
      ['Book a consultation', '/book'],
      ...also.map((a) => [a.title, `/services/${a.slug}`]),
    ],
    ['What does a session cost?', 'What do you need from me?', 'How soon can I get an appointment?'],
  )
}

/* ---- scoring ---------------------------------------------------- */

function scoreEntry(entry, q, qWords) {
  let score = 0
  for (const key of entry.k) {
    if (key.includes(' ')) {
      // a phrase is worth far more than the sum of its words
      if (q.includes(key)) score += 3 + key.split(' ').length
      else {
        const kw = key.split(' ').filter((w) => !STOP.has(w)).map(stem)
        const hit = kw.filter((w) => qWords.includes(w)).length
        if (hit) score += (hit / kw.length) * 2
      }
    } else if (qWords.includes(stem(key))) {
      // one exact term is enough on its own: somebody typing "manglik" or
      // "refund" has told you everything they mean to
      score += 2.6
    } else if (key.length > 5 && q.includes(key)) {
      score += 1.4
    }
  }
  return score * (entry.weight ?? 1)
}

/* ---- courtesies ------------------------------------------------- */

const GREET = /^(hi|hey|hello|namaste|namaskar|pranam|good (morning|afternoon|evening)|salaam)\b/
const THANKS = /\b(thanks|thank you|dhanyavad|shukriya|great|helpful)\b/
const BYE = /\b(bye|goodbye|see you|alvida)\b/

/* ============================================================
   ask()
   ============================================================ */

export function ask(raw) {
  const q = norm(raw)
  if (!q) return reply('Ask me anything — the sciences, or how a consultation works.', [], OPENERS)

  if (GREET.test(q) && q.split(' ').length <= 4) {
    return reply(
      'Namaste 🙏 I am the guidance desk for Meenakshi’s practice. Ask about the chart — dashas, houses, manglik, guna milan, muhurat — or about a consultation itself. Give me a date of birth and I will read the sign and the numbers straight away.',
      [],
      OPENERS,
    )
  }

  if (BYE.test(q)) {
    return reply(`Shubh din. Whenever you are ready, the booking form takes about two minutes — or write to ${BRAND.email}.`, [['Book a consultation', '/book']], [])
  }

  if (THANKS.test(q) && q.split(' ').length <= 5) {
    return reply('Any time. Anything else you want to understand before you book?', [['Book a consultation', '/book']], OPENERS)
  }

  // a date beats everything else: it is the most specific thing a visitor can
  // hand over, and answering it with a keyword match would be a waste of it
  const date = parseDate(raw)
  if (date && /\b(born|birth|dob|date|sign|rashi|number|numerolog|life path|mulank|kundli)\b/.test(q)) {
    return dateReply(date)
  }

  const qWords = words(raw)

  // A named house, sign or graha answers itself — unless the question also
  // contains a longer phrase that an entry owns. "rahu kaal" and "shani sade
  // sati" both contain a graha name, and the lookup would have answered them
  // with the planet rather than the thing actually asked about.
  const ownedPhrase = ENTRIES.some((e) =>
    e.k.some((k) => k.includes(' ') && q.includes(k)),
  )
  if (!ownedPhrase) {
    const lookup = lookupReply(raw, q)
    if (lookup) return lookup
  }

  // "which one do I need" — routed by situation, not by discipline. The
  // trigger is deliberately narrow: a bare "what" would send "what is the 7th
  // house" to the Vastu page on the strength of the word house alone.
  const asksForRoute =
    /\b(which|what)\s+(consultation|service|reading|session|one)\b/.test(q) ||
    /\b(recommend|suggest|suitable|right for me|which one|should i book|best for me|help me with)\b/.test(q)
  if (asksForRoute) {
    const r = routerReply(raw)
    if (r) return r
  }

  const ranked = ENTRIES.map((e) => ({ e, s: scoreEntry(e, q, qWords) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)

  const best = ranked[0]
  if (best && best.s >= 2.4) {
    const near = ranked
      .slice(1, 4)
      .filter((x) => x.s >= best.s * 0.62 && x.e.a !== best.e.a)
      .map((x) => x.e)

    const chips = best.e.chips ?? []
    return reply(
      best.e.a,
      best.e.links ?? [],
      chips.length ? chips : near.slice(0, 2).map((n) => n.k[0]),
    )
  }

  // a bare date with no context word still deserves the reading
  if (date) return dateReply(date)

  // routed anyway, if the words happen to name a situation
  const r = routerReply(raw)
  if (r) return r

  return reply(
    `I did not follow that one — and I would rather say so than answer something adjacent. I can explain the chart (lagna, dashas, houses, nakshatras, manglik, guna milan, sade sati, muhurat), the other seven disciplines, or anything about booking, fees, privacy and what a session includes. Meenakshi herself answers everything else: ${BRAND.email}.`,
    [['Write to her', '/book'], ['All services', '/services']],
    OPENERS,
  )
}

/* Used by the panel for its opening line, so the desk knows which page the
   visitor called it from. */
export function serviceNames() {
  return SERVICES.map((s) => s.title)
}

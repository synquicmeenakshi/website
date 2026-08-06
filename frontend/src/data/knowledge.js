/* ============================================================
   ASK MEENAKSHI — the knowledge the desk answers from
   ============================================================

   Two halves, kept in one file because they are answered by one engine:

     1. The sciences   — rashis, grahas, bhavas, dashas, nakshatras and the
                         terms a visitor actually types: manglik, sade sati,
                         guna milan, mulank, vastu directions, and so on.
     2. The practice   — everything already written elsewhere in this repo
                         (services, journey, policy, FAQ, contact), pulled in
                         rather than restated, so the desk can never drift out
                         of step with the pages it is describing.

   Every answer is short enough to read in a chat bubble and honest about its
   limits: a real reading needs a birth time and place, and the desk says so
   rather than pretending otherwise. */

import { SERVICES } from './services.js'
import { JOURNEY, POLICY, INCLUDED } from './journey.js'
import { BRAND, PROOF, LINEAGES, ASSURANCES, ETHICS, WHY } from './site.js'
import { FAQ_GROUPS } from './faq.js'
import { LEGAL_LINKS } from './legal.js'

/* ---- 1 · the twelve rashis ------------------------------------
   Dates are the tropical (Western) boundaries, which is what a visitor's
   date of birth maps onto without a chart. The Vedic caveat is carried in the
   answer itself — see `signAnswer` below. */

export const SIGNS = [
  { en: 'Aries', vd: 'Mesha', dv: 'मेष', from: [3, 21], to: [4, 19], el: 'Fire', lord: 'Mars', traits: 'initiative, appetite for a fresh start, impatience with slow ground' },
  { en: 'Taurus', vd: 'Vrishabha', dv: 'वृषभ', from: [4, 20], to: [5, 20], el: 'Earth', lord: 'Venus', traits: 'steadiness, an eye for value, reluctance to be hurried' },
  { en: 'Gemini', vd: 'Mithuna', dv: 'मिथुन', from: [5, 21], to: [6, 20], el: 'Air', lord: 'Mercury', traits: 'quickness, range, a mind that starts more than it finishes' },
  { en: 'Cancer', vd: 'Karka', dv: 'कर्क', from: [6, 21], to: [7, 22], el: 'Water', lord: 'Moon', traits: 'memory, care for the people close in, a long fuse and a longer recall' },
  { en: 'Leo', vd: 'Simha', dv: 'सिंह', from: [7, 23], to: [8, 22], el: 'Fire', lord: 'Sun', traits: 'presence, generosity, a need for the work to be seen' },
  { en: 'Virgo', vd: 'Kanya', dv: 'कन्या', from: [8, 23], to: [9, 22], el: 'Earth', lord: 'Mercury', traits: 'precision, usefulness, an editor’s eye turned inward too often' },
  { en: 'Libra', vd: 'Tula', dv: 'तुला', from: [9, 23], to: [10, 22], el: 'Air', lord: 'Venus', traits: 'balance, negotiation, difficulty closing a decision alone' },
  { en: 'Scorpio', vd: 'Vrischika', dv: 'वृश्चिक', from: [10, 23], to: [11, 21], el: 'Water', lord: 'Mars (and Ketu)', traits: 'depth, endurance, an instinct for what is being left unsaid' },
  { en: 'Sagittarius', vd: 'Dhanu', dv: 'धनु', from: [11, 22], to: [12, 21], el: 'Fire', lord: 'Jupiter', traits: 'conviction, teaching, restlessness inside a small routine' },
  { en: 'Capricorn', vd: 'Makara', dv: 'मकर', from: [12, 22], to: [1, 19], el: 'Earth', lord: 'Saturn', traits: 'structure, patience, results that arrive later and last longer' },
  { en: 'Aquarius', vd: 'Kumbha', dv: 'कुम्भ', from: [1, 20], to: [2, 18], el: 'Air', lord: 'Saturn (and Rahu)', traits: 'independence, systems thinking, distance kept as a habit' },
  { en: 'Pisces', vd: 'Meena', dv: 'मीन', from: [2, 19], to: [3, 20], el: 'Water', lord: 'Jupiter', traits: 'imagination, empathy, boundaries that need drawing twice' },
]

/* ---- 2 · the nine grahas -------------------------------------- */

export const GRAHAS = [
  { en: 'Sun', vd: 'Surya', dv: 'सूर्य', day: 'Sunday', governs: 'the self, vitality, father, authority and the work you want your name on' },
  { en: 'Moon', vd: 'Chandra', dv: 'चन्द्र', day: 'Monday', governs: 'the mind, mood, mother, and how steadily you hold the day' },
  { en: 'Mars', vd: 'Mangal', dv: 'मंगल', day: 'Tuesday', governs: 'drive, courage, property, siblings, and the temper under pressure' },
  { en: 'Mercury', vd: 'Budha', dv: 'बुध', day: 'Wednesday', governs: 'intellect, speech, trade, contracts and everything you write down' },
  { en: 'Jupiter', vd: 'Guru', dv: 'गुरु', day: 'Thursday', governs: 'wisdom, teachers, children, fortune and the growth that is earned' },
  { en: 'Venus', vd: 'Shukra', dv: 'शुक्र', day: 'Friday', governs: 'love, marriage, comfort, art and what you find beautiful' },
  { en: 'Saturn', vd: 'Shani', dv: 'शनि', day: 'Saturday', governs: 'discipline, delay, labour, longevity and the lessons that repeat until learnt' },
  { en: 'Rahu', vd: 'Rahu', dv: 'राहु', day: '—', governs: 'ambition, obsession, foreign matters and sudden, unearned rise' },
  { en: 'Ketu', vd: 'Ketu', dv: 'केतु', day: '—', governs: 'detachment, research, past-life ability and the things you let go of' },
]

/* ---- 3 · the twelve bhavas ------------------------------------ */

export const BHAVAS = [
  ['1st · Lagna / Tanu', 'the self, the body, the first impression you make'],
  ['2nd · Dhana', 'wealth held, speech, family of origin, what you eat'],
  ['3rd · Sahaja', 'courage, siblings, short journeys, skill of hand'],
  ['4th · Sukha', 'home, mother, land and vehicles, peace of mind'],
  ['5th · Putra', 'children, intelligence, romance, and merit carried forward'],
  ['6th · Ari', 'debt, disease, competition, service and daily discipline'],
  ['7th · Yuvati', 'marriage, partnership, and every agreement with another'],
  ['8th · Randhra', 'longevity, inheritance, upheaval, the hidden and the occult'],
  ['9th · Dharma', 'fortune, father, teachers, long journeys, belief'],
  ['10th · Karma', 'career, standing, the work the world knows you by'],
  ['11th · Labha', 'gains, income, elder siblings, networks and fulfilment of desire'],
  ['12th · Vyaya', 'expenditure, foreign lands, retreat, sleep and liberation'],
]

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
  'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
  'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
]

export const DASHA_YEARS = [
  ['Ketu', 7], ['Venus', 20], ['Sun', 6], ['Moon', 10], ['Mars', 7],
  ['Rahu', 18], ['Jupiter', 16], ['Saturn', 19], ['Mercury', 17],
]

/* ---- 4 · numerology ------------------------------------------- */

export const NUMBER_MEANINGS = {
  1: 'leadership, originality, a straight line to the goal — and impatience with anyone slower',
  2: 'partnership, diplomacy, sensitivity to atmosphere; decisions come easier with one other person in the room',
  3: 'expression, teaching, charm; scattered energy is the tax on it',
  4: 'structure, discipline, the long build; change has to be argued for',
  5: 'movement, trade, freedom; routine is the enemy and also the medicine',
  6: 'responsibility, home, care of others; the burden is taken on before it is offered',
  7: 'analysis, solitude, faith or research — often both; trust is slow',
  8: 'authority, capacity for scale, delay before reward; the classic Saturn signature',
  9: 'completion, service, intensity; endings arrive on schedule whether or not you are ready',
  11: 'a master number — intuition and nervous energy, a 2 running at higher voltage',
  22: 'a master number — the builder, a 4 with the plans drawn much larger',
  33: 'a master number — the teacher, a 6 that takes on more than its own household',
}

/* ---- 5 · vastu, in the terms the site uses --------------------- */

export const VASTU_DIRECTIONS = [
  ['North-east · Ishanya', 'water, prayer, light — kept open, clean and uncluttered'],
  ['East', 'morning light, health and study'],
  ['South-east · Agneya', 'fire — the kitchen, the boiler, the electrics'],
  ['South', 'rest and weight; not a direction to leave hollow'],
  ['South-west · Nairutya', 'the heaviest corner — the master bedroom, the safe, the strongroom'],
  ['West', 'gains, dining, evening use'],
  ['North-west · Vayavya', 'air and movement — guests, storage, anything that should not settle'],
  ['North · Kubera', 'wealth and opportunity — kept light and unblocked'],
]

/* ============================================================
   THE ENTRIES
   Each is { id, k: keywords and phrases, a: answer, links, chips }.
   ============================================================ */

const svcLink = (slug) => ['/services/' + slug]

/* -- the sciences ------------------------------------------------ */

const ASTRO_ENTRIES = [
  {
    id: 'astro-what',
    k: ['what is astrology', 'vedic astrology', 'jyotish', 'how does astrology work', 'is astrology real', 'astrology meaning'],
    a: 'Jyotish — the science of light — reads the sky at the moment you were born as a map of tendencies: where the openings are, where the resistance sits, and when each is likely to be active. It describes weather, not fate. Meenakshi reads it through four lineages together (Vedic Jyotish, Dasha, Bhrigu Nandi Nadi and KP) so no single method goes unchecked.',
    links: [['Astrology consultation', '/services/astrology'], ['The four lineages', '/about#lineages']],
    chips: ['What is a kundli?', 'What is a dasha?', 'Which house is career?'],
  },
  {
    id: 'astro-sunsign',
    k: ['my sign', 'sun sign', 'what sign am i', 'moon sign', 'my rashi', 'zodiac sign', 'star sign', 'which sign am i'],
    a: 'Tell me your date of birth — day, month, year — and I will read the sign, the element, the ruling graha and your numerology numbers here in the window. Your Moon sign and lagna are a different matter: those need the time and place as well, and they are usually the two that describe you best.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['My date of birth is 14/08/1992', 'Why does birth time matter?'],
  },
  {
    id: 'astro-kundli',
    k: ['kundli', 'birth chart', 'janam kundali', 'horoscope chart', 'natal chart', 'what is a chart'],
    a: 'A kundli is your birth chart: the twelve houses, the twelve rashis and the nine grahas fixed at your date, time and place of birth. The time matters most — it sets the lagna (ascendant), and the lagna decides which house every planet falls in. Without it, a reading can describe the year but not the life.',
    links: [['Astrology consultation', '/services/astrology'], ['What a session needs', '/journey#before']],
    chips: ['Why does birth time matter?', 'I do not know my birth time'],
  },
  {
    id: 'astro-lagna',
    k: ['lagna', 'ascendant', 'rising sign', 'birth time matter', 'why birth time', 'exact time'],
    a: 'The lagna, or ascendant, is the sign rising on the eastern horizon at your birth. It moves about one degree every four minutes, so a difference of twenty minutes can change the whole house structure of the chart. That is why the booking form asks for the time as well as the date — and if you are unsure of it, say so and alternative methods are used.',
    links: [['Book a consultation', '/book'], ['Ask before you book', '/book']],
    chips: ['What if I do not know my birth time?', 'What is prashna?'],
  },
  {
    id: 'astro-dasha',
    k: ['dasha', 'mahadasha', 'antardasha', 'vimshottari', 'planetary period', 'timing', 'when will'],
    a: 'Vimshottari dasha divides 120 years between the nine grahas, each ruling a stretch of your life in turn: Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17. The dasha you are running says what the period favours; the transits say when inside it. This is the part of the chart that answers "when", and it needs an exact birth time.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is sade sati?', 'What is a transit?'],
  },
  {
    id: 'astro-nakshatra',
    k: ['nakshatra', 'star sign vedic', 'birth star', 'janma nakshatra', '27 stars'],
    a: 'The zodiac is also divided into 27 nakshatras — Ashwini through Revati — each about 13°20′ wide and each with its own ruling graha and temperament. Your janma nakshatra is where the Moon sat at birth; it is used for naming, for muhurat, for compatibility, and it is the anchor of the whole dasha sequence.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is guna milan?', 'What is muhurat?'],
  },
  {
    id: 'astro-house',
    k: ['bhava', 'houses meaning', 'twelve houses', 'which house', 'career house', 'marriage house', 'house of the chart'],
    a: 'Twelve houses, each governing a department of life. 1st the self, 2nd wealth and speech, 3rd courage and siblings, 4th home and mother, 5th children and intellect, 6th debt and disease, 7th marriage and partnership, 8th upheaval and the hidden, 9th fortune and teachers, 10th career and standing, 11th gains and networks, 12th expenditure, foreign lands and rest.\n\nAsk me for any one of them by number. And if you meant the house you actually live in rather than a house of the chart, that is Vastu — say so and I will switch.',
    links: [['Astrology consultation', '/services/astrology'], ['Vastu Shastra', '/services/vastu-shastra']],
    chips: ['What is the 10th house?', 'What is a dasha?', 'Tell me about vastu'],
  },
  {
    id: 'astro-planets',
    k: ['planet', 'graha', 'nine planets', 'navagraha', 'saturn', 'shani', 'jupiter', 'guru', 'mars', 'mangal', 'venus', 'shukra', 'mercury', 'budha', 'rahu', 'ketu', 'sun surya', 'moon chandra'],
    a: 'Nine grahas, each with a portfolio. Sun — self and authority. Moon — mind and mood. Mars — drive, property, temper. Mercury — intellect, speech, trade. Jupiter — wisdom, children, earned growth. Venus — love, comfort, art. Saturn — discipline, delay, endurance. Rahu — ambition and sudden rise. Ketu — detachment and research. A reading is mostly about which of these is currently loudest.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is sade sati?', 'What is manglik?'],
  },
  {
    id: 'astro-sadesati',
    k: ['sade sati', 'sadhe sati', 'shani sade sati', 'saturn period', 'seven and half years'],
    a: 'Sade sati is the roughly seven-and-a-half years in which Saturn transits the twelfth, first and second signs from your natal Moon. It has a reputation it only half deserves: it slows things, removes what was never structural, and asks for work without applause — and the people who come out of it well are usually the ones who used it to build. What it actually does in your chart depends on where Saturn sits and what it rules for you.',
    links: [['Astrology consultation', '/services/astrology'], ['Spiritual remedies', '/services/spiritual-remedies']],
    chips: ['Are remedies expensive?', 'Book a consultation'],
  },
  {
    id: 'astro-manglik',
    k: ['manglik', 'mangal dosha', 'kuja dosha', 'mangalik', 'mars dosha'],
    a: 'Mangal dosha is Mars placed in the 1st, 2nd, 4th, 7th, 8th or 12th house — counted from the lagna, and often from the Moon and Venus too. It is read as friction in marriage, particularly early. It is also cancelled by a long list of conditions, which is why so many "manglik" verdicts collapse the moment a full chart is opened. It is worth checking properly rather than worrying generally.',
    links: [['Marriage compatibility', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['What is guna milan?', 'Marriage compatibility'],
  },
  {
    id: 'astro-gunamilan',
    k: ['guna milan', 'kundli matching', 'horoscope matching', 'compatibility', '36 points', 'ashtakoot', 'match making', 'marriage matching'],
    a: 'Ashtakoot guna milan scores eight factors out of 36 — Varna 1, Vashya 2, Tara 3, Yoni 4, Graha Maitri 5, Gana 6, Bhakoot 7, Nadi 8. Eighteen and above is conventionally workable. But the score is a summary, not the reading: Bhakoot and Nadi carry the real weight, and two charts scoring 30 can still be a difficult marriage. Both birth details are needed.',
    links: [['Marriage & compatibility', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['What is manglik?', 'What do you need from me?'],
  },
  {
    id: 'astro-transit',
    k: ['transit', 'gochar', 'current planets', 'retrograde', 'vakri', 'mercury retrograde'],
    a: 'Transits (gochar) are where the grahas are now, read against where they sat at your birth. They are the trigger; the dasha is the permission. A retrograde planet is not a curse — it turns its business inward and asks for revision rather than launch, which is why the old advice about not signing under Mercury retrograde is really advice about reading the contract twice.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is muhurat?', 'What is a dasha?'],
  },
  {
    id: 'astro-muhurat',
    k: ['muhurat', 'auspicious time', 'good date', 'shubh muhurat', 'best day to', 'when should i start'],
    a: 'Muhurat is choosing the moment rather than accepting it — for a wedding, a registration, a first payment, a move, a launch. It is built from the panchang (tithi, vara, nakshatra, yoga, karana) and then checked against your own chart, because a date that is excellent in general can be poor for you specifically.',
    links: [['Muhurat & timing', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['How soon can I get an appointment?'],
  },
  {
    id: 'astro-prashna',
    k: ['prashna', 'horary', 'no birth time', 'do not know birth time', 'dont know my birth time', 'unknown birth time'],
    a: 'If the birth time is genuinely unknown, say so while booking. Prashna (horary) reads the chart of the moment the question is asked rather than the moment you were born, and for a single sharp question it answers well. Rune Card Reading is the other route when the question is urgent and narrow.',
    links: [['Rune Card Reading', '/services/rune-card-reading'], ['Book a consultation', '/book']],
    chips: ['What is rune reading?', 'What do you need from me?'],
  },
  {
    id: 'astro-remedy',
    k: ['remedy', 'upay', 'gemstone', 'ratna', 'mantra', 'puja', 'yantra', 'do i need to wear', 'stone'],
    a: 'Remedies here are personalised and never compulsory: a practice, a discipline, a mantra, occasionally a stone — chosen for your chart rather than prescribed from a list. Nothing expensive is required, nothing is sold to you, and no remedy is offered as a substitute for medical, legal or financial advice.',
    links: [['Spiritual remedies & counselling', '/services/spiritual-remedies'], ['Code of ethics', '/legal/code-of-ethics']],
    chips: ['Is this confidential?', 'Book a consultation'],
  },
  {
    id: 'astro-numerology',
    k: ['numerology', 'ank', 'mulank', 'bhagyank', 'life path', 'name number', 'lucky number', 'spelling of my name', 'business name'],
    a: 'Numerology works from two things: your date of birth, which is fixed, and your name, which is not. Mulank is the day you were born reduced to a single digit; bhagyank (life path) is the whole date reduced. The name is where the correction usually happens — a spelling, a trading name, the number a business signs under. Send me your date of birth and I will work out your numbers right here.',
    links: [['Numerology consultation', '/services/numerology']],
    chips: ['My date of birth is 14/08/1992', 'Does a name change really work?'],
  },
  {
    id: 'astro-vastu',
    k: ['vastu', 'vaastu', 'house direction', 'kitchen direction', 'main door', 'office layout', 'plot', 'north east', 'demolition'],
    a: 'Vastu reads a space the way a chart reads a life — by direction. North-east open and light, south-east for fire and the kitchen, south-west heaviest for the master bedroom, north-west for what should keep moving, north for wealth kept unblocked. Corrections here start with placement, light and use, not with breaking walls; demolition is a last resort and rarely the recommendation.',
    links: [['Vastu Shastra consultation', '/services/vastu-shastra']],
    chips: ['Can you do vastu remotely?', 'Book a consultation'],
  },
  {
    id: 'astro-rune',
    k: ['rune', 'rune card', 'tarot', 'card reading', 'urgent question', 'yes or no'],
    a: 'Rune Card Reading is the short form: a direct answer to one pressing question when there is no time for a full chart, or when the question is narrow enough that a chart would be over-reading it. It does not replace the kundli — it answers the thing in front of you this week.',
    links: [['Rune Card Reading', '/services/rune-card-reading']],
    chips: ['What is prashna?', 'Book a consultation'],
  },
  {
    id: 'astro-karma',
    k: ['karma', 'karma alignment', 'past life', 'same pattern', 'keeps repeating', 'cycle'],
    a: 'Karma Alignment is for the situation that keeps returning in a different shape — the same argument with a different person, the same stall at the same point in every venture. It reads the pattern through Bhrigu Nandi Nadi and the 8th and 12th houses, and works on what is being asked to settle rather than on the symptom.',
    links: [['Karma Alignment', '/services/karma-alignment']],
    chips: ['What is Swar Vigyan?', 'Book a consultation'],
  },
  {
    id: 'astro-swar',
    k: ['swar', 'swar vigyan', 'breath', 'nostril', 'shiva swarodaya'],
    a: 'Swar Vigyan is the science of breath: which nostril is dominant, and what that hour therefore favours. Ida (left) for the receptive and the gentle, pingala (right) for the assertive and the physical, sushumna for stillness and practice. It is the most practical of the eight — it changes what you do in the next hour, not the next year.',
    links: [['Swar Vigyan', '/services/swar-vigyan']],
    chips: ['What is graphology?', 'Book a consultation'],
  },
  {
    id: 'astro-graphology',
    k: ['graphology', 'handwriting', 'signature', 'writing analysis'],
    a: 'Graphology reads character in a stroke of ink — pressure, slant, spacing, the shape of a signature. It is used here alongside the chart for self-understanding, for a signature that stops working against you, and occasionally for reading a situation where the other party will not say what they mean.',
    links: [['Graphology', '/services/graphology']],
    chips: ['See all services', 'Book a consultation'],
  },
  {
    id: 'astro-limits',
    k: ['is it accurate', 'can you predict', 'will i die', 'lottery', 'guarantee', 'fake', 'superstition', 'proof'],
    a: 'Honestly: this is guidance, not a guarantee. No outcome is promised, no date of death is discussed, and nothing here replaces medical, legal or financial advice. What a reading gives you is a clearer view of what you are standing in and one or two things you can actually do about it. If that is not what you are looking for, you will be told so before you pay.',
    links: [['Code of ethics', '/legal/code-of-ethics'], ['Disclaimer', '/legal/disclaimer']],
    chips: ['What does a session cost?', 'Book a consultation'],
  },
  {
    id: 'astro-yoga',
    k: ['yoga', 'raj yoga', 'rajyoga', 'dhana yoga', 'gajakesari', 'panch mahapurusha', 'combination', 'auspicious combination'],
    a: 'A yoga is a combination of grahas that changes what the chart is capable of. Raja yogas link the trine and angular lords and lift standing. Dhana yogas tie the 2nd and 11th to wealth. Gajakesari sets Jupiter in an angle from the Moon. The Panch Mahapurusha yogas form when Mars, Mercury, Jupiter, Venus or Saturn sits in its own or exalted sign, in an angle.\n\nThey are worth less in isolation than most people are told: a yoga that its dasha never activates stays theoretical.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is a dasha?', 'What is a dosha?'],
  },
  {
    id: 'astro-dosha',
    k: ['dosha', 'kaal sarp', 'kalsarp', 'pitra dosh', 'pitru dosha', 'nadi dosha', 'bhakoot', 'shrapit', 'affliction'],
    a: 'A dosha is an affliction in the chart. Kaal Sarp places every graha between Rahu and Ketu. Pitra dosha is read as an unresolved debt on the paternal line, usually through the 9th house and the Sun. Nadi and Bhakoot doshas belong to matching rather than the natal chart.\n\nMost of them have recognised cancellations, and a great many "doshas" people arrive worried about turn out to be cancelled once the whole chart is open. Worth checking properly rather than carrying.',
    links: [['Astrology consultation', '/services/astrology'], ['Spiritual remedies', '/services/spiritual-remedies']],
    chips: ['What is manglik?', 'Are remedies compulsory?'],
  },
  {
    id: 'astro-retrograde',
    k: ['retrograde', 'what does retrograde mean', 'retrograde meaning', 'vakri', 'mercury retrograde', 'shani vakri', 'combust', 'astangata', 'debilitated', 'exalted', 'neecha', 'uccha'],
    a: 'A graha is retrograde (vakri) when it appears to move backwards from Earth — it turns inward rather than weak, and often gives its results late but thoroughly. Combustion (astangata) is a graha too close to the Sun, which dims it. Exaltation (uccha) is its strongest sign, debilitation (neecha) its weakest — and neecha bhanga, the cancellation of debility, is common enough that a "debilitated" planet is rarely the sentence it sounds like.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is a transit?', 'What is a yoga?'],
  },
  {
    id: 'astro-divisional',
    k: ['navamsa', 'd9', 'divisional chart', 'varga', 'dashamsa', 'd10', 'saptamsa', 'chart division'],
    a: 'The natal chart (D1) is one of sixteen. The navamsa (D9) is read alongside it for marriage and for the real strength of a graha — a planet strong in D1 and weak in D9 tends to promise more than it delivers. The dashamsa (D10) is read for career, the saptamsa (D7) for children. Divisional charts need an exact birth time; a few minutes changes them entirely.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['Why does birth time matter?', 'Marriage compatibility'],
  },
  {
    id: 'astro-ayanamsa',
    k: ['ayanamsa', 'sidereal', 'tropical', 'vedic vs western', 'difference between western and vedic', 'lahiri', 'why is my sign different', 'vedic sign different', 'sign is different', 'western and vedic'],
    a: 'Western astrology uses the tropical zodiac, fixed to the seasons. Vedic uses the sidereal, fixed to the constellations. The two have drifted about 24 degrees apart, which is the ayanamsa — Lahiri is the standard in India. That drift is why your Vedic sign is often the previous one to the sign you have always been told.\n\nThe date-of-birth reading in this window uses the tropical boundaries, because that is what a date alone can give. Your actual rashi comes from the Moon, and needs a time and place.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['My date of birth is 14/08/1992', 'What is a nakshatra?'],
  },
  {
    id: 'astro-career',
    k: ['career', 'job', 'promotion', 'business astrology', 'should i change job', 'which career', 'work', 'profession', 'startup'],
    a: 'Career is read from the 10th house and its lord, the 6th for service and daily work, the 11th for gains, and the dasha running now for timing. Business rather than employment shows in the 7th and the strength of the 3rd. In practice the question is rarely "what career" and usually "is this the year" — which is a dasha and transit question, and answerable.',
    links: [['Astrology consultation', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['What is the 10th house?', 'What is a dasha?', 'Book a consultation'],
  },
  {
    id: 'astro-money',
    k: ['money', 'wealth', 'finance', 'debt', 'loan', 'investment', 'property', 'when will i be rich', 'financial'],
    a: 'Wealth is read from the 2nd house (what you hold), the 11th (what comes in) and the 5th and 9th for fortune; debt and obligation sit in the 6th, and the 8th governs money that arrives from elsewhere — inheritance, insurance, a partner. Property is the 4th. What a reading can do is name the periods that favour building and the ones that favour holding. It cannot promise a number, and will not.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['Can you guarantee results?', 'Book a consultation'],
  },
  {
    id: 'astro-health',
    k: ['health', 'illness', 'disease', 'medical', 'surgery', 'anxiety', 'mental health', 'wellness'],
    a: 'The 6th house governs illness, the 8th chronic and sudden matters, the 1st vitality overall, and the Moon the state of mind. Astrology can point at periods that ask for care and at habits worth changing.\n\nIt is not medicine. Nothing said here or in a consultation replaces a doctor, a therapist or a diagnosis, and you should not delay any of those on the strength of a chart.',
    links: [['Disclaimer', '/legal/disclaimer'], ['Astrology consultation', '/services/astrology']],
    chips: ['Can you guarantee results?', 'What are the limits?'],
  },
  {
    id: 'astro-love',
    k: ['love', 'relationship', 'partner', 'will i get married', 'when will i marry', 'breakup', 'divorce', 'ex', 'romance'],
    a: 'The 7th house holds marriage and partnership, the 5th romance before it, and Venus the capacity for it; the navamsa is read alongside for the shape of the marriage rather than the fact of it. Timing comes from the dasha and from Jupiter\u2019s transit. Compatibility between two charts is guna milan — thirty-six points, though the points matter less than which of the eight koots is the one falling short.',
    links: [['Marriage compatibility', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['What is guna milan?', 'What is manglik?'],
  },
  {
    id: 'astro-child',
    k: ['child', 'children', 'baby', 'pregnancy', 'santan', 'baby name', 'education', 'study', 'exam'],
    a: 'Children are read from the 5th house, its lord and Jupiter, with the saptamsa (D7) alongside; education from the 4th and 5th, and higher study from the 9th. Naming a child is usually a numerology and nakshatra question together — the birth nakshatra suggests a starting syllable, and the numbers are checked against it.',
    links: [['Numerology consultation', '/services/numerology'], ['Astrology consultation', '/services/astrology']],
    chips: ['Tell me about numerology', 'What is a nakshatra?'],
  },
  {
    id: 'astro-foreign',
    k: ['foreign', 'abroad', 'visa', 'immigration', 'settle abroad', 'travel', 'relocation', 'nri'],
    a: 'Foreign settlement is read from the 12th house — distance, and life away from where you began — with the 9th for long journeys, the 3rd for short ones, and Rahu, which is the graha most associated with going far from home. As always the dasha decides when the door is actually open rather than merely visible.',
    links: [['Astrology consultation', '/services/astrology']],
    chips: ['What is a dasha?', 'Book a consultation'],
  },
  {
    id: 'astro-gemstone',
    k: ['gemstone', 'stone', 'ratna', 'ruby', 'pearl', 'coral', 'emerald', 'sapphire', 'neelam', 'pukhraj', 'which stone should i wear', 'which gemstone should i wear', 'gemstone should i wear', 'wear a stone', 'rudraksha'],
    a: 'Each graha has a stone — ruby for the Sun, pearl for the Moon, red coral for Mars, emerald for Mercury, yellow sapphire for Jupiter, diamond for Venus, blue sapphire for Saturn, hessonite for Rahu, cat\u2019s eye for Ketu. Rudraksha is counted separately, by mukhi.\n\nA stone is prescribed against a chart, never against a sign, and the wrong one strengthens a graha you wanted quiet. Blue sapphire in particular is not something to try casually. Meenakshi recommends one only where the chart asks for it, and a good many readings end with no stone at all.',
    links: [['Spiritual remedies', '/services/spiritual-remedies']],
    chips: ['Are remedies compulsory?', 'Are remedies expensive?'],
  },
  {
    id: 'astro-mantra',
    k: ['mantra', 'chant', 'japa', 'puja', 'fasting', 'vrat', 'donation', 'daan', 'temple', 'ritual'],
    a: 'Remedies come in a rough order of cost: practice first — a mantra, a fast on the right weekday, a donation matched to the graha — then yantra, then stone. The weekday matters: Sunday for the Sun through Saturday for Saturn.\n\nThey are supportive, never compulsory, and never a substitute for the ordinary work a situation needs.',
    links: [['Spiritual remedies', '/services/spiritual-remedies']],
    chips: ['Are remedies compulsory?', 'What about gemstones?'],
  },
  {
    id: 'astro-daily',
    k: ['today', 'daily horoscope', 'this week', 'weekly', 'monthly horoscope', 'prediction for today', 'rashifal', 'lucky number today'],
    a: 'There is no daily horoscope here, and that is deliberate. A column that addresses a twelfth of the world at once cannot say anything specific enough to act on — it is reading one graha out of nine, with no house structure and no dasha behind it.\n\nWhat this desk can do from a date of birth is your sign, element, ruling graha and numerology numbers. Anything about a particular week needs your chart.',
    links: [['Astrology consultation', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['My date of birth is 14/08/1992', 'Book a consultation'],
  },
  {
    id: 'astro-panchang',
    k: ['panchang', 'panchangam', 'tithi', 'nakshatra today', 'yoga karana', 'rahu kaal', 'rahukalam', 'abhijit', 'good time today', 'shubh muhurat'],
    a: 'The panchang is the five limbs of the Vedic day: tithi (lunar day), vara (weekday), nakshatra, yoga and karana. Rahu kaal is the inauspicious stretch each day, about ninety minutes, at a different hour depending on the weekday; Abhijit muhurat is the favourable window around local noon.\n\nThese are location-specific to the minute, so this desk does not compute them live — a muhurat for something that matters is calculated properly in a consultation.',
    links: [['Muhurat and timing', '/services/astrology'], ['Book a consultation', '/book']],
    chips: ['What is muhurat?', 'Book a consultation'],
  },
]

/* -- the practice, assembled from the site's own data ------------- */

const money = 'Fees depend on the consultation and are confirmed before anything is taken — nothing is charged for asking which one you need. Payment is made in advance through Razorpay, and the appointment is confirmed once it clears.'

const PRACTICE_ENTRIES = [
  {
    id: 'desk',
    k: ['are you a bot', 'are you real', 'who are you', 'am i talking to meenakshi', 'is this a robot', 'ai', 'chatbot', 'real person', 'real astrologer', 'human'],
    a: `I am the guidance desk — an assistant on this website, not Meenakshi herself and not a reading. Everything I say is written from her practice's own material: the eight disciplines, the journey, the policies and the FAQ, plus the standard meanings of the chart. A reading is a person studying your chart for days and then sitting with you for an hour. For anything I cannot answer, she replies herself at ${BRAND.email}.`,
    links: [['Book a consultation', '/book'], ['Meet Meenakshi', '/about']],
    chips: ['What does a session cost?', 'Which consultation do I need?'],
  },
  {
    id: 'who',
    k: ['who is meenakshi', 'who is she', 'about her', 'about meenakshi', 'experience', 'qualified', 'how long has she', 'credentials'],
    a: `Meenakshi is a Spiritual Consultant and practitioner of the occult sciences — ${PROOF[0].value.replace('+', ' or more')} years of professional practice and ${PROOF[1].value} individuals and businesses guided. She reads through four classical lineages together: ${LINEAGES.map((l) => l.name).join(', ')}. Consultations are given in English and Hindi, online, worldwide.`,
    links: [['Meet Meenakshi', '/about'], ['The four lineages', '/about#lineages']],
    chips: ['Why choose her?', 'What does she practise?'],
  },
  {
    id: 'why',
    k: ['why choose', 'why her', 'what makes you different', 'trust', 'commitments'],
    a: `Seven commitments, held to every time — the first three being: ${WHY.slice(0, 3).map((w) => w.title.toLowerCase()).join('; ')}. Read together rather than through one method, personalised to your details, and given in plain language you can act on.`,
    links: [['Why clients choose her', '/about#why'], ['Code of ethics', '/about#ethics']],
    chips: ['Is this confidential?', 'What do people say?'],
  },
  {
    id: 'services',
    k: ['services', 'what do you offer', 'consultations', 'disciplines', 'list of services', 'what can i book'],
    a: `Eight disciplines: ${SERVICES.map((s) => s.title).join(', ')}. Most consultations draw on more than one, because a life rarely divides neatly along those lines. Tell me the situation instead and I will name the one that fits.`,
    links: [['All services', '/services'], ['Book a consultation', '/book']],
    chips: ['Which one do I need?', 'What does a session cost?'],
  },
  {
    id: 'book',
    k: ['book', 'booking', 'appointment', 'schedule', 'how do i book', 'i want a reading', 'consult', 'talk to her'],
    a: `Booking is one form: your name and contact, your date, time and place of birth, and the area you want guidance on. Payment confirms it, and the session is usually scheduled ${INCLUDED.find(([k]) => k.includes('Scheduled')) ? 'automatically' : ''} four to five days later — that gap is the preparation.`,
    links: [['Book a consultation', '/book'], ['The eight steps', '/journey']],
    chips: ['What do you need from me?', 'How soon can I get an appointment?'],
  },
  {
    id: 'price',
    k: ['price', 'cost', 'fee', 'charges', 'how much', 'rate', 'expensive', 'payment', 'razorpay', 'pay'],
    a: money,
    links: [['Book a consultation', '/book'], ['Refund policy', '/legal/refund-policy']],
    chips: ['Can I get a refund?', 'What does the session include?'],
  },
  {
    id: 'includes',
    k: ['what do i get', 'includes', 'included', 'report', 'follow up', 'support', 'how long is the session', 'duration', '60 minutes'],
    a: 'Every consultation: sixty minutes or more, one to one and online; your chart studied in advance; a written report of the guidance and remedies afterwards; fifteen days of follow-up support; English or Hindi, whichever you prefer.',
    links: [['What is included', '/journey#included'], ['Book a consultation', '/book']],
    chips: ['How soon can I get an appointment?', 'Is this confidential?'],
  },
  {
    id: 'wait',
    k: ['how soon', 'how long to wait', 'urgent', 'four to five days', 'availability', 'when can i', 'today', 'tomorrow'],
    a: 'Appointments are typically four to five days after payment clears. The wait is not a queue — it is the time your chart is being studied before you arrive, which is what keeps the hour itself on your questions. Priority slots occasionally exist; ask.',
    links: [['Your consultation journey', '/journey'], ['Book a consultation', '/book']],
    chips: ['What happens in the session?', 'Can I reschedule?'],
  },
  {
    id: 'need',
    k: ['what do you need', 'what details', 'information required', 'birth details', 'what should i send', 'prepare'],
    a: 'Your name and contact, your date of birth, your time of birth, your place of birth, and a short description of what you are seeking guidance on. The time and place are what make the chart yours rather than generic — and if the time is unknown, say so on the form.',
    links: [['Book a consultation', '/book'], ['Before the session', '/journey#before']],
    chips: ['I do not know my birth time', 'Is my data safe?'],
  },
  {
    id: 'journey',
    k: ['journey', 'process', 'what happens', 'steps', 'how does it work', 'after the session'],
    a: `Eight steps: ${JOURNEY.slice(0, 4).map((j) => j.title.toLowerCase()).join(', ')}, then the consultation itself, your written report, fifteen days of support, and — entirely optional — sharing how it went.`,
    links: [['The eight steps', '/journey'], ['Afterwards', '/journey#after']],
    chips: ['What is included?', 'Book a consultation'],
  },
  {
    id: 'language',
    k: ['language', 'hindi', 'english', 'which language', 'bhasha'],
    a: 'English or Hindi — whichever you are more yourself in. Say which you prefer on the booking form. हिंदी में भी परामर्श उपलब्ध है।',
    links: [['Book a consultation', '/book']],
    chips: ['Is it online?', 'What does the session include?'],
  },
  {
    id: 'online',
    k: ['online', 'in person', 'where', 'location', 'office', 'visit', 'video call', 'meet', 'zoom', 'whatsapp call'],
    a: `Everything is online, worldwide, by appointment only. Confirmation reaches you on both WhatsApp and email, and the session itself is a private call. ${ASSURANCES.join(' · ')}.`,
    links: [['Book a consultation', '/book']],
    chips: ['How soon can I get an appointment?', 'Contact details'],
  },
  {
    id: 'privacy',
    k: ['confidential', 'privacy', 'private', 'data', 'safe', 'share my details', 'gdpr', 'secure'],
    a: 'Completely confidential, at every stage. Your details, the discussion, the report and the remedies are never sold and never shared, except where the law requires it. Birth details are used for one thing only: preparing your reading.',
    links: [['Privacy policy', '/legal/privacy-policy'], ['Code of ethics', '/legal/code-of-ethics']],
    chips: ['Can I get a refund?', 'Book a consultation'],
  },
  {
    id: 'refund',
    k: ['refund', 'cancel', 'reschedule', 'missed', 'miss', 'no show', 'did not attend', 'money back', 'change my appointment', 'forfeit'],
    a: `${POLICY[1][1]} Rescheduling is possible with adequate notice, subject to availability.`,
    links: [['Refund policy', '/legal/refund-policy'], ['Booking & cancellation', '/journey#policy']],
    chips: ['What does a session cost?', 'Contact details'],
  },
  {
    id: 'contact',
    k: ['contact', 'email', 'phone', 'number', 'whatsapp', 'reach you', 'talk to a human', 'write to you', 'call'],
    a: `Email ${BRAND.email}, phone ${BRAND.phone}, or WhatsApp the same number. Write before you book if it helps — you will be told plainly which consultation fits, or that you do not need one.`,
    links: [['Book / write', '/book'], ['WhatsApp', BRAND.whatsapp]],
    chips: ['Book a consultation', 'Which one do I need?'],
  },
  {
    id: 'testimonial',
    k: ['review', 'testimonial', 'clients say', 'experiences', 'feedback', 'is she good'],
    a: 'Three hundred and more individuals, families, entrepreneurs and business owners have come here for clarity. Their words are on the home page, published only with consent and never edited into something they did not say.',
    links: [['Client experiences', '/#testimonials'], ['Meet Meenakshi', '/about']],
    chips: ['Why choose her?', 'Book a consultation'],
  },
  {
    id: 'legal',
    k: ['terms', 'policy', 'legal', 'disclaimer', 'conditions'],
    a: `Five policies, all short: ${LEGAL_LINKS.map((l) => l.label).join(', ')}.`,
    links: LEGAL_LINKS.slice(0, 3).map((l) => [l.label, l.to]),
    chips: ['Is this confidential?', 'Can I get a refund?'],
  },
  {
    id: 'ethics',
    k: ['ethics', 'ethical', 'promise', 'guarantee outcome', 'religion', 'belief', 'judge me'],
    a: `${ETHICS[3][1]} And no outcome is ever promised — fees, process and limits are stated before you book.`,
    links: [['Code of ethics', '/legal/code-of-ethics']],
    chips: ['Is this confidential?', 'What does a session cost?'],
  },
]

/* Every service becomes its own entry, so "tell me about vastu" answers from
   the same text the service page shows rather than a second description that
   would have to be maintained beside it. */
const SERVICE_ENTRIES = SERVICES.map((s) => ({
  id: 'svc-' + s.slug,
  k: [s.title.toLowerCase(), s.slug.replace(/-/g, ' '), ...(s.short ? [s.short.toLowerCase()] : [])],
  a: `${s.intro} It covers ${s.items.length} consultations in all, including ${s.items.slice(0, 3).join(', ').toLowerCase()}.`,
  links: [[s.title, ...svcLink(s.slug)], ['Book this consultation', '/book']],
  chips: ['What does a session cost?', 'What do you need from me?'],
  weight: 0.9,
}))

/* The FAQ is already written and already reviewed; the desk should quote it,
   not paraphrase it. */
const FAQ_ENTRIES = FAQ_GROUPS.flatMap((g) =>
  g.items.map((item, i) => ({
    id: `faq-${g.group}-${i}`,
    k: [item.q.toLowerCase().replace(/[?.]/g, '')],
    a: item.a,
    links: [['All questions', '/#faq'], ['Book a consultation', '/book']],
    weight: 0.85,
  })),
)

export const ENTRIES = [...ASTRO_ENTRIES, ...PRACTICE_ENTRIES, ...SERVICE_ENTRIES, ...FAQ_ENTRIES]

/* ---- what the desk suggests when it has nothing to go on -------- */

export const OPENERS = [
  'Which consultation do I need?',
  'What is a dasha?',
  'What do you need from me?',
  'How soon can I get an appointment?',
]

/* Chips offered per route, so the desk opens on something relevant to the page
   the visitor is actually standing on. */
export const PAGE_CHIPS = {
  '/': ['Which consultation do I need?', 'What is a kundli?', 'What does a session cost?'],
  '/about': ['What are the four lineages?', 'Why choose her?', 'Is this confidential?'],
  '/services': ['Which consultation do I need?', 'What is guna milan?', 'What does a session cost?'],
  '/journey': ['How soon can I get an appointment?', 'What is included?', 'Can I reschedule?'],
  '/book': ['What do you need from me?', 'I do not know my birth time', 'Is my data safe?'],
}

/* Problem → discipline. This is the routing table behind "which one do I
   need", phrased the way people actually arrive rather than by discipline. */
export const ROUTER = [
  { k: ['career', 'job', 'promotion', 'work', 'interview', 'resign', 'appraisal'], slug: 'astrology', why: 'career direction and timing are read from the 10th house and the running dasha' },
  { k: ['business', 'startup', 'company', 'partnership', 'expand', 'venture'], slug: 'astrology', why: 'business timing is chart work first — and the trading name is checked in numerology after' },
  { k: ['marriage', 'wedding', 'match', 'spouse', 'husband', 'wife', 'divorce', 'relationship', 'love', 'partner'], slug: 'astrology', why: 'compatibility, the 7th house and Mangal dosha all sit inside the astrology consultation' },
  { k: ['money', 'wealth', 'debt', 'loan', 'finance', 'investment', 'property', 'real estate'], slug: 'astrology', why: 'wealth is read from the 2nd and 11th houses, with the dasha for timing' },
  { k: ['health', 'illness', 'disease', 'anxiety', 'stress', 'sleep'], slug: 'spiritual-remedies', why: 'this is handled as practice and counselling, alongside — never instead of — medical advice' },
  { k: ['child', 'children', 'education', 'study', 'exam', 'college'], slug: 'astrology', why: 'the 5th house and the current dasha cover children and education' },
  { k: ['name', 'spelling', 'brand name', 'lucky number', 'number', 'date'], slug: 'numerology', why: 'names and dates are numerology' },
  { k: ['home', 'house', 'flat', 'office', 'shop', 'plot', 'construction', 'renovation', 'direction'], slug: 'vastu-shastra', why: 'a space is read by direction, not by chart' },
  { k: ['urgent', 'quick', 'one question', 'this week', 'immediately', 'right now'], slug: 'rune-card-reading', why: 'a single sharp question does not need a full chart' },
  { k: ['repeat', 'pattern', 'stuck', 'again and again', 'blocked', 'same problem'], slug: 'karma-alignment', why: 'a situation that keeps returning is read as a pattern rather than an event' },
  { k: ['handwriting', 'signature'], slug: 'graphology', why: 'that is graphology' },
  { k: ['breath', 'daily practice', 'routine', 'timing of the day'], slug: 'swar-vigyan', why: 'Swar Vigyan works at the scale of the hour' },
]

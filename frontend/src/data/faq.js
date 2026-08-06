import { get } from '../content-store.js'

/* The full FAQ from the presentation, grouped so the page can be read rather
   than scrolled. The home page shows the first group only. */

const FAQ_GROUPS_FALLBACK = [
  {
    group: 'Before you book',
    items: [
      {
        q: 'What services does Meenakshi offer?',
        a: 'Personalised consultations in Vedic Astrology, Numerology, Vastu Shastra, Rune Card Reading, Karma Alignment, Swar Vigyan, Graphology and other traditional metaphysical sciences.',
      },
      {
        q: 'Which consultation is right for me?',
        a: 'If you are unsure which service best suits your needs, contact us before booking. We are happy to point you to the most appropriate consultation, or to tell you if you do not need a session at all.',
      },
      {
        q: 'How do I book a consultation?',
        a: 'Complete the consultation form with the required details and make the payment. Your appointment is confirmed once the booking process is complete.',
      },
      {
        q: 'What information do I need to provide?',
        a: 'Your name and contact details, your date, time and place of birth, and a brief description of the areas where you are seeking guidance.',
      },
      {
        q: 'What if I do not know my exact birth time?',
        a: 'An accurate birth time is ideal for astrological analysis. If you are unsure, mention it while booking. Depending on your requirements, alternative methods or suitable guidance may be suggested.',
      },
      {
        q: 'Do you offer priority or urgent appointments?',
        a: 'Priority appointments may be available depending on the schedule. Please contact us to check current availability.',
      },
    ],
  },
  {
    group: 'The consultation',
    items: [
      {
        q: 'Why is my appointment four to five days after booking?',
        a: 'Every consultation is personally prepared. That period allows for detailed analysis of your birth details and concerns, which is what makes the session specific to you rather than generic.',
      },
      {
        q: 'How long does a consultation last?',
        a: 'Most consultations last approximately sixty minutes or longer, depending on the nature of your concerns and the discussion during the session.',
      },
      {
        q: 'How should I prepare?',
        a: 'Take a few moments beforehand to note the questions or areas you would like to discuss. It keeps the session focused and productive.',
      },
      {
        q: 'Are online consultations available?',
        a: 'Yes. Consultations are conducted online, so clients anywhere in the world can receive guidance from home or the office.',
      },
      {
        q: 'Which languages are consultations available in?',
        a: 'English and Hindi, so the conversation stays comfortable for a wide range of clients.',
      },
      {
        q: 'Can I book for a family member?',
        a: 'Yes. It is recommended that the person being consulted is aware of and consents to the consultation, and accurate personal details remain essential.',
      },
      {
        q: 'Can I consult about business matters?',
        a: 'Yes. Meenakshi regularly guides entrepreneurs, professionals and business owners on growth, branding, partnerships, career, finances and strategic decisions.',
      },
    ],
  },
  {
    group: 'Afterwards',
    items: [
      {
        q: 'Will I receive a report?',
        a: 'Yes. After the consultation you receive a personalised report containing the guidance, recommended remedies and the key points discussed.',
      },
      {
        q: 'Do you provide post-consultation support?',
        a: 'Every consultation includes fifteen days of support to clarify questions about the guidance and remedies recommended during your session.',
      },
      {
        q: 'Are the remedies compulsory?',
        a: 'No. Remedies are recommended as supportive spiritual practices. Following them is entirely your personal choice.',
      },
      {
        q: 'Are the consultations confidential?',
        a: 'Absolutely. All personal information, discussions, reports and recommendations are treated with the highest level of confidentiality and are never sold or shared.',
      },
    ],
  },
  {
    group: 'Payment and policy',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'Secure online payments through the methods displayed during the booking process.',
      },
      {
        q: 'Can I reschedule my appointment?',
        a: 'Yes, if the request is made with adequate advance notice and subject to appointment availability.',
      },
      {
        q: 'What is your refund policy?',
        a: 'Because every consultation involves dedicated preparation before the appointment, fees are generally non-refundable once the booking is confirmed. See the Refund & Cancellation Policy for the detail.',
      },
      {
        q: 'Do you offer consultation packages?',
        a: 'Depending on your requirements, packages may be available for individuals, families or businesses. Contact us for more information.',
      },
      {
        q: 'Can you guarantee specific results?',
        a: 'No. These disciplines provide guidance based on established principles and professional interpretation. Every individual and situation is unique, so no specific outcome can be guaranteed.',
      },
      {
        q: 'Are your services a substitute for medical, legal or financial advice?',
        a: 'No. The guidance is spiritual and advisory in nature. Please seek qualified professional assistance whenever appropriate.',
      },
    ],
  },
]

/* Flattened, for the shorter home-page accordion. */
const FAQ_HOME_FALLBACK = [
  FAQ_GROUPS_FALLBACK[0].items[0],
  FAQ_GROUPS_FALLBACK[1].items[0],
  FAQ_GROUPS_FALLBACK[1].items[1],
  FAQ_GROUPS_FALLBACK[0].items[4],
  FAQ_GROUPS_FALLBACK[2].items[0],
  FAQ_GROUPS_FALLBACK[2].items[3],
]

/* The four shown beside the booking form. Short answers only: anyone wanting
   the full set is one click from the home page's FAQ. */
const BOOK_FAQ_FALLBACK = [
  {
    q: 'How does the consultation process work?',
    a: 'Submit this form, confirm payment, and your appointment is scheduled automatically. Meenakshi studies your chart in advance, so the session itself stays focused on your questions.',
  },
  {
    q: 'What details do I need to provide?',
    a: 'Your name and contact, your date, time and place of birth, and the area where you are seeking guidance. Accurate birth details are what make the reading specific rather than generic.',
  },
  {
    q: 'How will I receive the consultation?',
    a: 'Online, at the confirmed time, in English or Hindi. Sessions run sixty minutes or longer, and a written report follows afterwards.',
  },
  {
    q: 'Is my information kept confidential?',
    a: 'Yes. Personal details, birth data, discussions and reports are never sold or shared, and no part of a consultation is published.',
  },
]

/* ---- live content, with the above as fallback ------------------ */

export const FAQ_GROUPS = get('faqGroups', FAQ_GROUPS_FALLBACK)
export const FAQ_HOME = get('faqHome', FAQ_HOME_FALLBACK)
export const BOOK_FAQ = get('bookFaq', BOOK_FAQ_FALLBACK)

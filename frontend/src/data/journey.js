import { get } from '../content-store.js'

/* The eight steps of a consultation, from the presentation. `aside` is the
   detail a visitor asks about once they have read the step itself. */

const JOURNEY_FALLBACK = [
  {
    n: '01',
    title: 'Explore & book',
    body: 'Browse the services and choose the consultation that fits. If you are unsure which one, write first and we will point you to it.',
    aside: 'No payment is taken until the area is agreed.',
  },
  {
    n: '02',
    title: 'Share your details',
    body: 'A short form: your name and contact, your date, time and place of birth, and the areas where you are seeking guidance.',
    aside: 'Birth details are used only to prepare your reading.',
  },
  {
    n: '03',
    title: 'Confirm the appointment',
    body: 'Once booking and payment are complete, the consultation is scheduled automatically, usually within four to five days.',
    aside: 'Confirmation arrives by WhatsApp and email.',
  },
  {
    n: '04',
    title: 'Personalised analysis',
    body: 'Before the appointment your chart and requirements are studied in depth, so the session itself stays focused on your questions.',
    aside: 'This preparation is why the wait exists.',
  },
  {
    n: '05',
    title: 'One-to-one consultation',
    body: 'A private session of sixty minutes or more, covering the influences behind your situation, practical direction, and any remedies.',
    aside: 'Conducted online, in English or Hindi.',
  },
  {
    n: '06',
    title: 'Your guidance report',
    body: 'A written document summarising the remedies, practices and guidance discussed, so you can return to it whenever you need.',
    aside: 'Yours to keep, and completely private.',
  },
  {
    n: '07',
    title: 'Fifteen days of support',
    body: 'Every consultation includes fifteen days of follow-up support to clarify questions about the remedies and how to apply them.',
    aside: 'The part most people say they value most.',
  },
  {
    n: '08',
    title: 'Share your experience',
    body: 'When your journey is complete you are invited to share how it went. Feedback shapes the practice and helps others decide.',
    aside: 'Entirely optional, and never published without consent.',
  },
]

/* Booking and cancellation terms, shown alongside the form. */
const POLICY_FALLBACK = [
  ['Payments', 'All consultation fees are payable in advance and are required to confirm the appointment.'],
  ['Refunds', 'Considerable time is invested preparing each consultation before the appointment, so fees are generally non-refundable once a booking is confirmed. Refunds under exceptional circumstances are at Meenakshi’s sole discretion.'],
  ['Rescheduling', 'You may request to reschedule with adequate advance notice, subject to availability.'],
  ['Missed appointments', 'Failing to attend without prior notice may result in forfeiture of the appointment and the fee.'],
  ['Preparation time', 'Consultations are generally scheduled four to five days after payment confirmation, to allow for detailed analysis.'],
  ['After the session', 'Every consultation includes fifteen days of support for clarification on the guidance and remedies discussed.'],
  ['Your cooperation', 'The quality of a consultation depends on the accuracy of what you share. Complete and correct details make the guidance meaningful.'],
]

/* What the booking flow actually provides, shown as a reassurance strip. */
const INCLUDED_FALLBACK = [
  ['Secure payment', 'Processed through Razorpay'],
  ['Scheduled automatically', 'Calendar confirmation on booking'],
  ['WhatsApp & email', 'Confirmation on both'],
  ['Written report', 'Delivered after the session'],
  ['15-day support', 'For follow-up questions'],
]

/* ---- live content, with the above as fallback ------------------ */

export const JOURNEY = get('journey', JOURNEY_FALLBACK)
export const POLICY = get('policy', POLICY_FALLBACK)
export const INCLUDED = get('included', INCLUDED_FALLBACK)

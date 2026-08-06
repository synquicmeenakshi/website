import { get } from '../content-store.js'

/* The five legal pages, kept as data so they render through one route and one
   template. Body text is taken verbatim in substance from the presentation.
   Each section is [heading, ...paragraphs]. */

const LEGAL_FALLBACK = {
  'privacy-policy': {
    title: 'Privacy Policy',
    lede: 'Your privacy matters, and the rules here are short enough to read.',
    updated: 'Applies to this website and all consultations booked through it.',
    sections: [
      ['Information we collect', 'We may collect your name, contact details, date of birth, time of birth, place of birth, consultation requirements, and any other information you provide voluntarily.'],
      ['Why we collect it', 'Solely to schedule consultations, prepare your personalised analysis, provide reports and remedies, communicate about appointments and follow-up support, and improve our services.'],
      ['Confidentiality', 'All personal information and consultation discussions are treated with strict confidentiality. They are never sold, and never shared with third parties except where required by law.'],
      ['Data security', 'Reasonable administrative and technical safeguards are in place to protect your information from unauthorised access.'],
      ['Your consent', 'By submitting your information through this website, you consent to its collection and use in accordance with this policy.'],
    ],
  },

  'terms-and-conditions': {
    title: 'Terms & Conditions',
    lede: 'The basis on which consultations are offered and booked.',
    updated: 'These terms may be updated from time to time without prior notice.',
    sections: [
      ['Acceptance of terms', 'By accessing this website or booking a consultation, you acknowledge that you have read, understood and agree to be bound by these terms.'],
      ['Nature of services', 'All consultations are based on the principles of Vedic Astrology, Numerology, Vastu Shastra and other traditional metaphysical sciences. The guidance provided represents Meenakshi’s professional interpretation and is intended to offer insight, clarity and spiritual direction.'],
      ['Booking and payments', 'Appointments are confirmed only after full payment is received. Fees are payable in advance. Pricing may change without prior notice, but changes will not affect bookings already confirmed.'],
      ['Consultation schedule', 'Appointments are generally scheduled four to five days after payment confirmation. This period allows for detailed analysis before your consultation.'],
      ['Client responsibilities', 'Clients are responsible for providing accurate personal details, including date, time and place of birth, and any other information relevant to the consultation.'],
      ['Intellectual property', 'All consultation reports, remedies, written content, website materials and documents are the intellectual property of Meenakshi and are intended solely for the client’s personal use. Reproduction, distribution or commercial use is prohibited.'],
      ['Limitation of liability', 'Consultations provide guidance and should not be considered a substitute for medical, legal, financial, psychological or other professional advice. Clients remain solely responsible for their own decisions and actions.'],
    ],
  },

  'refund-policy': {
    title: 'Refund & Cancellation Policy',
    lede: 'Preparation begins before your appointment, which is what this policy reflects.',
    updated: 'Applies to every consultation booked through this website.',
    sections: [
      ['Payments', 'All consultation fees are payable in advance and are required to confirm your appointment.'],
      ['Refunds', 'As considerable time is invested in preparing each personalised consultation before the scheduled appointment, fees are generally non-refundable once a booking has been confirmed. Refunds, if approved under exceptional circumstances, are entirely at Meenakshi’s sole discretion.'],
      ['Rescheduling', 'Clients may request to reschedule by providing adequate advance notice. Rescheduling requests are subject to availability.'],
      ['Missed appointments', 'Failure to attend a scheduled consultation without prior notice may result in forfeiture of both the appointment and the fee.'],
      ['Preparation time', 'Consultations are generally scheduled four to five days after payment confirmation, allowing sufficient time for detailed preparation and personalised analysis.'],
      ['Post-consultation support', 'Every consultation includes fifteen days of support for clarification regarding the guidance and remedies discussed during the session.'],
      ['Client cooperation', 'The quality of a consultation depends on the accuracy of the information provided. Clients are encouraged to share complete and correct details.'],
    ],
  },

  'code-of-ethics': {
    title: 'Code of Ethics',
    lede: 'Every consultation is guided by integrity, respect and responsibility.',
    updated: 'The commitments made to every client, without exception.',
    sections: [
      ['Integrity', 'Every consultation is conducted with honesty, authenticity and the highest professional standards. Guidance is offered in good faith, based on traditional knowledge, experience and careful analysis.'],
      ['Confidentiality', 'All personal information, discussions, reports and recommendations are treated with the utmost confidentiality. Your privacy is respected at every stage.'],
      ['Personalised guidance', 'Every individual is unique. Recommendations and remedies are tailored to your specific circumstances rather than based on generic interpretations or standardised advice.'],
      ['Respect and compassion', 'Every client is treated with dignity, empathy and respect, regardless of age, gender, nationality, religion, culture or personal belief. The intention is a safe and supportive environment for open conversation.'],
      ['Responsible recommendations', 'Remedies and guidance are offered as complementary spiritual practices intended to support your growth and well-being. They are not a substitute for professional medical, legal, financial or psychological advice.'],
      ['Transparency', 'Fees, services and processes are communicated clearly before booking. We do not knowingly make false promises, guarantee specific outcomes, or encourage unrealistic expectations.'],
      ['Client empowerment', 'The purpose of every consultation is to help you gain clarity, confidence and a deeper understanding of your circumstances, while respecting your free will and personal responsibility.'],
      ['Continuous learning', 'Meenakshi remains committed to the ongoing study and responsible practice of Astrology, Numerology, Vastu Shastra and other traditional metaphysical sciences.'],
    ],
  },

  disclaimer: {
    title: 'Disclaimer',
    lede: 'What this guidance is, and what it is not.',
    updated: 'Please read before booking a consultation.',
    sections: [
      ['The basis of the guidance', 'Consultations are based on the principles and interpretations of Vedic Astrology, Numerology, Vastu Shastra and other traditional metaphysical sciences, together with Meenakshi’s professional knowledge, study, experience and intuitive understanding developed over the years. They are intended to offer spiritual guidance, personal insight and a broader perspective to support informed decision-making.'],
      ['No guaranteed outcome', 'Every consultation is personalised and represents a sincere professional opinion based on the information provided and the methodologies applied. As these disciplines involve interpretation, and individual circumstances vary, no prediction, guidance, remedy or recommendation should be construed as a guarantee, warranty or assurance of any specific outcome. The effectiveness of remedies may differ from person to person depending on circumstances, belief, effort and other factors beyond our control.'],
      ['Your own judgement', 'Clients are encouraged to exercise their own judgement and discretion when making personal, financial, legal, medical, business or other important decisions. Where appropriate, seek independent advice from qualified professionals such as medical practitioners, legal advisors, financial consultants or other licensed experts.'],
      ['Liability', 'By booking a consultation or using this website, you acknowledge that the guidance provided is advisory in nature, accept full responsibility for your own decisions and actions, and agree that Meenakshi and her associates shall not be held liable for any direct, indirect, incidental or consequential loss, damage or claim arising from the use of the consultation, recommendations, remedies or information provided.'],
    ],
  },
}

/* ---- live content, with the above as fallback ------------------ */

export const LEGAL = get('legal', LEGAL_FALLBACK)

export const LEGAL_LINKS = Object.entries(LEGAL).map(([slug, p]) => ({
  slug,
  label: p.title,
  to: `/legal/${slug}`,
}))

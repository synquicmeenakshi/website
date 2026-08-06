/* Icons used only by the booking page. Drawn to match the reference: a single
   1.5 stroke on a 24-unit grid, with the four integration marks kept as simple
   silhouettes rather than as copied brand logos. */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...S} aria-hidden="true" {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
)

export const CalendarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...S} aria-hidden="true" {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...S} aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </svg>
)

/** Calendar with a clock inset, for the confirmation notice. */
export const CalendarClock = (p) => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...S} aria-hidden="true" {...p}>
    <path d="M20 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
    <path d="M3 10h17M8 3v4M15 3v4" />
    <circle cx="17.5" cy="17.5" r="4.5" />
    <path d="M17.5 15.4v2.3l1.5 1" />
  </svg>
)

/** Lotus, for "Trusted Guidance". */
export const LotusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...S} aria-hidden="true" {...p}>
    <path d="M12 19c-3.4 0-6-2.2-6-5 0 0 2.6.3 4.2 1.8" />
    <path d="M12 19c3.4 0 6-2.2 6-5 0 0-2.6.3-4.2 1.8" />
    <path d="M12 19c-2.2-2-3.2-4.3-3.2-6.4 0-2.4 1.4-4.4 3.2-5.6 1.8 1.2 3.2 3.2 3.2 5.6 0 2.1-1 4.4-3.2 6.4Z" />
    <path d="M3.4 12.6C5 12.2 6.6 12.6 7.8 13.6M20.6 12.6c-1.6-.4-3.2 0-4.4 1" />
  </svg>
)

/** Shield with a tick, for "100% Confidential". */
export const ShieldCheck = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...S} aria-hidden="true" {...p}>
    <path d="M12 3 20 6v6c0 4.6-3.4 7.6-8 9-4.6-1.4-8-4.4-8-9V6Z" />
    <path d="m8.6 12 2.4 2.4 4.4-4.6" />
  </svg>
)

/** Small yantra, for "Holistic Approach" and the masthead mark. */
export const YantraMark = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...S} aria-hidden="true" {...p}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="1" />
    <path d="M12 5.5 18.5 12 12 18.5 5.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M9.5 2.5v2M14.5 2.5v2M9.5 19.5v2M14.5 19.5v2M2.5 9.5h2M2.5 14.5h2M19.5 9.5h2M19.5 14.5h2" />
  </svg>
)

/** The larger bhupura mark that sits at the top-right of the panel. */
export const YantraBadge = (p) => (
  <svg viewBox="0 0 40 40" width="38" height="38" fill="none" aria-hidden="true" {...p}>
    <path d="M20 2 38 20 20 38 2 20Z" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="9" width="22" height="22" stroke="currentColor" strokeWidth="1.1" />
    <circle cx="20" cy="20" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="20" cy="20" r="2" fill="currentColor" />
  </svg>
)

export const LockSmall = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...S} aria-hidden="true" {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

export const ArrowUpRight = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...S} aria-hidden="true" {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
)

export const Chevron = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...S} aria-hidden="true" {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const PlusMinus = ({ open = false, ...p }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...S} aria-hidden="true" {...p}>
    <path d="M5 12h14" />
    {!open && <path d="M12 5v14" />}
  </svg>
)

/* ---- Integration marks -------------------------------------------------
   Simple silhouettes in the partner's colour rather than reproductions of the
   real logos, which we have no licence to embed. */

export const RazorpayMark = (p) => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true" {...p}>
    <path d="M4 20 12.5 4h4L8 20Z" fill="#3395FF" />
    <path d="M9.5 20 18 4h2l-3.4 7.5H20L14 20Z" fill="#072654" />
  </svg>
)

export const CalendarMark = (p) => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true" {...p}>
    <rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" stroke="#4285F4" strokeWidth="1.6" />
    <path d="M3 8.5h18" stroke="#4285F4" strokeWidth="1.6" />
    <path d="M9.6 12.6h4.8M12 12.6v5.2" stroke="#4285F4" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const WhatsAppMark = (p) => (
  <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="10" fill="#25D366" />
    <path
      fill="#fff"
      d="M16.2 14.3c-.2-.1-1.3-.6-1.5-.7-.2-.1-.35-.1-.5.1s-.57.7-.7.85c-.13.15-.26.16-.48.06a6.1 6.1 0 0 1-1.8-1.1 6.7 6.7 0 0 1-1.24-1.54c-.13-.22 0-.34.1-.45l.33-.39c.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39s-.5-1.2-.68-1.64c-.18-.43-.36-.37-.5-.38h-.42a.82.82 0 0 0-.59.28c-.2.22-.77.75-.77 1.83s.79 2.12.9 2.27c.11.15 1.55 2.37 3.76 3.32.53.23.94.36 1.26.46.53.17 1.01.14 1.39.09.42-.06 1.3-.53 1.49-1.05.18-.52.18-.96.13-1.05-.05-.09-.2-.15-.42-.25Z"
    />
  </svg>
)

export const MailMark = (p) => (
  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true" {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" fill="#D4531D" />
    <path d="m3.5 7 8.5 6 8.5-6" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

export const SupportMark = (p) => (
  <svg viewBox="0 0 24 24" width="19" height="19" {...S} stroke="#8a6b3a" aria-hidden="true" {...p}>
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <rect x="2.5" y="14" width="4.5" height="6" rx="1.6" />
    <rect x="17" y="14" width="4.5" height="6" rx="1.6" />
    <path d="M20 20v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
  </svg>
)

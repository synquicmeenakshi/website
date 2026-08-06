/* One stroke weight, one 24-unit grid, so the set reads as a family.
   Everything decorative on this site is drawn here rather than typed as an
   emoji or a dingbat character. */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const ArrowRight = ({ width = 16, height = 16, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

export const ArrowUpRight = ({ width = 16, height = 16, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="M6 18 18 6M9 6h9v9" />
  </svg>
)

export const ChevronDown = ({ width = 12, height = 12, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="m5 9 7 7 7-7" />
  </svg>
)

export const MenuIcon = ({ width = 22, height = 22, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="M3 7h18M3 17h18" />
  </svg>
)

export const CloseIcon = ({ width = 22, height = 22, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
)

export const MailIcon = ({ width = 18, height = 18, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

export const PhoneIcon = ({ width = 18, height = 18, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
  </svg>
)

export const WhatsAppIcon = ({ width = 18, height = 18, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-2-1.23a7.4 7.4 0 0 1-1.37-1.71c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.55-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.18 1.13.16 1.55.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29Z" />
  </svg>
)

export const InstagramIcon = ({ width = 18, height = 18, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const LockIcon = ({ width = 16, height = 16, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

export const PlusIcon = ({ width = 16, height = 16, open = false, ...p }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} {...S} aria-hidden="true" {...p}>
    <path d="M4 12h16" />
    {/* the vertical stroke is hidden rather than rotated, so nothing spins */}
    {!open && <path d="M12 4v16" />}
  </svg>
)

/* ---- Marks ------------------------------------------------------------- */

/** Four-point star, the recurring punctuation of the site. */
export const Star = ({ width = 12, height = 12, ...p }) => (
  <svg viewBox="0 0 20 20" width={width} height={height} fill="currentColor" aria-hidden="true" {...p}>
    <path d="M10 0 11.9 6.6 20 10 11.9 13.4 10 20 8.1 13.4 0 10 8.1 6.6Z" />
  </svg>
)

/** A rule with a star set into its centre. */
export const StarRule = ({ width = 160, ...p }) => (
  <svg viewBox={`0 0 ${width} 12`} width={width} height="12" fill="none" aria-hidden="true" {...p}>
    <line x1="0" y1="6" x2={width / 2 - 13} y2="6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <line x1={width / 2 + 13} y1="6" x2={width} y2="6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <path
      d={`M${width / 2} 0.5 ${width / 2 + 1.3} 4.7 ${width / 2 + 5.5} 6 ${width / 2 + 1.3} 7.3 ${width / 2} 11.5 ${width / 2 - 1.3} 7.3 ${width / 2 - 5.5} 6 ${width / 2 - 1.3} 4.7Z`}
      fill="currentColor"
    />
  </svg>
)

/** Brand mark: a bhupura gate enclosing an eight-petal lotus. */
export const Monogram = ({ size = 36, ...p }) => {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180
    return [24 + 8.5 * Math.cos(a), 24 + 8.5 * Math.sin(a), i * 45]
  })
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden="true" {...p}>
      <path d="M4 4h40v40H4z" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M18 4v4h12V4M18 44v-4h12v4M4 18h4v12H4M44 18h-4v12h4"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.75"
      />
      <path d="M9 9h30v30H9z" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M24 11 37 24 24 37 11 24Z" stroke="currentColor" strokeWidth="1.1" opacity="0.7" />
      {petals.map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="4.4"
          ry="2.1"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <circle cx="24" cy="24" r="2.2" fill="currentColor" />
    </svg>
  )
}

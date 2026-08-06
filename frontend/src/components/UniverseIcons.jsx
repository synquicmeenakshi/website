/* Icons for the Services Universe. One 48-unit grid, one 1.6 stroke, so the
   eight read as a set inside their orbit discs. Everything is `currentColor`
   and `fill: none` — the discs supply the glow. */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const wrap = (children) => (p) => (
  <svg viewBox="0 0 48 48" width="30" height="30" {...S} aria-hidden="true" {...p}>
    {children}
  </svg>
)

/* 01 · a radiant sun inside a lotus ring */
export const AstrologyIcon = wrap(
  <>
    <circle cx="24" cy="24" r="6.5" />
    <circle cx="24" cy="24" r="2.4" />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1="24" y1="14" x2="24" y2="10" transform={`rotate(${i * 30} 24 24)`} />
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d="M24 33 Q20.5 39 24 44 Q27.5 39 24 33Z" transform={`rotate(${i * 45} 24 24)`} opacity="0.7" />
    ))}
  </>,
)

/* 02 · a numeric quadrant, as on a numerology square */
export const NumerologyIcon = (p) => (
  <svg viewBox="0 0 48 48" width="30" height="30" fill="none" aria-hidden="true" {...p}>
    <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
    {[
      ['3', 15, 17],
      ['1', 33, 17],
      ['2', 15, 33],
      ['4', 33, 33],
    ].map(([n, x, y]) => (
      <text
        key={n}
        x={x}
        y={y}
        fill="currentColor"
        fontSize="13"
        fontFamily="var(--font-serif)"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {n}
      </text>
    ))}
  </svg>
)

/* 03 · a plot with its brahmasthan */
export const VastuIcon = wrap(
  <>
    <path d="M8 20 24 8l16 12v20H8Z" />
    <path d="M24 16 32 24l-8 8-8-8Z" />
    <circle cx="24" cy="24" r="3" />
  </>,
)

/* 04 · a rune stave */
export const RuneIcon = wrap(
  <>
    <rect x="12" y="8" width="24" height="32" rx="2" opacity="0.6" />
    <path d="M20 34V14h6a5 5 0 0 1 0 10h-6" />
    <path d="M25 24l5 10" />
  </>,
)

/* 05 · a lotus, for karma */
export const KarmaIcon = wrap(
  <>
    <path d="M24 36c-5-3-8-7-8-11 0 0 4 .5 8 5 4-4.5 8-5 8-5 0 4-3 8-8 11Z" />
    <path d="M24 36c-3-4-4.5-8-4.5-11.5 0-3.5 2-6.5 4.5-8.5 2.5 2 4.5 5 4.5 8.5C28.5 28 27 32 24 36Z" />
    <path d="M9 26c2.5 4 6.5 7 11 9M39 26c-2.5 4-6.5 7-11 9" opacity="0.7" />
  </>,
)

/* 06 · a breath waveform */
export const SwarIcon = wrap(
  <>
    <path d="M6 24h4M38 24h4" opacity="0.6" />
    <path d="M11 24c1-6 2-9 3-9s2 12 3 12 2-16 3-16 2 20 3 20 2-13 3-13 2 9 3 9 2-6 3-6 2 3 3 3" />
  </>,
)

/* 07 · a nib, for graphology */
export const GraphologyIcon = wrap(
  <>
    <path d="M14 32 32 12l5 4L20 37l-7 2Z" />
    <path d="M32 12l5 4" opacity="0.6" />
    <path d="M9 42c5 1.5 10-1.5 15 0s10-1.5 15 0" opacity="0.7" />
  </>,
)

/* 08 · a kalash, for remedies */
export const RemedyIcon = wrap(
  <>
    <path d="M16 20h16v10a8 8 0 0 1-16 0Z" />
    <path d="M13 20h22" />
    <path d="M19 20v-4h10v4" />
    <path d="M24 16c-3-3 3-5 0-9" opacity="0.75" />
    <path d="M16 42h16" opacity="0.6" />
  </>,
)

export const UNIVERSE_ICONS = {
  astrology: AstrologyIcon,
  numerology: NumerologyIcon,
  'vastu-shastra': VastuIcon,
  'rune-card-reading': RuneIcon,
  'karma-alignment': KarmaIcon,
  'swar-vigyan': SwarIcon,
  graphology: GraphologyIcon,
  'spiritual-remedies': RemedyIcon,
}

/* The moon-phase strip that closes the page. Each disc is drawn as a lit half
   plus a terminator ellipse, which is what actually makes a crescent read. */
export const MoonPhases = ({ ...p }) => {
  const phases = [0.06, 0.25, 0.44, 0.5, 0.56, 0.75, 0.94, 1]
  return (
    <svg viewBox="0 0 250 26" width="250" height="26" fill="none" aria-hidden="true" {...p}>
      {phases.map((k, i) => {
        const R = 8
        const waxing = k <= 0.5
        // 0 = new, 0.5 = full. The terminator is an ellipse whose x-radius
        // shrinks to nothing at quarter and flips side across it.
        const rx = Math.abs(1 - k * 4 % 2) * R
        const sweepOuter = waxing ? 1 : 0
        const sweepInner = k < 0.25 || (k > 0.5 && k < 0.75) ? sweepOuter : 1 - sweepOuter
        return (
          <g key={i} transform={`translate(${17 + i * 31} 13)`}>
            <circle r={R} stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
            <path
              d={`M0 ${-R} A${R} ${R} 0 0 ${sweepOuter} 0 ${R} A${rx} ${R} 0 0 ${sweepInner} 0 ${-R}Z`}
              fill="currentColor"
              opacity="0.9"
            />
          </g>
        )
      })}
    </svg>
  )
}

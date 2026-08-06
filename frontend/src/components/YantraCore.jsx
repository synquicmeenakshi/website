/* The glowing bhupura at the centre of the Services Universe.

   A square yantra: four gates, nested squares, both diagonals and the inner
   diamond, with the twelve bhava carrying Devanagari. Every stroke is marked
   [data-draw] so the whole figure can be traced in on scroll. */

const HOUSES = [
  ['मेष', 50, 20], ['वृष', 30, 14], ['मिथु', 14, 30], ['कर्क', 20, 50],
  ['सिंह', 14, 70], ['कन्या', 30, 86], ['तुला', 50, 80], ['वृश्चि', 70, 86],
  ['धनु', 86, 70], ['मकर', 80, 50], ['कुंभ', 86, 30], ['मीन', 70, 14],
]

export default function YantraCore({ className = '', ...p }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`yc ${className}`}
      fill="none"
      aria-hidden="true"
      {...p}
    >
      {/* four gates */}
      {[0, 90, 180, 270].map((r) => (
        <path
          key={r}
          data-draw
          d="M38 4h24v6h-8v6h-8v-6h-8z"
          stroke="currentColor"
          strokeWidth="0.8"
          transform={`rotate(${r} 50 50)`}
        />
      ))}

      {/* nested squares */}
      <rect data-draw x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="1.1" />
      <rect data-draw x="15" y="15" width="70" height="70" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

      {/* the bhava: both diagonals and the inner diamond */}
      <path data-draw d="M15 15 85 85M85 15 15 85" stroke="currentColor" strokeWidth="0.7" opacity="0.85" />
      <polygon data-draw points="50,15 85,50 50,85 15,50" stroke="currentColor" strokeWidth="0.9" />

      {/* inner square, rotated, and the bindu */}
      <rect data-draw x="35" y="35" width="30" height="30" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
      <circle data-draw cx="50" cy="50" r="9" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

      {HOUSES.map(([label, x, y]) => (
        <text
          key={label}
          x={x}
          y={y}
          fill="currentColor"
          fontSize="3.6"
          fontFamily="var(--font-deva)"
          textAnchor="middle"
          dominantBaseline="central"
          opacity="0.72"
          data-glyph
        >
          {label}
        </text>
      ))}

      <circle cx="50" cy="50" r="1.8" fill="currentColor" data-glyph />
    </svg>
  )
}

/* ============================================================
   Jyotish drawing kit.

   The horoscope furniture — the rashi wheel, the twelve sign glyphs, the
   north-Indian bhava chart, a yantra and the numerology grid — all drawn as
   SVG rather than sourced as photographs. They scale to any tile, never crop,
   and carry the site's own colours instead of a stock photo's.

   Everything takes `currentColor` for its linework, and defaults to filling
   its container, so a tile only has to set a colour and a size.
   ============================================================ */

const pol = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

/* ---- The twelve rashi, drawn on a 20x20 grid ------------------ */
const RASHI = {
  Mesha: 'M10 17V7M10 7C10 3 7.6 2 5.8 3.2 4 4.4 3.6 7 4.4 9M10 7c0-4 2.4-5 4.2-3.8 1.8 1.2 2.2 3.8 1.4 5.8',
  Vrishabha: 'M10 18a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2M3.4 2.6c0 3.4 3 5.6 6.6 5.6s6.6-2.2 6.6-5.6',
  Mithuna: 'M4 3.4c4 1.4 8 1.4 12 0M4 16.6c4-1.4 8-1.4 12 0M6.8 3.8v12.4M13.2 3.8v12.4',
  Karka: 'M2.6 7.4c2.4-3 6-4.2 9.4-3.4M17.4 12.6c-2.4 3-6 4.2-9.4 3.4M13.6 6.2a2.4 2.4 0 1 0 3.4 3.4 2.4 2.4 0 0 0-3.4-3.4M3 10.4a2.4 2.4 0 1 0 3.4 3.4A2.4 2.4 0 0 0 3 10.4',
  Simha: 'M7.6 16.6c-3 0-4.8-2-4.8-4.4s1.8-3.8 3.4-3.8c1.4 0 2.4 1 2.4 2.2M8.6 10.6c-.6-2-1-3.4-1-4.6C7.6 3.6 9 2.4 10.8 2.4S14 3.8 14 6c0 2.6-2 4.6-2 7 0 2 1.4 3.4 3.2 3.4 1 0 1.8-.4 2.4-1',
  Kanya: 'M3 5.6c1.4-1.6 3-1 3 1.2v8M6 7c1.4-1.6 3-1 3 1.2v6.6M9 8.4c1.4-1.6 3-1 3 1.2v4M12 9.6c0 4 1.6 6.4 4.6 6.6M12.6 17.6c3.4-.6 5-2.6 4.6-5.6',
  Tula: 'M2.6 16.6h14.8M2.6 12.4h4.2M13.2 12.4h4.2M6.8 12.4a3.6 3.6 0 1 1 6.4 0',
  Vrishchika: 'M2 5.6c1.4-1.6 3-1 3 1.2v8M5 7c1.4-1.6 3-1 3 1.2v6.6M8 8.4c1.4-1.6 3-1 3 1.2v6.4c0 1.6 1.4 2.4 2.6 1.4l3.4-3M14.6 17.4h3.4v-3.4',
  Dhanu: 'M4.6 15.4 16.4 3.6M11 3.6h5.4V9M6.4 10.4l3.2 3.2',
  Makara: 'M2.6 5.6c1.4-1.6 3-1 3 1.2v8M5.6 7c1.4-1.6 3-1 3 1.2v7.4M8.6 8.6c1-2 2.8-2.6 4.2-1.6 1.6 1.2 1.6 3.8-.2 5-1.4 1-3 .6-3.6-.6M13 12c2.4.4 3.6 2.2 3 4-.4 1.4-1.8 2-3 1.4',
  Kumbha: 'M2.6 8.4 5.8 5.6 9 8.4l3.2-2.8 3.2 2.8M2.6 14 5.8 11.2 9 14l3.2-2.8L15.4 14',
  Meena: 'M5.4 3c-2 4-2 10 0 14M14.6 3c2 4 2 10 0 14M3.4 10h13.2',
}
export const RASHI_NAMES = Object.keys(RASHI)

/** One rashi glyph, standalone. */
export function Rashi({ name, size = 24, ...p }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none" aria-hidden="true" {...p}>
      <path
        d={RASHI[name] ?? RASHI.Mesha}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A rashi placed inside a parent SVG at (x, y). */
function RashiAt({ name, x, y, s, opacity = 0.9 }) {
  return (
    <g transform={`translate(${x - s / 2} ${y - s / 2}) scale(${s / 20})`}>
      <path
        d={RASHI[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4 * (20 / s)}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  )
}

/**
 * The full rashi chakra: twelve houses, twelve signs, a tick ring and
 * planetary nodes. Scales cleanly from a 120px thumbnail to a full panel.
 */
export function ZodiacWheel({ size = '100%', nodes = true, className = '', ...p }) {
  const c = 50
  const R = 48
  const rings = [R, R * 0.92, R * 0.78, R * 0.6, R * 0.3, R * 0.15]

  return (
    <svg
      viewBox="0 0 100 100"
      className={`jy ${className}`}
      fill="none"
      width={size}
      height={size}
      aria-hidden="true"
      {...p}
    >
      {rings.map((r, i) => (
        <circle
          key={r}
          cx={c}
          cy={c}
          r={r}
          stroke="currentColor"
          strokeWidth={i === 0 || i === 2 ? 0.4 : 0.22}
          opacity={i === 0 || i === 2 ? 0.85 : 0.4}
        />
      ))}
      <circle cx={c} cy={c} r={R * 0.96} stroke="currentColor" strokeWidth="0.18" strokeDasharray="0.4 1.6" opacity="0.55" />

      {/* twelve house spokes */}
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pol(c, c, R * 0.3, i * 30)
        const [x2, y2] = pol(c, c, R * 0.92, i * 30)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.2" opacity="0.4" />
      })}

      {/* tick ring */}
      {Array.from({ length: 72 }, (_, i) => {
        const [x1, y1] = pol(c, c, R * 0.78, i * 5)
        const [x2, y2] = pol(c, c, R * (i % 6 === 0 ? 0.73 : 0.755), i * 5)
        return <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.18" opacity="0.45" />
      })}

      {/* interlocking triangles at the core */}
      {[0, 60].map((off) => (
        <polygon
          key={off}
          points={[0, 120, 240].map((a) => pol(c, c, R * 0.3, a + off).map((n) => n.toFixed(1)).join(',')).join(' ')}
          stroke="currentColor"
          strokeWidth="0.22"
          opacity="0.55"
        />
      ))}

      {/* the twelve signs */}
      {RASHI_NAMES.map((name, i) => {
        const [x, y] = pol(c, c, R * 0.855, i * 30 + 15)
        return <RashiAt key={name} name={name} x={x} y={y} s={5.4} opacity={0.95} />
      })}

      {/* planetary nodes */}
      {nodes &&
        [
          [22, 0.7], [78, 0.44], [140, 0.7], [196, 0.44], [250, 0.7], [305, 0.55], [340, 0.44],
        ].map(([deg, rr], i) => {
          const [x, y] = pol(c, c, R * rr, deg)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="1.5" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx={x} cy={y} r="0.55" fill="currentColor" />
            </g>
          )
        })}

      <circle cx={c} cy={c} r="1.1" fill="currentColor" />
    </svg>
  )
}

/** North-Indian bhava chart: a square cut by both diagonals and the diamond. */
export function KundliChart({ size = '100%', className = '', ...p }) {
  const labels = [
    [50, 12, '1'], [25, 9, '12'], [9, 25, '11'], [16, 50, '10'],
    [9, 75, '9'], [25, 91, '8'], [50, 88, '7'], [75, 91, '6'],
    [91, 75, '5'], [84, 50, '4'], [91, 25, '3'], [75, 9, '2'],
  ]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" className={`jy ${className}`} aria-hidden="true" {...p}>
      <rect x="1" y="1" width="98" height="98" stroke="currentColor" strokeWidth="0.7" opacity="0.9" />
      <rect x="5" y="5" width="90" height="90" stroke="currentColor" strokeWidth="0.3" opacity="0.4" />
      <path d="M1 1 99 99M99 1 1 99" stroke="currentColor" strokeWidth="0.45" opacity="0.65" />
      <polygon points="50,1 99,50 50,99 1,50" stroke="currentColor" strokeWidth="0.6" opacity="0.85" />
      <circle cx="50" cy="50" r="11" stroke="currentColor" strokeWidth="0.35" opacity="0.5" />
      {labels.map(([x, y, t]) => (
        <text
          key={t}
          x={x}
          y={y}
          fontSize="4"
          fill="currentColor"
          opacity="0.55"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-sans)"
        >
          {t}
        </text>
      ))}
      <circle cx="50" cy="50" r="1.6" fill="currentColor" />
    </svg>
  )
}

/** Sri-yantra style mark: bhupura gate, lotus ring, interlocking triangles. */
export function Yantra({ size = '100%', className = '', ...p }) {
  const c = 50
  const R = 48
  const tri = (r, up) =>
    [0, 120, 240].map((a) => pol(c, c, r, up ? a : a + 60).map((n) => n.toFixed(1)).join(',')).join(' ')

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" className={`jy ${className}`} aria-hidden="true" {...p}>
      <rect x="2" y="2" width="96" height="96" stroke="currentColor" strokeWidth="0.5" opacity="0.55" />
      <rect x="6" y="6" width="88" height="88" stroke="currentColor" strokeWidth="0.28" opacity="0.35" />
      {[[50, 2, 0], [98, 50, 90], [50, 98, 180], [2, 50, 270]].map(([x, y, rot], i) => (
        <rect key={i} x={x - 5} y={y - 2.5} width="10" height="5" stroke="currentColor" strokeWidth="0.4" opacity="0.6" transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      <circle cx={c} cy={c} r={R * 0.84} stroke="currentColor" strokeWidth="0.45" opacity="0.7" />
      <circle cx={c} cy={c} r={R * 0.66} stroke="currentColor" strokeWidth="0.28" opacity="0.4" />
      {Array.from({ length: 16 }, (_, i) => {
        const [x1, y1] = pol(c, c, R * 0.66, i * 22.5)
        const [x2, y2] = pol(c, c, R * 0.84, i * 22.5 + 11.25)
        const [x3, y3] = pol(c, c, R * 0.66, i * 22.5 + 22.5)
        return <path key={i} d={`M${x1} ${y1} Q${x2} ${y2} ${x3} ${y3}`} stroke="currentColor" strokeWidth="0.28" opacity="0.45" />
      })}
      {[0.6, 0.48, 0.36].map((r, i) => (
        <polygon key={`u${i}`} points={tri(R * r, true)} stroke="currentColor" strokeWidth="0.3" opacity={0.65 - i * 0.12} />
      ))}
      {[0.56, 0.44, 0.32].map((r, i) => (
        <polygon key={`d${i}`} points={tri(R * r, false)} stroke="currentColor" strokeWidth="0.3" opacity={0.65 - i * 0.12} />
      ))}
      <circle cx={c} cy={c} r="1.4" fill="currentColor" />
    </svg>
  )
}

/** The numerology square: a 3x3 lo-shu grid inside a ring of digits. */
export function NumberGrid({ size = '100%', className = '', ...p }) {
  const cells = [4, 9, 2, 3, 5, 7, 8, 1, 6]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" className={`jy ${className}`} aria-hidden="true" {...p}>
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="0.3" opacity="0.45" />
      <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="0.2" strokeDasharray="0.5 2" opacity="0.5" />
      {Array.from({ length: 9 }, (_, i) => {
        const [x, y] = pol(50, 50, 45, i * 40)
        return (
          <text key={i} x={x} y={y} fontSize="3.4" fill="currentColor" opacity="0.5" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-sans)">
            {i + 1}
          </text>
        )
      })}
      <rect x="22" y="22" width="56" height="56" stroke="currentColor" strokeWidth="0.55" opacity="0.85" />
      <path d="M40.7 22v56M59.3 22v56M22 40.7h56M22 59.3h56" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
      {cells.map((n, i) => (
        <text
          key={n}
          x={31.3 + (i % 3) * 18.6}
          y={31.3 + Math.floor(i / 3) * 18.6}
          fontSize="8"
          fill="currentColor"
          opacity={n === 5 ? 1 : 0.7}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-serif)"
        >
          {n}
        </text>
      ))}
    </svg>
  )
}

/** Rune stave marks, set out like a cast. */
export function RuneCast({ size = '100%', className = '', ...p }) {
  const staves = [
    'M6 4v16M6 4l7 5M6 12l7-5',
    'M6 4v16M14 4v16M6 12h8',
    'M10 4v16M4 8l6-4 6 4',
    'M5 20V4l10 16V4',
    'M6 4v16M6 4l8 8-8 8',
    'M4 4l6 8 6-8M10 12v8',
  ]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" className={`jy ${className}`} aria-hidden="true" {...p}>
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="0.28" strokeDasharray="0.6 2" opacity="0.5" />
      {staves.map((d, i) => {
        const [x, y] = pol(50, 50, 30, i * 60)
        return (
          <g key={i} transform={`translate(${x - 8} ${y - 8}) scale(0.8)`}>
            <rect x="0" y="0" width="20" height="24" rx="1.5" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
            <path d={d} stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.95" />
          </g>
        )
      })}
      <circle cx="50" cy="50" r="9" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      <circle cx="50" cy="50" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** A quiet field of stars, for use behind dark bands. */
export function Starfield({ count = 60, className = '', ...p }) {
  const h = (n) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return v - Math.floor(v)
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`jy ${className}`} aria-hidden="true" {...p}>
      {Array.from({ length: count }, (_, i) => {
        const x = h(i) * 100
        const y = h(i + 60) * 100
        const r = 0.08 + h(i + 130) * 0.22
        return <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.25 + h(i + 200) * 0.6} />
      })}
    </svg>
  )
}

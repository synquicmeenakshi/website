import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

import { SERVICES } from '../data/services.js'
import { UNIVERSE_ICONS, MoonPhases } from './UniverseIcons.jsx'
import YantraCore from './YantraCore.jsx'
import { ArrowUpRight, Star } from './Icons.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* SERVICES UNIVERSE — the eight disciplines as an orbital chart.

   A full-bleed section of the home page. Two motions, and only two: the yantra
   at the centre traces itself as the section crosses the viewport, and the
   orbit rings turn continuously at four different rates. Everything else is
   still, so the eye has somewhere to rest.

   Node angles start at the top and run clockwise, so the numbering reads 01 at
   twelve o'clock through 08. The badge is the ring position rather than the
   service's own index: the two differ for the last pair. */

const NODE_R = 37 // orbit radius, % of the field
const pol = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]
}

const BLURB = {
  astrology: 'Decode your chart and align with cosmic timing.',
  numerology: 'Uncover the power of numbers in your life.',
  'vastu-shastra': 'Harmonise your space, invite positive energy.',
  'rune-card-reading': 'Tap into ancient symbols for wise guidance.',
  'karma-alignment': 'Understand your karmic blueprint and heal at the source.',
  'swar-vigyan': 'Balance your breath, mind and destiny.',
  graphology: 'Reveal your true self through handwriting.',
  'spiritual-remedies': 'Personalised remedies for peace and prosperity.',
}

/* Ordered so the numbering runs clockwise from the top. */
const RING_ORDER = [
  'astrology', 'numerology', 'vastu-shastra', 'rune-card-reading',
  'karma-alignment', 'swar-vigyan', 'graphology', 'spiritual-remedies',
]

const PROFILE = [
  ['Nakshatra', 'Rohini'],
  ['Rashi', 'Vrishabha'],
  ['Element', 'Earth'],
  ['Life Path', '7'],
]

const HOW = [
  'Select a service node',
  'Discover tailored insights',
  'Receive guidance aligned to your path',
]

/* A deterministic starfield, so it never reflows between renders. */
const STARS = Array.from({ length: 130 }, (_, i) => {
  const h = (n) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
    return v - Math.floor(v)
  }
  return { x: h(i) * 100, y: h(i + 130) * 100, r: 0.4 + h(i + 260) * 1.4, o: 0.2 + h(i + 390) * 0.7 }
})

export default function UniverseSection() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1 · the yantra traces itself as the section crosses the viewport.
        const strokes = gsap.utils.toArray('[data-draw]', root.current)
        strokes.forEach((el) => {
          const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0
          gsap.set(el, { strokeDasharray: len || 400, strokeDashoffset: len || 400 })
        })

        const draw = {
          strokeDashoffset: 0,
          ease: 'none',
          stagger: 0.05,
        }
        const glyphs = { opacity: 1, duration: 0.4, stagger: 0.02 }
        gsap.set('[data-glyph]', { opacity: 0 })

        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              // Starts as the section's top clears the fold and finishes on
              // `center center` — the section's midpoint on the viewport's
              // midpoint, i.e. exactly when it is centred on screen. Ending on
              // `bottom 70%` left it at roughly three-quarters drawn at that
              // moment, which is when the figure is actually being looked at.
              start: 'top bottom',
              end: 'center center',
              scrub: 0.8,
            },
          })
          .to(strokes, { ...draw, duration: 1 })
          .to('[data-glyph]', { ...glyphs, duration: 0.3 }, '-=0.25')

        // 2 · the rings turn, continuously and at their own rates
        gsap.utils.toArray('[data-spin]').forEach((el) => {
          const dur = Number(el.dataset.spin)
          gsap.to(el, {
            rotate: dur > 0 ? 360 : -360,
            duration: Math.abs(dur),
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%',
          })
        })

        gsap.from('.uv__node', {
          opacity: 0,
          scale: 0.6,
          duration: 0.5,
          stagger: 0.06,
          ease: 'back.out(1.6)',
          transformOrigin: '50% 50%',
          scrollTrigger: { trigger: '.uv__chart', start: 'top 78%' },
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-draw], [data-glyph], .uv__node', { clearProps: 'all', opacity: 1 })
      })
    },
    { scope: root },
  )

  return (
    <section className="uv" id="universe" ref={root}>
      {/* ---- the night sky ---- */}
      <div className="uv__sky" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r / 8} fill="#F3B26A" opacity={s.o} />
          ))}
        </svg>
      </div>

      <div className="uv__grid">
        {/* ================= left rail ================= */}
        <aside className="uv__left">
          <h2 className="uv__title">
            Services
            <br />
            <em>Universe</em>
          </h2>
          <span className="uv__rule" aria-hidden="true" />

          <p className="uv__lede">
            Eight sacred sciences.
            <br />
            One transformative journey.
          </p>
          <p className="uv__copy">
            Explore our interconnected services, each calibrated to a celestial wisdom, guiding you
            towards clarity, balance and abundance.
          </p>

          <div className="uv__panel uv__how">
            <p className="uv__panel-h">How it works</p>
            <ol>
              {HOW.map((h, i) => (
                <li key={h}>
                  <span className="uv__how-n">{i + 1}</span>
                  {h}
                </li>
              ))}
            </ol>
          </div>

          <blockquote className="uv__panel uv__quote">
            <span aria-hidden="true">&ldquo;</span>
            <p>
              As above, so below.
              <br />
              As within, so without.
              <br />
              Align and transform.
            </p>
          </blockquote>
        </aside>

        {/* ================= the chart ================= */}
        <div className="uv__chart">
          <div className="uv__orbits" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none">
              {/* still rings */}
              <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.12" opacity="0.35" />
              <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="0.12" opacity="0.3" />

              {/* turning rings — four rates, two directions */}
              <g data-spin="150">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.18" strokeDasharray="0.6 2.4" opacity="0.7" />
                {Array.from({ length: 8 }, (_, i) => {
                  const [x, y] = pol(44, i * 45 + 22)
                  return <circle key={i} cx={x} cy={y} r="0.7" fill="currentColor" opacity="0.8" />
                })}
              </g>

              <g data-spin="-210">
                <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="0.15" opacity="0.4" />
                {Array.from({ length: 60 }, (_, i) => {
                  const [x1, y1] = pol(41, i * 6)
                  const [x2, y2] = pol(i % 5 === 0 ? 39.4 : 40.2, i * 6)
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.14" opacity="0.55" />
                })}
              </g>

              <g data-spin="260">
                <circle cx="50" cy="50" r="31" stroke="currentColor" strokeWidth="0.15" strokeDasharray="1.2 3" opacity="0.45" />
                {Array.from({ length: 4 }, (_, i) => {
                  const [x, y] = pol(31, i * 90 + 45)
                  return (
                    <rect key={i} x={x - 1} y={y - 1} width="2" height="2" stroke="currentColor" strokeWidth="0.18" opacity="0.75" transform={`rotate(45 ${x} ${y})`} />
                  )
                })}
              </g>

              <g data-spin="-320">
                <circle cx="50" cy="50" r="27" stroke="currentColor" strokeWidth="0.12" strokeDasharray="0.4 3.2" opacity="0.5" />
              </g>

              {/* spokes out to each node */}
              {RING_ORDER.map((_, i) => {
                const [x, y] = pol(NODE_R - 4, i * 45)
                const [x2, y2] = pol(25, i * 45)
                return <line key={i} x1={x2} y1={y2} x2={x} y2={y} stroke="currentColor" strokeWidth="0.12" opacity="0.3" />
              })}
            </svg>
          </div>

          {/* the yantra, traced on scroll */}
          <div className="uv__core">
            <span className="uv__core-glow" aria-hidden="true" />
            <YantraCore />
          </div>

          {/* the eight */}
          {RING_ORDER.map((slug, i) => {
            const s = SERVICES.find((x) => x.slug === slug)
            const Icon = UNIVERSE_ICONS[slug]
            const [x, y] = pol(NODE_R, i * 45)
            const side = x > 55 ? 'r' : x < 45 ? 'l' : 'c'
            return (
              <Link
                key={slug}
                to={`/services/${slug}`}
                className={`uv__node uv__node--${side}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* the ring position, not the service's own number: the two
                    differ for the last pair, and the chart reads clockwise */}
                <span className="uv__node-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="uv__disc"><Icon /></span>
                <span className="uv__node-label">{s.short}</span>
                <span className="uv__tip">{BLURB[slug]}</span>
              </Link>
            )
          })}
        </div>

        {/* ================= right rail ================= */}
        <aside className="uv__right">
          <div className="uv__panel">
            <p className="uv__panel-h">Your cosmic profile</p>
            <span className="uv__panel-orn" aria-hidden="true"><Star width="9" height="9" /></span>
            <dl className="uv__profile">
              {PROFILE.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <Link className="uv__ghost" to="/book">
              View full report <ArrowUpRight width="13" height="13" />
            </Link>
          </div>

        </aside>
      </div>

      <div className="uv__foot">
        <MoonPhases />
        <Link className="uv__cta" to="/book">
          Book a consultation <ArrowUpRight width="15" height="15" />
        </Link>
      </div>
    </section>
  )
}

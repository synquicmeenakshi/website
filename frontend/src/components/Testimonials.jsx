import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { TESTIMONIALS, FEATURED_QUOTE } from '../data/testimonials.js'
import { ArrowRight, LockIcon, Star } from './Icons.jsx'
import { SectionIntro } from './Bits.jsx'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* Testimonials as an asterism — seven voices plotted on a star chart, with the
   line between them traced in as you scroll.

   The cards sit in an explicit twelve-column grid, NOT on hand-placed
   percentage coordinates. A percentage fixes a card's top-left corner and says
   nothing about how wide or tall it is, so as the viewport narrowed — the
   percentage gaps closing with it while `clamp()` held the cards near their
   minimum width — neighbours walked straight through each other. Grid tracks
   cannot overlap by construction.

   Three even columns per row, mirrored about the centre, so the spacing reads
   the same on the left and the right. The scatter that keeps it a chart rather
   than a table is `lift`, a top margin in a mirrored pattern: it grows the
   card's own row instead of reaching into anyone else's.

   The constellation is measured from the cards, not authored alongside them —
   a second hand-written set of coordinates would be the same fault in another
   form, two sources of truth free to drift apart. Each segment is then clipped
   to stop just clear of both cards it joins, so the line lives entirely in the
   open ground between them. That matters: drawn centre to centre it is almost
   entirely hidden behind opaque cards, and a draw-on you cannot see is not a
   draw-on. */

/* Three per row, evenly spaced and mirrored. `lift` alternates to scatter the
   rows; the pattern is symmetrical so neither side sits lower than the other. */
const PLACES = [
  { col: '1 / 5', row: 1, lift: 0 },
  { col: '5 / 9', row: 1, lift: 62 },
  { col: '9 / 13', row: 1, lift: 0 },
  { col: '4 / 10', row: 2, lift: 0, feature: true },
  { col: '1 / 5', row: 3, lift: 62 },
  { col: '5 / 9', row: 3, lift: 0 },
  { col: '9 / 13', row: 3, lift: 62 },
]

/* A serpentine: across the top, down through the bright one, back across the
   bottom. No segment doubles back over another. */
const ORDER = [0, 1, 2, 3, 6, 5, 4]

/* Hash-based pseudo-random in [0,1). Deterministic on purpose: the sky must be
   identical on every render and every reflow, so it can never be Math.random. */
const rnd = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

/* A quiet scatter of background stars. */
const DUST = Array.from({ length: 54 }, (_, i) => ({
  x: rnd(i) * 100,
  y: rnd(i + 54) * 100,
  r: 0.12 + rnd(i + 108) * 0.3,
}))

/* Which cards the chart joins, in the order the line travels them: across the
   top, down through the bright one, back across the bottom, then the two
   sides. Every pair here is a genuine neighbour — they share a column or a row
   — so each link is one straight run through the gap between them and no
   segment has to cross another to get where it is going.

   This is why the figure is authored rather than searched for. A path found by
   walking scattered points is only ever as tidy as the ordering rule, and none
   of them keeps every segment straight. */
const LINKS = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 5],
  [5, 4],
  [5, 6],
  [0, 4],
  [2, 6],
]

/* How far a connector stops short of the cards at each end. */
const PAD = 7

export default function Testimonials() {
  const root = useRef(null)
  const fieldRef = useRef(null)
  const [chart, setChart] = useState({ w: 0, h: 0, d: '', dots: [] })

  // the featured quote is the brightest star, at the centre of the asterism
  const voices = PLACES.map((p, i) =>
    p.feature ? { ...p, t: FEATURED_QUOTE } : { ...p, t: TESTIMONIALS[i > 3 ? i - 1 : i] },
  )

  /* Rebuild the chart from the cards' real boxes. Runs on mount and on every
     resize of the field, so the line follows the cards when they reflow. */
  const measure = useCallback(() => {
    const field = fieldRef.current
    if (!field) return
    const cards = field.querySelectorAll('.tst__node')
    if (cards.length < ORDER.length) return

    const fr = field.getBoundingClientRect()
    const boxes = [...cards].map((c) => {
      const r = c.getBoundingClientRect()
      return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height }
    })

    /* One straight run per link, along whichever axis the two cards share.
       Vertical neighbours overlap in x, so the line drops down the middle of
       that overlap; horizontal neighbours overlap in y and the line runs across
       it. Taking the centre of the shared span — rather than either card's own
       centre — is what keeps the run perfectly square to both ends. */
    const parts = []
    const dots = []

    for (const [i, j] of LINKS) {
      const a = boxes[i]
      const b = boxes[j]

      const xo = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const yo = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)

      let seg = null
      if (xo > 0 && yo <= 0) {
        // vertical: a above b, or the reverse
        const x = Math.max(a.x, b.x) + xo / 2
        const top = a.y < b.y ? a : b
        const bot = a.y < b.y ? b : a
        const y1 = top.y + top.h + PAD
        const y2 = bot.y - PAD
        if (y2 - y1 > 4) seg = [x, y1, x, y2]
      } else if (yo > 0 && xo <= 0) {
        // horizontal: a left of b, or the reverse
        const y = Math.max(a.y, b.y) + yo / 2
        const lft = a.x < b.x ? a : b
        const rgt = a.x < b.x ? b : a
        const x1 = lft.x + lft.w + PAD
        const x2 = rgt.x - PAD
        if (x2 - x1 > 4) seg = [x1, y, x2, y]
      }
      if (!seg) continue

      const [x1, y1, x2, y2] = seg.map((n) => Math.round(n))
      parts.push(`M${x1} ${y1}L${x2} ${y2}`)
      dots.push([x1, y1], [x2, y2])
    }

    if (!parts.length) return setChart({ w: 0, h: 0, d: '', dots: [] })

    setChart({
      w: Math.round(fr.width),
      h: Math.round(fr.height),
      d: parts.join(''),
      dots,
    })
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(fieldRef.current)
    return () => ro.disconnect()
  }, [measure])

  useGSAP(
    () => {
      if (!chart.d) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        const line = root.current.querySelector('.tst__line')
        if (!line) return
        const len = line.getTotalLength()

        /* One scrubbed timeline for the whole chart, rather than a scrubbed
           line plus a fire-once stagger for the joints. Those joints used
           `gsap.from` with the default toggleActions, so they played on the way
           down and then stayed lit for good — scroll back up and you were left
           with a field of dots and no line between them. On a shared timeline
           every part of the drawing runs off the same playhead, so it unwinds
           on the way back exactly as it wound on the way down.

           The window is roughly twice what it was. It still opens as the
           section clears the lower fifth — not while it is a sliver at the
           bottom edge — but it now closes well after, so the trace is spread
           over about a screen and a half of scrolling instead of half of one. */
        const dots = gsap.utils.toArray('.tst__vertex')

        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })

        const chartTl = gsap.timeline({
          scrollTrigger: {
            trigger: fieldRef.current,
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: 1,
          },
        })

        chartTl.to(line, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)

        // each joint lights as the line arrives at it, and goes out in reverse
        dots.forEach((d, i) => {
          chartTl.fromTo(
            d,
            { opacity: 0, scale: 0 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.07,
              ease: 'back.out(2)',
              transformOrigin: '50% 50%',
            },
            (i / dots.length) * 0.93,
          )
        })

        gsap.from('.tst__node', {
          opacity: 0,
          y: 18,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: fieldRef.current, start: 'top 84%' },
        })
      })

      mm.add('(max-width: 900px), (prefers-reduced-motion: reduce)', () => {
        gsap.set('.tst__node, .tst__vertex, .tst__line', { clearProps: 'all', opacity: 1 })
      })
    },
    { scope: root, dependencies: [chart], revertOnUpdate: true },
  )

  return (
    <section className="tst" id="testimonials" ref={root}>
      <div className="container">
        <SectionIntro
          eyebrow="Client experiences"
          deva="अनुभव"
          title={<>Real journeys, <em>real decisions</em></>}
          copy="Seven voices, shortened at their request. Nothing here is published without consent."
        />

        <div className="tst__field" ref={fieldRef}>
          <div className="tst__dust" aria-hidden="true">
            {DUST.map((d, i) => (
              <span key={i} style={{ left: `${d.x}%`, top: `${d.y}%`, '--r': `${d.r * 3.2}px` }} />
            ))}
          </div>

          {/* Sized in pixels from the measured field, so a circle stays a
              circle — no preserveAspectRatio stretch to correct for. */}
          {chart.d && (
            <svg
              className="tst__chart"
              viewBox={`0 0 ${chart.w} ${chart.h}`}
              width={chart.w}
              height={chart.h}
              aria-hidden="true"
            >
              <path
                className="tst__line"
                d={chart.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              {chart.dots.map(([x, y], i) => (
                <circle className="tst__vertex" key={i} cx={x} cy={y} r="3" />
              ))}
            </svg>
          )}

          {voices.map((v) => (
            <figure
              key={v.t.name}
              className={`tst__node${v.feature ? ' tst__node--bright' : ''}`}
              style={{ gridColumn: v.col, gridRow: v.row, marginTop: v.lift }}
            >
              <Star width="10" height="10" className="tst__node-mark" />
              <blockquote>{v.t.short}</blockquote>
              <figcaption>
                <span className="tst__name">{v.t.name}</span>
                <span className="tst__meta">{v.t.cat} · {v.t.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="tst__foot">
          <p className="tst__conf">
            <LockIcon width="15" height="15" />
            All personal details, reports and discussions are held in strict confidence.
          </p>
          <Link className="btn btn--outline" to="/book">
            Book a consultation <ArrowRight width="15" height="15" />
          </Link>
        </div>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowRight, Star } from './Icons.jsx'
import { ZodiacWheel } from './Jyotish.jsx'
import { PROOF } from '../data/site.js'

/* A bento of seven cells. The message panel is ivory and holds the promise;
   the six around it are the real destinations, each one a link, so the whole
   grid is navigable rather than decorative. */
export default function Hero() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
          .fromTo(
            '[data-hero="cell"]',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.08 },
            0,
          )
          .fromTo(
            '.hero-message__title .line > span',
            { yPercent: 108 },
            { yPercent: 0, duration: 1, stagger: 0.1, ease: 'power4.out' },
            0.3,
          )
          .fromTo(
            '[data-hero="rule"]',
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.6 },
            0.75,
          )
          .fromTo('[data-hero="copy"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, 0.85)
          .fromTo('[data-hero="cta"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, 0.97)
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-hero], .hero-message__title .line > span', {
          clearProps: 'all',
          opacity: 1,
        })
      })
    },
    { scope: root },
  )

  return (
    <section className="hero" ref={root} aria-label="Clarity, success and prosperity">
      {/* ---- 1 · the promise ---- */}
      <div className="hero-cell hero-cell--message" data-hero="cell">
        <span className="hero-message__eyebrow">
          <Star width="9" height="9" /> Occult Sciences · Spiritual Consulting
        </span>
        <h1 className="hero-message__title">
          <span className="line"><span>Your journey towards</span></span>
          <span className="line"><span className="t-accent">clarity, success</span></span>
          <span className="line"><span>&amp; prosperity</span></span>
        </h1>
        <span className="hero-message__rule" data-hero="rule" aria-hidden="true" />
        <p className="hero-message__copy" data-hero="copy">
          Every life has a unique blueprint. Through Astrology, Numerology, Vastu Shastra and the
          other sacred sciences, Meenakshi helps individuals and businesses align with purpose.
        </p>
        <div className="hero-message__cta" data-hero="cta">
          <Link className="btn btn--primary" to="/book">
            Book a private consultation <ArrowRight width="15" height="15" />
          </Link>
          <Link className="btn btn--quiet" to="/services">
            Explore services
          </Link>
        </div>
      </div>

      {/* ---- 2 · the practitioner ---- */}
      <Link className="hero-cell hero-cell--portrait" to="/about" data-hero="cell">
        <img
          src="/img/portrait-hero.png"
          alt="Meenakshi, Occult Sciences Expert and Spiritual Consultant"
        />
        <span className="hero-cell__scrim" aria-hidden="true" />
        <span className="hero-cell__label hero-cell__label--bottom">
          <i className="hero-cell__dash" aria-hidden="true" />
          <em>Meet</em>
          Meenakshi
          <span className="hero-cell__sub">
            Five years of practice, three hundred clients, four classical lineages.
          </span>
        </span>
      </Link>

      {/* ---- 3 · astrology, the way in for most visitors ---- */}
      <Link className="hero-cell hero-cell--astro" to="/services/astrology" data-hero="cell">
        <span className="hero-cell__art" aria-hidden="true"><ZodiacWheel /></span>
        <span className="hero-cell__label hero-cell__label--bottom">
          <em>Astrology</em>
          Read the chart
          <ArrowRight width="15" height="15" />
        </span>
      </Link>

      {/* ---- 4 · the other seven ---- */}
      <Link className="hero-cell hero-cell--services" to="/services" data-hero="cell">
        <img src="/img/in-hawamahal.jpg" alt="Hawa Mahal, Jaipur" loading="lazy" />
        <span className="hero-cell__scrim" aria-hidden="true" />
        <span className="hero-cell__label hero-cell__label--bottom">
          <em>Eight sacred sciences</em>
          All consultations
          <ArrowRight width="15" height="15" />
        </span>
      </Link>

      {/* ---- 5 · what actually happens ---- */}
      <Link className="hero-cell hero-cell--journey" to="/journey" data-hero="cell">
        <img src="/img/temple-arch.jpg" alt="A stone archway in a temple corridor" loading="lazy" />
        <span className="hero-cell__scrim" aria-hidden="true" />
        <span className="hero-cell__label hero-cell__label--bottom">
          <em>Your journey</em>
          Eight steps
          <ArrowRight width="15" height="15" />
        </span>
      </Link>

      {/* ---- 6 · the proof, as a solid cell rather than a photo ---- */}
      <div className="hero-cell hero-cell--proof" data-hero="cell">
        <ul>
          {PROOF.slice(0, 3).map((p) => (
            <li key={p.label}>
              <span className="hero-proof__value">{p.value}</span>
              <span className="hero-proof__label">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

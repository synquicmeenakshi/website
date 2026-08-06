import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { ServiceCard } from '../components/ServiceCards.jsx'
import { SectionIntro } from '../components/Bits.jsx'
import { SERVICES } from '../data/services.js'
import { ArrowRight } from '../components/Icons.jsx'

/* Nobody arrives knowing they need Swar Vigyan. Each route is the situation a
   visitor turns up with, pointed at the discipline that answers it. */
const ROUTES = [
  { q: 'I want the whole picture of where my life is going', a: 'Astrology', to: '/services/astrology' },
  { q: 'My name, or the number my business trades under, feels wrong', a: 'Numerology', to: '/services/numerology' },
  { q: 'The house or office I am in has never quite worked', a: 'Vastu Shastra', to: '/services/vastu-shastra' },
  { q: 'The same situation keeps coming back around', a: 'Karma Alignment', to: '/services/karma-alignment' },
]

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Consultations"
        deva="सेवाएँ"
        title={<>Eight sacred sciences, <em>one reading</em></>}
        lede="Each discipline answers a different kind of question. Most consultations draw on more than one, because a life rarely divides neatly along those lines."
        img="/img/in-hawamahal.jpg"
        alt=""
        tone="dark"
        meta={[
          ['8', 'Disciplines, read together where it helps'],
          ['60 min+', 'Every consultation, one to one'],
          ['4–5 days', 'Typical wait, spent preparing your chart'],
          ['15 days', 'Follow-up support afterwards'],
        ]}
        actions={
          <>
            <Link className="btn btn--invert" to="/book">
              Book a consultation <ArrowRight width="15" height="15" />
            </Link>
            <Link className="btn btn--ghost-invert" to="/contact">Ask which one fits</Link>
          </>
        }
      />

      <section className="services-index">
        <div className="container">
          {/* Eight cards on a six-track grid: the two most asked for take a
              double width, the other six run three up. Three equal columns left
              the last row two-thirds empty. */}
          <div className="svc-grid svc-grid--index" data-reveal-child>
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.slug} s={s} size={i < 2 ? 'lg' : 'md'} />
            ))}
          </div>
        </div>
      </section>

      <section className="services-note">
        <div className="container">
          <SectionIntro
            align="left"
            eyebrow="Choosing"
            title={<>Which consultation <em>do you actually need?</em></>}
            copy="Astrology maps the whole life and is where most people start. The others answer sharper questions: a name, a room, a decision this week, a pattern that keeps returning."
          />
          {/* Four ways in, phrased as the situation rather than the discipline —
              nobody arrives knowing they need Swar Vigyan. */}
          <ul className="routes" data-reveal-child>
            {ROUTES.map((r) => (
              <li key={r.to}>
                <Link to={r.to}>
                  <span className="routes__q">{r.q}</span>
                  <span className="routes__a">
                    {r.a} <ArrowRight width="14" height="14" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="services-note__cta" data-reveal>
            <Link className="btn btn--primary" to="/contact">
              Describe your situation <ArrowRight width="15" height="15" />
            </Link>
            <p>No payment is taken until the area is agreed.</p>
          </div>
        </div>
      </section>
    </>
  )
}

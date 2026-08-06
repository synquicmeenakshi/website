import { Link } from 'react-router-dom'
import { bySlug } from '../data/services.js'
import { ArrowRight } from './Icons.jsx'
import { Eyebrow } from './Bits.jsx'
import { ZodiacWheel } from './Jyotish.jsx'

const ASTRO = bySlug('astrology')

/* Astrology gets its own spread on the home page: it is what most visitors
   arrive for, and the fifteen consultations underneath it are the proof that
   "astrology" is a category rather than a single service.

   Six of those fifteen are named here, not all of them. The badge already
   states the count, printing the full list ran the right-hand column about
   240px past the wheel beside it, and the same list is the substance of
   /services/astrology — where the button goes. */
const SHOWN = 6
export default function FeaturedAstrology() {
  return (
    <section className="featured" id="astrology">
      <div className="container featured__grid">
        <div className="featured__media" data-reveal>
          <span className="featured__wheel" aria-hidden="true"><ZodiacWheel /></span>
          <span className="featured__badge">
            <span className="featured__badge-n">15</span>
            <span>consultations within astrology alone</span>
          </span>
        </div>

        <div className="featured__body">
          <div data-reveal>
            <Eyebrow deva="ज्योतिष">Featured discipline</Eyebrow>
            <h2 className="section-title">Your life, read from <em>the chart you were born under</em></h2>
          </div>
          <p className="featured__copy" data-reveal>{ASTRO.intro}</p>

          <div className="featured__questions" data-reveal>
            <p className="featured__q-head">People usually arrive asking</p>
            <ul>
              {ASTRO.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <ul className="featured__list" data-reveal-child>
            {ASTRO.items.slice(0, SHOWN).map((item, i) => (
              <li key={item}>
                <span className="featured__list-n">{String(i + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="featured__actions" data-reveal>
            <Link className="btn btn--primary" to="/services/astrology">
              All {ASTRO.items.length} consultations <ArrowRight width="15" height="15" />
            </Link>
            <Link className="btn btn--quiet" to="/book">Book a session</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { LINEAGES } from '../data/site.js'
import { ArrowRight } from './Icons.jsx'
import { Eyebrow } from './Bits.jsx'

/* Meet Meenakshi, on the home page — one screen, read top to bottom.

   The claim runs the full width of the container rather than sitting in the
   right-hand column, which is the only way it sets on a single line. Beneath
   it the portrait and the four lineages share one row, so the picture is as
   tall as the copy beside it instead of being cut to a fixed ratio.

   Two things that used to live here are gone. The second paragraph restated
   the lede, and the proof figures are already on this page twice — three of
   them in the hero, all four under the testimonials — so a third printing was
   two too many. Both still read in full on /about. */
export default function Practice() {
  return (
    <section className="practice" id="practice">
      <div className="container practice__inner">
        <header className="practice__head" data-reveal>
          <Eyebrow deva="परिचय">Meet Meenakshi</Eyebrow>
          <h2 className="section-title practice__title">
            Where ancient wisdom meets <em>modern success</em>
          </h2>
        </header>

        <div className="practice__grid">
          <figure className="practice__media" data-reveal data-parallax>
            <img
              src="/img/scene-astrology.png"
              alt="Meenakshi studying a hand-drawn birth chart by lamplight"
              loading="lazy"
            />
            <figcaption>
              <span className="practice__deva">यथा पिण्डे तथा ब्रह्माण्डे</span>
              <span>As within, so without</span>
            </figcaption>
          </figure>

          <div className="practice__body">
            <p className="practice__lede" data-reveal>
              A Spiritual Consultant and practitioner of the sacred occult sciences, helping
              individuals, entrepreneurs and businesses align their lives with clarity and
              prosperity.
            </p>

            <ul className="practice__lineages" data-reveal-child>
              {LINEAGES.map((l, i) => (
                <li className="lineage" key={l.name}>
                  <span className="lineage__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lineage__name">{l.name}</span>
                  <span className="lineage__note">{l.note}</span>
                </li>
              ))}
            </ul>

            <div className="practice__foot" data-reveal>
              <blockquote className="practice__quote">
                <p>Destiny reveals the path. Conscious alignment creates the outcome.</p>
              </blockquote>
              <Link className="btn btn--outline" to="/about">
                Read her full profile <ArrowRight width="15" height="15" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

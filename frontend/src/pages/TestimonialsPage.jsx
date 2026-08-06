import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import useSeo from '../hooks/useSeo.js'
import { TESTIMONIALS, FEATURED_QUOTE } from '../data/testimonials.js'
import { ArrowRight } from '../components/Icons.jsx'

/* The standalone testimonials route. The home page shows these as a
   constellation of short quotes; here they run in full, which is what someone
   comparing practitioners actually wants to read. */

export default function TestimonialsPage() {
  useSeo({
    title: 'Client experiences',
    description: 'What clients say about consultations in Vedic astrology, numerology and vastu with Meenakshi.',
    path: '/testimonials',
  })

  const all = FEATURED_QUOTE ? [FEATURED_QUOTE, ...TESTIMONIALS] : TESTIMONIALS

  return (
    <>
      <PageHero
        eyebrow="In their words"
        deva="अनुभव"
        title="What clients say"
        lede="Names are shortened at their request. Nothing here is published without consent, and nothing is edited beyond length."
        meta={[
          [String(all.length), 'Accounts, unedited'],
          ['300+', 'Individuals and businesses guided'],
        ]}
      />

      <section className="legal">
        <div className="container">
          <ul className="tlist">
            {all.map((t, i) => (
              <li key={`${t.name}-${i}`} className="tlist__item">
                <blockquote className="tlist__quote">{t.quote || t.short}</blockquote>
                <p className="tlist__by">
                  <span className="tlist__name">{t.name}</span>
                  {t.cat && <span className="tlist__cat">{t.cat}</span>}
                  {t.city && <span className="tlist__city">{t.city}</span>}
                </p>
                {t.service && <p className="tlist__svc">{t.service}</p>}
              </li>
            ))}
          </ul>

          <p className="article__cta">
            <Link className="btn btn--outline" to="/book">
              Book a consultation <ArrowRight width="16" height="16" />
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}

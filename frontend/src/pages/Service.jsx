import { Link, useParams, Navigate } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { ServiceCard } from '../components/ServiceCards.jsx'
import { SectionIntro } from '../components/Bits.jsx'
import { SERVICES, bySlug } from '../data/services.js'
import { JOURNEY } from '../data/journey.js'
import { ArrowRight, LockIcon } from '../components/Icons.jsx'
import { ZodiacWheel, NumberGrid, RuneCast, Yantra } from '../components/Jyotish.jsx'

const ART = { zodiac: ZodiacWheel, numbers: NumberGrid, runes: RuneCast, yantra: Yantra }

export default function Service() {
  const { slug } = useParams()
  const s = bySlug(slug)

  // An unknown slug goes to the index rather than rendering an empty shell.
  if (!s) return <Navigate to="/services" replace />

  // Four, not three: the related rail runs on the four-column .svc-grid, and
  // three cards left the last column of the row empty.
  const related = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 4)
  const Art = ART[s.art]

  return (
    <>
      <PageHero
        crumb={{ to: '/services', label: 'All services' }}
        eyebrow={`Consultation ${s.n}`}
        deva={s.deva}
        title={s.title}
        lede={s.lede}
        img={s.img}
        alt=""
        tone="dark"
        meta={[
          [String(s.items.length), 'Consultations within this discipline'],
          // Duration and fee come from the service record. A zero price reads as
          // "on enquiry" rather than "free".
          [s.price ? `₹${Number(s.price).toLocaleString('en-IN')}` : 'On enquiry', 'Consultation fee'],
          [`${s.duration || 60} min+`, 'One to one, online, English or Hindi'],
          ['15 days', 'Support after your session'],
        ]}
        actions={
          <>
            <Link className="btn btn--invert" to="/book">
              Book this consultation <ArrowRight width="15" height="15" />
            </Link>
            <Link className="btn btn--ghost-invert" to="/journey">How it works</Link>
          </>
        }
      />

      <section className="svc-detail">
        <div className="container svc-detail__grid">
          <div className="svc-detail__body">
            <p className="lede" data-reveal>{s.intro}</p>

            <div className="svc-detail__questions" data-reveal>
              <h2>People usually arrive asking</h2>
              <ul>
                {s.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="svc-detail__list" data-reveal>
              <h2>
                What this covers
                <span>{s.items.length} {s.items.length === 1 ? 'consultation' : 'consultations'}</span>
              </h2>
              <ul data-reveal-child>
                {s.items.map((item, i) => (
                  <li key={item}>
                    <span className="svc-detail__n">{String(i + 1).padStart(2, '0')}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="svc-detail__aside">
            {Art ? (
              <figure className="svc-detail__art" data-reveal aria-hidden="true">
                <Art />
              </figure>
            ) : (
              <figure className="svc-detail__media" data-reveal>
                <img src={s.scene} alt={s.sceneAlt} loading="lazy" />
              </figure>
            )}

            <div className="svc-detail__card" data-reveal>
              <h3>What every consultation includes</h3>
              <ul>
                <li><strong>60 minutes or more</strong> one to one, online</li>
                <li><strong>Prepared in advance</strong> your chart studied beforehand</li>
                <li><strong>A written report</strong> guidance and remedies, after the session</li>
                <li><strong>15 days of support</strong> for follow-up questions</li>
                <li><strong>English or Hindi</strong> whichever you prefer</li>
              </ul>
              <Link className="btn btn--primary btn--wide" to="/book">
                Book this consultation <ArrowRight width="15" height="15" />
              </Link>
              <p className="svc-detail__conf">
                <LockIcon width="14" height="14" />
                Completely confidential, always.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ---- how a booking runs, condensed ---- */}
      <section className="svc-steps">
        <div className="container">
          <SectionIntro
            eyebrow="What happens next"
            title={<>From booking to <em>follow-up</em></>}
          />
          <ol className="svc-steps__list" data-reveal-child>
            {JOURNEY.slice(0, 4).map((j) => (
              <li key={j.n}>
                <span>{j.n}</span>
                <h3>{j.title}</h3>
                <p>{j.body}</p>
              </li>
            ))}
          </ol>
          <div className="svc-steps__foot" data-reveal>
            <Link className="btn btn--outline" to="/journey">
              All eight steps <ArrowRight width="15" height="15" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- related ---- */}
      <section className="svc-related">
        <div className="container">
          <SectionIntro
            align="left"
            eyebrow="Also consider"
            title={<>Other <em>consultations</em></>}
          />
          <div className="svc-grid" data-reveal-child>
            {related.map((r) => (
              <ServiceCard key={r.slug} s={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

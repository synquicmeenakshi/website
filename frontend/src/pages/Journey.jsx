import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { SectionIntro, Eyebrow } from '../components/Bits.jsx'
import { JOURNEY, POLICY, INCLUDED } from '../data/journey.js'
import { ArrowRight } from '../components/Icons.jsx'

/* The eight steps grouped into the three phases a client actually experiences,
   so the anchors in the nav panel land somewhere meaningful. `blurb` gives the
   phase rail something to say — the middle phase is a single step, and a
   full-width row for one card was mostly empty page. */
const PHASES = [
  {
    id: 'before',
    label: 'Before the session',
    deva: 'पूर्व',
    range: [0, 4],
    blurb: 'Four steps, most of which happen without you. The wait between confirmation and appointment is the preparation itself.',
  },
  {
    id: 'session',
    label: 'The consultation',
    deva: 'परामर्श',
    range: [4, 5],
    blurb: 'One step, and the only one in the diary. Everything before it exists so this hour can be spent on your questions rather than on your chart.',
  },
  {
    id: 'after',
    label: 'Afterwards',
    deva: 'पश्चात्',
    range: [5, 8],
    blurb: 'Three steps after the call ends. A consultation you cannot return to is half a consultation.',
  },
]

export default function Journey() {
  return (
    <>
      <PageHero
        eyebrow="Your consultation journey"
        deva="यात्रा"
        title={<>Eight steps, <em>booking to follow-up</em></>}
        lede="Every consultation is prepared before you arrive. This is what that preparation is, why the four to five day wait exists, and what you leave with."
        img="/img/temple-arch.jpg"
        alt=""
        tone="dark"
        meta={[
          ['8', 'Steps, booking to follow-up'],
          ['4–5 days', 'Between confirmation and appointment'],
          ['60 min+', 'The consultation itself'],
          ['15 days', 'Support once it has ended'],
        ]}
        actions={
          <Link className="btn btn--invert" to="/book">
            Start at step one <ArrowRight width="15" height="15" />
          </Link>
        }
      />

      {/* Each phase is a rail and a column of steps rather than full-width
          rows: the middle phase is a single step, and a full-bleed card for one
          step was almost entirely empty page. */}
      {PHASES.map((phase) => {
        const steps = JOURNEY.slice(...phase.range)
        return (
          <section className="jphase" id={phase.id} key={phase.id}>
            <div className="container jphase__grid">
              <header className="jphase__head" data-reveal>
                <Eyebrow deva={phase.deva}>{phase.label}</Eyebrow>
                <h2 className="section-title">
                  Step {steps[0].n}
                  {steps.length > 1 && <> &ndash; {steps[steps.length - 1].n}</>}
                </h2>
                <p className="jphase__blurb">{phase.blurb}</p>
                <p className="jphase__count">
                  {steps.length} of 8 {steps.length === 1 ? 'step' : 'steps'}
                </p>
              </header>

              <ol className="jphase__list" data-reveal-child>
                {steps.map((s) => (
                  <li key={s.n}>
                    <span className="jphase__n">{s.n}</span>
                    <div className="jphase__body">
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                      <span className="jphase__aside">{s.aside}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )
      })}

      {/* ---- what is included ---- */}
      <section className="included">
        <div className="container">
          <SectionIntro
            eyebrow="Included in every booking"
            title={<>What you are <em>actually paying for</em></>}
          />
          <ul className="included__grid" data-reveal-child>
            {INCLUDED.map(([k, v], i) => (
              <li key={k}>
                <span className="included__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="included__k">{k}</span>
                <span className="included__v">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- policy ---- */}
      <section className="policy" id="policy">
        <div className="container">
          <SectionIntro
            align="left"
            eyebrow="Booking & cancellation"
            title={<>The terms, <em>in plain words</em></>}
            copy="Preparation begins before your appointment, which is what most of this policy reflects."
          />
          <dl className="policy__list" data-reveal-child>
            {POLICY.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="policy__foot" data-reveal>
            <Link className="btn btn--outline" to="/legal/refund-policy">
              Full refund policy <ArrowRight width="15" height="15" />
            </Link>
            <Link className="btn btn--primary" to="/book">
              Book a consultation <ArrowRight width="15" height="15" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

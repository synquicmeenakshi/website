import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { SectionIntro, Eyebrow } from '../components/Bits.jsx'
import { LINEAGES, PROOF, WHY, ETHICS, BRAND, ASSURANCES } from '../data/site.js'
import { SERVICES } from '../data/services.js'
import { ArrowRight, StarRule } from '../components/Icons.jsx'
import { Yantra } from '../components/Jyotish.jsx'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Meet Meenakshi"
        deva="परिचय"
        title={<>Where ancient wisdom meets <em>modern success</em></>}
        lede="A Spiritual Consultant and practitioner of the sacred occult sciences, helping individuals, entrepreneurs and businesses align their lives with clarity, success and prosperity."
        meta={[
          ['5+', 'Years of professional practice'],
          ['300+', 'Individuals and businesses guided'],
          ['4', 'Classical lineages read together'],
          ['8', 'Disciplines practised'],
        ]}
        actions={
          <>
            <Link className="btn btn--primary" to="/book">
              Book a consultation <ArrowRight width="15" height="15" />
            </Link>
            <Link className="btn btn--quiet" to="/services">See all services</Link>
          </>
        }
      />

      {/* ---- portrait and the claim ---- */}
      <section className="about-lead">
        <div className="container about-lead__grid">
          <div className="about-lead__aside">
            <figure className="about-lead__media" data-reveal data-parallax>
              <img src="/img/portrait-hero.png" alt="Meenakshi, Occult Sciences Expert" loading="lazy" />
            </figure>
            {/* The three titles she actually practises under, which the masthead
                names once and nothing else on the page repeats. */}
            <ul className="about-lead__roles" data-reveal>
              {BRAND.roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="about-lead__body">
            <p className="lede" data-reveal>
              With over five years of professional practice and the trust of three hundred clients,
              Meenakshi is recognised for intuitive insight, precise analysis and a holistic
              approach to destiny alignment.
            </p>
            <p data-reveal>
              Her consultations extend beyond prediction. They offer practical guidance, strategic
              direction and simple, personalised remedies tailored to each client&rsquo;s journey —
              whether the question concerns career, business, wealth, relationships or personal
              growth.
            </p>
            <p data-reveal>
              Guidance is given in English and Hindi, online, to clients anywhere in the world.
            </p>

            <ul className="about-lead__assur" data-reveal>
              {ASSURANCES.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>

            <ul className="about-lead__proof" data-reveal-child>
              {PROOF.map((p) => (
                <li key={p.label}>
                  <span>{p.value}</span>
                  <span>{p.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- philosophy ---- */}
      <section className="philosophy" id="philosophy">
        <div className="philosophy__mark" aria-hidden="true">
          <Yantra />
        </div>
        <div className="container philosophy__inner" data-reveal>
          <StarRule width={160} />
          <blockquote>
            True guidance does not merely predict the future. It empowers you to shape it.
          </blockquote>
          <p>
            Destiny reveals the path, but conscious alignment creates extraordinary outcomes. That
            is the whole of the philosophy, and the reason every session ends with something you can
            actually do.
          </p>
          <ul className="philosophy__pillars">
            {[
              ['Read', 'The chart, the numbers, the space — whichever the question needs.'],
              ['Explain', 'In plain words, with the reasoning shown rather than asserted.'],
              ['Act', 'One or two things to do, sized to the life you actually have.'],
            ].map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- lineages ---- */}
      <section className="lineages" id="lineages">
        <div className="container">
          <SectionIntro
            eyebrow="The lineages"
            deva="परम्परा"
            title={<>Four classical systems, <em>read together</em></>}
            copy="Each answers a different part of the same question. Used together they cross-check one another, which is what keeps a reading honest."
          />
          <div className="lineage-grid" data-reveal-child>
            {LINEAGES.map((l) => (
              <article className="lineage-card" key={l.name}>
                <header className="lineage-card__top">
                  <span className="lineage-card__n">{l.n}</span>
                  <span className="lineage-card__deva">{l.deva}</span>
                </header>
                <h3>{l.name}</h3>
                <p className="lineage-card__note">{l.note}</p>
                <p className="lineage-card__answers">{l.answers}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- expertise ---- */}
      <section className="expertise">
        <div className="container">
          <SectionIntro
            align="left"
            eyebrow="Areas of expertise"
            deva="विशेषज्ञता"
            title={<>Eight disciplines, <em>one practice</em></>}
          />
          <ul className="expertise__list" data-reveal-child>
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`}>
                  <span className="expertise__n">{s.n}</span>
                  <span className="expertise__title">{s.title}</span>
                  <span className="expertise__lede">{s.lede}</span>
                  <ArrowRight width="15" height="15" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- the seven commitments ---- */}
      <section className="commitments" id="why">
        <div className="container">
          <SectionIntro
            eyebrow="Why clients choose her"
            deva="विश्वास"
            title={<>Seven commitments, <em>held to every time</em></>}
          />
          <ol className="commitments__list" data-reveal-child>
            {WHY.map((w) => (
              <li key={w.n}>
                <span className="commitments__n">{w.n}</span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- ethics ---- */}
      <section className="ethics" id="ethics">
        <div className="container">
          <SectionIntro
            eyebrow="Code of ethics"
            deva="आचार"
            title={<>How this practice <em>conducts itself</em></>}
            copy="The commitments made to every client, in full, and published rather than implied."
          />
          <div className="ethics__grid" data-reveal-child>
            {ETHICS.map(([title, body], i) => (
              <article key={title}>
                <span className="ethics__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className="ethics__foot" data-reveal>
            <Link className="btn btn--outline" to="/legal/code-of-ethics">
              Read the full code <ArrowRight width="15" height="15" />
            </Link>
          </div>
        </div>
      </section>

      <section className="about-contact">
        <div className="container">
          <div className="about-contact__panel" data-reveal>
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="section-title">Write before you book, if it helps</h2>
            <p>
              Describe the situation and we will point you to the consultation that fits, or tell
              you that you do not need one.
            </p>
          </div>
          <div className="about-contact__links">
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <a href={BRAND.phoneHref}>{BRAND.phone}</a>
            <Link className="btn btn--primary" to="/book">
              Book a consultation <ArrowRight width="15" height="15" />
            </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

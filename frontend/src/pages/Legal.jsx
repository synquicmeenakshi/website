import { Link, useParams, Navigate } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { LEGAL, LEGAL_LINKS } from '../data/legal.js'
import { BRAND } from '../data/site.js'
import { ArrowRight, LockIcon, StarRule } from '../components/Icons.jsx'

/* All five policies render through this one template. Legal text is kept in a
   narrow measure and away from marketing sections, which is the whole point of
   giving them their own route. */
export default function Legal() {
  const { slug } = useParams()
  const page = LEGAL[slug]

  if (!page) return <Navigate to="/legal/privacy-policy" replace />

  return (
    <>
      <PageHero
        eyebrow="Policies"
        title={page.title}
        lede={page.lede}
        meta={[
          [String(page.sections.length), 'Sections, and none of them long'],
          ['Plain', 'Written to be read, not to be survived'],
        ]}
      />

      <section className="legal">
        <div className="container legal__grid">
          <nav className="legal__nav" aria-label="Policies">
            <p className="legal__nav-h">Policies</p>
            <ul>
              {LEGAL_LINKS.map((l) => (
                <li key={l.slug}>
                  <Link to={l.to} aria-current={l.slug === slug ? 'page' : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <article className="legal__body">
            <p className="legal__updated">{page.updated}</p>
            {page.sections.map(([heading, body], i) => (
              <section key={heading} data-reveal>
                <span className="legal__n">{String(i + 1).padStart(2, '0')}</span>
                <h2>{heading}</h2>
                <p>{body}</p>
              </section>
            ))}

            <div className="legal__foot">
              <p>
                Questions about any of this can be sent before you book, and will be answered
                plainly.
              </p>
              <Link className="btn btn--outline" to="/contact">
                Contact <ArrowRight width="15" height="15" />
              </Link>
            </div>
          </article>

          {/* The measure on legal text is ~74ch, which left the right third of
              the rail blank on every desktop. It carries the two things people
              actually want while reading a policy: a way to ask, and the
              assurance the policy is describing. */}
          <aside className="legal__aside">
            <div className="legal__card">
              <StarRule width={110} />
              <h2>Ask before you book</h2>
              <p>
                If any part of this affects your decision, write first. Questions are answered
                plainly, and nothing is charged for asking.
              </p>
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              <a href={BRAND.phoneHref}>{BRAND.phone}</a>
              <Link className="btn btn--primary btn--wide" to="/book">
                Book a consultation <ArrowRight width="15" height="15" />
              </Link>
            </div>
            <p className="legal__conf">
              <LockIcon width="14" height="14" />
              Everything shared before, during and after a consultation stays confidential.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}

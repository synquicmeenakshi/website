import { useState } from 'react'
import { Link } from 'react-router-dom'
import Accordion from './Accordion.jsx'
import { SectionIntro } from './Bits.jsx'
import { FAQ_GROUPS } from '../data/faq.js'
import { BRAND } from '../data/site.js'
import { ArrowRight } from './Icons.jsx'

/* The full FAQ, on the home page. Four groups is more than fits comfortably in
   one column, so the group acts as a filter rather than a heading — the whole
   list is present, but only one group is open at a time. */
export default function FaqSection() {
  const [group, setGroup] = useState(0)

  return (
    <section className="faq" id="faq">
      <div className="container">
        <SectionIntro
          eyebrow="Frequently asked"
          deva="प्रश्न"
          title={<>Questions, <em>answered plainly</em></>}
          copy="Booking, the session itself, and everything afterwards."
        />

        <div className="faq__grid">
          <div className="faq__side" data-reveal>
            <div className="faq__tabs" role="tablist" aria-label="Question groups">
              {FAQ_GROUPS.map((g, i) => (
                <button
                  key={g.group}
                  role="tab"
                  type="button"
                  id={`faqtab-${i}`}
                  aria-selected={group === i}
                  aria-controls={`faqpanel-${i}`}
                  className={`faq__tab${group === i ? ' is-on' : ''}`}
                  onClick={() => setGroup(i)}
                >
                  <span>{g.group}</span>
                  <span className="faq__tab-n">{g.items.length}</span>
                </button>
              ))}
            </div>

            <p className="faq__aside">
              If your question is not here, write before you book. We would rather answer it first.
            </p>
            <a className="textlink" href={`mailto:${BRAND.email}`}>
              <span>{BRAND.email}</span>
              <ArrowRight width="15" height="15" />
            </a>
          </div>

          <div
            className="faq__panel"
            role="tabpanel"
            id={`faqpanel-${group}`}
            aria-labelledby={`faqtab-${group}`}
          >
            {/* keyed on the group so the open/closed state resets when it changes */}
            <Accordion key={group} items={FAQ_GROUPS[group].items} numbered />
          </div>
        </div>

        <div className="faq__foot" data-reveal>
          <p>Ready when you are.</p>
          <Link className="btn btn--primary" to="/book">
            Book a consultation <ArrowRight width="15" height="15" />
          </Link>
        </div>
      </div>
    </section>
  )
}

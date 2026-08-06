import { Link } from 'react-router-dom'
import { BRAND, ASSURANCES } from '../data/site.js'
import { SERVICES } from '../data/services.js'
import { LEGAL_LINKS } from '../data/legal.js'
import {
  ArrowRight,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
  InstagramIcon,
  Monogram,
  StarRule,
} from './Icons.jsx'
import { ZodiacWheel } from './Jyotish.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* ---- closing call to action ---- */}
      <section className="footcta" data-reveal>
        <div className="container footcta__inner">
          <p className="footcta__deva">शुभारम्भ</p>
          <h2 className="footcta__title">
            Take the first step
            <br />
            towards <em>positive change</em>
          </h2>
          <StarRule width={180} className="footcta__rule" />
          <p className="footcta__copy">
            Every journey begins with a decision. Together, let us explore the path to greater
            balance, clarity and prosperity.
          </p>
          <div className="footcta__actions">
            <Link className="btn btn--invert" to="/book">
              Schedule your consultation <ArrowRight width="16" height="16" />
            </Link>
            <a className="btn btn--ghost-invert" href={BRAND.whatsapp}>
              <WhatsAppIcon width="16" height="16" /> Message on WhatsApp
            </a>
          </div>
          <ul className="footcta__pills">
            {ASSURANCES.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- directory ---- */}
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to="/" aria-label={`${BRAND.name}, home`}>
            <Monogram size={44} />
            <span className="footer__name">{BRAND.name}</span>
          </Link>
          <p className="footer__roles">{BRAND.roles.join(' · ')}</p>
          <ul className="footer__social">
            <li>
              <a href={`mailto:${BRAND.email}`} aria-label="Email">
                <MailIcon /> <span>{BRAND.email}</span>
              </a>
            </li>
            <li>
              <a href={BRAND.phoneHref} aria-label="Telephone">
                <PhoneIcon /> <span>{BRAND.phone}</span>
              </a>
            </li>
            <li>
              <a href={BRAND.whatsapp} aria-label="WhatsApp">
                <WhatsAppIcon /> <span>WhatsApp</span>
              </a>
            </li>
            <li>
              <a href={BRAND.instagram} aria-label="Instagram">
                <InstagramIcon /> <span>Instagram</span>
              </a>
            </li>
          </ul>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <div>
            <p className="footer__h">Consultations</p>
            <ul>
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`}>{s.short}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer__h">Explore</p>
            <ul>
              <li><Link to="/about">Meet Meenakshi</Link></li>
              <li><Link to="/journey">Your consultation journey</Link></li>
              <li><Link to="/testimonials">Client experiences</Link></li>
              <li><Link to="/blog">Journal</Link></li>
              <li><Link to="/#faq">Frequently asked questions</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/book">Book a consultation</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer__h">Policies</p>
            <ul>
              {LEGAL_LINKS.map((l) => (
                <li key={l.slug}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="container">
        <p className="footer__disclaimer">
          <strong>Disclaimer.</strong> Consultations are based on the principles of Vedic Astrology,
          Numerology, Vastu Shastra and other traditional metaphysical sciences, together with
          Meenakshi&rsquo;s professional study and experience. Guidance is advisory in nature. No
          prediction, remedy or recommendation is a guarantee of any specific outcome. Please seek
          qualified professional advice for medical, legal, financial or psychological matters.
        </p>
        <div className="footer__base">
          <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
          <span className="footer__deva">सत्यं शिवं सुन्दरम्</span>
        </div>
      </div>

      {/* The rashi chakra, faded into the corner. Linework only, no ground of
          its own, and cropped by the footer's edge so it reads as a watermark
          rather than as a placed illustration. */}
      <span className="footer__chakra" aria-hidden="true">
        <ZodiacWheel />
      </span>
    </footer>
  )
}

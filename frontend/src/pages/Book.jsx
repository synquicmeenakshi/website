import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../data/site.js'
import { CONSULT_AREAS } from '../data/services.js'
import {
  PinIcon, CalendarIcon, ClockIcon, CalendarClock,
  LotusIcon, ShieldCheck, YantraMark, YantraBadge,
  LockSmall, ArrowUpRight,
  RazorpayMark, CalendarMark, WhatsAppMark, MailMark, SupportMark,
} from '../components/BookIcons.jsx'

/* Booking, laid out as a single spread that fits one screen: the wheel and the
   promise on the left, everything actionable on the right, and nothing below
   the fold to scroll to. The site footer is suppressed here for the same
   reason — see the `body:has(.bk)` rules. */

const PROMISES = [
  { Icon: LotusIcon, title: 'Trusted Guidance', sub: 'Ancient wisdom' },
  { Icon: ShieldCheck, title: '100% Confidential', sub: 'Private & secure' },
  { Icon: YantraMark, title: 'Holistic Approach', sub: 'Mind, Life & Destiny' },
]

const INTEGRATIONS = [
  { label: 'Secure Payments', Mark: RazorpayMark, name: 'Razorpay', note: '100% Secure' },
  { label: 'Smart Scheduling', Mark: CalendarMark, name: 'Calendar', note: 'Auto-scheduled' },
  { label: 'WhatsApp Confirm.', Mark: WhatsAppMark, name: 'Instant', note: 'Confirmation' },
  { label: 'Email Confirm.', Mark: MailMark, name: 'Detailed', note: 'Confirmation' },
  { label: 'Post Support', Mark: SupportMark, name: '15-Day', note: 'Assistance' },
]

const LANGUAGES = ['English', 'Hindi', 'English & Hindi']

function Field({ id, label, required, children, error, hint, className = '' }) {
  return (
    <div className={`bk-field ${className}${error ? ' is-err' : ''}`}>
      <label htmlFor={id}>
        {label} {required && <span className="bk-req" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="bk-hint" id={`h-${id}`}>{hint}</p>}
      {error && <p className="bk-err" id={`e-${id}`}>{error}</p>}
    </div>
  )
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function Book() {
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function onSubmit(ev) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const e = {}
    const need = {
      name: 'Name', dob: 'Date of birth', tob: 'Time of birth', pob: 'Place of birth',
    }
    Object.entries(need).forEach(([k, label]) => {
      if (!String(fd.get(k) || '').trim()) e[k] = `${label} is required.`
    })
    if (!fd.get('area')) e.area = 'Please choose a consultation area.'

    const contact = String(fd.get('contact') || '').trim()
    if (!contact) e.contact = 'A WhatsApp number or email is required.'
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) &&
      !/^[\d\s+\-()]{7,}$/.test(contact)
    ) {
      e.contact = 'Enter a valid phone number or email address.'
    }

    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus()
      return
    }

    // The dialling code is a separate control, so prefix it for phone numbers.
    // An email address is sent as typed.
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)
    const fullContact = isEmail ? contact : `${fd.get('dial') || ''} ${contact}`.trim()

    setBusy(true)
    setFailed(false)
    try {
      const res = await fetch(`${API_BASE}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          contact: fullContact,
          dob: fd.get('dob'),
          tob: fd.get('tob'),
          pob: fd.get('pob'),
          area: fd.get('area'),
          language: fd.get('language') || 'English',
          preferred: fd.get('preferred'),
          // No `consent` is sent: this form has no consent control, so there is
          // nothing to record. It defaults to false server-side rather than
          // storing agreement the visitor never gave. Add a checkbox to the
          // form and pass its value here if explicit consent is required.
        }),
      })

      // Check the payload, not just the status: a 200 from something that is
      // not this API (a dev-server fallback, a proxy error page) must not read
      // as success, or the request is lost exactly as it used to be.
      const body = await res.json().catch(() => null)
      if (!res.ok || !body || body.success !== true) {
        throw new Error(body?.message || `HTTP ${res.status}`)
      }

      setSent(true)
    } catch (err) {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bk">
      {/* ================= left: the wheel and the promise ================= */}
      <aside className="bk__left">
        <div className="bk__left-inner">
          <figure className="bk__wheel">
            <img src="/img/zodiac-sun.png" alt="" aria-hidden="true" />
          </figure>

          <h1 className="bk__headline">
            Sacred Guidance.
            <br />
            <em>Personalized</em> for Your Journey.
          </h1>

          <p className="bk__copy">
            Connect with <b>{BRAND.name}</b> for a one-on-one consultation rooted in Vedic wisdom.
            Receive clarity, direction, and empowered solutions tailored to your unique birth chart.
          </p>

          <ul className="bk__promises">
            {PROMISES.map(({ Icon, title, sub }) => (
              <li key={title}>
                <span className="bk__promise-ico"><Icon /></span>
                <span className="bk__promise-text">
                  <b>{title}</b>
                  <span>{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ================= right: everything actionable ================= */}
      <div className="bk__right">
        <div className="bk__right-inner">
          <header className="bk__masthead">
            <Link className="bk__brand" to="/" aria-label={`${BRAND.name}, home`}>
              <YantraMark width="42" height="42" />
              <span>
                <span className="bk__brand-name">{BRAND.name}</span>
                <span className="bk__brand-tag">{BRAND.tag}</span>
              </span>
            </Link>

            <div className="bk__masthead-right">
              <span>
                <b>Book a Private Consultation</b>
                <span>We&rsquo;ll help you find clarity and direction.</span>
              </span>
              <YantraBadge />
            </div>
          </header>

          {/* ---- the form ---- */}
          <section className="bk__card">
            {sent ? (
              <div className="bk__done" role="status">
                <p className="bk__done-deva">धन्यवाद</p>
                <h2>Request received</h2>
                <p>
                  We will confirm your appointment and send a secure payment link by WhatsApp and
                  email within 24 hours. Your details are held in strict confidence.
                </p>
                <a className="bk__submit" href={BRAND.whatsapp}>
                  Message us on WhatsApp <ArrowUpRight />
                </a>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="bk__row bk__row--3">
                  <Field id="name" label="Name" required error={errors.name}>
                    <input id="name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" />
                  </Field>
                  <Field id="dob" label="Date of Birth" required error={errors.dob}>
                    <span className="bk-input-wrap">
                      <input id="dob" name="dob" type="date" />
                      <CalendarIcon className="bk-input-ico" />
                    </span>
                  </Field>
                  <Field id="tob" label="Time of Birth" required error={errors.tob}>
                    <span className="bk-input-wrap">
                      <input id="tob" name="tob" type="time" />
                      <ClockIcon className="bk-input-ico" />
                    </span>
                  </Field>
                </div>

                <div className="bk__row">
                  <Field id="pob" label="Place of Birth" required error={errors.pob}>
                    <span className="bk-input-wrap">
                      <input id="pob" name="pob" type="text" placeholder="City, State, Country" />
                      <PinIcon className="bk-input-ico" />
                    </span>
                  </Field>
                </div>

                <div className="bk__row bk__row--2">
                  <Field id="area" label="Consultation Area" required error={errors.area}>
                    <select id="area" name="area" defaultValue="">
                      <option value="" disabled>Select consultation area</option>
                      {CONSULT_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </Field>
                  <Field id="language" label="Preferred Language">
                    <select id="language" name="language" defaultValue="">
                      <option value="" disabled>Select preferred language</option>
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="bk__row bk__row--2">
                  <Field id="preferred" label="Preferred Date">
                    <span className="bk-input-wrap">
                      <input id="preferred" name="preferred" type="date" />
                      <CalendarIcon className="bk-input-ico" />
                    </span>
                  </Field>
                  <Field id="contact" label="Contact Details" required error={errors.contact}>
                    <span className="bk-phone">
                      <select name="dial" aria-label="Country dialling code" defaultValue="+91">
                        <option>+91</option><option>+1</option><option>+44</option>
                        <option>+61</option><option>+971</option>
                      </select>
                      <input id="contact" name="contact" type="text" placeholder="Enter WhatsApp number or Email" />
                    </span>
                  </Field>
                </div>

                <div className="bk__row bk__row--submit">
                  <p className="bk__notice">
                    <span className="bk__notice-ico"><CalendarClock /></span>
                    <span>
                      We&rsquo;ll confirm your appointment within
                      <b>24 hours</b>
                      <span>You&rsquo;ll receive confirmation via WhatsApp or Email.</span>
                    </span>
                  </p>

                  <div className="bk__submit-col">
                    <button className="bk__submit" type="submit" disabled={busy} aria-busy={busy}>
                      Book Consultation <ArrowUpRight />
                    </button>
                    {failed && (
                      <p className="bk-err" role="alert">
                        That did not go through. Please try again, or message us on WhatsApp at {BRAND.phone}.
                      </p>
                    )}
                    <p className="bk__safe"><LockSmall /> Your information is safe and secure.</p>
                  </div>
                </div>
              </form>
            )}
          </section>

          {/* ---- what the booking is wired to ---- */}
          <ul className="bk__integrations">
            {INTEGRATIONS.map(({ label, Mark, name, note }) => (
              <li key={label}>
                <span className="bk__int-label">{label}</span>
                <span className="bk__int-name"><Mark /> {name}</span>
                <span className="bk__int-note">{note}</span>
              </li>
            ))}
          </ul>

          {/* One line where the FAQ block used to be. Its four questions —
              how the process works, what details are needed, how the session
              arrives, whether it stays confidential — are all answered in the
              home page's FAQ, and at 255px it was the single biggest reason
              this spread ran past one screen. */}
          <p className="bk__ask">
            Any questions before you book?{' '}
            <a href={`mailto:${BRAND.email}`}>
              Write to us <ArrowUpRight />
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

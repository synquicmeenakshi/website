import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import { BRAND } from '../data/site.js'
import { ArrowRight, LockIcon, WhatsAppIcon } from '../components/Icons.jsx'

/* The enquiry route. Distinct from /book: this is for the visitor who has a
   question first, and does not yet know which consultation they need. It asks
   for nothing they would have to look up — no birth details, no slot. */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const SUBJECTS = [
  'Which consultation do I need?',
  'A question about booking',
  'Fees and payment',
  'Rescheduling an appointment',
  'Something else',
]

function Field({ id, label, required, children, error, hint }) {
  return (
    <div className={`bk-field${error ? ' is-err' : ''}`}>
      <label htmlFor={id}>
        {label} {required && <span className="bk-req" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="bk-hint">{hint}</p>}
      {error && <p className="bk-err" id={`e-${id}`}>{error}</p>}
    </div>
  )
}

export default function Contact() {
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState('')

  async function onSubmit(ev) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const e = {}

    if (!String(fd.get('name') || '').trim()) e.name = 'Name is required.'
    if (!String(fd.get('message') || '').trim()) e.message = 'Please write your question.'

    const email = String(fd.get('email') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    // The backend requires one of the two; say so here rather than after a round trip.
    if (!email && !phone) e.email = 'An email address or phone number is required.'
    else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Enter a valid email address.'

    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus()
      return
    }

    setBusy(true)
    setFailed('')
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email,
          phone,
          subject: fd.get('subject') || '',
          message: fd.get('message'),
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body || body.success !== true) {
        throw new Error(body?.message || `HTTP ${res.status}`)
      }
      setSent(true)
    } catch (err) {
      setFailed('That did not go through. Please try again, or write to us directly.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        deva="संपर्क"
        title="Ask before you book"
        lede="If you are unsure which consultation fits, write first. You will get a straight answer — including if the answer is that you do not need a session at all."
        meta={[
          ['1 day', 'Typical reply time'],
          ['English & Hindi', 'Either is fine'],
        ]}
      />

      <section className="legal">
        <div className="container legal__grid">
          <nav className="legal__nav" aria-label="Direct contact">
            <p className="legal__nav-h">Reach us directly</p>
            <ul>
              <li><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
              <li><a href={BRAND.phoneHref}>{BRAND.phone}</a></li>
              <li><a href={BRAND.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></li>
            </ul>
            <p className="legal__nav-note">
              Consultations are by appointment only, online, worldwide.
            </p>
          </nav>

          <div className="legal__body">
            {sent ? (
              <div className="bk__done" role="status">
                <p className="bk__done-deva">धन्यवाद</p>
                <h2>Message received</h2>
                <p>
                  Thank you. We read every message ourselves and will reply within one working day,
                  to whichever contact you gave us.
                </p>
                <a className="btn btn--outline" href={BRAND.whatsapp} target="_blank" rel="noreferrer">
                  <WhatsAppIcon width="16" height="16" /> Message us on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="bk__card">
                <div className="bk__row">
                  <Field id="name" label="Your name" required error={errors.name}>
                    <input id="name" name="name" type="text" autoComplete="name" placeholder="Enter your full name" />
                  </Field>
                </div>

                <div className="bk__row bk__row--2">
                  <Field id="email" label="Email" error={errors.email} hint="Either an email or a phone number.">
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                  </Field>
                  <Field id="phone" label="WhatsApp / phone">
                    <input id="phone" name="phone" type="text" autoComplete="tel" placeholder="+91…" />
                  </Field>
                </div>

                <div className="bk__row">
                  <Field id="subject" label="What is this about?">
                    <select id="subject" name="subject" defaultValue="">
                      <option value="">Select a subject</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="bk__row">
                  <Field id="message" label="Your question" required error={errors.message}>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      placeholder="Tell us what you are seeking guidance on, and we will point you to the right consultation."
                    />
                  </Field>
                </div>

                <div className="bk__row bk__row--submit">
                  <p className="bk__notice">
                    <span className="bk__notice-ico"><LockIcon width="16" height="16" /></span>
                    <span>
                      Your message stays private
                      <span>Never sold, never shared, never published.</span>
                    </span>
                  </p>

                  <div className="bk__submit-col">
                    <button className="bk__submit" type="submit" disabled={busy} aria-busy={busy}>
                      Send message <ArrowRight width="16" height="16" />
                    </button>
                    {failed && (
                      <p className="bk-err" role="alert">{failed} {BRAND.email}</p>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

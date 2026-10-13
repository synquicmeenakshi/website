import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../data/site.js'
import { SERVICES } from '../data/services.js'
import {
  PinIcon, CalendarIcon, ClockIcon, CalendarClock,
  LotusIcon, ShieldCheck, YantraMark, YantraBadge,
  LockSmall, ArrowUpRight,
  RazorpayMark, CalendarMark, WhatsAppMark, MailMark, SupportMark,
} from '../components/BookIcons.jsx'
import SlotCalendar from '../components/SlotCalendar.jsx'

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

/** Load the Razorpay checkout script once, on demand. */
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const money = (n, c = 'INR') =>
  c === 'INR' ? `₹${Number(n).toLocaleString('en-IN')}` : `${c} ${n}`

const longDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Book() {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [paid, setPaid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState('')

  // Step 1 is captured on leaving it, so returning to edit repopulates rather
  // than clearing what was typed.
  const [details, setDetails] = useState({
    name: '', email: '', phone: '', dial: '+91',
    dob: '', tob: '', pob: '', language: 'English',
  })

  const [serviceSlug, setServiceSlug] = useState('')
  const service = SERVICES.find((s) => s.slug === serviceSlug) || null

  const [window_, setWindow_] = useState(null)
  const [picked, setPicked] = useState({ date: '', time: '' })

  const formRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/consultations/window`)
      .then((r) => r.json())
      .then((b) => { if (b?.success) setWindow_(b.data) })
      .catch(() => { /* the calendar falls back to a wide range */ })
  }, [])

  /** Read the step-1 controls out of the DOM and validate them. */
  function collectStep1() {
    const form = formRef.current
    if (!form) return { values: null, errs: { name: 'Something went wrong.' } }
    const fd = new FormData(form)
    const v = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      dial: String(fd.get('dial') || '+91'),
      dob: String(fd.get('dob') || ''),
      tob: String(fd.get('tob') || ''),
      pob: String(fd.get('pob') || '').trim(),
      language: String(fd.get('language') || 'English'),
    }

    const errs = {}
    if (!v.name) errs.name = 'Name is required.'
    if (!v.email) errs.email = 'Email is required.'
    else if (!EMAIL_RE.test(v.email)) errs.email = 'Enter a valid email address.'
    if (!v.phone) errs.phone = 'A WhatsApp number is required.'
    else if (!/^[\d\s+\-()]{7,}$/.test(v.phone)) errs.phone = 'Enter a valid phone number.'
    if (!v.dob) errs.dob = 'Date of birth is required.'
    if (!v.tob) errs.tob = 'Time of birth is required.'
    if (!v.pob) errs.pob = 'Place of birth is required.'
    if (!serviceSlug) errs.area = 'Please choose a consultation.'

    return { values: v, errs }
  }

  /* Errors persist in state after a failed submit, so a corrected field would
     otherwise keep showing red — and, because Field hides the hint whenever an
     error is present, the consultation's duration and fee stayed hidden too. */
  function clearError(key) {
    if (!key) return
    setErrors((prev) => (prev[key] === undefined ? prev : { ...prev, [key]: undefined }))
  }

  function goToStep2() {
    const { values, errs } = collectStep1()
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus()
      return
    }
    setDetails(values)
    setStep(2)
  }

  async function payFor(booking) {
    // No fee, or no gateway configured — the booking stands as it is.
    if (!booking.amount || booking.paymentStatus === 'not_required') return false

    const cfg = await fetch(`${API_BASE}/payments/config`).then((r) => r.json()).catch(() => null)
    if (!cfg?.configured) return false

    const orderRes = await fetch(`${API_BASE}/payments/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId: booking.id }),
    }).then((r) => r.json())

    if (!orderRes?.success) throw new Error(orderRes?.message || 'Could not start payment')
    if (orderRes.configured === false || orderRes.skipped) return false

    const ok = await loadRazorpay()
    if (!ok) throw new Error('Could not reach the payment gateway')

    const order = orderRes.data
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: BRAND.name,
        description: service ? service.title : 'Consultation',
        order_id: order.orderId,
        prefill: { name: details.name, email: details.email, contact: `${details.dial}${details.phone}` },
        theme: { color: '#DFB13B' },
        handler: async (resp) => {
          try {
            const v = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(resp),
            }).then((r) => r.json())
            if (!v?.success) return reject(new Error(v?.message || 'Payment could not be verified'))
            resolve(true)
          } catch (err) {
            reject(err)
          }
        },
        modal: {
          // The booking is already saved, so an abandoned checkout is not a lost
          // enquiry — it simply stays unpaid for an admin to follow up.
          ondismiss: () => reject(new Error('PAYMENT_DISMISSED')),
        },
      })
      rzp.open()
    })
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    if (step === 1) { goToStep2(); return }

    if (!picked.date || !picked.time) {
      setErrors({ slot: 'Please choose a date and time.' })
      return
    }

    setBusy(true)
    setFailed('')
    try {
      const res = await fetch(`${API_BASE}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          phone: `${details.dial} ${details.phone}`.trim(),
          dob: details.dob,
          tob: details.tob,
          pob: details.pob,
          area: service ? service.title : '',
          serviceSlug,
          language: details.language,
          appointmentDate: picked.date,
          appointmentTime: picked.time,
          preferred: picked.date,
          // No `consent` is sent: this form has no consent control, so there is
          // nothing to record. It defaults to false server-side rather than
          // storing agreement the visitor never gave.
        }),
      })

      // Check the payload, not just the status: a 200 from something that is
      // not this API (a dev-server fallback, a proxy error page) must not read
      // as success, or the request is lost exactly as it used to be.
      const body = await res.json().catch(() => null)

      if (res.status === 409) {
        // Someone took the slot between painting the calendar and submitting.
        setFailed(body?.message || 'That time has just been taken. Please choose another.')
        setPicked({ date: picked.date, time: '' })
        setBusy(false)
        return
      }

      if (!res.ok || !body || body.success !== true) {
        throw new Error(body?.message || `HTTP ${res.status}`)
      }

      const didPay = await payFor(body.data)
      setPaid(Boolean(didPay))
      setSent(true)
    } catch (err) {
      if (err?.message === 'PAYMENT_DISMISSED') {
        // Deliberately not an error: the request is recorded either way.
        setPaid(false)
        setSent(true)
      } else {
        setFailed('That did not go through. Please try again, or message us on WhatsApp at')
      }
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
              <img src="/img/logo.png" alt={BRAND.name} className="bk__brand-logo" />
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

          {/* ---- the form: details, then a calendar, then payment ---- */}
          <section className="bk__card">
            {sent ? (
              <div className="bk__done" role="status">
                <p className="bk__done-deva">धन्यवाद</p>
                <h2>{paid ? 'Your consultation is booked' : 'Request received'}</h2>
                <p>
                  {paid
                    ? 'A short confirmation is on its way by WhatsApp, and the full details by email.'
                    : 'We will confirm your appointment and send the details by WhatsApp and email. Your details are held in strict confidence.'}
                </p>
                {picked.date && (
                  <p className="bk__done-when">
                    {longDate(picked.date)} · {picked.time}
                    {service ? ` · ${service.title}` : ''}
                  </p>
                )}
                <a className="bk__submit" href={BRAND.whatsapp} target="_blank" rel="noreferrer">
                  Message us on WhatsApp <ArrowUpRight />
                </a>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={onSubmit}
                noValidate
                onInput={(e) => clearError(e.target.name || e.target.id)}
                onChange={(e) => clearError(e.target.name || e.target.id)}
              >
                {/* ---- step indicator ---- */}
                <ol className="bk__steps" aria-label="Booking steps">
                  <li className={step === 1 ? 'is-on' : 'is-done'}>
                    <span>1</span> Your details
                  </li>
                  <li className={step === 2 ? 'is-on' : ''}>
                    <span>2</span> Date &amp; time
                  </li>
                </ol>

                {step === 1 ? (
                  <>
                    <div className="bk__row bk__row--3">
                      <Field id="name" label="Name" required error={errors.name}>
                        <input id="name" name="name" type="text" placeholder="Enter your full name"
                          autoComplete="name" defaultValue={details.name} />
                      </Field>
                      <Field id="email" label="Email" required error={errors.email}>
                        <input id="email" name="email" type="email" placeholder="you@example.com"
                          autoComplete="email" defaultValue={details.email} />
                      </Field>
                      <Field id="phone" label="WhatsApp number" required error={errors.phone}>
                        <span className="bk-phone">
                          <select name="dial" aria-label="Country dialling code" defaultValue={details.dial || '+91'}>
                            <option>+91</option><option>+1</option><option>+44</option>
                            <option>+61</option><option>+971</option>
                          </select>
                          <input id="phone" name="phone" type="text" placeholder="Enter your number"
                            autoComplete="tel" defaultValue={details.phone} />
                        </span>
                      </Field>
                    </div>

                    <div className="bk__row bk__row--3">
                      <Field id="dob" label="Date of Birth" required error={errors.dob}>
                        <span className="bk-input-wrap">
                          <input id="dob" name="dob" type="date" defaultValue={details.dob} />
                          <CalendarIcon className="bk-input-ico" />
                        </span>
                      </Field>
                      <Field id="tob" label="Time of Birth" required error={errors.tob}>
                        <span className="bk-input-wrap">
                          <input id="tob" name="tob" type="time" defaultValue={details.tob} />
                          <ClockIcon className="bk-input-ico" />
                        </span>
                      </Field>
                      <Field id="pob" label="Place of Birth" required error={errors.pob}>
                        <span className="bk-input-wrap">
                          <input id="pob" name="pob" type="text" placeholder="City, State, Country"
                            defaultValue={details.pob} />
                          <PinIcon className="bk-input-ico" />
                        </span>
                      </Field>
                    </div>

                    <div className="bk__row bk__row--2">
                      <Field
                        id="area"
                        label="Consultation"
                        required
                        error={errors.area}
                        hint={service
                          ? `${service.duration || 60} minutes · ${service.price ? money(service.price, service.currency) : 'Fee on enquiry'}`
                          : undefined}
                      >
                        <select
                          id="area"
                          name="area"
                          value={service ? service.title : ''}
                          onChange={(e) => {
                            const chosen = SERVICES.find((s) => s.title === e.target.value)
                            setServiceSlug(chosen ? chosen.slug : '')
                            setPicked({ date: '', time: '' })
                            clearError('area')
                          }}
                        >
                          <option value="" disabled>Select a consultation</option>
                          {SERVICES.map((s) => (
                            <option key={s.slug} value={s.title}>
                              {s.title}{s.price ? ` — ${money(s.price, s.currency)}` : ''}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field id="language" label="Preferred Language">
                        <select id="language" name="language" defaultValue={details.language || 'English'}>
                          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </Field>
                    </div>

                    <div className="bk__row bk__row--submit">
                      <p className="bk__notice">
                        <span className="bk__notice-ico"><CalendarClock /></span>
                        <span>
                          Next, pick a time
                          <b>Live availability</b>
                          <span>Only times Meenakshi is genuinely free are shown.</span>
                        </span>
                      </p>
                      <div className="bk__submit-col">
                        <button className="bk__submit" type="button" onClick={goToStep2}>
                          Choose a date &amp; time <ArrowUpRight />
                        </button>
                        <p className="bk__safe"><LockSmall /> Your information is safe and secure.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bk__recap">
                      <button type="button" className="bk__back" onClick={() => setStep(1)}>
                        ← Edit details
                      </button>
                      <span>
                        <b>{details.name}</b>
                        {service ? ` · ${service.title}` : ''}
                        {service?.duration ? ` · ${service.duration} min` : ''}
                        {service?.price ? ` · ${money(service.price, service.currency)}` : ''}
                      </span>
                    </div>

                    <SlotCalendar
                      window_={window_}
                      serviceSlug={serviceSlug}
                      value={picked}
                      onChange={setPicked}
                    />

                    {errors.slot && <p className="bk-err" role="alert">{errors.slot}</p>}

                    <div className="bk__row bk__row--submit">
                      <p className="bk__notice">
                        <span className="bk__notice-ico"><CalendarClock /></span>
                        <span>
                          {picked.time ? 'Ready to confirm' : 'Pick a time to continue'}
                          <b>{picked.date ? `${longDate(picked.date)}${picked.time ? ` · ${picked.time}` : ''}` : '—'}</b>
                          <span>
                            {service?.price
                              ? `Payment of ${money(service.price, service.currency)} is taken on the next step.`
                              : 'Confirmation arrives by WhatsApp and email.'}
                          </span>
                        </span>
                      </p>

                      <div className="bk__submit-col">
                        <button className="bk__submit" type="submit" disabled={busy || !picked.time} aria-busy={busy}>
                          {service?.price ? 'Confirm & pay' : 'Confirm booking'} <ArrowUpRight />
                        </button>
                        {failed && (
                          <p className="bk-err" role="alert">{failed} {BRAND.phone}</p>
                        )}
                        <p className="bk__safe"><LockSmall /> Your information is safe and secure.</p>
                      </div>
                    </div>
                  </>
                )}
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

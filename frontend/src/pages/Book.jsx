import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../data/site.js'
import { SERVICES } from '../data/services.js'
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

/* The practice keeps one schedule, in its own timezone, but the site is sold as
   "online worldwide". Showing a bare "11:00" to someone abroad invites them to
   read it as their own local time and miss the appointment, so slots carry a
   UTC instant and are rendered in the visitor's zone with the zone named. */
const LOCAL_TZ = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' }
})()

const localLabel = (iso, fallback) => {
  if (!iso) return fallback
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return fallback }
}

const money = (n, c = 'INR') =>
  c === 'INR' ? `₹${Number(n).toLocaleString('en-IN')}` : `${c} ${n}`

export default function Book() {
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState('')

  // slot picking
  const [window_, setWindow_] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState(null)      // null = not asked yet
  const [slotsReason, setSlotsReason] = useState('')
  const [slotTz, setSlotTz] = useState('')
  const [slot, setSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  // chosen service drives duration and price
  const [serviceSlug, setServiceSlug] = useState('')
  const service = SERVICES.find((s) => s.slug === serviceSlug) || null

  useEffect(() => {
    fetch(`${API_BASE}/consultations/window`)
      .then((r) => r.json())
      .then((b) => { if (b?.success) setWindow_(b.data) })
      .catch(() => { /* the date input simply loses its min/max */ })
  }, [])

  // Fetch availability whenever the date changes. The slot list is authoritative
  // from the server — the client never assumes a slot is free.
  // Re-fetch on service change too: a longer consultation fits fewer starts,
  // so the offered times genuinely differ per service.
  useEffect(() => {
    if (!date) { setSlots(null); setSlot(''); setSlotsReason(''); return }
    let cancelled = false
    setLoadingSlots(true)
    setSlot('')
    const q = `date=${date}${serviceSlug ? `&service=${encodeURIComponent(serviceSlug)}` : ''}`
    fetch(`${API_BASE}/consultations/slots?${q}`)
      .then((r) => r.json())
      .then((b) => {
        if (cancelled) return
        setSlots(b?.data?.available || [])
        setSlotsReason(b?.data?.reason || '')
        setSlotTz(b?.data?.timezone || '')
      })
      .catch(() => { if (!cancelled) { setSlots([]); setSlotsReason('Could not load times.') } })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [date, serviceSlug])

  async function payFor(booking) {
    // No fee, or no gateway configured — the booking stands as it is.
    if (!booking.amount || booking.paymentStatus === 'not_required') return true

    const cfg = await fetch(`${API_BASE}/payments/config`).then((r) => r.json()).catch(() => null)
    if (!cfg?.configured) return true

    const orderRes = await fetch(`${API_BASE}/payments/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId: booking.id }),
    }).then((r) => r.json())

    if (!orderRes?.success) throw new Error(orderRes?.message || 'Could not start payment')
    if (orderRes.configured === false || orderRes.skipped) return true

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
        prefill: { name: order.name, email: /@/.test(order.contact) ? order.contact : '' },
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
          // enquiry — say so rather than implying the request vanished.
          ondismiss: () => reject(new Error('PAYMENT_DISMISSED')),
        },
      })
      rzp.open()
    })
  }

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
    if (!fd.get('area')) e.area = 'Please choose a consultation.'
    if (!date) e.preferred = 'Please choose a date.'
    else if (!slot) e.preferred = 'Please choose a time.'

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
    setFailed('')
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
          serviceSlug,
          language: fd.get('language') || 'English',
          appointmentDate: date,
          appointmentTime: slot,
          preferred: date,
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

      if (res.status === 409) {
        // Someone took the slot between loading the page and submitting.
        setFailed(body?.message || 'That time has just been taken. Please choose another.')
        const again = await fetch(`${API_BASE}/consultations/slots?date=${date}`).then((r) => r.json())
        setSlots(again?.data?.available || [])
        setSlot('')
        setBusy(false)
        return
      }

      if (!res.ok || !body || body.success !== true) {
        throw new Error(body?.message || `HTTP ${res.status}`)
      }

      await payFor(body.data)
      setSent(true)
    } catch (err) {
      if (err?.message === 'PAYMENT_DISMISSED') {
        // Deliberately not an error state: the request is recorded either way.
        setSent(true)
      } else {
        setFailed('That did not go through. Please try again, or message us on WhatsApp.')
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
                      }}
                    >
                      <option value="" disabled>Select a consultation</option>
                      {SERVICES.map((s) => (
                        <option key={s.slug} value={s.title}>
                          {s.title}
                          {s.price ? ` — ${money(s.price, s.currency)}` : ''}
                        </option>
                      ))}
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
                  <Field
                    id="preferred"
                    label="Date"
                    required
                    error={errors.preferred}
                    hint={window_ ? `Earliest ${window_.min} — consultations are prepared in advance.` : undefined}
                  >
                    <span className="bk-input-wrap">
                      <input
                        id="preferred"
                        name="preferred"
                        type="date"
                        value={date}
                        min={window_?.min}
                        max={window_?.max}
                        onChange={(e) => setDate(e.target.value)}
                      />
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

                {date && (
                  <div className="bk__row">
                    <div className="bk-field">
                      <label htmlFor="bk-slots">
                        Time <span className="bk-req" aria-hidden="true">*</span>
                      </label>

                      {loadingSlots ? (
                        <p className="bk-hint">Checking availability…</p>
                      ) : slots && slots.length > 0 ? (
                        <>
                          <div className="bk-slots" id="bk-slots" role="radiogroup" aria-label="Available times">
                            {slots.map((t) => {
                              const shown = LOCAL_TZ && slotTz && LOCAL_TZ !== slotTz
                                ? localLabel(t.iso, t.time)
                                : t.time
                              return (
                                <button
                                  key={t.time}
                                  type="button"
                                  role="radio"
                                  aria-checked={slot === t.time}
                                  className={`bk-slot${slot === t.time ? ' is-on' : ''}`}
                                  onClick={() => setSlot(t.time)}
                                  title={LOCAL_TZ !== slotTz ? `${t.time} ${slotTz}` : undefined}
                                >
                                  {shown}
                                </button>
                              )
                            })}
                          </div>
                          <p className="bk-hint">
                            {LOCAL_TZ && slotTz && LOCAL_TZ !== slotTz
                              ? `Times shown in your local time (${LOCAL_TZ}). The practice keeps ${slotTz}.`
                              : `Times shown in ${slotTz || 'the practice’s local time'}.`}
                            {service?.duration ? ` Session length ${service.duration} minutes.` : ''}
                          </p>
                        </>
                      ) : (
                        <p className="bk-hint">
                          {slotsReason || 'No times available on that date. Please try another.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                      <p className="bk-err" role="alert">{failed} {BRAND.phone}</p>
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

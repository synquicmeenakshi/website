import { useState, useEffect, useMemo } from 'react'

/* Month grid + times, in the shape people already know from scheduling tools.
   Availability counts for the whole month come from one range request, so
   moving between months is one call rather than one per day. */

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n) => String(n).padStart(2, '0')
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

/** Monday-first offset for the 1st of the month. */
const leadingBlanks = (y, m) => (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7
const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()

export default function SlotCalendar({
  window_,          // { min, max, timezone }
  serviceSlug,
  value,            // { date, time }
  onChange,
}) {
  const today = window_?.min || new Date().toISOString().slice(0, 10)
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number)
    return { y, m: m - 1 }
  })

  const [counts, setCounts] = useState({})     // 'YYYY-MM-DD' -> number
  const [slots, setSlots] = useState(null)
  const [slotsReason, setSlotsReason] = useState('')
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [tz, setTz] = useState(window_?.timezone || '')

  const localTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' }
  }, [])
  const differentZone = Boolean(localTz && tz && localTz !== tz)

  /* ---- month availability ------------------------------------------------ */
  useEffect(() => {
    let cancelled = false
    const first = ymd(cursor.y, cursor.m, 1)
    const days = daysInMonth(cursor.y, cursor.m)
    setLoadingMonth(true)
    const q = `from=${first}&days=${days}${serviceSlug ? `&service=${encodeURIComponent(serviceSlug)}` : ''}`
    fetch(`${API_BASE}/consultations/slots?${q}`)
      .then((r) => r.json())
      .then((b) => {
        if (cancelled) return
        const map = {}
        for (const row of b?.data || []) map[row.date] = row.count
        setCounts(map)
      })
      .catch(() => { if (!cancelled) setCounts({}) })
      .finally(() => { if (!cancelled) setLoadingMonth(false) })
    return () => { cancelled = true }
  }, [cursor.y, cursor.m, serviceSlug])

  /* ---- times for the chosen day ------------------------------------------ */
  useEffect(() => {
    if (!value?.date) { setSlots(null); return }
    let cancelled = false
    setLoadingSlots(true)
    const q = `date=${value.date}${serviceSlug ? `&service=${encodeURIComponent(serviceSlug)}` : ''}`
    fetch(`${API_BASE}/consultations/slots?${q}`)
      .then((r) => r.json())
      .then((b) => {
        if (cancelled) return
        setSlots(b?.data?.available || [])
        setSlotsReason(b?.data?.reason || '')
        if (b?.data?.timezone) setTz(b.data.timezone)
      })
      .catch(() => { if (!cancelled) { setSlots([]); setSlotsReason('Could not load times.') } })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [value?.date, serviceSlug])

  const canPrev = ymd(cursor.y, cursor.m, 1) > (window_?.min || '')
  const canNext = ymd(cursor.y, cursor.m, daysInMonth(cursor.y, cursor.m)) < (window_?.max || '9999-12-31')

  const step = (dir) => {
    setCursor((c) => {
      const m = c.m + dir
      if (m < 0) return { y: c.y - 1, m: 11 }
      if (m > 11) return { y: c.y + 1, m: 0 }
      return { y: c.y, m }
    })
  }

  const cells = []
  for (let i = 0; i < leadingBlanks(cursor.y, cursor.m); i++) cells.push(null)
  for (let d = 1; d <= daysInMonth(cursor.y, cursor.m); d++) cells.push(ymd(cursor.y, cursor.m, d))

  const longDate = (iso) => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d))
    return dt.toLocaleDateString('en-GB', {
      timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  const timeLabel = (s) => {
    if (!differentZone || !s.iso) return s.time
    try {
      return new Date(s.iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return s.time }
  }

  return (
    <div className="bkcal">
      {/* ---- month grid ---- */}
      <div className="bkcal__month">
        <div className="bkcal__nav">
          <button type="button" onClick={() => step(-1)} disabled={!canPrev} aria-label="Previous month">‹</button>
          <span className="bkcal__title">{MONTHS[cursor.m]} {cursor.y}</span>
          <button type="button" onClick={() => step(1)} disabled={!canNext} aria-label="Next month">›</button>
        </div>

        <div className="bkcal__dow" aria-hidden="true">
          {DOW.map((d) => <span key={d}>{d}</span>)}
        </div>

        <div className="bkcal__grid" role="grid" aria-label="Choose a date">
          {cells.map((iso, i) => {
            if (!iso) return <span key={`b${i}`} className="bkcal__pad" />
            const inWindow = iso >= (window_?.min || '') && iso <= (window_?.max || '9999-12-31')
            const open = inWindow && (counts[iso] || 0) > 0
            const selected = value?.date === iso
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                disabled={!open}
                aria-selected={selected}
                className={`bkcal__day${open ? ' is-open' : ''}${selected ? ' is-on' : ''}`}
                onClick={() => onChange({ date: iso, time: '' })}
                title={open ? `${counts[iso]} times available` : undefined}
              >
                {Number(iso.slice(8, 10))}
              </button>
            )
          })}
        </div>

        {loadingMonth && <p className="bkcal__note">Checking availability…</p>}

        <div className="bkcal__tz">
          <span className="bkcal__tz-label">Time zone</span>
          <span className="bkcal__tz-value">
            {differentZone ? `${localTz} (yours)` : (tz || window_?.timezone || '—')}
          </span>
          {differentZone && (
            <span className="bkcal__tz-note">Practice keeps {tz}</span>
          )}
        </div>
      </div>

      {/* ---- times for the chosen day ---- */}
      <div className="bkcal__times">
        {!value?.date ? (
          <p className="bkcal__note">Select a date to see available times.</p>
        ) : (
          <>
            <p className="bkcal__day-h">{longDate(value.date)}</p>
            {loadingSlots ? (
              <p className="bkcal__note">Loading times…</p>
            ) : slots && slots.length > 0 ? (
              <ul className="bkcal__list">
                {slots.map((s) => (
                  <li key={s.time}>
                    <button
                      type="button"
                      className={`bkcal__slot${value.time === s.time ? ' is-on' : ''}`}
                      onClick={() => onChange({ date: value.date, time: s.time })}
                      title={differentZone ? `${s.time} ${tz}` : undefined}
                    >
                      {timeLabel(s)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="bkcal__note">
                {slotsReason || 'No times left on that day. Please choose another.'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

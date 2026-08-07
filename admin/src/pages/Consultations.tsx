import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Search, X, Save, Trash2, AlertCircle, Mail, Phone,
  CalendarClock, MapPin, Clock, Cake, Languages, RefreshCw, IndianRupee,
} from 'lucide-react'
import AdminShell from '../components/AdminShell'
import * as ui from '../utils/ui'
import {
  listConsultations, updateConsultation, deleteConsultation, getSlots, getBookingWindow,
  type Consultation,
} from '../utils/meenakshiApi'

const STATUSES = ['all', 'new', 'confirmed', 'completed', 'cancelled'] as const
type StatusFilter = (typeof STATUSES)[number]

const statusStyle = ui.pill



const BUSINESS_TZ = 'Asia/Kolkata'

const payStyle = ui.pill

const payLabel = (c: Consultation) => {
  const amt = c.amount ? `₹${c.amount.toLocaleString('en-IN')}` : ''
  if (c.paymentStatus === 'paid') return `Paid${amt ? ` ${amt}` : ''}`
  if (c.paymentStatus === 'pending') return `Payment pending${amt ? ` ${amt}` : ''}`
  if (c.paymentStatus === 'failed') return 'Payment failed'
  return 'No fee'
}

/** 'YYYY-MM-DD' rendered without timezone drift. */
const longDate = (iso?: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

const fmtDate = (iso: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const Consultations = () => {
  const [items, setItems] = useState<Consultation[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState<Consultation | null>(null)
  const [draft, setDraft] = useState<Partial<Consultation>>({})
  const [saving, setSaving] = useState(false)

  // reschedule
  const [rescheduling, setRescheduling] = useState(false)
  const [slotOptions, setSlotOptions] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [force, setForce] = useState(false)
  const [bookingWindow, setBookingWindow] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listConsultations({ status, search })
      setItems(res.data || [])
      setCounts(res.byStatus || {})
    } catch (e: any) {
      setError(e.message || 'Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }, [status, search])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  useEffect(() => {
    getBookingWindow().then((r) => setBookingWindow(r.data)).catch(() => {})
  }, [])

  /* Live availability for the reschedule picker. The booking is excluded from
     its own check, so moving it within the same day does not collide with the
     slot it currently holds. */
  useEffect(() => {
    if (!rescheduling || !draft.appointmentDate || !selected) { setSlotOptions([]); return }
    let cancelled = false
    setLoadingSlots(true)
    getSlots(draft.appointmentDate, selected.serviceSlug, selected._id)
      .then((r) => { if (!cancelled) setSlotOptions((r.data?.available || []).map((x: any) => x.time)) })
      .catch(() => { if (!cancelled) setSlotOptions([]) })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [rescheduling, draft.appointmentDate, selected])

  const open = (c: Consultation) => {
    setSelected(c)
    setDraft({
      status: c.status,
      appointmentDate: c.appointmentDate || '',
      appointmentTime: c.appointmentTime || '',
      adminNotes: c.adminNotes || '',
    })
    setRescheduling(false)
    setForce(false)
    setSlotOptions([])
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const payload: any = { status: draft.status, adminNotes: draft.adminNotes }
      if (rescheduling && draft.appointmentDate && draft.appointmentTime) {
        payload.appointmentDate = draft.appointmentDate
        payload.appointmentTime = draft.appointmentTime
        if (force) payload.force = true
      }
      await updateConsultation(selected._id, payload)
      setSelected(null)
      await load()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c: Consultation) => {
    if (!window.confirm(`Delete the request from ${c.name}? This cannot be undone.`)) return
    try {
      await deleteConsultation(c._id)
      setSelected(null)
      await load()
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  return (
    <AdminShell
      title="Consultations"
      subtitle="Requests submitted through the booking form"
      actions={
        <button onClick={load} className={ui.btnIcon} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-[10px] bg-[rgba(179,66,26,0.07)] border border-[rgba(179,66,26,0.22)] text-[13px] text-[#8e3411]">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-[10px] text-sm font-medium capitalize transition ${
              status === s
                ? 'bg-[var(--saffron-ink)] text-white '
                : 'text-slate-600 bg-white border border-[var(--hairline)] hover:bg-slate-50'
            }`}
          >
            {s}
            {s !== 'all' && counts[s] ? (
              <span className={`ml-1.5 text-xs ${status === s ? 'text-white/80' : 'text-slate-400'}`}>
                {counts[s]}
              </span>
            ) : null}
          </button>
        ))}

        <div className="relative ml-auto w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${ui.input} pl-9`}
            placeholder="Name, contact, area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No consultation requests{status !== 'all' ? ` with status “${status}”` : ''} yet.
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--hairline)] overflow-hidden">
          {items.map((c, i) => (
            <button
              key={c._id}
              onClick={() => open(c)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition ${
                i ? 'border-t border-[var(--hairline)]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border capitalize ${statusStyle[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5 truncate">
                  {c.appointmentDate
                    ? `${longDate(c.appointmentDate)} · ${c.appointmentTime}`
                    : 'No slot booked'}
                </p>
                <p className="text-xs text-slate-500 truncate">{c.area}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  {c.contactType === 'email' ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                  {c.contact}
                </p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 pt-0.5">{fmtDate(c.createdAt)}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[80] bg-[rgba(36,26,20,0.42)] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[10px] w-full max-w-2xl my-8 shadow-[0_18px_50px_rgba(36,26,20,0.16)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
              <div>
                <h2 className="text-[19px] text-[var(--ink)]" style={ui.displayFace}>{selected.name}</h2>
                <p className="text-xs text-slate-500">Requested {fmtDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className={ui.btnIcon} aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* The appointment is the headline fact — it was previously not
                  shown at all, so admin could not tell when anyone was booked. */}
              <div className="p-4 rounded-[10px] bg-gradient-to-r from-[#d4531d]/10 to-[#ad3f15]/5 border border-[rgba(212,83,29,0.3)]">
                <p className="text-[11px] uppercase tracking-wider text-[#9a7b2f] font-semibold flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" /> Appointment
                </p>
                {selected.appointmentDate ? (
                  <>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {longDate(selected.appointmentDate)} · {selected.appointmentTime}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {BUSINESS_TZ}
                      {selected.durationMinutes ? ` · ${selected.durationMinutes} minutes` : ''}
                      {selected.area ? ` · ${selected.area}` : ''}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 mt-1">
                    No slot on this record — it predates slot booking.
                    {selected.preferredDate ? ` Preferred ${selected.preferredDate}.` : ''}
                  </p>
                )}
              </div>

              {/* payment */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border capitalize ${statusStyle[selected.status]}`}>
                  {selected.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${payStyle[selected.paymentStatus || 'pending']}`}>
                  {payLabel(selected)}
                </span>
                {selected.paymentId && (
                  <span className="text-[11px] text-slate-400">{selected.paymentId}</span>
                )}
              </div>

              {/* contact — email and phone are separate now, and actionable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-[10px] bg-slate-50 border border-[var(--hairline)]">
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </p>
                  {selected.email || /@/.test(selected.contact || '') ? (
                    <a href={`mailto:${selected.email || selected.contact}`}
                      className="text-sm text-[#ad3f15] hover:underline mt-1 block break-words">
                      {selected.email || selected.contact}
                    </a>
                  ) : <p className="text-sm text-slate-400 mt-1">—</p>}
                </div>
                <div className="p-3 rounded-[10px] bg-slate-50 border border-[var(--hairline)]">
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
                  </p>
                  {selected.phone || !/@/.test(selected.contact || '') ? (
                    <a href={`https://wa.me/${String(selected.phone || selected.contact || '').replace(/\D/g, '')}`}
                      target="_blank" rel="noreferrer"
                      className="text-sm text-[#ad3f15] hover:underline mt-1 block break-words">
                      {selected.phone || selected.contact}
                    </a>
                  ) : <p className="text-sm text-slate-400 mt-1">—</p>}
                </div>
              </div>

              {/* birth details — what the reading is prepared from */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <Cake className="w-3.5 h-3.5" />, label: 'Date of birth', value: selected.dob },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: 'Time of birth', value: selected.tob },
                  { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Place of birth', value: selected.pob },
                  { icon: <Languages className="w-3.5 h-3.5" />, label: 'Language', value: selected.language },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-[10px] bg-slate-50 border border-[var(--hairline)]">
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold flex items-center gap-1.5">
                      {f.icon} {f.label}
                    </p>
                    <p className="text-sm text-slate-800 mt-1 break-words">{f.value || '—'}</p>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div className="p-3 rounded-[10px] bg-slate-50 border border-[var(--hairline)]">
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold">
                    What they would like guidance on
                  </p>
                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              {/* ---- admin actions ---- */}
              <div className="pt-1 border-t border-[var(--hairline)] space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className={ui.input} value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as Consultation['status'] })}>
                    {['new', 'confirmed', 'completed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Cancelling releases the slot back to the calendar.
                  </p>
                </div>

                {/* Rescheduling moves the real appointment. The old
                    "confirmed date/time" pair changed nothing about
                    availability and has been removed. */}
                <div>
                  <button type="button"
                    onClick={() => setRescheduling((v) => !v)}
                    className="text-sm font-medium text-[#ad3f15] hover:underline">
                    {rescheduling ? 'Cancel reschedule' : 'Reschedule…'}
                  </button>

                  {rescheduling && (
                    <div className="mt-3 p-3 rounded-[10px] border border-[var(--hairline)] bg-slate-50/60 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">New date</label>
                        <input type="date" className={ui.input}
                          value={draft.appointmentDate || ''}
                          min={bookingWindow?.min} max={bookingWindow?.max}
                          onChange={(e) => setDraft({ ...draft, appointmentDate: e.target.value, appointmentTime: '' })} />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">New time</label>
                        {loadingSlots ? (
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking availability…
                          </p>
                        ) : slotOptions.length ? (
                          <div className="flex flex-wrap gap-2">
                            {slotOptions.map((t) => (
                              <button key={t} type="button"
                                onClick={() => setDraft({ ...draft, appointmentTime: t })}
                                className={`px-3 py-1.5 rounded-[10px] text-sm border transition ${
                                  draft.appointmentTime === t
                                    ? 'bg-[var(--saffron-ink)] text-white border-transparent'
                                    : 'bg-white text-slate-700 border-[var(--hairline)] hover:border-[#d4531d]'
                                }`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            {draft.appointmentDate ? 'No free times on that date.' : 'Pick a date first.'}
                          </p>
                        )}
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" className="w-4 h-4 accent-[#d4531d]"
                          checked={force} onChange={(e) => setForce(e.target.checked)} />
                        Override availability (for a booking taken by phone)
                      </label>

                      {force && (
                        <input type="time" className={ui.input} value={draft.appointmentTime || ''}
                          onChange={(e) => setDraft({ ...draft, appointmentTime: e.target.value })} />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Internal notes</label>
                  <textarea className={ui.input} rows={3} value={draft.adminNotes || ''}
                    onChange={(e) => setDraft({ ...draft, adminNotes: e.target.value })} />
                  <p className="text-xs text-slate-400 mt-1">Never shown to the client.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--hairline)]">
              <button onClick={() => remove(selected)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium text-red-500 hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSelected(null)}
                  className={ui.btnQuiet}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving} className={ui.btnPrimary}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default Consultations

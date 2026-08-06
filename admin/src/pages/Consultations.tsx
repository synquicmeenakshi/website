import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Search, X, Save, Trash2, AlertCircle, Mail, Phone,
  CalendarClock, MapPin, Clock, Cake, Languages, RefreshCw,
} from 'lucide-react'
import AdminShell from '../components/AdminShell'
import {
  listConsultations, updateConsultation, deleteConsultation,
  type Consultation,
} from '../utils/meenakshiApi'

const STATUSES = ['all', 'new', 'confirmed', 'completed', 'cancelled'] as const
type StatusFilter = (typeof STATUSES)[number]

const statusStyle: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/40 focus:border-[#DFB13B] transition'

const btnGold =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ' +
  'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] shadow-md shadow-[#DFB13B]/25 ' +
  'hover:opacity-95 disabled:opacity-50 transition'

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

  const open = (c: Consultation) => {
    setSelected(c)
    setDraft({
      status: c.status,
      confirmedDate: c.confirmedDate || '',
      confirmedTime: c.confirmedTime || '',
      adminNotes: c.adminNotes || '',
    })
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      await updateConsultation(selected._id, draft)
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
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 transition" title="Refresh">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
              status === s
                ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md shadow-[#DFB13B]/25'
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
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
            className={`${inputCls} pl-9`}
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
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          {items.map((c, i) => (
            <button
              key={c._id}
              onClick={() => open(c)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition ${
                i ? 'border-t border-slate-100' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${statusStyle[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{c.area}</p>
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
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-800">{selected.name}</h2>
                <p className="text-xs text-slate-500">Received {fmtDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-slate-100 transition" aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* what the visitor submitted — read only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <Mail className="w-3.5 h-3.5" />, label: 'Contact', value: selected.contact },
                  { icon: <Languages className="w-3.5 h-3.5" />, label: 'Language', value: selected.language },
                  { icon: <Cake className="w-3.5 h-3.5" />, label: 'Date of birth', value: selected.dob },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: 'Time of birth', value: selected.tob },
                  { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Place of birth', value: selected.pob },
                  { icon: <CalendarClock className="w-3.5 h-3.5" />, label: 'Preferred date', value: selected.preferredDate || '—' },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                      {f.icon} {f.label}
                    </p>
                    <p className="text-sm text-slate-800 mt-1 break-words">{f.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Consultation area</p>
                <p className="text-sm text-slate-800 mt-1">{selected.area}</p>
              </div>

              {selected.notes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    What they would like guidance on
                  </p>
                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              {/* admin-editable */}
              <div className="pt-1 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select className={inputCls} value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as Consultation['status'] })}>
                    {['new', 'confirmed', 'completed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmed date</label>
                    <input type="date" className={inputCls} value={draft.confirmedDate || ''}
                      onChange={(e) => setDraft({ ...draft, confirmedDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmed time</label>
                    <input type="time" className={inputCls} value={draft.confirmedTime || ''}
                      onChange={(e) => setDraft({ ...draft, confirmedTime: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Internal notes</label>
                  <textarea className={inputCls} rows={3} value={draft.adminNotes || ''}
                    onChange={(e) => setDraft({ ...draft, adminNotes: e.target.value })} />
                  <p className="text-xs text-slate-400 mt-1">Never shown to the client.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <button onClick={() => remove(selected)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                  Cancel
                </button>
                <button onClick={save} disabled={saving} className={btnGold}>
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

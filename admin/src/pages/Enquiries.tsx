import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, X, Save, Trash2, AlertCircle, Mail, Phone, RefreshCw } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import * as ui from '../utils/ui'
import { listEnquiries, updateEnquiry, deleteEnquiry, type Enquiry } from '../utils/meenakshiApi'

const STATUSES = ['all', 'new', 'read', 'replied', 'archived'] as const

const statusStyle = ui.pill



const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const Enquiries = () => {
  const [items, setItems] = useState<Enquiry[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [draft, setDraft] = useState<Partial<Enquiry>>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await listEnquiries({ status, search })
      setItems(res.data || [])
      setCounts(res.byStatus || {})
    } catch (e: any) {
      setError(e.message || 'Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }, [status, search])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  const open = async (e: Enquiry) => {
    setSelected(e)
    setDraft({ status: e.status, adminNotes: e.adminNotes || '' })
    // Opening an unread enquiry marks it read — the common case, saves a click.
    if (e.status === 'new') {
      try { await updateEnquiry(e._id, { status: 'read' }); load() } catch { /* non-critical */ }
    }
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await updateEnquiry(selected._id, draft)
      setSelected(null)
      await load()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (e: Enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${e.name}?`)) return
    try { await deleteEnquiry(e._id); setSelected(null); await load() } catch (err: any) { setError(err.message) }
  }

  return (
    <AdminShell
      title="Enquiries"
      subtitle="Messages from the contact page"
      actions={
        <button onClick={load} className={ui.btnIcon} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-[10px] bg-[rgba(179,66,26,0.07)] border border-[rgba(179,66,26,0.22)] text-[13px] text-[#8e3411]">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-[10px] text-sm font-medium capitalize transition ${
              status === s
                ? 'bg-[var(--saffron-ink)] text-white '
                : 'text-slate-600 bg-white border border-[var(--hairline)] hover:bg-slate-50'
            }`}>
            {s}
            {s !== 'all' && counts[s] ? (
              <span className={`ml-1.5 text-xs ${status === s ? 'text-white/80' : 'text-slate-400'}`}>{counts[s]}</span>
            ) : null}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${ui.input} pl-9`} placeholder="Name, email, message…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No enquiries{status !== 'all' ? ` with status “${status}”` : ''} yet.
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--hairline)] overflow-hidden">
          {items.map((e, i) => (
            <button key={e._id} onClick={() => open(e)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition ${i ? 'border-t border-[var(--hairline)]' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{e.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border capitalize ${statusStyle[e.status]}`}>
                    {e.status}
                  </span>
                </div>
                {e.subject && <p className="text-xs text-slate-500 mt-0.5 truncate">{e.subject}</p>}
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{e.message}</p>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 pt-0.5">{fmt(e.createdAt)}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[80] bg-[rgba(36,26,20,0.42)] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[10px] w-full max-w-xl my-8 shadow-[0_18px_50px_rgba(36,26,20,0.16)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)]">
              <div>
                <h2 className="text-[19px] text-[var(--ink)]" style={ui.displayFace}>{selected.name}</h2>
                <p className="text-xs text-slate-500">{fmt(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className={ui.btnIcon} aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="flex flex-wrap gap-3 text-sm">
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 text-[#ad3f15] hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {selected.email}
                  </a>
                )}
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1.5 text-[#ad3f15] hover:underline">
                    <Phone className="w-3.5 h-3.5" /> {selected.phone}
                  </a>
                )}
              </div>

              {selected.subject && (
                <div>
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold">Subject</p>
                  <p className="text-sm text-slate-800 mt-0.5">{selected.subject}</p>
                </div>
              )}

              <div className="p-3 rounded-[10px] bg-slate-50 border border-[var(--hairline)]">
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold">Message</p>
                <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className={ui.input} value={draft.status}
                  onChange={(ev) => setDraft({ ...draft, status: ev.target.value as Enquiry['status'] })}>
                  {['new', 'read', 'replied', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal notes</label>
                <textarea className={ui.input} rows={3} value={draft.adminNotes || ''}
                  onChange={(ev) => setDraft({ ...draft, adminNotes: ev.target.value })} />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--hairline)]">
              <button onClick={() => remove(selected)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium text-red-500 hover:bg-red-50 transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSelected(null)}
                  className={ui.btnQuiet}>Cancel</button>
                <button onClick={save} disabled={saving} className={ui.btnPrimary}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default Enquiries

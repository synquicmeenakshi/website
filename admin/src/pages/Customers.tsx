import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Search, AlertCircle, Mail, Phone, X, RefreshCw, Users, Repeat, IndianRupee,
} from 'lucide-react'
import AdminShell from '../components/AdminShell'
import * as ui from '../utils/ui'
import { listCustomers, type Customer } from '../utils/meenakshiApi'


const statusStyle = ui.pill

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

const Customers = () => {
  const [items, setItems] = useState<Customer[]>([])
  const [totals, setTotals] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await listCustomers(search)
      setItems(res.data || [])
      setTotals(res.totals || {})
    } catch (e: any) {
      setError(e.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  const tiles = [
    { label: 'Customers', value: totals.customers ?? 0, icon: <Users className="w-5 h-5" />, tone: 'text-sky-600 bg-sky-50' },
    { label: 'Repeat clients', value: totals.repeat ?? 0, icon: <Repeat className="w-5 h-5" />, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Revenue', value: `₹${(totals.revenue ?? 0).toLocaleString('en-IN')}`, icon: <IndianRupee className="w-5 h-5" />, tone: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <AdminShell
      title="Customers"
      subtitle="Grouped from consultation bookings"
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

      <div className="grid grid-cols-3 gap-3 mb-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-[10px] border border-[var(--hairline)] p-4">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${t.tone}`}>{t.icon}</div>
            <p className="text-xl font-semibold text-slate-800 mt-3">{t.value}</p>
            <p className="text-xs text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className={`${ui.input} pl-9`} placeholder="Name, contact or area…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">No customers yet.</div>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--hairline)] overflow-hidden">
          {items.map((c, i) => (
            <button key={c.key} onClick={() => setSelected(c)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition ${i ? 'border-t border-[var(--hairline)]' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  {c.totalBookings > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      {c.totalBookings} bookings
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  {c.contactType === 'email' ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                  {c.contact}
                </p>
                {c.areas.length > 0 && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.areas.join(' · ')}</p>}
              </div>
              <div className="text-right shrink-0">
                {c.totalSpend > 0 && <p className="text-sm font-medium text-slate-700">₹{c.totalSpend.toLocaleString('en-IN')}</p>}
                <p className="text-[11px] text-slate-400">last {fmt(c.lastSeen)}</p>
              </div>
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
                <p className="text-xs text-slate-500">{selected.contact}</p>
              </div>
              <button onClick={() => setSelected(null)} className={ui.btnIcon} aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Bookings', selected.totalBookings],
                  ['Spend', `₹${selected.totalSpend.toLocaleString('en-IN')}`],
                  ['First seen', fmt(selected.firstSeen)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="p-3 rounded-[10px] bg-slate-50 border border-[var(--hairline)]">
                    <p className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold">{label}</p>
                    <p className="text-sm text-slate-800 mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-[16px] text-[var(--ink)] mb-2" style={ui.displayFace}>Consultation history</h3>
                <div className="space-y-2">
                  {selected.history.map((h: any) => (
                    <div key={h._id} className="p-3 rounded-[10px] border border-[var(--hairline)]">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm text-slate-800">{h.area}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border capitalize ${statusStyle[h.status]}`}>
                          {h.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {h.appointmentDate ? `${h.appointmentDate} ${h.appointmentTime || ''}` : `requested ${fmt(h.createdAt)}`}
                        {h.amount > 0 && ` · ₹${h.amount.toLocaleString('en-IN')} ${h.paymentStatus}`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Born {h.dob} {h.tob} · {h.pob}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end px-5 py-4 border-t border-[var(--hairline)]">
              <button onClick={() => setSelected(null)}
                className={ui.btnQuiet}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default Customers

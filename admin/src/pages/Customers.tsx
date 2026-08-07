import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Search, AlertCircle, Mail, Phone, X, RefreshCw, Users, Repeat, IndianRupee,
} from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { listCustomers, type Customer } from '../utils/meenakshiApi'

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-[rgba(212,83,29,0.35)] focus:border-[#d4531d] transition'

const statusStyle: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

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
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 transition" title="Refresh">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.tone}`}>{t.icon}</div>
            <p className="text-xl font-semibold text-slate-800 mt-3">{t.value}</p>
            <p className="text-xs text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className={`${inputCls} pl-9`} placeholder="Name, contact or area…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">No customers yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          {items.map((c, i) => (
            <button key={c.key} onClick={() => setSelected(c)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition ${i ? 'border-t border-slate-100' : ''}`}>
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
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-800">{selected.name}</h2>
                <p className="text-xs text-slate-500">{selected.contact}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition" aria-label="Close">
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
                  <div key={String(label)} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
                    <p className="text-sm text-slate-800 mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Consultation history</h3>
                <div className="space-y-2">
                  {selected.history.map((h: any) => (
                    <div key={h._id} className="p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm text-slate-800">{h.area}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${statusStyle[h.status]}`}>
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

            <div className="flex justify-end px-5 py-4 border-t border-slate-100">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default Customers

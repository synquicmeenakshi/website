import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2, AlertCircle, RefreshCw, ArrowRight, Mail, Phone,
  CalendarCheck, Clock, CheckCircle2, XCircle,
  Sparkles, Quote, HelpCircle, Footprints, Scale, Settings2,
} from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { listConsultations, listItems, type Consultation } from '../utils/meenakshiApi'

const statusStyle: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

const fmt = (iso: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<Consultation[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [content, setContent] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listConsultations({})
      setItems(res.data || [])
      setCounts(res.byStatus || {})

      // Content counts are informational — a failure here must not blank the page.
      const names = ['services', 'testimonials', 'faqs', 'journey', 'legal'] as const
      const results = await Promise.allSettled(names.map((n) => listItems(n)))
      const next: Record<string, number> = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') next[names[i]] = r.value?.data?.length ?? 0
      })
      setContent(next)
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const total = items.length

  const tiles = [
    { key: 'new', label: 'New', value: counts.new || 0, icon: <Clock className="w-5 h-5" />, tone: 'text-amber-600 bg-amber-50' },
    { key: 'confirmed', label: 'Confirmed', value: counts.confirmed || 0, icon: <CalendarCheck className="w-5 h-5" />, tone: 'text-emerald-600 bg-emerald-50' },
    { key: 'completed', label: 'Completed', value: counts.completed || 0, icon: <CheckCircle2 className="w-5 h-5" />, tone: 'text-slate-600 bg-slate-100' },
    { key: 'cancelled', label: 'Cancelled', value: counts.cancelled || 0, icon: <XCircle className="w-5 h-5" />, tone: 'text-red-600 bg-red-50' },
  ]

  const contentLinks = [
    { label: 'Services', count: content.services, path: '/m/services', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Testimonials', count: content.testimonials, path: '/m/testimonials', icon: <Quote className="w-4 h-4" /> },
    { label: 'FAQ', count: content.faqs, path: '/m/faq', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Journey', count: content.journey, path: '/m/journey', icon: <Footprints className="w-4 h-4" /> },
    { label: 'Legal Pages', count: content.legal, path: '/m/legal', icon: <Scale className="w-4 h-4" /> },
    { label: 'Site Settings', count: undefined, path: '/m/settings', icon: <Settings2 className="w-4 h-4" /> },
  ]

  const recent = items.slice(0, 8)

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Consultation requests and site content"
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

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-16 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl p-5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md shadow-[#DFB13B]/20">
            <p className="text-white/80 text-xs uppercase tracking-wider font-semibold">Meenakshi</p>
            <h2 className="text-xl font-semibold mt-0.5">
              {counts.new
                ? `${counts.new} new request${counts.new === 1 ? '' : 's'} waiting`
                : 'No new requests right now'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {total} consultation{total === 1 ? '' : 's'} in total.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiles.map((t) => (
              <button
                key={t.key}
                onClick={() => navigate('/consultations')}
                className="text-left bg-white rounded-xl border border-slate-200/80 p-4 hover:border-[#DFB13B]/50 hover:shadow-sm transition"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.tone}`}>{t.icon}</div>
                <p className="text-2xl font-semibold text-slate-800 mt-3">{t.value}</p>
                <p className="text-xs text-slate-500">{t.label}</p>
              </button>
            ))}
          </div>

          <section className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Recent requests</h3>
              <button
                onClick={() => navigate('/consultations')}
                className="text-xs font-medium text-[#C9A032] hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recent.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-slate-500">No consultation requests yet.</p>
                <p className="text-xs text-slate-400 mt-1">
                  They appear here as soon as someone submits the booking form.
                </p>
              </div>
            ) : (
              recent.map((c, i) => (
                <button
                  key={c._id}
                  onClick={() => navigate('/consultations')}
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
                  <span className="text-[11px] text-slate-400 shrink-0 pt-0.5">{fmt(c.createdAt)}</span>
                </button>
              ))
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Site content</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {contentLinks.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/80 p-4 hover:border-[#DFB13B]/50 hover:shadow-sm transition text-left"
                >
                  <span className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    {l.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800 truncate">{l.label}</span>
                    {l.count !== undefined && (
                      <span className="block text-xs text-slate-400">{l.count} item{l.count === 1 ? '' : 's'}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  )
}

export default Dashboard

import { useState, useEffect } from 'react'
import { Loader2, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import { getSettings, saveSettings } from '../utils/meenakshiApi'

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-[rgba(212,83,29,0.35)] focus:border-[#d4531d] transition'

const btnGold =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ' +
  'bg-[var(--saffron)] ' +
  'hover:opacity-95 disabled:opacity-50 transition'

const Card = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <section className="bg-white rounded-xl border border-slate-200/80 p-5">
    <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
    {hint && <p className="text-xs text-slate-400 mt-0.5 mb-3">{hint}</p>}
    <div className={hint ? '' : 'mt-3'}>{children}</div>
  </section>
)

/** Editable list of plain strings. */
const StringList = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => (
  <div className="space-y-2">
    {(value || []).map((v, i) => (
      <div key={i} className="flex gap-2">
        <input className={inputCls} value={v}
          onChange={(e) => { const n = [...value]; n[i] = e.target.value; onChange(n) }} />
        <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
          className="px-2 rounded-lg text-red-500 hover:bg-red-50 transition" aria-label="Remove">
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
    <button type="button" onClick={() => onChange([...(value || []), ''])}
      className="text-sm text-[#ad3f15] hover:underline font-medium">+ Add</button>
  </div>
)

/** Editable list of objects with a fixed set of string keys. */
const ObjectList = ({
  value, onChange, keys,
}: { value: any[]; onChange: (v: any[]) => void; keys: { key: string; label: string; textarea?: boolean }[] }) => (
  <div className="space-y-3">
    {(value || []).map((row, i) => (
      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
        <div className="flex justify-end">
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="text-red-500 hover:bg-red-50 rounded p-1 transition" aria-label="Remove">
            <X className="w-4 h-4" />
          </button>
        </div>
        {keys.map((k) => (
          <div key={k.key}>
            <label className="block text-xs font-medium text-slate-500 mb-1">{k.label}</label>
            {k.textarea ? (
              <textarea className={inputCls} rows={2} value={row[k.key] ?? ''}
                onChange={(e) => { const n = [...value]; n[i] = { ...row, [k.key]: e.target.value }; onChange(n) }} />
            ) : (
              <input className={inputCls} value={row[k.key] ?? ''}
                onChange={(e) => { const n = [...value]; n[i] = { ...row, [k.key]: e.target.value }; onChange(n) }} />
            )}
          </div>
        ))}
      </div>
    ))}
    <button type="button"
      onClick={() => onChange([...(value || []), keys.reduce((a, k) => ({ ...a, [k.key]: '' }), {})])}
      className="text-sm text-[#ad3f15] hover:underline font-medium">+ Add</button>
  </div>
)

const MeenakshiSettings = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await getSettings()
        setData(res.data)
      } catch (e: any) {
        setError(e.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const set = (patch: any) => setData((d: any) => ({ ...d, ...patch }))
  const setBrand = (patch: any) => setData((d: any) => ({ ...d, brand: { ...d.brand, ...patch } }))

  const save = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      await saveSettings(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminShell title="Site Settings">
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      </AdminShell>
    )
  }

  if (!data) {
    return (
      <AdminShell title="Site Settings">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error || 'No settings found.'}</span>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title="Site Settings"
      subtitle="Brand details and the trust markers repeated across the site"
      actions={
        <button onClick={save} disabled={saving} className={btnGold}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" />
            : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
        </button>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 max-w-3xl">
        <Card title="Brand">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['name', 'Name'], ['tag', 'Tagline'], ['email', 'Email'], ['phone', 'Phone (display)'],
              ['phoneHref', 'Phone (tel: link)'], ['whatsapp', 'WhatsApp URL'], ['instagram', 'Instagram URL'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                <input className={inputCls} value={data.brand?.[key] ?? ''}
                  onChange={(e) => setBrand({ [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-500 mb-1">Roles</label>
            <StringList value={data.brand?.roles || []} onChange={(roles) => setBrand({ roles })} />
          </div>
        </Card>

        <Card title="Proof stats" hint="The counters shown as trust markers">
          <ObjectList value={data.proof || []} onChange={(proof) => set({ proof })}
            keys={[{ key: 'value', label: 'Value' }, { key: 'label', label: 'Label' }, { key: 'deva', label: 'Devanagari' }]} />
        </Card>

        <Card title="Assurances" hint="The short reassurance strip">
          <StringList value={data.assurances || []} onChange={(assurances) => set({ assurances })} />
        </Card>

        <Card title="Marquee" hint="The scrolling discipline names">
          <StringList value={data.marquee || []} onChange={(marquee) => set({ marquee })} />
        </Card>

        <Card title="Consultation areas" hint="Options in the booking form's dropdown">
          <StringList value={data.consultAreas || []} onChange={(consultAreas) => set({ consultAreas })} />
        </Card>

        <Card title="Lineages" hint="The traditions practised within">
          <ObjectList value={data.lineages || []} onChange={(lineages) => set({ lineages })}
            keys={[
              { key: 'n', label: 'Numeral' }, { key: 'name', label: 'Name' }, { key: 'deva', label: 'Devanagari' },
              { key: 'note', label: 'Note' }, { key: 'answers', label: 'Answers', textarea: true },
            ]} />
        </Card>

        <Card title="Why choose her">
          <ObjectList value={data.why || []} onChange={(why) => set({ why })}
            keys={[{ key: 'n', label: 'Numeral' }, { key: 'title', label: 'Title' }, { key: 'body', label: 'Body', textarea: true }]} />
        </Card>

        <Card title="Code of ethics">
          <ObjectList value={data.ethics || []} onChange={(ethics) => set({ ethics })}
            keys={[{ key: 'heading', label: 'Heading' }, { key: 'body', label: 'Body', textarea: true }]} />
        </Card>

        <Card title="Booking policy" hint="Shown alongside the booking form">
          <ObjectList value={data.policy || []} onChange={(policy) => set({ policy })}
            keys={[{ key: 'heading', label: 'Heading' }, { key: 'body', label: 'Body', textarea: true }]} />
        </Card>

        <Card title="What's included" hint="The reassurance strip on the booking page">
          <ObjectList value={data.included || []} onChange={(included) => set({ included })}
            keys={[{ key: 'heading', label: 'Heading' }, { key: 'body', label: 'Body' }]} />
        </Card>
      </div>
    </AdminShell>
  )
}

export default MeenakshiSettings

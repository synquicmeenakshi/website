import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Edit2, Trash2, X, Save, Loader2, Eye, EyeOff, Search,
  ArrowUp, ArrowDown, AlertCircle,
} from 'lucide-react'
import AdminShell from './AdminShell'
import {
  listItems, createItem, updateItem, deleteItem, reorderItems,
  type CollectionName,
} from '../utils/meenakshiApi'

/* ---- field specification -------------------------------------------------- */

export type FieldSpec = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'stringList' | 'sectionList' | 'select'
  hint?: string
  rows?: number
  options?: string[]
  /** Hide from the create/edit form but keep in the payload. */
  hidden?: boolean
}

interface Props {
  collection: CollectionName
  title: string
  subtitle?: string
  /** Fields rendered in the modal form. */
  fields: FieldSpec[]
  /** Columns shown in the list; falls back to the first two fields. */
  listKeys?: string[]
  /** Optional grouping label shown as a row heading. */
  groupKey?: string
  emptyItem: Record<string, any>
  /** Human label for one row, used in the delete confirmation. */
  labelOf: (item: any) => string
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-[rgba(212,83,29,0.35)] focus:border-[#d4531d] transition'

const btnGold =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ' +
  'bg-[var(--saffron)] ' +
  'hover:opacity-95 disabled:opacity-50 transition'

/* ---- sub-editors ---------------------------------------------------------- */

const StringListEditor = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => (
  <div className="space-y-2">
    {(value || []).map((v, i) => (
      <div key={i} className="flex gap-2">
        <input
          className={inputCls}
          value={v}
          onChange={(e) => {
            const next = [...value]
            next[i] = e.target.value
            onChange(next)
          }}
        />
        <button
          type="button"
          onClick={() => onChange(value.filter((_, j) => j !== i))}
          className="px-2 rounded-lg text-red-500 hover:bg-red-50 transition"
          aria-label="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...(value || []), ''])}
      className="text-sm text-[#ad3f15] hover:underline font-medium"
    >
      + Add item
    </button>
  </div>
)

type Section = { heading: string; paragraphs: string[] }

const SectionListEditor = ({ value, onChange }: { value: Section[]; onChange: (v: Section[]) => void }) => (
  <div className="space-y-4">
    {(value || []).map((s, i) => (
      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="Section heading"
            value={s.heading}
            onChange={(e) => {
              const next = [...value]
              next[i] = { ...s, heading: e.target.value }
              onChange(next)
            }}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="px-2 rounded-lg text-red-500 hover:bg-red-50 transition"
            aria-label="Remove section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <StringListEditor
          value={s.paragraphs}
          onChange={(paragraphs) => {
            const next = [...value]
            next[i] = { ...s, paragraphs }
            onChange(next)
          }}
        />
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...(value || []), { heading: '', paragraphs: [''] }])}
      className="text-sm text-[#ad3f15] hover:underline font-medium"
    >
      + Add section
    </button>
  </div>
)

/* ---- main ----------------------------------------------------------------- */

const CollectionEditor = ({
  collection, title, subtitle, fields, listKeys, groupKey, emptyItem, labelOf,
}: Props) => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<Record<string, any>>(emptyItem)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listItems(collection)
      setItems(res.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [collection])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...emptyItem }); setShowModal(true) }
  const openEdit = (item: any) => { setEditing(item); setForm({ ...emptyItem, ...item }); setShowModal(true) }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const payload: Record<string, any> = {}
      for (const f of fields) payload[f.key] = form[f.key]
      if ('isActive' in emptyItem) payload.isActive = form.isActive

      if (editing) await updateItem(collection, editing._id, payload)
      else await createItem(collection, payload)

      setShowModal(false)
      await load()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: any) => {
    if (!window.confirm(`Delete "${labelOf(item)}"? This cannot be undone.`)) return
    try {
      await deleteItem(collection, item._id)
      await load()
    } catch (e: any) {
      setError(e.message || 'Delete failed')
    }
  }

  const toggleActive = async (item: any) => {
    try {
      await updateItem(collection, item._id, { isActive: !item.isActive })
      await load()
    } catch (e: any) {
      setError(e.message || 'Update failed')
    }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
    try {
      await reorderItems(collection, next.map((i) => i._id))
    } catch (e: any) {
      setError(e.message || 'Reorder failed')
      await load()
    }
  }

  const cols = listKeys && listKeys.length ? listKeys : fields.slice(0, 2).map((f) => f.key)

  const visible = items.filter((it) => {
    if (!search.trim()) return true
    const hay = JSON.stringify(it).toLowerCase()
    return hay.includes(search.toLowerCase())
  })

  return (
    <AdminShell
      title={title}
      subtitle={subtitle}
      actions={
        <button onClick={openCreate} className={btnGold}>
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New</span>
        </button>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputCls} pl-9`}
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">Nothing here yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          {visible.map((item, i) => (
            <div
              key={item._id}
              className={`flex items-start gap-3 px-4 py-3 ${i ? 'border-t border-slate-100' : ''} ${
                item.isActive === false ? 'opacity-50' : ''
              }`}
            >
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30 transition" aria-label="Move up">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === visible.length - 1}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30 transition" aria-label="Move down">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                {groupKey && item[groupKey] && (
                  <p className="text-[11px] uppercase tracking-wider text-[#ad3f15] font-semibold mb-0.5">
                    {item[groupKey]}
                  </p>
                )}
                <p className="text-sm font-medium text-slate-800 truncate">{String(item[cols[0]] ?? '')}</p>
                {cols[1] && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {Array.isArray(item[cols[1]]) ? item[cols[1]].join(' · ') : String(item[cols[1]] ?? '')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {'isActive' in emptyItem && (
                  <button onClick={() => toggleActive(item)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition"
                    title={item.isActive ? 'Hide from site' : 'Show on site'}>
                    {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
                <button onClick={() => openEdit(item)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => remove(item)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-base font-semibold text-slate-800">
                {editing ? 'Edit' : 'New'} — {title}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition" aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {fields.filter((f) => !f.hidden).map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>

                  {f.type === 'textarea' ? (
                    <textarea className={inputCls} rows={f.rows || 3}
                      value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  ) : f.type === 'boolean' ? (
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" className="w-4 h-4 accent-[#d4531d]"
                        checked={Boolean(form[f.key])}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                      Enabled
                    </label>
                  ) : f.type === 'number' ? (
                    <input type="number" className={inputCls}
                      value={form[f.key] ?? 0}
                      onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })} />
                  ) : f.type === 'select' ? (
                    <select className={inputCls} value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'stringList' ? (
                    <StringListEditor value={form[f.key] || []}
                      onChange={(v) => setForm({ ...form, [f.key]: v })} />
                  ) : f.type === 'sectionList' ? (
                    <SectionListEditor value={form[f.key] || []}
                      onChange={(v) => setForm({ ...form, [f.key]: v })} />
                  ) : (
                    <input className={inputCls} value={form[f.key] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                  )}

                  {f.hint && <p className="text-xs text-slate-400 mt-1">{f.hint}</p>}
                </div>
              ))}

              {'isActive' in emptyItem && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="w-4 h-4 accent-[#d4531d]"
                    checked={form.isActive !== false}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  Visible on the site
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)}
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
      )}
    </AdminShell>
  )
}

export default CollectionEditor

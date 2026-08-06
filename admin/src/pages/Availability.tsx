import { useState, useEffect, useCallback } from 'react'
import { Loader2, Save, X, AlertCircle, CheckCircle2, Plus, Trash2, CalendarOff } from 'lucide-react'
import AdminShell from '../components/AdminShell'
import {
  getAvailability, saveAvailability, listBlocked, createBlocked, deleteBlocked,
} from '../utils/meenakshiApi'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/40 focus:border-[#DFB13B] transition'

const btnGold =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ' +
  'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] shadow-md shadow-[#DFB13B]/25 ' +
  'hover:opacity-95 disabled:opacity-50 transition'

const Availability = () => {
  const [settings, setSettings] = useState<any>(null)
  const [blocked, setBlocked] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [newBlock, setNewBlock] = useState({ date: '', reason: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, b] = await Promise.all([getAvailability(), listBlocked()])
      setSettings(s.data)
      setBlocked(b.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setDay = (day: string, patch: any) =>
    setSettings((s: any) => ({
      ...s,
      weeklySchedule: { ...s.weeklySchedule, [day]: { ...s.weeklySchedule[day], ...patch } },
    }))

  const save = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      await saveAvailability(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const addBlock = async () => {
    if (!newBlock.date) return
    try {
      await createBlocked({ date: newBlock.date, isFullDay: true, reason: newBlock.reason })
      setNewBlock({ date: '', reason: '' })
      await load()
    } catch (e: any) {
      setError(e.message || 'Could not block that date')
    }
  }

  const removeBlock = async (id: string) => {
    try { await deleteBlocked(id); await load() } catch (e: any) { setError(e.message) }
  }

  if (loading || !settings) {
    return (
      <AdminShell title="Availability">
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title="Availability"
      subtitle="Which slots the booking page offers"
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
        <section className="bg-white rounded-xl border border-slate-200/80 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Booking window</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Lead time (days)</label>
              <input type="number" className={inputCls} value={settings.leadTimeDays ?? 4}
                onChange={(e) => setSettings({ ...settings, leadTimeDays: Number(e.target.value) })} />
              <p className="text-xs text-slate-400 mt-1">Earliest bookable day, counted from today.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Horizon (days)</label>
              <input type="number" className={inputCls} value={settings.horizonDays ?? 60}
                onChange={(e) => setSettings({ ...settings, horizonDays: Number(e.target.value) })} />
              <p className="text-xs text-slate-400 mt-1">How far ahead the calendar opens.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slot length (minutes)</label>
              <input type="number" className={inputCls} value={settings.slotMinutes ?? 60}
                onChange={(e) => setSettings({ ...settings, slotMinutes: Number(e.target.value) })} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200/80 p-5">
          <h2 className="text-sm font-semibold text-slate-800">Weekly schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">
            Times are 24-hour, in {settings.timezone || 'Asia/Kolkata'}.
          </p>

          <div className="space-y-3">
            {DAYS.map((day) => {
              const d = settings.weeklySchedule?.[day] || { isWorking: false, slots: [] }
              return (
                <div key={day} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 capitalize">
                      <input type="checkbox" className="w-4 h-4 accent-[#DFB13B]"
                        checked={Boolean(d.isWorking)}
                        onChange={(e) => setDay(day, { isWorking: e.target.checked })} />
                      {day}
                    </label>
                    {d.isWorking && (
                      <button type="button"
                        onClick={() => setDay(day, { slots: [...(d.slots || []), ''] })}
                        className="text-xs text-[#C9A032] hover:underline font-medium">
                        + Add slot
                      </button>
                    )}
                  </div>

                  {d.isWorking ? (
                    <div className="flex flex-wrap gap-2">
                      {(d.slots || []).map((t: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          <input type="time" className="px-2 py-1 rounded-md border border-slate-200 text-sm"
                            value={t}
                            onChange={(e) => {
                              const slots = [...d.slots]; slots[i] = e.target.value
                              setDay(day, { slots })
                            }} />
                          <button type="button"
                            onClick={() => setDay(day, { slots: d.slots.filter((_: any, j: number) => j !== i) })}
                            className="text-red-500 hover:bg-red-50 rounded p-1 transition" aria-label="Remove slot">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                      {!d.slots?.length && <span className="text-xs text-slate-400">No slots — this day will show as closed.</span>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Closed</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200/80 p-5">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-slate-400" /> Blocked dates
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">Holidays and days off. Saved immediately.</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <input type="date" className={`${inputCls} w-auto`} value={newBlock.date}
              onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })} />
            <input className={`${inputCls} w-auto flex-1 min-w-[10rem]`} placeholder="Reason (optional)"
              value={newBlock.reason}
              onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })} />
            <button onClick={addBlock} disabled={!newBlock.date} className={btnGold}>
              <Plus className="w-4 h-4" /> Block
            </button>
          </div>

          {blocked.length === 0 ? (
            <p className="text-sm text-slate-500">No blocked dates.</p>
          ) : (
            <div className="space-y-1">
              {blocked.map((b) => (
                <div key={b._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-700">
                    {b.date}
                    {b.reason && <span className="text-slate-400"> — {b.reason}</span>}
                  </span>
                  <button onClick={() => removeBlock(b._id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition" aria-label="Unblock">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

export default Availability

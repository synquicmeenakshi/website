import { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Trash2, X, Loader2, CalendarOff, CalendarCheck, Menu, AlertCircle, ToggleLeft, ToggleRight, Clock, Save, Clock3, Settings2, CalendarDays, Edit3, ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL } from '../config/api'
import { formatBelgiumDate, getBelgiumDayOfWeek, getBelgiumTodayStr, getBelgiumDateStr } from '../utils/timezone'

interface DaySchedule {
  isWorking: boolean
  timeSlots: string[]
}

interface WeeklySchedule {
  sunday: DaySchedule
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
}

interface BookingSettings {
  _id: string
  timeSlots: string[]
  weeklySchedule: WeeklySchedule
  minAdvanceBooking: number
  maxAdvanceBooking: number
  isBookingEnabled: boolean
}

interface BlockedDate {
  _id: string
  date: string
  reason: string
  isActive: boolean
  isFullDayBlocked: boolean
  blockedTimeSlots: string[]
  createdAt: string
}

type DayName = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

const DAYS: { key: DayName; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
]

const BookingManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'schedule' | 'blocked'>('schedule')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [editingDay, setEditingDay] = useState<DayName | null>(null)
  const [editingDaySlots, setEditingDaySlots] = useState<string[]>([])
  const [editingDayWorking, setEditingDayWorking] = useState(true)
  const [newSlot, setNewSlot] = useState('')
  const [minAdvanceHours, setMinAdvanceHours] = useState<number>(0)
  const [savingAdvance, setSavingAdvance] = useState(false)

  // Blocked dates state
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blockType, setBlockType] = useState<'full' | 'slots'>('full')
  const [blockMode, setBlockMode] = useState<'single' | 'range'>('single')
  const [blockEndDate, setBlockEndDate] = useState('')
  const [selectedBlockSlots, setSelectedBlockSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPastDates, setShowPastDates] = useState(false)

  // Filter state for blocked dates
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [activeRange, setActiveRange] = useState<string | null>(null)
  const [openPicker, setOpenPicker] = useState<'from' | 'to' | null>(null)
  const [pickerMonth, setPickerMonth] = useState(new Date())
  const pickerRef = useRef<HTMLDivElement>(null)

  // Filter state for past blocked dates
  const [pastFilterFrom, setPastFilterFrom] = useState('')
  const [pastFilterTo, setPastFilterTo] = useState('')
  const [pastActiveRange, setPastActiveRange] = useState<string | null>(null)
  const [pastOpenPicker, setPastOpenPicker] = useState<'from' | 'to' | null>(null)
  const [pastPickerMonth, setPastPickerMonth] = useState(new Date())
  const pastPickerRef = useRef<HTMLDivElement>(null)

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/settings`)
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
        setMinAdvanceHours(data.data.minAdvanceBooking || 0)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Save minimum advance booking hours
  const handleSaveAdvanceBooking = async () => {
    setSavingAdvance(true)
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minAdvanceBooking: minAdvanceHours })
      })
      const data = await response.json()
      if (data.success) {
        setSettings(prev => prev ? { ...prev, minAdvanceBooking: minAdvanceHours } : prev)
        alert('Advance booking setting saved successfully!')
      } else {
        alert(data.message || 'Failed to save setting')
      }
    } catch (error) {
      console.error('Error saving advance booking:', error)
      alert('Failed to save setting')
    } finally {
      setSavingAdvance(false)
    }
  }

  // Fetch blocked dates
  const fetchBlockedDates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates`)
      const data = await response.json()
      if (data.success) {
        setBlockedDates(data.data)
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchSettings(), fetchBlockedDates()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Close picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPicker(null)
      }
    }
    if (openPicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openPicker])

  // Close past picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pastPickerRef.current && !pastPickerRef.current.contains(e.target as Node)) {
        setPastOpenPicker(null)
      }
    }
    if (pastOpenPicker) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pastOpenPicker])

  // Open picker for a field
  const handleOpenPicker = (field: 'from' | 'to') => {
    const current = field === 'from' ? filterFrom : filterTo
    if (current) {
      setPickerMonth(new Date(current + 'T00:00:00'))
    } else {
      setPickerMonth(new Date())
    }
    setOpenPicker(field)
  }

  // Select a date from the picker
  const handlePickDate = (dateStr: string) => {
    if (openPicker === 'from') setFilterFrom(dateStr)
    else if (openPicker === 'to') setFilterTo(dateStr)
    setOpenPicker(null)
    setActiveRange(null) // custom pick clears the range tab
  }

  // Quick range selection — Belgium dates
  const handleQuickRange = (days: number, label: string) => {
    const fromStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())
    const end = new Date(fromStr + 'T12:00:00Z')
    end.setUTCDate(end.getUTCDate() + days)
    const toStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(end)
    setFilterFrom(fromStr)
    setFilterTo(toStr)
    setActiveRange(label)
    setOpenPicker(null)
  }

  // Clear all filters
  const handleClearFilter = () => {
    setFilterFrom('')
    setFilterTo('')
    setActiveRange(null)
    setOpenPicker(null)
  }

  // Past filter handlers
  const handleOpenPastPicker = (field: 'from' | 'to') => {
    const current = field === 'from' ? pastFilterFrom : pastFilterTo
    if (current) {
      setPastPickerMonth(new Date(current + 'T00:00:00'))
    } else {
      setPastPickerMonth(new Date())
    }
    setPastOpenPicker(field)
  }

  const handlePickPastDate = (dateStr: string) => {
    if (pastOpenPicker === 'from') setPastFilterFrom(dateStr)
    else if (pastOpenPicker === 'to') setPastFilterTo(dateStr)
    setPastOpenPicker(null)
    setPastActiveRange(null)
  }

  const handlePastQuickRange = (days: number, label: string) => {
    const todayBelgium = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())
    const yesterday = new Date(todayBelgium + 'T12:00:00Z')
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const toStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(yesterday)
    const start = new Date(todayBelgium + 'T12:00:00Z')
    start.setUTCDate(start.getUTCDate() - days)
    const fromStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(start)
    setPastFilterFrom(fromStr)
    setPastFilterTo(toStr)
    setPastActiveRange(label)
    setPastOpenPicker(null)
  }

  const handleClearPastFilter = () => {
    setPastFilterFrom('')
    setPastFilterTo('')
    setPastActiveRange(null)
    setPastOpenPicker(null)
  }

  // Format YYYY-MM-DD to readable string — always Belgium calendar
  const formatFilterDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr + 'T12:00:00Z'))
  }

  // Handle editing a day's schedule
  const handleEditDay = (day: DayName) => {
    if (!settings) return
    setEditingDay(day)
    setEditingDaySlots([...settings.weeklySchedule[day].timeSlots])
    setEditingDayWorking(settings.weeklySchedule[day].isWorking)
  }

  // Save day schedule
  const handleSaveDaySchedule = async () => {
    if (!editingDay || !settings) return

    setSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/settings/day/${editingDay}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isWorking: editingDayWorking,
          timeSlots: editingDaySlots
        })
      })
      const data = await response.json()

      if (data.success) {
        // Update local state
        setSettings(prev => {
          if (!prev) return prev
          return {
            ...prev,
            weeklySchedule: {
              ...prev.weeklySchedule,
              [editingDay]: {
                isWorking: editingDayWorking,
                timeSlots: editingDaySlots
              }
            }
          }
        })
        setEditingDay(null)
      } else {
        alert(data.message || 'Failed to save schedule')
      }
    } catch (error) {
      console.error('Error saving day schedule:', error)
      alert('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  // Add time slot to editing day
  const handleAddSlotToDay = () => {
    if (newSlot && !editingDaySlots.includes(newSlot)) {
      // Sort slots by time
      const allSlots = [...editingDaySlots, newSlot].sort((a, b) => {
        const timeToMinutes = (t: string) => {
          const [h, m] = t.split(':').map(Number)
          return (h < 7 ? h + 12 : h) * 60 + m
        }
        return timeToMinutes(a) - timeToMinutes(b)
      })
      setEditingDaySlots(allSlots)
      setNewSlot('')
    }
  }

  // Remove time slot from editing day
  const handleRemoveSlotFromDay = (slot: string) => {
    setEditingDaySlots(editingDaySlots.filter(s => s !== slot))
  }

  // Generate array of YYYY-MM-DD strings between two dates (inclusive)
  const getDateRange = (startStr: string, endStr: string): string[] => {
    const dates: string[] = []
    const current = new Date(startStr + 'T00:00:00')
    const end = new Date(endStr + 'T00:00:00')
    while (current <= end) {
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, '0')
      const d = String(current.getDate()).padStart(2, '0')
      dates.push(`${y}-${m}-${d}`)
      current.setDate(current.getDate() + 1)
    }
    return dates
  }

  // Block date handlers
  const handleBlockDate = async () => {
    if (!selectedDate) return
    if (blockMode === 'range' && !blockEndDate) return

    setSubmitting(true)
    try {
      const datesToBlock = blockMode === 'range'
        ? getDateRange(selectedDate, blockEndDate)
        : [selectedDate]

      let successCount = 0
      let failCount = 0

      for (const dateStr of datesToBlock) {
        const payload: { date: string; reason: string; blockedTimeSlots?: string[] } = {
          date: dateStr,
          reason: blockReason
        }

        if (blockMode === 'single' && blockType === 'slots' && selectedBlockSlots.length > 0) {
          payload.blockedTimeSlots = selectedBlockSlots
        }

        try {
          const response = await fetch(`${API_BASE_URL}/blocked-dates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          const data = await response.json()
          if (data.success) successCount++
          else failCount++
        } catch {
          failCount++
        }
      }

      await fetchBlockedDates()
      setShowBlockModal(false)
      setSelectedDate('')
      setBlockEndDate('')
      setBlockReason('')
      setBlockType('full')
      setBlockMode('single')
      setSelectedBlockSlots([])

      if (failCount > 0 && successCount > 0) {
        alert(`Blocked ${successCount} date(s). ${failCount} date(s) failed (may already be blocked).`)
      } else if (failCount > 0 && successCount === 0) {
        alert('Failed to block dates. They may already be blocked.')
      }
    } catch (error) {
      console.error('Error blocking date:', error)
      alert('Failed to block date')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleBlock = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/${id}/toggle`, {
        method: 'PUT'
      })
      const data = await response.json()

      if (data.success) {
        setBlockedDates(prev =>
          prev.map(bd => bd._id === id ? { ...bd, isActive: !bd.isActive } : bd)
        )
      }
    } catch (error) {
      console.error('Error toggling blocked date:', error)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setBlockedDates(prev => prev.filter(bd => bd._id !== id))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting blocked date:', error)
    }
  }

  const handleRemoveBlockedSlot = async (id: string, slot: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/${id}/slot/${encodeURIComponent(slot)}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        await fetchBlockedDates()
      }
    } catch (error) {
      console.error('Error removing time slot:', error)
    }
  }

  const toggleBlockSlotSelection = (slot: string) => {
    if (selectedBlockSlots.includes(slot)) {
      setSelectedBlockSlots(selectedBlockSlots.filter(s => s !== slot))
    } else {
      setSelectedBlockSlots([...selectedBlockSlots, slot])
    }
  }

  // Get time slots for selected date based on day of week (Belgium timezone)
  const getTimeSlotsForSelectedDate = () => {
    if (!selectedDate || !settings) return []
    // selectedDate is a YYYY-MM-DD string — day-of-week is a property of the calendar day itself
    const date = new Date(selectedDate + 'T12:00:00Z') // noon UTC anchors avoid DST edges
    const dayIndex = getBelgiumDayOfWeek(date)
    const dayNames: DayName[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dayIndex]
    return settings.weeklySchedule[dayName].timeSlots
  }

  const formatDate = (dateString: string) => {
    return formatBelgiumDate(dateString, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (dateString: string) => {
    return formatBelgiumDate(dateString, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Belgium "today" as YYYY-MM-DD — string comparison is timezone-safe
  const todayStr = getBelgiumTodayStr()

  // Split blocked dates into future and past using Belgium calendar days
  const { futureBlockedDates, pastBlockedDates } = useMemo(() => {
    const future: typeof blockedDates = []
    const past: typeof blockedDates = []
    blockedDates.forEach(bd => {
      const dStr = getBelgiumDateStr(bd.date)
      if (dStr < todayStr) past.push(bd)
      else future.push(bd)
    })
    return { futureBlockedDates: future, pastBlockedDates: past }
  }, [blockedDates, todayStr])

  // Filter blocked dates by date range (only future dates)
  const filteredBlockedDates = useMemo(() => {
    if (!filterFrom && !filterTo) return futureBlockedDates

    return futureBlockedDates.filter(bd => {
      const dStr = getBelgiumDateStr(bd.date)
      if (filterFrom && dStr < filterFrom) return false
      if (filterTo && dStr > filterTo) return false
      return true
    })
  }, [futureBlockedDates, filterFrom, filterTo])

  // Filter past blocked dates by date range
  const filteredPastBlockedDates = useMemo(() => {
    if (!pastFilterFrom && !pastFilterTo) return pastBlockedDates

    return pastBlockedDates.filter(bd => {
      const dStr = getBelgiumDateStr(bd.date)
      if (pastFilterFrom && dStr < pastFilterFrom) return false
      if (pastFilterTo && dStr > pastFilterTo) return false
      return true
    })
  }, [pastBlockedDates, pastFilterFrom, pastFilterTo])

  // Stats
  const workingDaysCount = settings ? Object.values(settings.weeklySchedule).filter(d => d.isWorking).length : 0
  const activeBlocksCount = blockedDates.filter(bd => bd.isActive).length
  const partialBlocksCount = blockedDates.filter(bd => !bd.isFullDayBlocked && bd.blockedTimeSlots.length > 0).length

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header - Modern Design */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 relative z-50">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Booking Management</h1>
                <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">Configure working hours, time slots & blocked dates</p>
              </div>
            </div>
            <button
              onClick={() => setShowBlockModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all font-medium shadow-sm text-xs sm:text-sm"
            >
              <CalendarOff className="w-4 h-4" />
              <span className="hidden sm:inline">Block Date</span>
            </button>
          </div>

          {/* Stats row - Compact on mobile, full cards on desktop */}
          {/* Mobile: Compact badges */}
          <div className="flex sm:hidden items-center gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-lg shrink-0">
              <span className="text-xs text-slate-500">Days</span>
              <span className="text-sm font-bold text-slate-800">{workingDaysCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg shrink-0">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span className="text-xs text-emerald-700">{settings ? Object.values(settings.weeklySchedule).reduce((acc, day) => acc + (day.isWorking ? day.timeSlots.length : 0), 0) : 0} slots</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 rounded-lg shrink-0">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span className="text-xs text-red-700">{activeBlocksCount} blocked</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 rounded-lg shrink-0">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              <span className="text-xs text-purple-700">{partialBlocksCount} partial</span>
            </div>
          </div>

          {/* Desktop: Modern gradient stat cards - Compact */}
          <div className="hidden sm:grid grid-cols-4 gap-3 mt-3">
            {/* Working Days Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{workingDaysCount}</p>
                  <p className="text-xs text-white/80">Working Days</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Time Slots Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {settings ? Object.values(settings.weeklySchedule).reduce((acc, day) => acc + (day.isWorking ? day.timeSlots.length : 0), 0) : 0}
                  </p>
                  <p className="text-xs text-white/80">Time Slots</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Active Blocks Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-400 via-red-500 to-rose-600 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{activeBlocksCount}</p>
                  <p className="text-xs text-white/80">Active Blocks</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <CalendarOff className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Partial Blocks Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-400 via-purple-500 to-violet-600 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{partialBlocksCount}</p>
                  <p className="text-xs text-white/80">Partial Blocks</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <Clock3 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-[#DFB13B] animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Loading booking settings...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Modern Tabs with Pill Design */}
              <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-6 w-fit">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'schedule'
                      ? 'bg-white text-slate-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Weekly</span> Schedule
                </button>
                <button
                  onClick={() => setActiveTab('blocked')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'blocked'
                      ? 'bg-white text-slate-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <CalendarOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Blocked</span> Dates
                  {activeBlocksCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      activeTab === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      {activeBlocksCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'schedule' ? (
                <div className="space-y-6">
                  {/* Advance Booking Settings - Modern Card */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl flex items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Advance Booking Settings</h3>
                        <p className="text-xs text-slate-500">Configure how far in advance users can book</p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Minimum Advance Booking (Hours)
                          </label>
                          <p className="text-xs text-slate-500 mb-3">
                            Users must book at least this many hours before the appointment time.
                            <span className="font-medium"> E.g., 48 hours means users can only book appointments that are at least 2 days away.</span>
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              max="720"
                              value={minAdvanceHours}
                              onChange={(e) => setMinAdvanceHours(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-32 px-4 py-2.5 border-2 border-slate-100 rounded-xl text-center text-lg font-semibold focus:outline-none focus:border-[#DFB13B] focus:shadow-lg focus:shadow-[#DFB13B]/10 transition-all"
                            />
                            <span className="text-slate-600 font-medium">hours</span>
                            <span className="text-slate-400 text-sm">
                              ({minAdvanceHours >= 24 ? `${Math.floor(minAdvanceHours / 24)} day${Math.floor(minAdvanceHours / 24) !== 1 ? 's' : ''}${minAdvanceHours % 24 > 0 ? ` ${minAdvanceHours % 24}h` : ''}` : `${minAdvanceHours}h`})
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleSaveAdvanceBooking}
                          disabled={savingAdvance || minAdvanceHours === settings?.minAdvanceBooking}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#DFB13B]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {savingAdvance ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Setting
                            </>
                          )}
                        </button>
                      </div>

                      {minAdvanceHours > 0 && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-[#DFB13B]/10 to-[#C9A032]/5 border border-[#DFB13B]/20 rounded-xl">
                          <p className="text-sm text-[#8B7B2A]">
                            <span className="font-semibold">Current setting:</span> Users can only book appointments that are at least <span className="font-bold">{minAdvanceHours} hours</span> ({minAdvanceHours >= 24 ? `${Math.floor(minAdvanceHours / 24)} day${Math.floor(minAdvanceHours / 24) !== 1 ? 's' : ''}` : `${minAdvanceHours} hours`}) from now.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weekly Schedule Tab - Modern Card */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Weekly Working Schedule</h3>
                      <p className="text-xs text-slate-500">Configure time slots for each day</p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {DAYS.map(({ key, label, short }) => {
                      const daySchedule = settings?.weeklySchedule[key]
                      const isEditing = editingDay === key

                      return (
                        <div key={key} className={`px-3 sm:px-6 py-3 sm:py-4 ${!daySchedule?.isWorking ? 'bg-slate-50/50' : ''}`}>
                          {isEditing ? (
                            /* Editing Mode */
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="font-semibold text-slate-800 text-sm sm:text-base">{label}</span>
                                  <button
                                    onClick={() => setEditingDayWorking(!editingDayWorking)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                                      editingDayWorking
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {editingDayWorking ? (
                                      <>
                                        <ToggleRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden xs:inline">Working</span>
                                      </>
                                    ) : (
                                      <>
                                        <ToggleLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden xs:inline">Day Off</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingDay(null)}
                                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveDaySchedule}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#DFB13B] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#C9A032] transition-colors disabled:opacity-50"
                                  >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    Save
                                  </button>
                                </div>
                              </div>

                              {editingDayWorking && (
                                <>
                                  {/* Current time slots */}
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {editingDaySlots.length === 0 ? (
                                      <p className="text-xs sm:text-sm text-amber-600">No time slots. Add at least one.</p>
                                    ) : (
                                      editingDaySlots.map((slot) => (
                                        <span
                                          key={slot}
                                          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs sm:text-sm font-medium"
                                        >
                                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                          {slot}
                                          <button
                                            onClick={() => handleRemoveSlotFromDay(slot)}
                                            className="ml-0.5 sm:ml-1 hover:text-red-500 transition-colors"
                                          >
                                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                          </button>
                                        </span>
                                      ))
                                    )}
                                  </div>

                                  {/* Add new slot */}
                                  <div className="flex gap-2 max-w-xs">
                                    <input
                                      type="text"
                                      value={newSlot}
                                      onChange={(e) => setNewSlot(e.target.value)}
                                      placeholder="e.g., 10:00"
                                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]"
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddSlotToDay()}
                                    />
                                    <button
                                      onClick={handleAddSlotToDay}
                                      disabled={!newSlot}
                                      className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                    >
                                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            /* Display Mode */
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-start gap-2 sm:gap-4 min-w-0 flex-1">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-sm sm:text-base shrink-0 ${
                                  daySchedule?.isWorking
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-500'
                                }`}>
                                  <span className="sm:hidden">{short}</span>
                                  <span className="hidden sm:inline">{label.slice(0, 2)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{label}</h4>
                                    {daySchedule?.isWorking ? (
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] sm:text-xs font-medium">
                                        Working
                                      </span>
                                    ) : (
                                      <span className="px-1.5 sm:px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] sm:text-xs font-medium">
                                        Off
                                      </span>
                                    )}
                                  </div>
                                  {daySchedule?.isWorking && daySchedule.timeSlots.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                                      {daySchedule.timeSlots.map((slot) => (
                                        <span
                                          key={slot}
                                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 text-slate-600 rounded text-[10px] sm:text-xs font-medium"
                                        >
                                          {slot}
                                        </span>
                                      ))}
                                    </div>
                                  ) : daySchedule?.isWorking ? (
                                    <p className="text-[10px] sm:text-sm text-amber-600 mt-1">No slots</p>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                onClick={() => handleEditDay(key)}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0"
                              >
                                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Edit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                </div>
              ) : (
                /* Blocked Dates Tab */
                <div className="space-y-6">
                {/* Upcoming Blocked Dates Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                        <CalendarOff className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Blocked Dates</h3>
                        <p className="text-xs text-slate-500">Dates when bookings not allowed</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                      {futureBlockedDates.length} upcoming
                    </span>
                  </div>

                  {/* Date Range Filter */}
                  {futureBlockedDates.length > 0 && (
                    <div className="px-4 sm:px-6 py-3 border-b border-slate-100 relative" ref={pickerRef}>
                      {/* Quick Range Tabs */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {[
                          { label: '7 Days', days: 7 },
                          { label: '15 Days', days: 15 },
                          { label: '30 Days', days: 30 },
                        ].map(({ label, days }) => (
                          <button
                            key={label}
                            onClick={() => handleQuickRange(days, label)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              activeRange === label
                                ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md shadow-[#DFB13B]/25'
                                : 'bg-slate-100 text-slate-600 hover:bg-[#DFB13B]/15 hover:text-[#8B7B2A]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}

                        {(filterFrom || filterTo) && (
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs font-medium text-slate-500">
                              {filteredBlockedDates.length} of {futureBlockedDates.length}
                            </span>
                            <button
                              onClick={handleClearFilter}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                            >
                              <X className="w-3 h-3" />
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Custom Date Range */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* From button */}
                        <button
                          onClick={() => handleOpenPicker('from')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                            filterFrom
                              ? 'bg-[#DFB13B]/10 border-[#DFB13B]/30 text-[#8B7B2A]'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-[#DFB13B]/40'
                          } ${openPicker === 'from' ? 'ring-2 ring-[#DFB13B]/30' : ''}`}
                        >
                          <CalendarDays className="w-4 h-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-wide">From:</span>
                          <span className="font-medium">{filterFrom ? formatFilterDate(filterFrom) : 'Select'}</span>
                        </button>

                        <span className="text-slate-300 text-sm">to</span>

                        {/* To button */}
                        <button
                          onClick={() => handleOpenPicker('to')}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                            filterTo
                              ? 'bg-[#DFB13B]/10 border-[#DFB13B]/30 text-[#8B7B2A]'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-[#DFB13B]/40'
                          } ${openPicker === 'to' ? 'ring-2 ring-[#DFB13B]/30' : ''}`}
                        >
                          <CalendarDays className="w-4 h-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-wide">To:</span>
                          <span className="font-medium">{filterTo ? formatFilterDate(filterTo) : 'Select'}</span>
                        </button>
                      </div>

                      {/* Custom Calendar Dropdown */}
                      {openPicker && (() => {
                        const viewYear = pickerMonth.getFullYear()
                        const viewMonthIdx = pickerMonth.getMonth()
                        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
                        const weekDays = ['Mo','Tu','We','Th','Fr','Sa','Su']
                        const daysInMonth = new Date(viewYear, viewMonthIdx + 1, 0).getDate()
                        let startDay = new Date(viewYear, viewMonthIdx, 1).getDay() - 1
                        if (startDay < 0) startDay = 6

                        const cells: (number | null)[] = []
                        for (let i = 0; i < startDay; i++) cells.push(null)
                        for (let d = 1; d <= daysInMonth; d++) cells.push(d)

                        const activeValue = openPicker === 'from' ? filterFrom : filterTo

                        return (
                          <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-[280px]">
                            {/* Month nav */}
                            <div className="flex items-center justify-between mb-3">
                              <button
                                onClick={() => setPickerMonth(new Date(viewYear, viewMonthIdx - 1, 1))}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <ChevronLeft className="w-4 h-4 text-slate-500" />
                              </button>
                              <span className="text-sm font-bold text-slate-800">{monthNames[viewMonthIdx]} {viewYear}</span>
                              <button
                                onClick={() => setPickerMonth(new Date(viewYear, viewMonthIdx + 1, 1))}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                              </button>
                            </div>

                            {/* Weekday headers */}
                            <div className="grid grid-cols-7 mb-1">
                              {weekDays.map(wd => (
                                <div key={wd} className="text-center text-[10px] font-semibold text-slate-400 py-1">{wd}</div>
                              ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-0.5">
                              {cells.map((day, idx) => {
                                if (day === null) return <div key={`e-${idx}`} className="w-8 h-8" />
                                const dateStr = `${viewYear}-${String(viewMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const isSelected = dateStr === activeValue
                                return (
                                  <button
                                    key={day}
                                    onClick={() => handlePickDate(dateStr)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-[#DFB13B] to-[#C9A032] text-white font-bold shadow-md shadow-[#DFB13B]/30'
                                        : 'text-slate-700 hover:bg-[#DFB13B]/10'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {futureBlockedDates.length === 0 && !filterFrom && !filterTo ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                        <CalendarCheck className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700 text-lg">No upcoming blocked dates</p>
                      <p className="text-sm text-slate-400 mt-1">All future dates follow the weekly schedule</p>
                      <button
                        onClick={() => setShowBlockModal(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all shadow-md"
                      >
                        <CalendarOff className="w-4 h-4" />
                        Block a Date
                      </button>
                    </div>
                  ) : filteredBlockedDates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                        <CalendarCheck className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-semibold text-slate-600">No blocked dates in this range</p>
                      <p className="text-sm text-slate-400 mt-1">Try adjusting the date range</p>
                      <button
                        onClick={handleClearFilter}
                        className="mt-3 text-sm text-red-500 hover:text-red-700 font-semibold"
                      >
                        Clear Filter
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredBlockedDates.map((blockedDate) => {
                        return (
                          <div
                            key={blockedDate._id}
                            className={`px-4 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors ${
                              !blockedDate.isActive ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center text-white font-semibold shadow-sm shrink-0 ${
                                  !blockedDate.isActive
                                    ? 'bg-slate-400'
                                    : blockedDate.isFullDayBlocked
                                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                }`}>
                                  <span className="text-[10px] uppercase tracking-wide opacity-90">
                                    {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', month: 'short' }).format(new Date(blockedDate.date))}
                                  </span>
                                  <span className="text-lg sm:text-xl font-bold -mt-0.5">
                                    {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', day: 'numeric' }).format(new Date(blockedDate.date))}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                                      {formatDate(blockedDate.date)}
                                    </h4>
                                    {blockedDate.isFullDayBlocked ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                                        Full Day
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                                        {blockedDate.blockedTimeSlots.length} Slot{blockedDate.blockedTimeSlots.length !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {!blockedDate.isActive && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                        Unblocked
                                      </span>
                                    )}
                                  </div>
                                  {blockedDate.reason && (
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                      Reason: {blockedDate.reason}
                                    </p>
                                  )}

                                  {!blockedDate.isFullDayBlocked && blockedDate.blockedTimeSlots.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {blockedDate.blockedTimeSlots.map((slot) => (
                                        <span
                                          key={slot}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium"
                                        >
                                          <Clock className="w-3 h-3" />
                                          {slot}
                                          <button
                                            onClick={() => handleRemoveBlockedSlot(blockedDate._id, slot)}
                                            className="ml-1 hover:text-red-500 transition-colors"
                                            title="Remove this slot"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <p className="text-xs text-slate-400 mt-2">
                                    Added {formatShortDate(blockedDate.createdAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-16 sm:ml-0 shrink-0">
                                <button
                                  onClick={() => handleToggleBlock(blockedDate._id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    blockedDate.isActive
                                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                  title={blockedDate.isActive ? 'Unblock this date' : 'Block this date'}
                                >
                                  {blockedDate.isActive ? (
                                    <>
                                      <ToggleRight className="w-4 h-4" />
                                      <span className="hidden sm:inline">Blocked</span>
                                    </>
                                  ) : (
                                    <>
                                      <ToggleLeft className="w-4 h-4" />
                                      <span className="hidden sm:inline">Unblocked</span>
                                    </>
                                  )}
                                </button>

                                {deleteConfirm === blockedDate._id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteBlock(blockedDate._id)}
                                      className="px-2 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(blockedDate._id)}
                                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                </div>

                {/* Past Blocked Dates - Separate Card */}
                {pastBlockedDates.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mt-6">
                    <button
                      onClick={() => setShowPastDates(!showPastDates)}
                      className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                          <Clock3 className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-slate-700 text-sm sm:text-base">Past Blocked Dates</h3>
                          <p className="text-[10px] sm:text-xs text-slate-400">Previously blocked dates history</p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">
                          {pastBlockedDates.length}
                        </span>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showPastDates ? 'rotate-90' : ''}`} />
                    </button>

                    {showPastDates && (
                      <>
                        {/* Past Dates Filter */}
                        <div className="px-4 sm:px-6 py-3 border-t border-b border-slate-100 bg-slate-50/50 relative" ref={pastPickerRef}>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {[
                              { label: 'Last 7', days: 7 },
                              { label: 'Last 15', days: 15 },
                              { label: 'Last 30', days: 30 },
                            ].map(({ label, days }) => (
                              <button
                                key={label}
                                onClick={() => handlePastQuickRange(days, label)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                  pastActiveRange === label
                                    ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-sm'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                              >
                                {label}
                              </button>
                            ))}

                            {(pastFilterFrom || pastFilterTo) && (
                              <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs font-medium text-slate-400">
                                  {filteredPastBlockedDates.length} of {pastBlockedDates.length}
                                </span>
                                <button
                                  onClick={handleClearPastFilter}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button
                              onClick={() => handleOpenPastPicker('from')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                                pastFilterFrom
                                  ? 'bg-slate-100 border-slate-300 text-slate-600'
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                              } ${pastOpenPicker === 'from' ? 'ring-2 ring-slate-300' : ''}`}
                            >
                              <CalendarDays className="w-4 h-4" />
                              <span className="text-[11px] font-semibold uppercase tracking-wide">From:</span>
                              <span className="font-medium">{pastFilterFrom ? formatFilterDate(pastFilterFrom) : 'Select'}</span>
                            </button>

                            <span className="text-slate-300 text-sm">to</span>

                            <button
                              onClick={() => handleOpenPastPicker('to')}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                                pastFilterTo
                                  ? 'bg-slate-100 border-slate-300 text-slate-600'
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                              } ${pastOpenPicker === 'to' ? 'ring-2 ring-slate-300' : ''}`}
                            >
                              <CalendarDays className="w-4 h-4" />
                              <span className="text-[11px] font-semibold uppercase tracking-wide">To:</span>
                              <span className="font-medium">{pastFilterTo ? formatFilterDate(pastFilterTo) : 'Select'}</span>
                            </button>
                          </div>

                          {/* Calendar Dropdown for Past Filter */}
                          {pastOpenPicker && (() => {
                            const viewYear = pastPickerMonth.getFullYear()
                            const viewMonthIdx = pastPickerMonth.getMonth()
                            const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
                            const weekDays = ['Mo','Tu','We','Th','Fr','Sa','Su']
                            const daysInMonth = new Date(viewYear, viewMonthIdx + 1, 0).getDate()
                            let startDay = new Date(viewYear, viewMonthIdx, 1).getDay() - 1
                            if (startDay < 0) startDay = 6

                            const cells: (number | null)[] = []
                            for (let i = 0; i < startDay; i++) cells.push(null)
                            for (let d = 1; d <= daysInMonth; d++) cells.push(d)

                            const activeValue = pastOpenPicker === 'from' ? pastFilterFrom : pastFilterTo

                            return (
                              <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-[280px]">
                                <div className="flex items-center justify-between mb-3">
                                  <button
                                    onClick={() => setPastPickerMonth(new Date(viewYear, viewMonthIdx - 1, 1))}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                                  </button>
                                  <span className="text-sm font-bold text-slate-800">{monthNames[viewMonthIdx]} {viewYear}</span>
                                  <button
                                    onClick={() => setPastPickerMonth(new Date(viewYear, viewMonthIdx + 1, 1))}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-7 mb-1">
                                  {weekDays.map(wd => (
                                    <div key={wd} className="text-center text-[10px] font-semibold text-slate-400 py-1">{wd}</div>
                                  ))}
                                </div>

                                <div className="grid grid-cols-7 gap-0.5">
                                  {cells.map((day, idx) => {
                                    if (day === null) return <div key={`e-${idx}`} className="w-8 h-8" />
                                    const dateStr = `${viewYear}-${String(viewMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                    const isSelected = dateStr === activeValue
                                    return (
                                      <button
                                        key={day}
                                        onClick={() => handlePickPastDate(dateStr)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                                          isSelected
                                            ? 'bg-gradient-to-br from-slate-500 to-slate-600 text-white font-bold shadow-md'
                                            : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                      >
                                        {day}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Past dates list */}
                        {filteredPastBlockedDates.length === 0 ? (
                          <div className="px-4 sm:px-6 py-10 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <CalendarCheck className="w-7 h-7 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-400 font-semibold">No past blocked dates in this range</p>
                            <button
                              onClick={handleClearPastFilter}
                              className="mt-2 text-xs text-red-400 hover:text-red-600 font-semibold"
                            >
                              Clear Filter
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {filteredPastBlockedDates.map((blockedDate) => (
                              <div
                                key={blockedDate._id}
                                className="px-4 sm:px-6 py-3 hover:bg-slate-50/50 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white font-semibold bg-slate-400 shrink-0">
                                      <span className="text-[8px] uppercase tracking-wide opacity-90">
                                        {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', month: 'short' }).format(new Date(blockedDate.date))}
                                      </span>
                                      <span className="text-sm font-bold -mt-0.5">
                                        {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', day: 'numeric' }).format(new Date(blockedDate.date))}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-600">{formatDate(blockedDate.date)}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {blockedDate.isFullDayBlocked ? (
                                          <span className="text-[10px] font-medium text-slate-400">Full Day</span>
                                        ) : (
                                          <span className="text-[10px] font-medium text-slate-400">
                                            {blockedDate.blockedTimeSlots.length} Slot{blockedDate.blockedTimeSlots.length !== 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {blockedDate.reason && (
                                          <span className="text-[10px] text-slate-400">— {blockedDate.reason}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (deleteConfirm === blockedDate._id) {
                                        handleDeleteBlock(blockedDate._id)
                                      } else {
                                        setDeleteConfirm(blockedDate._id)
                                      }
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                      deleteConfirm === blockedDate._id
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'hover:bg-red-50 text-slate-300 hover:text-red-400'
                                    }`}
                                    title={deleteConfirm === blockedDate._id ? 'Click again to confirm delete' : 'Delete'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Block Date Modal - Modern Design */}
      {showBlockModal && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowBlockModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modern Header with Gradient & Pattern */}
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 px-6 py-5 text-white overflow-hidden sticky top-0">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <CalendarOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Block {blockMode === 'range' ? 'Dates' : 'Date'}</h3>
                    <p className="text-white/80 text-sm mt-0.5">{blockMode === 'range' ? 'Block multiple days at once' : 'Block full day or specific time slots'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Block Mode Toggle: Single Date / Date Range */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Block Mode
                </label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setBlockMode('single')
                      setBlockEndDate('')
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      blockMode === 'single'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Single Date
                  </button>
                  <button
                    onClick={() => {
                      setBlockMode('range')
                      setBlockType('full')
                      setSelectedBlockSlots([])
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      blockMode === 'range'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Date Range
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              {blockMode === 'single' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedBlockSlots([])
                    }}
                    min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                        if (blockEndDate && e.target.value > blockEndDate) {
                          setBlockEndDate('')
                        }
                      }}
                      min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={blockEndDate}
                      onChange={(e) => setBlockEndDate(e.target.value)}
                      min={selectedDate || new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all text-sm"
                    />
                  </div>
                  {selectedDate && blockEndDate && (
                    <p className="text-xs text-slate-500 font-medium">
                      {Math.round((new Date(blockEndDate + 'T00:00:00').getTime() - new Date(selectedDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s) will be blocked
                    </p>
                  )}
                </div>
              )}

              {/* Block Type Selection - Only for single date mode */}
              {blockMode === 'single' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Block Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setBlockType('full')
                        setSelectedBlockSlots([])
                      }}
                      className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        blockType === 'full'
                          ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CalendarOff className="w-4 h-4" />
                      Full Day
                    </button>
                    <button
                      onClick={() => setBlockType('slots')}
                      className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        blockType === 'slots'
                          ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Specific Slots
                    </button>
                  </div>
                </div>
              )}

              {/* Time Slots Selection - Only for single date + slots mode */}
              {blockMode === 'single' && blockType === 'slots' && selectedDate && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Time Slots to Block
                  </label>
                  {getTimeSlotsForSelectedDate().length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {getTimeSlotsForSelectedDate().map((slot) => (
                        <button
                          key={slot}
                          onClick={() => toggleBlockSlotSelection(slot)}
                          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            selectedBlockSlots.includes(slot)
                              ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">This is a non-working day. No slots available.</span>
                      </div>
                    </div>
                  )}
                  {selectedBlockSlots.length === 0 && getTimeSlotsForSelectedDate().length > 0 && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      Select at least one time slot to block
                    </p>
                  )}
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason <span className="text-red-400 font-normal">*</span>
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Holiday, Vacation, Personal day, etc."
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-red-500 transition-all text-sm placeholder-slate-400"
                />
              </div>

              {/* Summary Preview */}
              {blockMode === 'single' && selectedDate && (
                <div className={`p-4 rounded-xl ${blockType === 'full' ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-100' : 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100'}`}>
                  <p className={`text-sm font-semibold ${blockType === 'full' ? 'text-red-700' : 'text-purple-700'}`}>
                    Blocking: {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(selectedDate + 'T12:00:00Z'))}
                  </p>
                  <p className={`text-xs mt-1 ${blockType === 'full' ? 'text-red-600' : 'text-purple-600'}`}>
                    {blockType === 'full'
                      ? 'Users will not be able to book any appointments on this date.'
                      : selectedBlockSlots.length > 0
                      ? `Blocking ${selectedBlockSlots.length} time slot${selectedBlockSlots.length !== 1 ? 's' : ''}: ${selectedBlockSlots.join(', ')}`
                      : 'Select time slots to block'
                    }
                  </p>
                </div>
              )}
              {blockMode === 'range' && selectedDate && blockEndDate && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
                  <p className="text-sm font-semibold text-red-700">
                    Blocking {Math.round((new Date(blockEndDate + 'T00:00:00').getTime() - new Date(selectedDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                  <p className="text-xs mt-1 text-red-600">
                    From {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', month: 'short', day: 'numeric' }).format(new Date(selectedDate + 'T12:00:00Z'))} to {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(blockEndDate + 'T12:00:00Z'))} — all appointments will be blocked.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowBlockModal(false)
                    setBlockType('full')
                    setBlockMode('single')
                    setSelectedBlockSlots([])
                    setSelectedDate('')
                    setBlockEndDate('')
                    setBlockReason('')
                  }}
                  className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockDate}
                  disabled={
                    !selectedDate || submitting || !blockReason.trim() ||
                    (blockMode === 'single' && blockType === 'slots' && selectedBlockSlots.length === 0) ||
                    (blockMode === 'range' && !blockEndDate)
                  }
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all font-semibold flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Blocking{blockMode === 'range' ? ' dates...' : '...'}
                    </>
                  ) : (
                    <>
                      <CalendarOff className="w-4 h-4" />
                      {blockMode === 'range'
                        ? `Block ${selectedDate && blockEndDate ? Math.round((new Date(blockEndDate + 'T00:00:00').getTime() - new Date(selectedDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)) + 1 + ' Days' : 'Dates'}`
                        : `Block ${blockType === 'full' ? 'Full Day' : 'Slots'}`
                      }
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingManagement

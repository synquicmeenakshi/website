import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, X, Loader2, CalendarOff, CalendarCheck, Menu, AlertCircle, ToggleLeft, ToggleRight, Clock, Settings, Save, Clock3 } from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL } from '../config/api'
import { formatBelgiumDate, getBelgiumTodayStr, getBelgiumDateStr } from '../utils/timezone'

interface BlockedDate {
  _id: string
  date: string
  reason: string
  isActive: boolean
  isFullDayBlocked: boolean
  blockedTimeSlots: string[]
  createdAt: string
}

interface BookingSettings {
  _id: string
  timeSlots: string[]
  minAdvanceBooking: number
  maxAdvanceBooking: number
  isBookingEnabled: boolean
}

const BlockedDates = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [reason, setReason] = useState('')
  const [blockType, setBlockType] = useState<'full' | 'slots'>('full')
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Settings state
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [editingSlots, setEditingSlots] = useState<string[]>([])
  const [newSlot, setNewSlot] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  const fetchBlockedDates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/blocked-dates`)
      const data = await response.json()
      if (data.success) {
        setBlockedDates(data.data)
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/settings`)
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
        setEditingSlots(data.data.timeSlots)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  useEffect(() => {
    fetchBlockedDates()
    fetchSettings()
  }, [])

  const handleAddDate = async () => {
    if (!selectedDate) return

    setSubmitting(true)
    try {
      const payload: { date: string; reason: string; blockedTimeSlots?: string[] } = {
        date: selectedDate,
        reason
      }

      // If blocking specific slots, include them
      if (blockType === 'slots' && selectedTimeSlots.length > 0) {
        payload.blockedTimeSlots = selectedTimeSlots
      }

      const response = await fetch(`${API_BASE_URL}/blocked-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (data.success) {
        await fetchBlockedDates()
        setShowAddModal(false)
        setSelectedDate('')
        setReason('')
        setBlockType('full')
        setSelectedTimeSlots([])
      } else {
        alert(data.message || 'Failed to block date')
      }
    } catch (error) {
      console.error('Error blocking date:', error)
      alert('Failed to block date')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string) => {
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

  const handleDelete = async (id: string) => {
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

  const handleRemoveTimeSlot = async (id: string, slot: string) => {
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

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const response = await fetch(`${API_BASE_URL}/blocked-dates/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlots: editingSlots })
      })
      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
        setShowSettingsModal(false)
        alert('Time slots updated successfully!')
      } else {
        alert(data.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleAddSlot = () => {
    if (newSlot && !editingSlots.includes(newSlot)) {
      setEditingSlots([...editingSlots, newSlot].sort())
      setNewSlot('')
    }
  }

  const handleRemoveSlotFromSettings = (slot: string) => {
    setEditingSlots(editingSlots.filter(s => s !== slot))
  }

  const toggleTimeSlotSelection = (slot: string) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot))
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot])
    }
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

  const activeBlockedDates = blockedDates.filter(bd => bd.isActive)

  // Upcoming blocked dates: next 30 Belgium calendar days (string comparison is timezone-safe)
  const todayStr = getBelgiumTodayStr()
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const thirtyDaysLaterStr = new Date(Date.UTC(ty, tm - 1, td + 30)).toISOString().slice(0, 10)

  const upcomingBlockedDates = activeBlockedDates.filter(bd => {
    const dStr = getBelgiumDateStr(bd.date)
    return dStr >= todayStr && dStr <= thirtyDaysLaterStr
  })

  // Count partial blocks (only specific time slots blocked)
  const partialBlocks = blockedDates.filter(bd => !bd.isFullDayBlocked && bd.blockedTimeSlots.length > 0)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Blocked Dates</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage unavailable dates & time slots for massage bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Time Slots</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/20 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Block Date
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-red-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Blocked</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{blockedDates.length}</p>
                  <p className="text-xs text-slate-400 mt-2">All time</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarOff className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-amber-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Blocks</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{activeBlockedDates.length}</p>
                  <p className="text-xs text-slate-400 mt-2">Currently blocked</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-purple-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Partial Blocks</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{partialBlocks.length}</p>
                  <p className="text-xs text-slate-400 mt-2">Specific slots only</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Upcoming (30d)</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{upcomingBlockedDates.length}</p>
                  <p className="text-xs text-slate-400 mt-2">In next month</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Blocked Dates List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Blocked Dates Calendar</h3>
                <span className="text-sm text-slate-500">
                  {blockedDates.length} date{blockedDates.length !== 1 ? 's' : ''} blocked
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-[#DFB13B] animate-spin mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Loading blocked dates...</p>
                </div>
              </div>
            ) : blockedDates.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No blocked dates</h3>
                <p className="text-slate-500 text-sm">
                  All dates are currently available for booking
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-[#DFB13B] text-white rounded-lg text-sm font-medium hover:bg-[#C9A032] transition-colors"
                >
                  Block a Date
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {blockedDates.map((blockedDate) => {
                  const date = new Date(blockedDate.date)
                  // Past = Belgium calendar day is before today's Belgium calendar day
                  const isPast = getBelgiumDateStr(blockedDate.date) < todayStr

                  return (
                    <div
                      key={blockedDate._id}
                      className={`px-4 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors ${
                        !blockedDate.isActive ? 'opacity-60' : ''
                      } ${isPast ? 'bg-slate-50/30' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Date Icon */}
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center text-white font-semibold shadow-sm shrink-0 ${
                            !blockedDate.isActive
                              ? 'bg-slate-400'
                              : isPast
                              ? 'bg-slate-500'
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

                          {/* Date Info */}
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
                              {isPast && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                  Past
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

                            {/* Show blocked time slots */}
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
                                      onClick={() => handleRemoveTimeSlot(blockedDate._id, slot)}
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

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-16 sm:ml-0 shrink-0">
                          {/* Toggle Button */}
                          <button
                            onClick={() => handleToggle(blockedDate._id)}
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

                          {/* Delete Button */}
                          {deleteConfirm === blockedDate._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(blockedDate._id)}
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
        </div>
      </div>

      {/* Add Date Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-6 py-5 text-white relative sticky top-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <CalendarOff className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Block Date/Time</h3>
                  <p className="text-white/80 text-sm">Block full day or specific time slots</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Date Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date())}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all"
                />
              </div>

              {/* Block Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Block Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setBlockType('full')
                      setSelectedTimeSlots([])
                    }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      blockType === 'full'
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                    }`}
                  >
                    <CalendarOff className="w-4 h-4" />
                    Full Day
                  </button>
                  <button
                    onClick={() => setBlockType('slots')}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      blockType === 'slots'
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Specific Slots
                  </button>
                </div>
              </div>

              {/* Time Slots Selection (only if blocking specific slots) */}
              {blockType === 'slots' && settings && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Time Slots to Block
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {settings.timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => toggleTimeSlotSelection(slot)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTimeSlots.includes(slot)
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {selectedTimeSlots.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      Select at least one time slot to block
                    </p>
                  )}
                </div>
              )}

              {/* Reason Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Holiday, Personal day, etc."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all"
                />
              </div>

              {/* Preview */}
              {selectedDate && (
                <div className={`mb-6 p-4 rounded-xl border ${blockType === 'full' ? 'bg-red-50 border-red-100' : 'bg-purple-50 border-purple-100'}`}>
                  <p className={`text-sm ${blockType === 'full' ? 'text-red-700' : 'text-purple-700'}`}>
                    <span className="font-medium">Blocking:</span>{' '}
                    {new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(selectedDate + 'T12:00:00Z'))}
                  </p>
                  <p className={`text-xs mt-1 ${blockType === 'full' ? 'text-red-600' : 'text-purple-600'}`}>
                    {blockType === 'full'
                      ? 'Users will not be able to book any appointments on this date.'
                      : selectedTimeSlots.length > 0
                      ? `Blocking ${selectedTimeSlots.length} time slot${selectedTimeSlots.length !== 1 ? 's' : ''}: ${selectedTimeSlots.join(', ')}`
                      : 'Select time slots to block'
                    }
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setBlockType('full')
                    setSelectedTimeSlots([])
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDate}
                  disabled={!selectedDate || submitting || (blockType === 'slots' && selectedTimeSlots.length === 0)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#DFB13B]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Blocking...
                    </>
                  ) : (
                    <>
                      <CalendarOff className="w-4 h-4" />
                      Block {blockType === 'full' ? 'Full Day' : 'Slots'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 text-white relative">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Time Slot Settings</h3>
                  <p className="text-white/80 text-sm">Configure available booking time slots</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Current Time Slots */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Available Time Slots
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editingSlots.map((slot) => (
                    <span
                      key={slot}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {slot}
                      <button
                        onClick={() => handleRemoveSlotFromSettings(slot)}
                        className="ml-1 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                {editingSlots.length === 0 && (
                  <p className="text-sm text-amber-600">No time slots configured. Add at least one.</p>
                )}
              </div>

              {/* Add New Slot */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add New Time Slot
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    placeholder="e.g., 10:00 or 6:30"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSlot()}
                  />
                  <button
                    onClick={handleAddSlot}
                    disabled={!newSlot}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Enter time in format like "12:30" or "1:30"
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSettingsModal(false)
                    setEditingSlots(settings?.timeSlots || [])
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings || editingSlots.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
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

export default BlockedDates

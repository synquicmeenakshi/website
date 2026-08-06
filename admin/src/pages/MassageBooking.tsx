import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Plus, Send, CheckCircle, XCircle, Loader2, Calendar, User, Clock, Mail, Phone, MapPin, X, Save, Sparkles, CalendarCheck, MessageSquare, FileText, Menu, Trash2, Filter, ChevronDown, PanelLeftClose, PanelRightClose, GripVertical, Archive } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { getBelgiumDayOfWeek } from '../utils/timezone'

interface ServiceOption {
  _id: string
  title: string
  duration: number
  price: number
  category: string
}

interface BookingData {
  _id: string
  enrollmentId: number
  service: string
  serviceTitle: string
  appointmentDate: string
  appointmentDay: string
  appointmentTime: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  country: string
  gender: string
  specialRequests: string
  message: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt: string
}

import { API_BASE_URL } from '../config/api'
const API_URL = API_BASE_URL

type FilterPeriod = 'all' | 'today' | 'day' | 'week' | 'month' | 'year'

const countryNames: { [key: string]: string } = {
  'BE': 'Belgium',
  'US': 'United States',
  'UK': 'United Kingdom',
  'NL': 'Netherlands',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'IN': 'India'
}

const MassageBooking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email')
  const [messageContent, setMessageContent] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageStatus, setMessageStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Panel resize and collapse states
  const [leftPanelWidth, setLeftPanelWidth] = useState(450)
  const [activePanel, setActivePanel] = useState<'both' | 'left' | 'right'>('both')
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [savingBooking, setSavingBooking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newBookingForm, setNewBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: 'BE',
    gender: 'male',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '10:00',
    specialRequests: '',
    message: ''
  })

  const filterOptions: { value: FilterPeriod; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' }
  ]

  // Filter bookings based on selected period
  const getFilteredByPeriod = (data: BookingData[]) => {
    const now = new Date()
    let startDate: Date

    switch (filterPeriod) {
      case 'today': {
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now)
        return data.filter(booking => {
          const belgiumDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date(booking.appointmentDate))
          return belgiumDate === todayStr
        })
      }
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return data
    }

    return data.filter(booking => new Date(booking.appointmentDate) >= startDate)
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/enrollments`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      if (data.success) {
        setBookings(data.data)
        // Only auto-select first booking on desktop (md breakpoint = 768px)
        // On mobile, show list first and let user select
        if (data.data.length > 0 && !selectedBooking && window.innerWidth >= 768) {
          setSelectedBooking(data.data[0])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      if (data.success) {
        setServices(data.data.filter((s: ServiceOption & { isActive: boolean }) => s.isActive))
      }
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBooking(true)

    try {
      const selectedService = services.find(s => s._id === newBookingForm.serviceId)
      // Parse appointmentDate as Belgium calendar day — noon UTC anchor avoids DST edges
      const appointmentDate = new Date(newBookingForm.appointmentDate + 'T12:00:00Z')
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      const response = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: newBookingForm.serviceId,
          serviceTitle: selectedService?.title || '',
          appointmentDate: newBookingForm.appointmentDate,
          appointmentDay: dayNames[getBelgiumDayOfWeek(appointmentDate)],
          appointmentTime: newBookingForm.appointmentTime,
          firstName: newBookingForm.firstName,
          lastName: newBookingForm.lastName,
          email: newBookingForm.email,
          phoneNumber: newBookingForm.phoneNumber,
          country: newBookingForm.country,
          gender: newBookingForm.gender,
          specialRequests: newBookingForm.specialRequests,
          message: newBookingForm.message
        })
      })

      if (!response.ok) throw new Error('Failed to create booking')

      const data = await response.json()
      if (data.success) {
        setShowNewBookingModal(false)
        setNewBookingForm({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          country: 'BE',
          gender: 'male',
          serviceId: '',
          appointmentDate: '',
          appointmentTime: '10:00',
          specialRequests: '',
          message: ''
        })
        fetchBookings()
      }
    } catch {
      alert('Failed to create booking')
    } finally {
      setSavingBooking(false)
    }
  }

  const openNewBookingModal = () => {
    fetchServices()
    setShowNewBookingModal(true)
  }

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle panel resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }, [])

  // Add mouse event listeners for resizing
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      e.preventDefault()

      const containerRect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left

      // Set min and max widths to prevent UI breaking
      const minLeftWidth = 350  // Minimum left panel width
      const minRightWidth = 850 // Minimum right panel width to preserve layout
      const maxLeftWidth = containerRect.width - minRightWidth

      // Clamp the width between min and max
      const clampedWidth = Math.min(Math.max(mouseX, minLeftWidth), maxLeftWidth)

      requestAnimationFrame(() => {
        setLeftPanelWidth(clampedWidth)
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      setActionLoading(status)
      const response = await fetch(`${API_URL}/enrollments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update status')
      const data = await response.json()
      if (data.success) {
        setBookings(prev => prev.map(b => b._id === id ? data.data : b))
        if (selectedBooking?._id === id) {
          setSelectedBooking(data.data)
        }
      }
    } catch {
      alert('Failed to update booking status')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      setDeleting(true)
      const response = await fetch(`${API_URL}/enrollments/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete appointment')
      const data = await response.json()
      if (data.success) {
        setBookings(prev => prev.filter(b => b._id !== id))
        if (selectedBooking?._id === id) {
          setSelectedBooking(bookings.length > 1 ? bookings.find(b => b._id !== id) || null : null)
        }
        setShowDeleteConfirm(null)
      }
    } catch {
      alert('Failed to delete appointment')
    } finally {
      setDeleting(false)
    }
  }

  const openMessageModal = () => {
    setMessageType('email')
    setMessageContent('')
    setMessageSubject('')
    setMessageStatus(null)
    setShowMessageModal(true)
  }

  const sendMessage = async () => {
    if (!selectedBooking || !messageContent.trim()) return

    try {
      setSendingMessage(true)
      setMessageStatus(null)
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: messageType,
          to: messageType === 'email' ? selectedBooking.email : selectedBooking.phoneNumber,
          subject: messageSubject || `Message from Zen Your Life`,
          message: messageContent,
          customerName: `${selectedBooking.firstName} ${selectedBooking.lastName}`,
          country: selectedBooking.country
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessageStatus({ type: 'success', text: `${messageType === 'email' ? 'Email' : 'SMS'} sent successfully!` })
        setMessageContent('')
        setMessageSubject('')
        // Auto close after 2 seconds
        setTimeout(() => {
          setShowMessageModal(false)
          setMessageStatus(null)
        }, 2000)
      } else {
        setMessageStatus({ type: 'error', text: data.message || 'Failed to send message' })
      }
    } catch {
      setMessageStatus({ type: 'error', text: 'Failed to send message. Please try again.' })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Brussels',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' }
      case 'pending':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' }
      case 'cancelled':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' }
      case 'completed':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' }
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' }
    }
  }

  // Apply period filter first, then status and search filters
  const periodFilteredBookings = getFilteredByPeriod(bookings)

  const filteredBookings = periodFilteredBookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter
    const searchMatch = searchQuery === '' ||
      `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.enrollmentId?.toString().includes(searchQuery) ||
      booking.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return statusMatch && searchMatch
  }).sort((a, b) => {
    const dateA = new Date(a.appointmentDate).getTime()
    const dateB = new Date(b.appointmentDate).getTime()
    if (dateA !== dateB) return dateB - dateA
    return (b.appointmentTime || '').localeCompare(a.appointmentTime || '')
  })

  // Stats based on period filtered bookings
  const stats = {
    total: periodFilteredBookings.length,
    pending: periodFilteredBookings.filter(b => b.status === 'pending').length,
    confirmed: periodFilteredBookings.filter(b => b.status === 'confirmed').length,
    completed: periodFilteredBookings.filter(b => b.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8fafc]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#DFB13B] mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading appointments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#f8fafc]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to load appointments</h3>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button
              onClick={fetchBookings}
              className="bg-[#DFB13B] text-white px-6 py-2.5 rounded-xl hover:bg-[#C9A032] transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col h-screen overflow-hidden">
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
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Massage Appointments</h1>
                <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">Manage massage bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Today Quick Button */}
              <button
                onClick={() => setFilterPeriod(filterPeriod === 'today' ? 'all' : 'today')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg transition-all text-xs sm:text-sm font-medium ${
                  filterPeriod === 'today'
                    ? 'bg-[#DFB13B] text-white shadow-md shadow-[#DFB13B]/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Today</span>
              </button>

              {/* Filter Dropdown */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-xs sm:text-sm font-medium text-slate-700"
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{filterOptions.find(opt => opt.value === filterPeriod)?.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-48 z-[100]">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterPeriod(option.value)
                          setIsFilterOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                          filterPeriod === option.value
                            ? 'bg-[#DFB13B]/10 text-[#DFB13B] font-semibold'
                            : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={openNewBookingModal}
                className="flex items-center gap-1.5 bg-[#DFB13B] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#C9A032] transition font-medium shadow-sm text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </div>

          {/* Stats row - Compact on mobile, full cards on desktop */}
          {/* Mobile: Compact badges */}
          <div className="flex sm:hidden items-center gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-lg shrink-0">
              <span className="text-xs text-slate-500">Total</span>
              <span className="text-sm font-bold text-slate-800">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg shrink-0">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              <span className="text-xs text-amber-700">{stats.pending}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg shrink-0">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              <span className="text-xs text-emerald-700">{stats.confirmed}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg shrink-0">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span className="text-xs text-blue-700">{stats.completed}</span>
            </div>
          </div>
          {/* Desktop: Modern gradient stat cards - Compact */}
          <div className="hidden sm:grid grid-cols-4 gap-3 mt-3">
            {/* Total Bookings Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-400">Total Bookings</p>
                </div>
                <div className="w-9 h-9 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Pending Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  <p className="text-xs text-white/80">Pending</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Confirmed Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
                  <p className="text-xs text-white/80">Confirmed</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Completed Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 p-3.5 shadow-md">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.completed}</p>
                  <p className="text-xs text-white/80">Completed</p>
                </div>
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row relative flex-1 overflow-hidden" ref={containerRef}>
          {/* Left Panel - Full screen on mobile (hidden when booking selected), resizable on desktop */}
          <div
            className={`md:border-r border-slate-200 bg-white transition-none flex-shrink-0 flex flex-col overflow-hidden ${
              activePanel === 'right' ? 'hidden md:flex md:w-0 md:overflow-hidden' : activePanel === 'left' ? 'w-full' : ''
            } ${selectedBooking ? 'hidden md:flex' : ''}`}
            style={{
              width: activePanel === 'right' ? 0 : activePanel === 'left' ? '100%' : `${leftPanelWidth}px`,
              minWidth: activePanel === 'right' ? 0 : activePanel === 'left' ? '100%' : '350px'
            }}
          >
            {/* Panel header with toggle - Hidden on mobile */}
            {activePanel !== 'right' && (
              <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#DFB13B] rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Appointments</span>
                </div>
                <button
                  onClick={() => setActivePanel(activePanel === 'left' ? 'both' : 'left')}
                  className={`p-1.5 rounded-lg transition-all ${activePanel === 'left' ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-lg shadow-[#DFB13B]/30' : 'hover:bg-slate-100 text-slate-500'}`}
                  title={activePanel === 'left' ? 'Show both panels' : 'Expand to full width'}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Search & Filter - Modern Design */}
            <div className="p-4 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-[#DFB13B]/20 to-[#C9A032]/10 rounded-lg flex items-center justify-center">
                  <Search className="text-[#DFB13B] w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-[#DFB13B] focus:shadow-lg focus:shadow-[#DFB13B]/10 transition-all text-sm placeholder-slate-400"
                />
              </div>

              {/* Status Tabs - Modern Pill Design */}
              <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl">
                {[
                  { key: 'all', label: 'All', count: stats.total, color: 'slate' },
                  { key: 'pending', label: 'Pending', count: stats.pending, color: 'amber' },
                  { key: 'confirmed', label: 'Confirmed', count: stats.confirmed, color: 'emerald' },
                  { key: 'completed', label: 'Done', count: stats.completed, color: 'blue' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex-1 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      statusFilter === tab.key
                        ? 'bg-white text-slate-800 shadow-md'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      statusFilter === tab.key
                        ? tab.color === 'amber' ? 'bg-amber-100 text-amber-600'
                          : tab.color === 'emerald' ? 'bg-emerald-100 text-emerald-600'
                          : tab.color === 'blue' ? 'bg-blue-100 text-blue-600'
                          : 'bg-[#DFB13B]/10 text-[#DFB13B]'
                        : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking List - Grouped by Month */}
            <div className="p-3 flex-1 overflow-y-auto">
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                    <Calendar className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-700 text-lg">No appointments</p>
                  <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
                </div>
              ) : (() => {
                const now = new Date()
                // Recent = current month + previous month; Archived = 3rd month and older
                // Use Belgium timezone for month boundaries
                const belgiumNowStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now)
                const [bty, btm] = belgiumNowStr.split('-').map(Number)
                const prevMonthM = btm === 1 ? 12 : btm - 1
                const prevMonthY = btm === 1 ? bty - 1 : bty
                const recentCutoff = `${prevMonthY}-${String(prevMonthM - 1).padStart(2, '0')}`

                // Group bookings by Belgium calendar month
                const monthGroups: Record<string, { label: string, bookings: typeof filteredBookings }> = {}
                filteredBookings.forEach(booking => {
                  const belgiumDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date(booking.appointmentDate))
                  const [y, m] = belgiumDateStr.split('-')
                  const key = `${y}-${String(Number(m) - 1).padStart(2, '0')}`
                  if (!monthGroups[key]) {
                    monthGroups[key] = {
                      label: new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Brussels', month: 'long', year: 'numeric' }).format(new Date(booking.appointmentDate)),
                      bookings: []
                    }
                  }
                  monthGroups[key].bookings.push(booking)
                })

                const sortedKeys = Object.keys(monthGroups).sort().reverse()
                const currentAndFutureKeys = sortedKeys.filter(k => k >= recentCutoff)
                const archivedKeys = sortedKeys.filter(k => k < recentCutoff)

                const renderBookingCard = (booking: typeof filteredBookings[0]) => {
                  const statusConfig = getStatusConfig(booking.status)
                  const isSelected = selectedBooking?._id === booking._id
                  return (
                    <div
                      key={booking._id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`p-4 cursor-pointer transition-all rounded-2xl border-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#DFB13B]/10 to-[#C9A032]/5 border-[#DFB13B] shadow-lg shadow-[#DFB13B]/10'
                          : 'bg-white border-transparent hover:border-slate-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                            booking.gender === 'male'
                              ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                              : booking.gender === 'female'
                              ? 'bg-gradient-to-br from-pink-400 to-pink-600'
                              : 'bg-gradient-to-br from-slate-400 to-slate-600'
                          }`}>
                            {booking.firstName?.charAt(0)}{booking.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{booking.firstName} {booking.lastName}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{booking.serviceTitle}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3 h-3 text-[#DFB13B]" />
                            {formatDate(booking.appointmentDate)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3 h-3 text-[#DFB13B]" />
                            {booking.appointmentTime}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">#{booking.enrollmentId}</span>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {/* Current & Future Months */}
                    {currentAndFutureKeys.map(key => (
                      <div key={key}>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <Calendar className="w-3.5 h-3.5 text-[#DFB13B]" />
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{monthGroups[key].label}</h3>
                          <span className="text-[10px] bg-[#DFB13B]/10 text-[#B8960B] px-2 py-0.5 rounded-full font-semibold">{monthGroups[key].bookings.length}</span>
                        </div>
                        <div className="space-y-2">
                          {monthGroups[key].bookings.map(renderBookingCard)}
                        </div>
                      </div>
                    ))}

                    {/* Archived Bookings (Past Months) */}
                    {archivedKeys.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-1 pt-3 border-t border-slate-200">
                          <Archive className="w-3.5 h-3.5 text-slate-400" />
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archived Bookings</h3>
                        </div>
                        {archivedKeys.map(key => (
                          <div key={key} className="mb-3">
                            <div className="flex items-center gap-2 mb-2 px-1">
                              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{monthGroups[key].label}</h4>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{monthGroups[key].bookings.length}</span>
                            </div>
                            <div className="space-y-2 opacity-75">
                              {monthGroups[key].bookings.map(renderBookingCard)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Resizer Handle - Hidden on mobile */}
          {activePanel === 'both' && (
            <div
              className={`hidden md:flex w-2 bg-slate-200 hover:bg-[#DFB13B] cursor-col-resize relative group flex-shrink-0 items-center justify-center ${isResizing ? 'bg-[#DFB13B]' : ''}`}
              onMouseDown={handleMouseDown}
            >
              <div className={`w-4 h-10 bg-slate-300 group-hover:bg-[#DFB13B] rounded-full flex items-center justify-center ${isResizing ? 'bg-[#DFB13B] opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <GripVertical className="w-3 h-3 text-white" />
              </div>
            </div>
          )}

          {/* Collapsed Left Panel Button - Hidden on mobile */}
          {activePanel === 'right' && (
            <button
              onClick={() => setActivePanel('both')}
              className="hidden md:flex w-10 bg-white border-r border-slate-200 items-center justify-center hover:bg-slate-50 transition-colors"
              title="Show appointments list"
            >
              <PanelRightClose className="w-4 h-4 text-slate-500" />
            </button>
          )}

          {/* Right Panel - Details (Full height within content area on mobile) */}
          <div
            className={`flex-1 bg-slate-50 transition-none flex flex-col overflow-hidden ${
              activePanel === 'left' ? 'hidden md:flex md:w-0 md:overflow-hidden' : ''
            } ${selectedBooking ? '' : 'hidden md:flex'}`}
          >
            {/* Right panel header with toggle and back button - Modern */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {/* Back button - Mobile only */}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="md:hidden flex items-center gap-2 px-3 py-2 -ml-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl transition-all shadow-sm"
                >
                  <ChevronDown className="w-4 h-4 text-slate-600 rotate-90" />
                  <span className="text-sm font-semibold text-slate-600">Back</span>
                </button>
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Booking Details</span>
                </div>
              </div>
              <button
                onClick={() => setActivePanel(activePanel === 'right' ? 'both' : 'right')}
                className={`hidden md:block p-1.5 rounded-lg transition-all ${activePanel === 'right' ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-lg shadow-[#DFB13B]/30' : 'hover:bg-slate-100 text-slate-500'}`}
                title={activePanel === 'right' ? 'Show both panels' : 'Expand to full width'}
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            {selectedBooking ? (
              <div className="space-y-6">
                {/* Booking Header Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-4 sm:px-6 py-4 sm:py-5 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
                          {selectedBooking.firstName?.charAt(0)}{selectedBooking.lastName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg sm:text-xl font-semibold truncate">{selectedBooking.firstName} {selectedBooking.lastName}</h2>
                          <p className="text-white/80 text-xs sm:text-sm truncate">{selectedBooking.serviceTitle}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right pl-14 sm:pl-0">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Appointment ID</p>
                        <p className="text-base sm:text-lg font-mono font-semibold">#{selectedBooking.enrollmentId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
                    <div className="p-4 text-center">
                      <p className="text-lg font-bold text-slate-800">{formatDate(selectedBooking.appointmentDate)}</p>
                      <p className="text-xs text-slate-500 mt-1">Date</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-lg font-bold text-slate-800">{selectedBooking.appointmentTime}</p>
                      <p className="text-xs text-slate-500 mt-1">Time</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-lg font-bold text-slate-800">{selectedBooking.appointmentDay}</p>
                      <p className="text-xs text-slate-500 mt-1">Day</p>
                    </div>
                    <div className="p-4 text-center">
                      {(() => {
                        const statusConfig = getStatusConfig(selectedBooking.status)
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {selectedBooking.status}
                          </span>
                        )
                      })()}
                      <p className="text-xs text-slate-500 mt-2">Status</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Modern Gradient Design */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0 sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'confirmed')}
                      disabled={actionLoading === 'confirmed'}
                      className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold shadow-md disabled:opacity-50 text-xs whitespace-nowrap shrink-0"
                    >
                      {actionLoading === 'confirmed' ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      Confirm
                    </button>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'completed')}
                      disabled={actionLoading === 'completed'}
                      className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-semibold shadow-md disabled:opacity-50 text-xs whitespace-nowrap shrink-0"
                    >
                      {actionLoading === 'completed' ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      Complete
                    </button>
                  )}
                  <button
                    onClick={openMessageModal}
                    className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition-all font-semibold shadow-md text-xs whitespace-nowrap shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Message
                  </button>
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                    <button
                      onClick={() => setShowCancelConfirm(selectedBooking._id)}
                      className="flex items-center gap-1.5 sm:gap-2 bg-white text-red-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-red-50 transition-all font-semibold border-2 border-red-200 text-xs whitespace-nowrap shrink-0"
                    >
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(selectedBooking._id)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all font-semibold shadow-md text-xs whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Delete
                  </button>
                </div>

                {/* Info Grid - Modern Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Customer Information */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800">Customer Information</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                          selectedBooking.gender === 'male'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                            : selectedBooking.gender === 'female'
                            ? 'bg-gradient-to-br from-pink-400 to-pink-600'
                            : 'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                          {selectedBooking.firstName?.charAt(0)}{selectedBooking.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{selectedBooking.firstName} {selectedBooking.lastName}</p>
                          <p className="text-xs text-slate-500 capitalize">{selectedBooking.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors min-w-0">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-slate-600 truncate">{selectedBooking.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-slate-600">{selectedBooking.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-slate-600">{countryNames[selectedBooking.country] || selectedBooking.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800">Appointment Details</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-slate-600">Date</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{formatDate(selectedBooking.appointmentDate)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                          <span className="text-xs text-amber-600 font-medium">Time</span>
                          <span className="text-lg font-bold text-slate-800 mt-1">{selectedBooking.appointmentTime}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <span className="text-xs text-blue-600 font-medium">Day</span>
                          <span className="text-lg font-bold text-slate-800 mt-1">{selectedBooking.appointmentDay}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm p-2 text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Booked on {formatDate(selectedBooking.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl flex items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800">Service</h3>
                    </div>
                    <div className="p-5">
                      <div className="p-4 bg-gradient-to-r from-[#DFB13B]/10 to-[#C9A032]/5 rounded-xl border border-[#DFB13B]/20">
                        <p className="font-bold text-slate-800 text-lg">{selectedBooking.serviceTitle}</p>
                        <p className="text-xs text-slate-500 mt-1">Treatment</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Timeline */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800">Timeline</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl">
                        <span className="text-sm text-slate-600">Created</span>
                        <span className="text-sm font-bold text-slate-800">{formatDate(selectedBooking.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl">
                        <span className="text-sm text-slate-600">Last Updated</span>
                        <span className="text-sm font-bold text-slate-800">{formatDate(selectedBooking.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {(selectedBooking.specialRequests || selectedBooking.message) && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-slate-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-slate-800">Additional Notes</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {selectedBooking.specialRequests && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Special Requests</p>
                          <p className="text-sm text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-xl">{selectedBooking.specialRequests}</p>
                        </div>
                      )}
                      {selectedBooking.message && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Message</p>
                          <p className="text-sm text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-xl">{selectedBooking.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-700">Select an appointment</p>
                <p className="text-sm text-slate-400 mt-1">Choose an appointment from the list to view details</p>
              </div>
            )}
            </div>
          </div>

          {/* Collapsed Right Panel Button */}
          {activePanel === 'left' && (
            <button
              onClick={() => setActivePanel('both')}
              className="w-10 bg-white border-l border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              title="Show booking details"
            >
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowNewBookingModal(false)}>
          <div
            className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-4 sm:px-6 py-4 sm:py-5 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Create New Appointment</h2>
                  <p className="text-white/70 text-xs sm:text-sm mt-0.5">Add a new massage appointment</p>
                </div>
                <button
                  onClick={() => setShowNewBookingModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Customer Information */}
                <div className="bg-slate-50/50 rounded-xl p-4 sm:p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={newBookingForm.firstName}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, firstName: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={newBookingForm.lastName}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, lastName: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={newBookingForm.email}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={newBookingForm.phoneNumber}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, phoneNumber: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
                        placeholder="+32 123456789"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Country</label>
                      <select
                        value={newBookingForm.country}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, country: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm appearance-none cursor-pointer"
                      >
                        {Object.entries(countryNames).map(([code, name]) => (
                          <option key={code} value={code}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Gender</label>
                      <div className="flex gap-1.5 sm:gap-2">
                        {['male', 'female', 'other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setNewBookingForm({ ...newBookingForm, gender: g })}
                            className={`flex-1 px-2 sm:px-3 py-2.5 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-medium transition-all capitalize ${
                              newBookingForm.gender === g
                                ? 'bg-[#DFB13B] text-white border-[#DFB13B] shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#DFB13B]/50'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="bg-slate-50/50 rounded-xl p-4 sm:p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Service Selection</h3>
                  </div>
                  <select
                    value={newBookingForm.serviceId}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, serviceId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.title} - €{service.price} ({service.duration} mins)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Details */}
                <div className="bg-slate-50/50 rounded-xl p-4 sm:p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Appointment Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Date</label>
                      <input
                        type="date"
                        value={newBookingForm.appointmentDate}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, appointmentDate: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Time</label>
                      <input
                        type="time"
                        value={newBookingForm.appointmentTime}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, appointmentTime: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-slate-50/50 rounded-xl p-4 sm:p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Additional Information</h3>
                    <span className="text-xs text-slate-400 ml-auto">Optional</span>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Special Requests</label>
                      <textarea
                        value={newBookingForm.specialRequests}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, specialRequests: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm h-16 sm:h-20 resize-none"
                        placeholder="Any special requests from the customer..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Message</label>
                      <textarea
                        value={newBookingForm.message}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, message: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm h-16 sm:h-20 resize-none"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex gap-2 sm:gap-3 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl hover:bg-white transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBooking}
                  className="flex-1 px-3 sm:px-4 py-2.5 bg-[#DFB13B] text-white rounded-lg sm:rounded-xl hover:bg-[#C9A032] transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm shadow-[#DFB13B]/20 text-sm"
                >
                  {savingBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">Creating...</span>
                      <span className="sm:hidden">Wait...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Create Appointment</span>
                      <span className="sm:hidden">Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Delete Appointment?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete this appointment? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteBooking(showDeleteConfirm)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCancelConfirm(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Cancel Appointment?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to cancel this appointment? The customer will be notified about the cancellation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-medium"
                >
                  No, Keep It
                </button>
                <button
                  onClick={async () => {
                    await updateBookingStatus(showCancelConfirm, 'cancelled')
                    setShowCancelConfirm(null)
                  }}
                  disabled={actionLoading === 'cancelled'}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'cancelled' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Yes, Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal - Compact Modern Design */}
      {showMessageModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMessageModal(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Send Message</h2>
                    <p className="text-white/80 text-xs">to {selectedBooking.firstName} {selectedBooking.lastName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Status Notification */}
            {messageStatus && (
              <div className={`px-5 py-2.5 flex items-center gap-2 ${
                messageStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {messageStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">{messageStatus.text}</span>
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Inline Contact Info */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#DFB13B]" />
                  <span className="truncate max-w-[140px]">{selectedBooking.email}</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#DFB13B]" />
                  <span>{selectedBooking.phoneNumber}</span>
                </div>
              </div>

              {/* Compact Type Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMessageType('email')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    messageType === 'email'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('sms')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    messageType === 'sms'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  SMS
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                {messageType === 'email' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#DFB13B] focus:ring-2 focus:ring-[#DFB13B]/10 transition-all text-sm"
                      placeholder="Email subject..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message</label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#DFB13B] focus:ring-2 focus:ring-[#DFB13B]/10 transition-all text-sm resize-none ${
                      messageType === 'email' ? 'h-24' : 'h-28'
                    }`}
                    placeholder={messageType === 'email' ? 'Write your message...' : 'Write your SMS...'}
                  />
                  {messageType === 'sms' && (
                    <div className="flex items-center justify-end mt-1">
                      <p className={`text-[10px] font-medium ${messageContent.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                        {messageContent.length}/160
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/25 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send {messageType === 'email' ? 'Email' : 'SMS'}
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

export default MassageBooking
import { useState, useEffect } from 'react'
import { Search, Plus, Send, CheckCircle, XCircle, Loader2, Calendar, User, Home, CreditCard, X, Save, Clock, Mail, Phone, BedDouble, Car, Euro, CalendarCheck, MessageSquare, FileText } from 'lucide-react'
import Sidebar from '../components/Sidebar'

interface PropertyOption {
  _id: string
  name: string
  price: number
  guests: number
  bedrooms: number
  parking: string
}

interface BookingData {
  _id: string
  bookingId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  property: {
    propertyId: string
    name: string
    price: number
    guests: number
    bedrooms: number
    parking: string
  } | null
  booking: {
    checkInDate: string
    checkOutDate?: string
    checkInTime: string
    checkOutTime: string
    numberOfNights: number
    totalPrice: number
  }
  specialRequests: string
  message: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment: {
    totalAmount: number
    deposit: number
    depositPaid: boolean
    remainingBalance: number
    balanceDueDate?: string
    paymentStatus: string
  }
  emailSent: boolean
  createdAt: string
  updatedAt: string
}

import { API_BASE_URL } from '../config/api'
const API_URL = API_BASE_URL

const RentalBooking = () => {
  // const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [savingBooking, setSavingBooking] = useState(false)
  const [newBookingForm, setNewBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    propertyId: '',
    checkInDate: '',
    checkInTime: '10:30',
    checkOutTime: '10:00',
    specialRequests: '',
    message: ''
  })

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/bookings`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      const data = await response.json()
      if (data.success) {
        setBookings(data.data)
        if (data.data.length > 0 && !selectedBooking) {
          setSelectedBooking(data.data[0])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties`)
      if (!response.ok) throw new Error('Failed to fetch properties')
      const data = await response.json()
      if (data.success) {
        setProperties(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingBooking(true)

    try {
      const selectedProperty = properties.find(p => p._id === newBookingForm.propertyId)

      const response = await fetch(`${API_URL}/bookings/rental`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newBookingForm.firstName,
          lastName: newBookingForm.lastName,
          email: newBookingForm.email,
          phone: newBookingForm.phone,
          gender: newBookingForm.gender,
          specialRequests: newBookingForm.specialRequests,
          message: newBookingForm.message,
          property: selectedProperty ? {
            propertyId: selectedProperty._id,
            name: selectedProperty.name,
            price: selectedProperty.price,
            guests: selectedProperty.guests,
            bedrooms: selectedProperty.bedrooms,
            parking: selectedProperty.parking
          } : null,
          booking: {
            // Send Belgium calendar date as YYYY-MM-DD — backend stores it at Belgium midnight.
            // Avoids browser-local `.toISOString()` drift (e.g. UTC-5 turning "2026-04-20" into a UTC "2026-04-20T05:00:00Z").
            fullDate: newBookingForm.checkInDate,
            checkInTime: newBookingForm.checkInTime,
            checkOutTime: newBookingForm.checkOutTime
          }
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
          phone: '',
          gender: 'male',
          propertyId: '',
          checkInDate: '',
          checkInTime: '10:30',
          checkOutTime: '10:00',
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
    fetchProperties()
    setShowNewBookingModal(true)
  }

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      setActionLoading(status)
      const response = await fetch(`${API_URL}/bookings/${id}/status`, {
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

  const updatePaymentStatus = async (id: string, depositPaid: boolean) => {
    try {
      setActionLoading('payment')
      const response = await fetch(`${API_URL}/bookings/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositPaid, paymentStatus: depositPaid ? 'deposit_paid' : 'pending' })
      })
      if (!response.ok) throw new Error('Failed to update payment')
      const data = await response.json()
      if (data.success) {
        setBookings(prev => prev.map(b => b._id === id ? data.data : b))
        if (selectedBooking?._id === id) {
          setSelectedBooking(data.data)
        }
      }
    } catch {
      alert('Failed to update payment status')
    } finally {
      setActionLoading(null)
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

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter
    const searchMatch = searchQuery === '' ||
      `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return statusMatch && searchMatch
  })

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#DFB13B] mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to load bookings</h3>
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
      <Sidebar />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Rental Bookings</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage holiday rental reservations</p>
            </div>
            <button
              onClick={openNewBookingModal}
              className="flex items-center gap-2 bg-[#DFB13B] text-white px-5 py-2.5 rounded-xl hover:bg-[#C9A032] transition font-medium shadow-sm shadow-[#DFB13B]/20"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-[420px] border-r border-slate-200 flex flex-col bg-white">
            {/* Search & Filter */}
            <div className="p-4 space-y-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                {[
                  { key: 'all', label: 'All', count: stats.total },
                  { key: 'pending', label: 'Pending', count: stats.pending },
                  { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
                  { key: 'completed', label: 'Done', count: stats.completed }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === tab.key
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      statusFilter === tab.key ? 'bg-[#DFB13B]/10 text-[#DFB13B]' : 'bg-slate-200/50'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Booking List */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-700">No bookings found</p>
                  <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status)
                    const isSelected = selectedBooking?._id === booking._id

                    return (
                      <div
                        key={booking._id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#DFB13B]/5 border-l-3 border-l-[#DFB13B]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${
                              booking.gender === 'male' ? 'bg-blue-500' : booking.gender === 'female' ? 'bg-pink-500' : 'bg-slate-500'
                            }`}>
                              {booking.firstName?.charAt(0)}{booking.lastName?.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm">{booking.firstName} {booking.lastName}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{booking.property?.name || 'No property'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(booking.booking.checkInDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Euro className="w-3.5 h-3.5" />
                              {booking.payment.totalAmount?.toFixed(0) || '0'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">#{booking.bookingId}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {selectedBooking ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Booking Header Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-xl font-bold">
                          {selectedBooking.firstName?.charAt(0)}{selectedBooking.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold">{selectedBooking.firstName} {selectedBooking.lastName}</h2>
                          <p className="text-white/80 text-sm">{selectedBooking.property?.name || 'No property assigned'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Booking ID</p>
                        <p className="text-lg font-mono font-semibold">#{selectedBooking.bookingId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 divide-x divide-slate-100">
                    <div className="p-4 text-center">
                      <p className="text-2xl font-bold text-slate-800">€{selectedBooking.payment.totalAmount?.toFixed(0) || '0'}</p>
                      <p className="text-xs text-slate-500 mt-1">Total Amount</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-2xl font-bold text-slate-800">{selectedBooking.property?.bedrooms || '-'}</p>
                      <p className="text-xs text-slate-500 mt-1">Bedrooms</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-2xl font-bold text-slate-800">{selectedBooking.property?.guests || '-'}</p>
                      <p className="text-xs text-slate-500 mt-1">Guests</p>
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'confirmed')}
                      disabled={actionLoading === 'confirmed'}
                      className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition font-medium shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === 'confirmed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'completed')}
                      disabled={actionLoading === 'completed'}
                      className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition font-medium shadow-sm disabled:opacity-50"
                    >
                      {actionLoading === 'completed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                      Mark Complete
                    </button>
                  )}
                  <button className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition font-medium shadow-sm">
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                  {!selectedBooking.payment.depositPaid && (
                    <button
                      onClick={() => updatePaymentStatus(selectedBooking._id, true)}
                      disabled={actionLoading === 'payment'}
                      className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition font-medium disabled:opacity-50"
                    >
                      {actionLoading === 'payment' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      Mark Paid
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'cancelled')}
                      disabled={actionLoading === 'cancelled'}
                      className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-100 transition font-medium border border-red-200 disabled:opacity-50"
                    >
                      {actionLoading === 'cancelled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Cancel
                    </button>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Guest Information */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-[#DFB13B]" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Guest Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
                          selectedBooking.gender === 'male' ? 'bg-blue-500' : selectedBooking.gender === 'female' ? 'bg-pink-500' : 'bg-slate-500'
                        }`}>
                          {selectedBooking.firstName?.charAt(0)}{selectedBooking.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{selectedBooking.firstName} {selectedBooking.lastName}</p>
                          <p className="text-xs text-slate-500 capitalize">{selectedBooking.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{selectedBooking.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{selectedBooking.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#DFB13B]" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Booking Details</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">Check-in</span>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{formatDate(selectedBooking.booking.checkInDate)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="text-xs text-slate-500">In Time</span>
                          <span className="text-sm font-medium text-slate-800">{selectedBooking.booking.checkInTime}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="text-xs text-slate-500">Out Time</span>
                          <span className="text-sm font-medium text-slate-800">{selectedBooking.booking.checkOutTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Booked on {formatDate(selectedBooking.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  {selectedBooking.property && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                          <Home className="w-4 h-4 text-[#DFB13B]" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Property</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-gradient-to-r from-[#DFB13B]/5 to-transparent rounded-xl">
                          <p className="font-medium text-slate-800">{selectedBooking.property.name}</p>
                          <p className="text-2xl font-bold text-[#DFB13B] mt-1">€{selectedBooking.property.price}<span className="text-sm font-normal text-slate-500">/night</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <BedDouble className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{selectedBooking.property.bedrooms} Bedrooms</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <Car className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{selectedBooking.property.parking}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-[#DFB13B]" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Payment</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-600">Total Amount</span>
                        <span className="text-lg font-bold text-slate-800">€{selectedBooking.payment.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Deposit (30%)</span>
                        <span className="text-sm font-medium text-slate-700">€{selectedBooking.payment.deposit?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Remaining</span>
                        <span className="text-sm font-medium text-slate-700">€{selectedBooking.payment.remainingBalance?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          selectedBooking.payment.depositPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedBooking.payment.depositPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {selectedBooking.payment.depositPaid ? 'Deposit Paid' : 'Awaiting Payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {(selectedBooking.specialRequests || selectedBooking.message) && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-[#DFB13B]" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Additional Notes</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedBooking.specialRequests && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Special Requests</p>
                          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{selectedBooking.specialRequests}</p>
                        </div>
                      )}
                      {selectedBooking.message && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Message</p>
                          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{selectedBooking.message}</p>
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
                <p className="text-lg font-medium text-slate-700">Select a booking</p>
                <p className="text-sm text-slate-400 mt-1">Choose a booking from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewBookingModal(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Create New Booking</h2>
                  <p className="text-white/70 text-sm mt-0.5">Add a new rental reservation</p>
                </div>
                <button
                  onClick={() => setShowNewBookingModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="overflow-y-auto max-h-[calc(90vh-100px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={newBookingForm.firstName}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={newBookingForm.lastName}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={newBookingForm.email}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={newBookingForm.phone}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                        placeholder="+32 123456789"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Gender</label>
                      <div className="flex gap-3">
                        {['male', 'female', 'other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setNewBookingForm({ ...newBookingForm, gender: g })}
                            className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${
                              newBookingForm.gender === g
                                ? 'bg-[#DFB13B] text-white border-[#DFB13B]'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <Home className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Property Selection</h3>
                  </div>
                  <select
                    value={newBookingForm.propertyId}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, propertyId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                    required
                  >
                    <option value="">Select a property</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.name} - €{property.price}/night ({property.bedrooms} BR, {property.guests} guests)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booking Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Booking Details</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Check-in Date</label>
                      <input
                        type="date"
                        value={newBookingForm.checkInDate}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, checkInDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Check-in Time</label>
                      <input
                        type="time"
                        value={newBookingForm.checkInTime}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, checkInTime: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Check-out Time</label>
                      <input
                        type="time"
                        value={newBookingForm.checkOutTime}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, checkOutTime: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#DFB13B]/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <h3 className="font-semibold text-slate-800">Additional Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Special Requests</label>
                      <textarea
                        value={newBookingForm.specialRequests}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, specialRequests: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm h-20 resize-none"
                        placeholder="Any special requests from the guest..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Message</label>
                      <textarea
                        value={newBookingForm.message}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, message: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm h-20 resize-none"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBooking}
                  className="flex-1 px-4 py-2.5 bg-[#DFB13B] text-white rounded-xl hover:bg-[#C9A032] transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm shadow-[#DFB13B]/20"
                >
                  {savingBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RentalBooking

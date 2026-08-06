import { useState, useEffect } from 'react'
import { Search, Users as UsersIcon, Mail, Phone, MapPin, Calendar, X, Loader2, Eye, UserCircle, CalendarCheck, Sparkles, TrendingUp, Clock, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL } from '../config/api'

interface UserData {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  country: string
  gender: string
  totalBookings: number
  firstBooking: string
  lastBooking: string
}

interface UserDetails {
  user: {
    firstName: string
    lastName: string
    fullName: string
    email: string
    phoneNumber: string
    country: string
    gender: string
  }
  stats: {
    totalBookings: number
    completedBookings: number
    pendingBookings: number
    cancelledBookings: number
  }
  bookings: Array<{
    _id: string
    enrollmentId: number
    serviceTitle: string
    appointmentDate: string
    appointmentTime: string
    status: string
  }>
}

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

const Users = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/enrollments/users`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUserDetails = async (email: string) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/users/${encodeURIComponent(email)}`)
      const data = await response.json()
      if (data.success) {
        setSelectedUser(data.data)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber?.includes(searchQuery)

    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Brussels',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'confirmed': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border border-red-200'
      default: return 'bg-slate-50 text-slate-700 border border-slate-200'
    }
  }

  const totalUsers = users.length
  const maleUsers = users.filter(u => u.gender === 'male').length
  const femaleUsers = users.filter(u => u.gender === 'female').length
  const totalBookings = users.reduce((sum, u) => sum + u.totalBookings, 0)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-semibold text-slate-800">Customer Management</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 hidden sm:block">View and manage your customers across all services</p>
              </div>
            </div>
            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-64 lg:w-80 focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Mobile Search */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-sm"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-[#DFB13B]/20 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Total Customers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalUsers}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Active</span> <span className="hidden sm:inline">users</span>
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#DFB13B]/10 to-[#DFB13B]/5 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#DFB13B]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Male Customers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{maleUsers}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
                    {totalUsers > 0 ? Math.round((maleUsers / totalUsers) * 100) : 0}% of total
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-pink-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Female Customers</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{femaleUsers}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
                    {totalUsers > 0 ? Math.round((femaleUsers / totalUsers) * 100) : 0}% of total
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-pink-50 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm group hover:shadow-md hover:border-amber-200 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalBookings}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    All time
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 text-sm sm:text-base">
                  Massage Booking Customers
                </h3>
                <span className="text-xs sm:text-sm text-slate-500">
                  {filteredUsers.length}/{totalUsers}
                </span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-16 sm:py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-[#DFB13B] animate-spin mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Loading customers...</p>
                </div>
              </div>
            )}

            {/* User Cards */}
            {!loading && (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="px-4 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                          user.gender === 'male'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : user.gender === 'female'
                            ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                            : 'bg-gradient-to-br from-slate-500 to-slate-600'
                        }`}>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>

                        {/* User Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800">{user.fullName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${
                              user.gender === 'male'
                                ? 'bg-blue-50 text-blue-600'
                                : user.gender === 'female'
                                ? 'bg-pink-50 text-pink-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {user.gender}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-slate-500 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {user.email}
                            </span>
                            <span className="text-sm text-slate-500 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {user.phoneNumber}
                            </span>
                            <span className="text-sm text-slate-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {countryNames[user.country] || user.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center gap-6">
                        {/* Bookings Count */}
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-800">{user.totalBookings}</p>
                          <p className="text-xs text-slate-500">Bookings</p>
                        </div>

                        {/* Last Activity */}
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm font-medium text-slate-700">{formatDate(user.lastBooking)}</p>
                          <p className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            Last active
                          </p>
                        </div>

                        {/* View Button */}
                        <button
                          onClick={() => fetchUserDetails(user.email)}
                          disabled={loadingDetails}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-[#DFB13B] hover:text-white transition-all text-sm font-medium group-hover:bg-[#DFB13B] group-hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-sm flex-shrink-0 ${
                          user.gender === 'male'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : user.gender === 'female'
                            ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                            : 'bg-gradient-to-br from-slate-500 to-slate-600'
                        }`}>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{user.fullName}</h4>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium uppercase ${
                              user.gender === 'male'
                                ? 'bg-blue-50 text-blue-600'
                                : user.gender === 'female'
                                ? 'bg-pink-50 text-pink-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {user.gender}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              {user.email}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              {user.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-slate-800">{user.totalBookings}</p>
                            <p className="text-[10px] text-slate-500">Bookings</p>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-slate-700">{formatDate(user.lastBooking)}</p>
                            <p className="text-[10px] text-slate-400">Last active</p>
                          </div>
                        </div>
                        <button
                          onClick={() => fetchUserDetails(user.email)}
                          disabled={loadingDetails}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DFB13B] text-white rounded-lg text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {filteredUsers.length === 0 && !loading && (
                  <div className="text-center py-12 sm:py-20 px-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UsersIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-1">No customers found</h3>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      {searchQuery
                        ? 'Try adjusting your search terms'
                        : 'Customers will appear here once they make massage bookings'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032] px-6 py-8 text-white relative">
              <button
                onClick={() => { setIsModalOpen(false); setSelectedUser(null) }}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {selectedUser.user.firstName?.charAt(0)}{selectedUser.user.lastName?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-white/70" />
                    <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Massage Customer</span>
                  </div>
                  <h3 className="text-xl font-semibold">{selectedUser.user.fullName}</h3>
                  <p className="text-white/80 text-sm">{selectedUser.user.email}</p>
                </div>
              </div>

              {/* Contact Info Pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  {selectedUser.user.phoneNumber}
                </span>
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {countryNames[selectedUser.user.country] || selectedUser.user.country}
                </span>
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur rounded-lg text-sm capitalize">
                  {selectedUser.user.gender}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800">{selectedUser.stats.totalBookings}</p>
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{selectedUser.stats.completedBookings}</p>
                  <p className="text-xs text-emerald-600 font-medium">Completed</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{selectedUser.stats.pendingBookings}</p>
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-500">{selectedUser.stats.cancelledBookings}</p>
                  <p className="text-xs text-red-500 font-medium">Cancelled</p>
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Booking History</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {selectedUser.bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{booking.serviceTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(booking.appointmentDate)} at {booking.appointmentTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">#{booking.enrollmentId}</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Users

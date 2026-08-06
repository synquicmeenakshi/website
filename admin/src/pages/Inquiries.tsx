import { useState, useEffect, useRef } from 'react'
import { Search, Mail, Phone, Calendar, User, Clock, MessageSquare, Trash2, Eye, CheckCircle, AlertCircle, Archive, Loader2, Menu, Filter, ChevronDown, ArrowLeft, Send } from 'lucide-react'
import Sidebar from '../components/Sidebar'

type FilterPeriod = 'all' | 'day' | 'week' | 'month' | 'year'

interface InquiryData {
  _id: string
  firstName: string
  lastName: string
  email: string
  countryCode: string
  phone: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  createdAt: string
}

import { API_BASE_URL } from '../config/api'
const API_URL = API_BASE_URL

const Inquiries = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [inquiries, setInquiries] = useState<InquiryData[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryData | null>(null)
  const [showDetail, setShowDetail] = useState(false) // For mobile view
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  const filterOptions: { value: FilterPeriod; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ]

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

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/contact?source=massage`)
      if (!response.ok) throw new Error('Failed to fetch inquiries')
      const data = await response.json()
      if (data.success) {
        setInquiries(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      setActionLoading(status)
      const response = await fetch(`${API_URL}/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update status')
      await fetchInquiries()
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: status as InquiryData['status'] } : null)
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteInquiry = async (id: string) => {
    try {
      setActionLoading('delete')
      const response = await fetch(`${API_URL}/contact/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete inquiry')
      await fetchInquiries()
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(null)
        setShowDetail(false)
      }
      setShowDeleteConfirm(false)
      setDeleteId(null)
    } catch (err) {
      console.error('Error deleting inquiry:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const getFilteredByPeriod = (data: InquiryData[]) => {
    const now = new Date()
    let startDate: Date

    switch (filterPeriod) {
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

    return data.filter(inquiry => new Date(inquiry.createdAt) >= startDate)
  }

  const filteredInquiries = getFilteredByPeriod(inquiries).filter(inquiry => {
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    const matchesSearch =
      inquiry.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new': return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }
      case 'read': return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' }
      case 'replied': return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
      case 'archived': return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Brussels',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const statusCounts = {
    all: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    read: inquiries.filter(i => i.status === 'read').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    archived: inquiries.filter(i => i.status === 'archived').length
  }

  const handleSelectInquiry = (inquiry: InquiryData) => {
    setSelectedInquiry(inquiry)
    setShowDetail(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header - Modern Design */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 relative z-50">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Massage Inquiries</h1>
                <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">Manage contact form submissions</p>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs sm:text-sm font-medium text-slate-700"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{filterOptions.find(opt => opt.value === filterPeriod)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden w-48 z-[100]">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterPeriod(option.value)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                        filterPeriod === option.value
                          ? 'bg-gradient-to-r from-[#DFB13B]/10 to-[#C9A032]/5 text-[#DFB13B] font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats row - Mobile: Compact badges, Desktop: Gradient cards */}
          {!loading && (
            <>
              {/* Mobile: Compact badges */}
              <div className="flex sm:hidden items-center gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 rounded-lg shrink-0">
                  <span className="w-2 h-2 bg-violet-400 rounded-full"></span>
                  <span className="text-xs text-violet-700">{statusCounts.all} total</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg shrink-0">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span className="text-xs text-blue-700">{statusCounts.new} new</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg shrink-0">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="text-xs text-amber-700">{statusCounts.read} read</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg shrink-0">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span className="text-xs text-emerald-700">{statusCounts.replied} replied</span>
                </div>
              </div>

              {/* Desktop: Modern gradient stat cards */}
              <div className="hidden sm:grid grid-cols-4 gap-3 mt-3">
                {/* Total Inquiries */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 p-3.5 shadow-md">
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{statusCounts.all}</p>
                      <p className="text-xs text-white/80">Total Inquiries</p>
                    </div>
                    <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* New */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 p-3.5 shadow-md">
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{statusCounts.new}</p>
                      <p className="text-xs text-white/80">New</p>
                    </div>
                    <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Read */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-3.5 shadow-md">
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{statusCounts.read}</p>
                      <p className="text-xs text-white/80">Read</p>
                    </div>
                    <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Replied */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-3.5 shadow-md">
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{statusCounts.replied}</p>
                      <p className="text-xs text-white/80">Replied</p>
                    </div>
                    <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-3" style={{ scrollbarWidth: 'thin' }}>
          {/* Compact Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#DFB13B] focus:ring-2 focus:ring-[#DFB13B]/10 transition-all"
              />
            </div>

            {/* Status Filter Tabs - Compact */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'all', label: 'All' },
                { key: 'new', label: 'New' },
                { key: 'read', label: 'Read' },
                { key: 'replied', label: 'Replied' },
                { key: 'archived', label: 'Archived' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    statusFilter === key
                      ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {label}
                  <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                    statusFilter === key ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    {statusCounts[key as keyof typeof statusCounts]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area - Responsive Layout */}
          <div className="flex gap-3 sm:gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
            {/* Inquiry List - Full width on mobile, fixed width on desktop */}
            <div className={`${showDetail ? 'hidden lg:block' : 'w-full'} lg:w-96 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col`}>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Inquiries</h3>
                    <p className="text-[10px] text-slate-500">{filteredInquiries.length} messages</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      </div>
                      <p className="text-slate-500 text-xs">Loading inquiries...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-48 text-red-500 p-4">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm text-center">{error}</p>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <p className="font-medium text-slate-600">No inquiries found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filteredInquiries.map(inquiry => {
                      const statusConfig = getStatusConfig(inquiry.status)
                      const isSelected = selectedInquiry?._id === inquiry._id
                      return (
                        <div
                          key={inquiry._id}
                          onClick={() => handleSelectInquiry(inquiry)}
                          className={`p-3 sm:p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                            isSelected ? 'bg-gradient-to-r from-[#DFB13B]/10 to-[#C9A032]/5 border-l-4 border-[#DFB13B]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-[#DFB13B]/30 shrink-0">
                              {inquiry.firstName.charAt(0)}{inquiry.lastName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-slate-800 text-sm truncate">
                                  {inquiry.firstName} {inquiry.lastName}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase shrink-0 ${statusConfig.bg} ${statusConfig.text}`}>
                                  {inquiry.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mb-1.5">{inquiry.email}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                {inquiry.message}
                              </p>
                              <div className="flex items-center text-[10px] text-slate-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {getTimeAgo(inquiry.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Detail Panel - Full width on mobile when selected, flex-1 on desktop */}
            <div className={`${showDetail ? 'w-full' : 'hidden'} lg:flex lg:flex-1 flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-0`}>
              {selectedInquiry ? (
                <>
                  {/* Detail Header with Gradient */}
                  <div className="bg-gradient-to-r from-[#DFB13B] via-[#E8C54A] to-[#C9A032] p-4 sm:p-5 relative overflow-hidden shrink-0">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute -bottom-8 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        {/* Back button - mobile only */}
                        <button
                          onClick={() => setShowDetail(false)}
                          className="lg:hidden flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(selectedInquiry._id)
                            setShowDeleteConfirm(true)
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                          {selectedInquiry.firstName.charAt(0)}{selectedInquiry.lastName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-white">
                            {selectedInquiry.firstName} {selectedInquiry.lastName}
                          </h2>
                          <p className="text-white/80 text-xs sm:text-sm">{selectedInquiry.email}</p>
                          <span className={`inline-block mt-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold uppercase ${getStatusConfig(selectedInquiry.status).bg} ${getStatusConfig(selectedInquiry.status).text}`}>
                            {selectedInquiry.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500">Email</p>
                          <p className="text-xs font-medium text-slate-800 truncate">{selectedInquiry.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/30">
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500">Phone</p>
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {selectedInquiry.countryCode} {selectedInquiry.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500">Received</p>
                          <p className="text-xs font-medium text-slate-800 truncate">{formatDate(selectedInquiry.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/30">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500">Full Name</p>
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {selectedInquiry.firstName} {selectedInquiry.lastName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message Card */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-lg flex items-center justify-center shadow-md shadow-[#DFB13B]/30">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Message</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {selectedInquiry.message}
                        </p>
                      </div>
                    </div>

                    {/* Status Actions Card */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center shadow-md shadow-slate-500/30">
                          <Send className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">Update Status</h3>
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(selectedInquiry._id, 'new')}
                            disabled={actionLoading !== null || selectedInquiry.status === 'new'}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              selectedInquiry.status === 'new'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            New
                          </button>
                          <button
                            onClick={() => updateStatus(selectedInquiry._id, 'read')}
                            disabled={actionLoading !== null || selectedInquiry.status === 'read'}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              selectedInquiry.status === 'read'
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === 'read' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                            Read
                          </button>
                          <button
                            onClick={() => updateStatus(selectedInquiry._id, 'replied')}
                            disabled={actionLoading !== null || selectedInquiry.status === 'replied'}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              selectedInquiry.status === 'replied'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === 'replied' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Replied
                          </button>
                          <button
                            onClick={() => updateStatus(selectedInquiry._id, 'archived')}
                            disabled={actionLoading !== null || selectedInquiry.status === 'archived'}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              selectedInquiry.status === 'archived'
                                ? 'bg-gradient-to-r from-slate-500 to-slate-700 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading === 'archived' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                            Archive
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(selectedInquiry._id)
                              setShowDeleteConfirm(true)
                            }}
                            disabled={actionLoading !== null}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-full text-slate-400 p-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                    <MessageSquare className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-600">Select an inquiry</p>
                  <p className="text-sm text-slate-400 mt-1">Choose from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowDeleteConfirm(false); setDeleteId(null) }}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Inquiry</h3>
                  <p className="text-white/80 text-xs">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-slate-600 text-sm mb-5">
                Are you sure you want to delete this inquiry? All associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteId(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteId && deleteInquiry(deleteId)}
                  disabled={actionLoading === 'delete'}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {actionLoading === 'delete' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inquiries

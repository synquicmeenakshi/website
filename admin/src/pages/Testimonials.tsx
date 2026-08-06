import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, X, Save, Loader2, Star, Quote, MessageCircle, Filter, Eye, EyeOff, ChevronDown, Sparkles, Home, Menu, Award } from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL } from '../config/api'

// Available profile images for selection
const availablePhotos = [
  { name: 'profile1.png', label: 'Avatar 1', color: 'from-blue-400 to-blue-600' },
  { name: 'profile2.png', label: 'Avatar 2', color: 'from-purple-400 to-purple-600' },
  { name: 'profile3.png', label: 'Avatar 3', color: 'from-emerald-400 to-emerald-600' },
  { name: 'profile4.png', label: 'Avatar 4', color: 'from-amber-400 to-amber-600' },
]

// Color palette for dynamic property tabs
const propertyColors = [
  { gradient: 'from-blue-600 to-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
  { gradient: 'from-emerald-600 to-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { gradient: 'from-purple-600 to-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
  { gradient: 'from-rose-600 to-rose-500', bg: 'bg-rose-100', text: 'text-rose-600' },
  { gradient: 'from-cyan-600 to-cyan-500', bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { gradient: 'from-orange-600 to-orange-500', bg: 'bg-orange-100', text: 'text-orange-600' },
]

interface Property {
  _id: string
  name: string
  isActive?: boolean
}

interface TestimonialLangTranslation {
  text?: string
  role?: string
}

interface Testimonial {
  _id: string
  name: string
  role: string
  text: string
  photo: string
  photoUrl?: string
  rating: number
  propertyId?: string
  propertyName?: string
  category?: string
  isActive: boolean
  displayOrder: number
  createdAt?: string
  translations?: { fr?: TestimonialLangTranslation; de?: TestimonialLangTranslation; nl?: TestimonialLangTranslation; es?: TestimonialLangTranslation }
}

interface TestimonialFormData {
  name: string
  role: string
  text: string
  photo: string
  photoUrl: string
  rating: number
  propertyId: string
  propertyName: string
  category: string
  isActive: boolean
}

const initialFormData: TestimonialFormData = {
  name: '',
  role: '',
  text: '',
  photo: 'profile1.png',
  photoUrl: '',
  rating: 5,
  propertyId: '',
  propertyName: '',
  category: 'massage',
  isActive: true
}

const Testimonials = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('massage') // 'massage' or property ID
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState<TestimonialFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Translation state
  const emptyTranslations = { fr: {}, de: {}, nl: {}, es: {} }
  const [testimonialTranslations, setTestimonialTranslations] = useState<Record<string, TestimonialLangTranslation>>(emptyTranslations)
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'de' | 'nl' | 'es'>('en')

  // Fetch properties for tabs and dropdown
  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true)
      const response = await fetch(`${API_BASE_URL}/properties?all=true`)
      const data = await response.json()
      if (data.success) {
        setProperties(data.data)
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setPropertiesLoading(false)
    }
  }

  // Get API endpoint
  const getApiEndpoint = () => {
    return 'testimonials'
  }

  // Get API query params based on active tab
  const getQueryParams = () => {
    if (activeTab === 'massage') return '?category=massage'
    // For property tabs, use propertyName
    const property = properties.find(p => p._id === activeTab)
    if (property) return `?propertyName=${encodeURIComponent(property.name)}`
    return ''
  }

  // Get current tab info
  const getCurrentTabInfo = () => {
    if (activeTab === 'massage') {
      return { name: 'Massage', category: 'massage', propertyName: '', propertyId: '' }
    }
    const property = properties.find(p => p._id === activeTab)
    if (property) {
      return { name: property.name, category: 'rental', propertyName: property.name, propertyId: property._id }
    }
    return { name: 'Unknown', category: 'massage', propertyName: '', propertyId: '' }
  }

  // Get color for property tab (by index)
  const getPropertyColor = (index: number) => {
    return propertyColors[index % propertyColors.length]
  }

  // Fetch testimonials
  useEffect(() => {
    fetchTestimonials()
  }, [activeTab])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      setError('')
      const queryParams = getQueryParams()
      const response = await fetch(`${API_BASE_URL}/testimonials/admin${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setTestimonials(data.data)
      } else {
        setError('Failed to fetch testimonials')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error('Error fetching testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  // Open modal for adding new testimonial
  const handleAddNew = () => {
    setEditingTestimonial(null)
    const tabInfo = getCurrentTabInfo()
    setFormData({
      ...initialFormData,
      category: tabInfo.category,
      propertyName: tabInfo.propertyName,
      propertyId: tabInfo.propertyId
    })
    setTestimonialTranslations(emptyTranslations)
    setSelectedLang('en')
    setShowModal(true)
  }

  // Open modal for editing testimonial
  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      photo: testimonial.photo,
      photoUrl: testimonial.photoUrl || '',
      rating: testimonial.rating,
      propertyId: testimonial.propertyId || '',
      propertyName: testimonial.propertyName || '',
      category: testimonial.category || 'massage',
      isActive: testimonial.isActive
    })
    setTestimonialTranslations({
      fr: testimonial.translations?.fr || {},
      de: testimonial.translations?.de || {},
      nl: testimonial.translations?.nl || {},
      es: testimonial.translations?.es || {},
    })
    setSelectedLang('en')
    setShowModal(true)
  }

  const updateTranslation = (lang: string, field: string, value: string) => {
    setTestimonialTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
  }

  // Save testimonial (create or update)
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.text.trim()) {
      alert('Please fill in name and testimonial text')
      return
    }

    try {
      setSaving(true)
      const url = editingTestimonial
        ? `${API_BASE_URL}/${getApiEndpoint()}/${editingTestimonial._id}`
        : `${API_BASE_URL}/${getApiEndpoint()}`

      const method = editingTestimonial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, translations: testimonialTranslations })
      })

      const data = await response.json()

      if (data.success) {
        setShowModal(false)
        fetchTestimonials()
        setFormData(initialFormData)
        setTestimonialTranslations(emptyTranslations)
        setEditingTestimonial(null)
      } else {
        alert(data.message || 'Failed to save testimonial')
      }
    } catch (err) {
      console.error('Error saving testimonial:', err)
      alert('Error saving testimonial')
    } finally {
      setSaving(false)
    }
  }

  // Delete testimonial
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${getApiEndpoint()}/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchTestimonials()
      } else {
        alert(data.message || 'Failed to delete testimonial')
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err)
      alert('Error deleting testimonial')
    }
  }

  // Toggle active status
  const handleToggleStatus = async (testimonial: Testimonial) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${getApiEndpoint()}/${testimonial._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !testimonial.isActive })
      })

      const data = await response.json()

      if (data.success) {
        fetchTestimonials()
      } else {
        console.error('Toggle status failed:', data.message)
      }
    } catch (err) {
      console.error('Error toggling status:', err)
    }
  }

  // Seed default testimonials
  const handleSeedTestimonials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/${getApiEndpoint()}/seed`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        alert(data.message)
        fetchTestimonials()
      } else {
        alert(data.message || 'Failed to seed testimonials')
      }
    } catch (err) {
      console.error('Error seeding testimonials:', err)
      alert('Error seeding testimonials')
    }
  }

  // Filter testimonials
  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.role.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && testimonial.isActive) ||
      (filterStatus === 'inactive' && !testimonial.isActive)

    return matchesSearch && matchesFilter
  })

  // Stats
  const totalTestimonials = testimonials.length
  const activeTestimonials = testimonials.filter(t => t.isActive).length
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0'

  // Get avatar color based on photo
  const getAvatarColor = (photo: string) => {
    const found = availablePhotos.find(p => p.name === photo)
    return found?.color || 'from-gray-400 to-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header - Clean Design like Dashboard */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 relative z-50">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3 sm:mb-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Testimonials</h1>
                <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">Manage customer reviews</p>
              </div>
            </div>

            {/* Tabs - Desktop only in header */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {/* Massage Tab (always first) */}
              <button
                onClick={() => setActiveTab('massage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'massage'
                    ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Massage
              </button>
              {/* Dynamic Property Tabs */}
              {properties.map((property, index) => {
                const color = getPropertyColor(index)
                return (
                  <button
                    key={property._id}
                    onClick={() => setActiveTab(property._id)}
                    title={property.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === property._id
                        ? `bg-gradient-to-r ${color.gradient} text-white shadow-md`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5 flex-shrink-0" />
                    {property.name}
                  </button>
                )
              })}
              {propertiesLoading && (
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* Tabs - Mobile only (below title) */}
          <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {/* Massage Tab (always first) */}
            <button
              onClick={() => setActiveTab('massage')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'massage'
                  ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Massage
            </button>
            {/* Dynamic Property Tabs */}
            {properties.map((property, index) => {
              const color = getPropertyColor(index)
              return (
                <button
                  key={property._id}
                  onClick={() => setActiveTab(property._id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === property._id
                      ? `bg-gradient-to-r ${color.gradient} text-white shadow-md`
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Home className="w-3 h-3 flex-shrink-0" />
                  {property.name}
                </button>
              )
            })}
          </div>

          {/* Stats row - Compact gradient cards like Dashboard */}
          {!loading && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
              {/* Total Reviews */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] p-2.5 sm:p-3 shadow-md">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-white">{totalTestimonials}</p>
                    <p className="text-[10px] sm:text-xs text-white/80">Total</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Active */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 sm:p-3 shadow-md">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-white">{activeTestimonials}</p>
                    <p className="text-[10px] sm:text-xs text-white/80">Active</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Avg Rating */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 sm:p-3 shadow-md">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-lg sm:text-xl font-bold text-white">{avgRating}</p>
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white fill-white" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-white/80">Rating</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 transition"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{filterStatus === 'all' ? 'All' : filterStatus}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[120px] z-20">
                    {['all', 'active', 'inactive'].map((status) => (
                      <button
                        key={status}
                        onClick={() => { setFilterStatus(status as 'all' | 'active' | 'inactive'); setShowFilterDropdown(false) }}
                        className={`w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 transition capitalize ${
                          filterStatus === status ? 'text-[#B8922D] font-medium bg-[#FFEEC3]/20' : 'text-slate-600'
                        }`}
                      >
                        {status === 'all' ? 'All' : status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Seed */}
              <button
                onClick={handleSeedTestimonials}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition hidden sm:block"
              >
                Seed
              </button>

              {/* Add */}
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-slate-500 mb-4">
            Showing {filteredTestimonials.length} of {totalTestimonials}
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#DFB13B] mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Loading...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTestimonials.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Quote className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">No testimonials found</h3>
              <p className="text-sm text-slate-500 mb-4">Add your first testimonial or seed demo data</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={handleSeedTestimonials} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                  Seed Demo
                </button>
                <button onClick={handleAddNew} className="px-4 py-2 bg-[#DFB13B] text-white rounded-xl text-sm font-medium hover:bg-[#C9A032] transition">
                  Add New
                </button>
              </div>
            </div>
          )}

          {/* Testimonials Grid */}
          {!loading && !error && filteredTestimonials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial._id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(testimonial.photo)} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{testimonial.name}</h3>
                          <p className="text-xs text-slate-500">{testimonial.role || 'Customer'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(testimonial)}
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold transition ${
                          testimonial.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {testimonial.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  {/* Rating & Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{testimonial.rating}.0</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      "{testimonial.text}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-slate-50 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded-lg transition text-xs font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(testimonial)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs font-medium"
                    >
                      {testimonial.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {testimonial.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-slate-100">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl flex items-center justify-center shadow-md">
                    {editingTestimonial ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">
                      {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                    </h2>
                    <p className="text-xs text-slate-500">{getCurrentTabInfo().name}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              {/* Language selector */}
              <div className="flex items-center gap-1.5 px-5 pb-3 flex-wrap">
                <span className="text-xs text-slate-400 mr-1">Language:</span>
                {(['en', 'fr', 'de', 'nl', 'es'] as const).map(lang => (
                  <button key={lang} type="button" onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${selectedLang === lang ? 'bg-[#DFB13B] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Translation mode banner */}
              {selectedLang !== 'en' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Editing <strong>{selectedLang.toUpperCase()}</strong> translation — English values shown as placeholders.</span>
                </div>
              )}

              {/* Name & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={selectedLang !== 'en'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Role {selectedLang !== 'en' && `(${selectedLang.toUpperCase()})`}
                  </label>
                  <input
                    type="text"
                    value={selectedLang === 'en' ? formData.role : (testimonialTranslations[selectedLang]?.role || '')}
                    onChange={(e) => selectedLang === 'en'
                      ? setFormData({ ...formData, role: e.target.value })
                      : updateTranslation(selectedLang, 'role', e.target.value)}
                    placeholder={selectedLang === 'en' ? '@handle' : formData.role || 'Role translation...'}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none transition ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
                  />
                </div>
              </div>

              {/* Property Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Property</label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => {
                    const selectedProperty = properties.find(p => p._id === e.target.value)
                    setFormData({
                      ...formData,
                      propertyId: e.target.value,
                      propertyName: selectedProperty?.name || '',
                      category: e.target.value ? 'rental' : 'massage'
                    })
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] outline-none transition"
                >
                  <option value="">General (Massage)</option>
                  {properties.map(property => (
                    <option key={property._id} value={property._id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Leave as "General" for massage testimonials</p>
              </div>

              {/* Text */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Testimonial {selectedLang === 'en' ? '*' : `(${selectedLang.toUpperCase()})`}
                </label>
                <textarea
                  value={selectedLang === 'en' ? formData.text : (testimonialTranslations[selectedLang]?.text || '')}
                  onChange={(e) => selectedLang === 'en'
                    ? setFormData({ ...formData, text: e.target.value })
                    : updateTranslation(selectedLang, 'text', e.target.value)}
                  placeholder={selectedLang === 'en' ? 'Customer feedback...' : formData.text || 'Testimonial translation...'}
                  rows={3}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none resize-none transition ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-7 h-7 transition ${
                          star <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-slate-600 ml-2 font-medium">{formData.rating}/5</span>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Avatar</label>
                <div className="grid grid-cols-4 gap-2">
                  {availablePhotos.map((photo) => (
                    <button
                      key={photo.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: photo.name })}
                      className={`p-2 rounded-xl transition ${
                        formData.photo === photo.name
                          ? 'bg-[#FFEEC3]/30 border-2 border-[#DFB13B]'
                          : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto bg-gradient-to-br ${photo.color} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow`}>
                        {photo.label.split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Photo URL <span className="text-slate-400">(optional)</span></label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] outline-none transition"
                />
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-700">Visible</p>
                  <p className="text-xs text-slate-500">Show on website</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-11 h-6 rounded-full transition ${formData.isActive ? 'bg-[#DFB13B]' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl shadow-md hover:shadow-lg transition text-sm font-medium disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {showFilterDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
      )}
    </div>
  )
}

export default Testimonials

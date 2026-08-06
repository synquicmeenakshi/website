import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, X, Save, Loader2, HelpCircle, Filter, Eye, EyeOff, ChevronDown, Sparkles, Home, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL } from '../config/api'

interface FAQ {
  _id: string
  question: string
  answer: string
  category: 'massage' | 'rental'
  isActive: boolean
  displayOrder: number
  translations?: {
    fr?: { question?: string; answer?: string }
    de?: { question?: string; answer?: string }
    nl?: { question?: string; answer?: string }
    es?: { question?: string; answer?: string }
  }
  createdAt?: string
}

interface FAQFormData {
  question: string
  answer: string
  isActive: boolean
}

const initialFormData: FAQFormData = {
  question: '',
  answer: '',
  isActive: true
}

type TabType = 'massage' | 'rental'

const FAQs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('rental')
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState<FAQFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Translation state
  const emptyTranslations = { fr: {}, de: {}, nl: {}, es: {} }
  const [faqTranslations, setFaqTranslations] = useState<Record<string, { question?: string; answer?: string }>>(emptyTranslations)
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'de' | 'nl' | 'es'>('en')

  // Fetch FAQs
  useEffect(() => {
    fetchFAQs()
  }, [activeTab])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_BASE_URL}/faqs/admin?category=${activeTab}`)
      const data = await response.json()

      if (data.success) {
        setFaqs(data.data)
      } else {
        setError('Failed to fetch FAQs')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error('Error fetching FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Open modal for adding new FAQ
  const handleAddNew = () => {
    setEditingFAQ(null)
    setFormData(initialFormData)
    setFaqTranslations(emptyTranslations)
    setSelectedLang('en')
    setShowModal(true)
  }

  // Open modal for editing FAQ
  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive
    })
    setFaqTranslations({
      fr: faq.translations?.fr || {},
      de: faq.translations?.de || {},
      nl: faq.translations?.nl || {},
      es: faq.translations?.es || {},
    })
    setSelectedLang('en')
    setShowModal(true)
  }

  const updateTranslation = (lang: string, field: string, value: string) => {
    setFaqTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }))
  }

  // Save FAQ (create or update)
  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer')
      return
    }

    try {
      setSaving(true)
      const url = editingFAQ
        ? `${API_BASE_URL}/faqs/${editingFAQ._id}`
        : `${API_BASE_URL}/faqs`

      const method = editingFAQ ? 'PUT' : 'POST'

      const payload = editingFAQ
        ? { ...formData, translations: faqTranslations }
        : { ...formData, category: activeTab, translations: faqTranslations }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        setShowModal(false)
        fetchFAQs()
        setFormData(initialFormData)
        setFaqTranslations(emptyTranslations)
        setEditingFAQ(null)
      } else {
        alert(data.message || 'Failed to save FAQ')
      }
    } catch (err) {
      console.error('Error saving FAQ:', err)
      alert('Error saving FAQ')
    } finally {
      setSaving(false)
    }
  }

  // Delete FAQ
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/faqs/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchFAQs()
      } else {
        alert(data.message || 'Failed to delete FAQ')
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err)
      alert('Error deleting FAQ')
    }
  }

  // Toggle active status
  const handleToggleStatus = async (faq: FAQ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/faqs/${faq._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...faq, isActive: !faq.isActive })
      })

      const data = await response.json()

      if (data.success) {
        fetchFAQs()
      }
    } catch (err) {
      console.error('Error toggling status:', err)
    }
  }

  // Seed default FAQs
  const handleSeedFAQs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faqs/seed`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        alert(data.message)
        fetchFAQs()
      } else {
        alert(data.message || 'Failed to seed FAQs')
      }
    } catch (err) {
      console.error('Error seeding FAQs:', err)
      alert('Error seeding FAQs')
    }
  }

  // Filter FAQs
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && faq.isActive) ||
      (filterStatus === 'inactive' && !faq.isActive)

    return matchesSearch && matchesFilter
  })

  // Stats
  const totalFAQs = faqs.length
  const activeFAQs = faqs.filter(f => f.isActive).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header - Clean Design like Dashboard */}
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
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">FAQs</h1>
                <p className="text-slate-500 text-xs mt-0.5 hidden sm:block">Manage frequently asked questions</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('massage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'massage'
                    ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Massage
              </button>
              <button
                onClick={() => setActiveTab('rental')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'rental'
                    ? 'bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Rental
              </button>
            </div>
          </div>

          {/* Stats row - Compact gradient cards like Dashboard */}
          {!loading && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
              {/* Total FAQs */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] p-2.5 sm:p-3 shadow-md">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-white">{totalFAQs}</p>
                    <p className="text-[10px] sm:text-xs text-white/80">Total</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Active */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 sm:p-3 shadow-md">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-white">{activeFAQs}</p>
                    <p className="text-[10px] sm:text-xs text-white/80">Active</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
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
                onClick={handleSeedFAQs}
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
            Showing {filteredFAQs.length} of {totalFAQs}
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
          {!loading && !error && filteredFAQs.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">No FAQs found</h3>
              <p className="text-sm text-slate-500 mb-4">Add your first FAQ or seed demo data</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={handleSeedFAQs} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                  Seed Demo
                </button>
                <button onClick={handleAddNew} className="px-4 py-2 bg-[#DFB13B] text-white rounded-xl text-sm font-medium hover:bg-[#C9A032] transition">
                  Add New
                </button>
              </div>
            </div>
          )}

          {/* FAQs List */}
          {!loading && !error && filteredFAQs.length > 0 && (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq._id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <HelpCircle className="w-4 h-4 text-[#DFB13B] flex-shrink-0" />
                          <h3 className="font-semibold text-slate-800 text-sm">{faq.question}</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(faq)}
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold transition flex-shrink-0 ${
                          faq.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {faq.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-slate-50 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded-lg transition text-xs font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(faq)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs font-medium"
                    >
                      {faq.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {faq.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
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
                    {editingFAQ ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">
                      {editingFAQ ? 'Edit FAQ' : 'Add FAQ'}
                    </h2>
                    <p className="text-xs text-slate-500">{activeTab === 'massage' ? 'Massage' : 'Rental'}</p>
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

              {/* Question */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Question {selectedLang === 'en' ? '*' : `(${selectedLang.toUpperCase()})`}
                </label>
                <input
                  type="text"
                  value={selectedLang === 'en' ? formData.question : (faqTranslations[selectedLang]?.question || '')}
                  onChange={(e) => selectedLang === 'en'
                    ? setFormData({ ...formData, question: e.target.value })
                    : updateTranslation(selectedLang, 'question', e.target.value)}
                  placeholder={selectedLang === 'en' ? 'What is...' : formData.question || 'Question translation...'}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none transition ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Answer {selectedLang === 'en' ? '*' : `(${selectedLang.toUpperCase()})`}
                </label>
                <textarea
                  value={selectedLang === 'en' ? formData.answer : (faqTranslations[selectedLang]?.answer || '')}
                  onChange={(e) => selectedLang === 'en'
                    ? setFormData({ ...formData, answer: e.target.value })
                    : updateTranslation(selectedLang, 'answer', e.target.value)}
                  placeholder={selectedLang === 'en' ? 'The answer is...' : formData.answer || 'Answer translation...'}
                  rows={5}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none resize-none transition ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
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

export default FAQs

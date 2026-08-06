import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, Save, Loader2, Building2, Users,
  BedDouble, DollarSign, Euro, Filter, ChevronDown, Eye, EyeOff, LayoutGrid,
  List, Car, Sparkles, Settings2, Star, TrendingUp, Home,
  ArrowUpRight, Image as ImageIcon, Menu, Upload, Link, MapPin,
  Wifi, Tv, Coffee, Key, Shield, Wind, Waves, Utensils, Shirt, ParkingCircle,
  Umbrella, Mountain, TreeDeciduous, Dumbbell, Bath, Check
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

import { API_BASE_URL, getImageUrl } from '../config/api'
import { apiUpload } from '../utils/api'

// Available images for selection with colors
const availableImages = [
  { name: 'Apat1.png', label: 'Apartment 1', color: 'from-violet-500 via-purple-500 to-fuchsia-500' },
  { name: 'Apat2.png', label: 'Apartment 2', color: 'from-cyan-500 via-blue-500 to-indigo-500' },
  { name: 'Villa1.png', label: 'Villa 1', color: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { name: 'Villa2.png', label: 'Villa 2', color: 'from-amber-500 via-orange-500 to-red-500' },
]

// Predefined amenities with icons for selection
const predefinedAmenities = [
  { id: 'wifi', label: 'High-speed Wi-Fi', icon: Wifi },
  { id: 'washing', label: 'Washing machine', icon: Shirt },
  { id: 'tv', label: 'Smart TV', icon: Tv },
  { id: 'linens', label: 'Fresh linens & towels', icon: Bath },
  { id: 'safe', label: 'Safe neighborhood', icon: Shield },
  { id: 'coffee', label: 'Coffee maker', icon: Coffee },
  { id: 'outdoor', label: 'Outdoor seating', icon: Umbrella },
  { id: 'checkin', label: 'Self check-in', icon: Key },
  { id: 'ac', label: 'Air conditioning', icon: Wind },
  { id: 'pool', label: 'Swimming pool', icon: Waves },
  { id: 'kitchen', label: 'Fully equipped kitchen', icon: Utensils },
  { id: 'parking', label: 'Free parking', icon: ParkingCircle },
  { id: 'garden', label: 'Private garden', icon: TreeDeciduous },
  { id: 'gym', label: 'Gym access', icon: Dumbbell },
  { id: 'view', label: 'Ocean/Mountain view', icon: Mountain },
]

interface OverviewFeature {
  title: string
  description: string
  imageUrl: string
}

interface LocationPlace {
  title: string
  imageUrl: string
}

interface PropertyLangTranslation {
  description?: string
  priceUnit?: string
  parking?: string
  cleanliness?: {
    title?: string
    description?: string
  }
}

interface PropertyData {
  _id: string
  name: string
  description: string
  price: number
  currency: string
  priceUnit: string
  guests: number
  bedrooms: number
  parking: string
  mapUrl?: string
  image: string
  imageUrl?: string
  galleryImages?: string[]
  cleanliness: {
    title: string
    description: string
  }
  amenities: string[]
  hostName?: string
  overview?: {
    title: string
    description1: string
    description2: string
    highlights: string[]
    features: OverviewFeature[]
  }
  location?: {
    title: string
    description: string
    mapEmbedUrl: string
    places: LocationPlace[]
  }
  displayOrder: number
  isActive: boolean
  translations?: {
    fr?: PropertyLangTranslation
    de?: PropertyLangTranslation
    nl?: PropertyLangTranslation
    es?: PropertyLangTranslation
  }
}

interface SectionSettings {
  sectionType: string
  title: string
  description: string
  isActive: boolean
}

interface OverviewCard {
  title: string
  description: string
  imageUrl: string
}

interface RentalOverviewSettings {
  _id?: string
  badge: string
  title1: string
  title2: string
  description1: string
  description2: string
  cards: OverviewCard[]
  isActive: boolean
}

const Properties = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({
    sectionType: 'apartments',
    title: 'Apartments',
    description: 'Discover our handpicked collection of premium apartments.',
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false)
  const [overviewSettings, setOverviewSettings] = useState<RentalOverviewSettings>({
    badge: 'Overview',
    title1: 'Find a Space That Feels',
    title2: 'Like Your Island Home',
    description1: "Lanzarote isn't just a destination — it's a rhythm. Volcanic cliffs, whitewashed villages, black-sand beaches, and quiet pockets of calm you won't find anywhere else. Our curated stays are designed to help you slip into that rhythm effortlessly.",
    description2: "Whether you want ocean views, total seclusion, or a modern base close to Lanzarote's cultural spots, you'll find a place here that feels comfortably yours.",
    cards: [
      { title: 'Private Villas', description: 'Spacious, private, and perfect for families or long stays.', imageUrl: '' },
      { title: 'Coastal Living', description: 'Slow living surrounded by volcanic landscapes.', imageUrl: '' }
    ],
    isActive: true
  })
  const [uploadingOverviewImage, setUploadingOverviewImage] = useState<number | null>(null)
  const overviewImageRef1 = useRef<HTMLInputElement>(null)
  const overviewImageRef2 = useRef<HTMLInputElement>(null)
  const overviewImageRef3 = useRef<HTMLInputElement>(null)
  const overviewImageRef4 = useRef<HTMLInputElement>(null)
  const overviewImageRefs = [overviewImageRef1, overviewImageRef2, overviewImageRef3, overviewImageRef4]

  // Feature card image upload refs and state
  const [uploadingFeatureImage, setUploadingFeatureImage] = useState<number | null>(null)
  const featureImageRef1 = useRef<HTMLInputElement>(null)
  const featureImageRef2 = useRef<HTMLInputElement>(null)
  const featureImageRef3 = useRef<HTMLInputElement>(null)
  const featureImageRef4 = useRef<HTMLInputElement>(null)
  const featureImageRefs = [featureImageRef1, featureImageRef2, featureImageRef3, featureImageRef4]

  const [editingProperty, setEditingProperty] = useState<PropertyData | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Translation state
  const [propertyTranslations, setPropertyTranslations] = useState<{
    fr: PropertyLangTranslation
    de: PropertyLangTranslation
    nl: PropertyLangTranslation
    es: PropertyLangTranslation
  }>({ fr: {}, de: {}, nl: {}, es: {} })
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'de' | 'nl' | 'es'>('en')
  const [amenityInput, setAmenityInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [uploadingPlaceImage, setUploadingPlaceImage] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryFileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: '€',
    priceUnit: 'per night',
    guests: 1,
    bedrooms: 1,
    parking: '',
    mapUrl: '',
    image: 'Apat1.png',
    imageUrl: '',
    galleryImages: [] as string[],
    cleanliness: {
      title: 'Cleanliness',
      description: ''
    },
    amenities: [] as string[],
    hostName: '',
    overview: {
      title: '',
      description1: '',
      description2: '',
      highlights: [] as string[],
      features: [] as OverviewFeature[]
    },
    location: {
      title: '',
      description: '',
      mapEmbedUrl: '',
      places: [] as LocationPlace[]
    },
    displayOrder: 0
  })

  // State for adding highlights
  const [highlightInput, setHighlightInput] = useState('')

  // Fetch properties from backend
  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties?all=true`)
      const data = await response.json()
      if (data.success) {
        setProperties(data.data)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch section settings
  const fetchSectionSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/section-settings/apartments`)
      const data = await response.json()
      if (data.success) {
        setSectionSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching section settings:', error)
    }
  }

  // Fetch rental overview settings
  const fetchOverviewSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rental-page/overview`)
      const data = await response.json()
      if (data.success) {
        setOverviewSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching overview settings:', error)
    }
  }

  useEffect(() => {
    fetchProperties()
    fetchSectionSettings()
    fetchOverviewSettings()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Debug: Log what we're sending
    console.log('[Admin] Submitting formData:', formData)
    console.log('[Admin] Gallery Images being sent:', formData.galleryImages)

    try {
      const url = editingProperty
        ? `${API_BASE_URL}/properties/${editingProperty._id}`
        : `${API_BASE_URL}/properties`

      const response = await fetch(url, {
        method: editingProperty ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, translations: propertyTranslations })
      })

      const data = await response.json()
      console.log('[Admin] Response from server:', data)
      console.log('[Admin] Saved galleryImages:', data.data?.galleryImages)
      if (data.success) {
        fetchProperties()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle section settings update
  const handleSectionSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API_BASE_URL}/properties/section-settings/apartments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionSettings)
      })

      const data = await response.json()
      if (data.success) {
        setIsSettingsModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating section settings:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle overview settings update
  const handleOverviewSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${API_BASE_URL}/rental-page/overview`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overviewSettings)
      })

      const data = await response.json()
      if (data.success) {
        setIsOverviewModalOpen(false)
      }
    } catch (error) {
      console.error('Error updating overview settings:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle overview card image upload
  const handleOverviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingOverviewImage(cardIndex)

    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    try {
      const data = await apiUpload('/upload/image', uploadFormData)
      console.log('Upload response:', data)
      if (data.success && data.data?.url) {
        const updatedCards = [...overviewSettings.cards]
        updatedCards[cardIndex] = { ...updatedCards[cardIndex], imageUrl: data.data.url }
        setOverviewSettings({ ...overviewSettings, cards: updatedCards })
        console.log('Updated card with image:', data.data.url)
      } else {
        console.error('Upload failed:', data.message || 'No URL in response')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploadingOverviewImage(null)
    }
  }

  // Update overview card field
  const updateOverviewCard = (index: number, field: keyof OverviewCard, value: string) => {
    const updatedCards = [...overviewSettings.cards]
    updatedCards[index] = { ...updatedCards[index], [field]: value }
    setOverviewSettings({ ...overviewSettings, cards: updatedCards })
  }

  // Add new overview card
  const addOverviewCard = () => {
    if (overviewSettings.cards.length < 4) {
      const newCard = { title: '', description: '', imageUrl: '' }
      setOverviewSettings({ ...overviewSettings, cards: [...overviewSettings.cards, newCard] })
    }
  }

  // Remove overview card
  const removeOverviewCard = (index: number) => {
    if (overviewSettings.cards.length > 1) {
      const updatedCards = overviewSettings.cards.filter((_, i) => i !== index)
      setOverviewSettings({ ...overviewSettings, cards: updatedCards })
    }
  }

  // Handle feature card image upload for property overview
  const handleFeatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, featureIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploadingFeatureImage(featureIndex)

    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    try {
      const data = await apiUpload('/upload/image', uploadFormData)
      console.log('Feature image upload response:', data)

      if (data.success && data.data?.url) {
        const newFeatures = [...formData.overview.features]
        newFeatures[featureIndex] = { ...newFeatures[featureIndex], imageUrl: data.data.url }
        setFormData({ ...formData, overview: { ...formData.overview, features: newFeatures } })
        console.log('Updated feature card with image:', data.data.url)
      } else {
        alert('Failed to upload image: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading feature image:', error)
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploadingFeatureImage(null)
    }
  }

  // Toggle property visibility
  const handleToggleStatus = async (property: PropertyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${property._id}/toggle`, {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        fetchProperties()
      }
    } catch (error) {
      console.error('Error toggling property:', error)
    }
  }

  // Delete property
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}/permanent`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchProperties()
      }
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  // Translation helpers
  const updateTranslation = (lang: 'fr' | 'de' | 'nl' | 'es', field: string, value: string) => {
    setPropertyTranslations(prev => {
      const current = prev[lang]
      if (field.startsWith('cleanliness.')) {
        const subField = field.replace('cleanliness.', '')
        return {
          ...prev,
          [lang]: {
            ...current,
            cleanliness: { ...(current.cleanliness || {}), [subField]: value }
          }
        }
      }
      return { ...prev, [lang]: { ...current, [field]: value } }
    })
  }

  // Open modal for editing
  const openEditModal = (property: PropertyData) => {
    setEditingProperty(property)
    // Load existing translations
    const t = property.translations || {}
    setPropertyTranslations({
      fr: t.fr || {},
      de: t.de || {},
      nl: t.nl || {},
      es: t.es || {}
    })
    setSelectedLang('en')
    setFormData({
      name: property.name,
      description: property.description,
      price: property.price,
      currency: property.currency || '€',
      priceUnit: property.priceUnit || 'per night',
      guests: property.guests,
      bedrooms: property.bedrooms,
      parking: property.parking,
      mapUrl: property.mapUrl || '',
      image: property.image,
      imageUrl: property.imageUrl || '',
      galleryImages: property.galleryImages || [],
      cleanliness: property.cleanliness || { title: 'Cleanliness', description: '' },
      amenities: property.amenities || [],
      hostName: property.hostName || '',
      overview: property.overview || {
        title: '',
        description1: '',
        description2: '',
        highlights: [],
        features: []
      },
      location: property.location || {
        title: '',
        description: '',
        mapEmbedUrl: '',
        places: []
      },
      displayOrder: property.displayOrder || 0
    })
    setIsModalOpen(true)
  }

  // Open modal for new property
  const openNewModal = () => {
    setEditingProperty(null)
    setPropertyTranslations({ fr: {}, de: {}, nl: {}, es: {} })
    setSelectedLang('en')
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: '€',
      priceUnit: 'per night',
      guests: 1,
      bedrooms: 1,
      parking: '',
      mapUrl: '',
      image: 'Apat1.png',
      imageUrl: '',
      galleryImages: [],
      cleanliness: { title: 'Cleanliness', description: '' },
      amenities: [],
      hostName: '',
      overview: {
        title: '',
        description1: '',
        description2: '',
        highlights: [],
        features: []
      },
      location: {
        title: '',
        description: '',
        mapEmbedUrl: '',
        places: []
      },
      displayOrder: properties.length
    })
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProperty(null)
  }

  // Add amenity
  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityInput.trim()] })
      setAmenityInput('')
    }
  }

  // Remove amenity
  const removeAmenity = (amenity: string) => {
    setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) })
  }

  // Handle image upload
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploadingImage(true)
    const formDataUpload = new FormData()
    formDataUpload.append('image', file)

    try {
      const data = await apiUpload('/upload/image', formDataUpload)
      if (data.success && data.data?.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.data.url }))
      } else {
        alert('Failed to upload image: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploadingImage(false)
    }
  }, [])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
  }, [handleImageUpload])

  // Handle URL input
  const handleImageUrlSubmit = () => {
    if (imageUrlInput.trim()) {
      setFormData({ ...formData, imageUrl: imageUrlInput.trim() })
      setImageUrlInput('')
    }
  }

  // Remove custom image
  const removeCustomImage = () => {
    setFormData({ ...formData, imageUrl: '' })
  }

  // Handle place image upload for location section
  const handlePlaceImageUpload = useCallback(async (files: FileList | null, placeIndex: number, event?: React.ChangeEvent<HTMLInputElement>) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploadingPlaceImage(placeIndex)
    const formDataUpload = new FormData()
    formDataUpload.append('image', file)

    try {
      console.log('Uploading place image...')
      console.log('File details:', { name: file.name, size: file.size, type: file.type })

      const data = await apiUpload('/upload/image', formDataUpload)
      console.log('Upload response:', data)

      if (data.success && data.data?.url) {
        setFormData(prev => {
          const newPlaces = [...prev.location.places]
          newPlaces[placeIndex].imageUrl = data.data.url
          return { ...prev, location: { ...prev.location, places: newPlaces } }
        })
      } else {
        alert('Failed to upload image: ' + (data.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error uploading place image:', error)
      alert('Failed to upload image: ' + (error.message || 'Unknown error'))
    } finally {
      setUploadingPlaceImage(null)
      // Reset the input value to allow re-uploading the same file
      if (event?.target) {
        event.target.value = ''
      }
    }
  }, [])

  // Handle gallery image upload (supports multiple files)
  const handleGalleryImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Filter for valid image files
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      alert('Please upload image files')
      return
    }

    if (imageFiles.length < files.length) {
      alert(`${files.length - imageFiles.length} non-image file(s) were skipped`)
    }

    setUploadingImage(true)
    const uploadedUrls: string[] = []
    const failedUploads: string[] = []

    try {
      // Upload all images
      for (const file of imageFiles) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', file)

        try {
          const data = await apiUpload('/upload/image', formDataUpload)
          if (data.success && data.data?.url) {
            uploadedUrls.push(data.data.url)
          } else {
            failedUploads.push(file.name)
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          failedUploads.push(file.name)
        }
      }

      // Add all successfully uploaded images to gallery
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...uploadedUrls]
        }))
      }

      // Show summary if there were failures
      if (failedUploads.length > 0) {
        alert(`Failed to upload ${failedUploads.length} image(s): ${failedUploads.join(', ')}`)
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error)
      alert('Failed to upload images: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploadingImage(false)
    }
  }, [])

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }))
  }

  // Filter and search properties
  const filteredProperties = properties.filter(property => {
    const matchesStatus = filterStatus === 'all' ? true :
      filterStatus === 'active' ? property.isActive : !property.isActive
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Get image color
  const getImageColor = (imageName: string) => {
    const img = availableImages.find(i => i.name === imageName)
    return img?.color || 'from-slate-400 to-slate-600'
  }

  // Stats
  const totalProperties = properties.length
  const activeProperties = properties.filter(p => p.isActive).length
  const avgPrice = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)
    : 0
  const totalCapacity = properties.reduce((sum, p) => sum + p.guests, 0)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-800">Properties</h1>
                  <p className="text-xs sm:text-sm text-slate-500">Manage your rental listings</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search - hidden on mobile, shown on sm+ */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 md:w-72 pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:bg-white transition-all"
                  />
                </div>

                {/* Add Button */}
                <button
                  onClick={openNewModal}
                  className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition-all font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Property</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Search */}
          <div className="relative sm:hidden mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]/50 transition-all"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
            {/* Total Properties */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 hover:border-[#DFB13B]/30 transition-all hover:shadow-xl hover:shadow-[#DFB13B]/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Total Properties</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalProperties}</p>
                  <p className="text-[10px] sm:text-xs text-[#B8922D] font-medium mt-1 sm:mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +2 this month
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] flex items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DFB13B] to-[#FFEEC3] rounded-b-xl sm:rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Active Listings */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 hover:border-[#FFEEC3] transition-all hover:shadow-xl hover:shadow-[#DFB13B]/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Active Listings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{activeProperties}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2">
                    {totalProperties > 0 ? Math.round((activeProperties / totalProperties) * 100) : 0}% of total
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#DFB13B] via-[#DFB13B] to-[#FFEEC3] flex items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DFB13B] to-[#FFEEC3] rounded-b-xl sm:rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Average Price */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 hover:border-amber-200 transition-all hover:shadow-xl hover:shadow-amber-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Avg. Price/Night</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">€{avgPrice}</p>
                  <p className="text-[10px] sm:text-xs text-amber-600 font-medium mt-1 sm:mt-2 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500" />
                    Premium pricing
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-b-xl sm:rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Total Capacity */}
            <div className="group relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-100 hover:border-rose-200 transition-all hover:shadow-xl hover:shadow-rose-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Total Capacity</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{totalCapacity}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2">guests accommodated</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-b-xl sm:rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Section Settings Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                  <Settings2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5">Section Configuration</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Title: <span className="text-white font-medium">"{sectionSettings.title}"</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-medium backdrop-blur"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Edit Settings
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" />
              </button>
            </div>
          </div>

          {/* Overview Section Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                  <LayoutGrid className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5">Overview Section (Rental Page)</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Edit the overview section content and feature cards shown on the rental home page
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOverviewModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-medium backdrop-blur"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Edit Overview
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:block" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:border-slate-300 transition-all"
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{filterStatus === 'all' ? 'All Properties' : filterStatus === 'active' ? 'Active Only' : 'Hidden Only'}</span>
                  <span className="sm:hidden">{filterStatus === 'all' ? 'All' : filterStatus === 'active' ? 'Active' : 'Hidden'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-1.5 min-w-[140px] sm:min-w-[160px] z-20">
                    {[
                      { value: 'all', label: 'All Properties', icon: Building2 },
                      { value: 'active', label: 'Active Only', icon: Eye },
                      { value: 'inactive', label: 'Hidden Only', icon: EyeOff }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => { setFilterStatus(status.value as 'all' | 'active' | 'inactive'); setShowFilterDropdown(false) }}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm hover:bg-slate-50 transition flex items-center gap-2 sm:gap-2.5 ${
                          filterStatus === status.value ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'
                        }`}
                      >
                        <status.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {status.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#DFB13B] text-white shadow-lg shadow-[#DFB13B]/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#DFB13B] text-white shadow-lg shadow-[#DFB13B]/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Results count */}
            <span className="text-xs sm:text-sm text-slate-500">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#FFEEC3] border-t-[#DFB13B] animate-spin" />
              <p className="text-slate-500">Loading properties...</p>
            </div>
          )}

          {/* Properties Grid/List */}
          {!loading && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5' : 'space-y-3 sm:space-y-4'}>
              {filteredProperties.map((property) => (
                viewMode === 'grid' ? (
                  // Grid View Card
                  <div
                    key={property._id}
                    className={`group bg-white rounded-xl sm:rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden ${
                      !property.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-36 sm:h-44 overflow-hidden">
                      {property.imageUrl ? (
                        <img
                          src={getImageUrl(property.imageUrl) || ''}
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getImageColor(property.image)} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                          <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-white/30" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium backdrop-blur-md ${
                        property.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-800/80 text-white'
                      }`}>
                        {property.isActive ? 'Active' : 'Hidden'}
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl shadow-lg">
                        <span className="text-sm sm:text-lg font-bold text-slate-800">{property.currency}{property.price}</span>
                        <span className="text-[10px] sm:text-xs text-slate-500 ml-0.5">/{property.priceUnit?.replace('per ', '')}</span>
                      </div>

                      {/* Quick Actions Overlay - always visible on mobile */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 sm:pb-4 gap-2">
                        <button
                          onClick={() => openEditModal(property)}
                          className="p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl hover:bg-[#FFEEC3]/30 transition-all shadow-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8922D]" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(property)}
                          className="p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
                        >
                          {property.isActive ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl hover:bg-red-50 transition-all shadow-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-5">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-1.5 line-clamp-1">{property.name}</h3>
                      <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{property.description}</p>

                      {/* Features */}
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                          {property.guests}
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                          {property.bedrooms}
                        </span>
                        {property.parking && (
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                            Yes
                          </span>
                        )}
                      </div>

                      {/* Amenities */}
                      {property.amenities && property.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {property.amenities.slice(0, 2).map((amenity, idx) => (
                            <span key={idx} className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-xs rounded-md sm:rounded-lg font-medium">
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 2 && (
                            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#FFEEC3]/30 text-[#B8922D] text-[10px] sm:text-xs rounded-md sm:rounded-lg font-medium">
                              +{property.amenities.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View Card
                  <div
                    key={property._id}
                    className={`group bg-white rounded-xl sm:rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col sm:flex-row ${
                      !property.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-full sm:w-48 md:w-56 h-32 sm:h-40 flex-shrink-0">
                      {property.imageUrl ? (
                        <img
                          src={getImageUrl(property.imageUrl) || ''}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getImageColor(property.image)} flex items-center justify-center`}>
                          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-white/30" />
                        </div>
                      )}
                      <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium ${
                        property.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-800/80 text-white'
                      }`}>
                        {property.isActive ? 'Active' : 'Hidden'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-800">{property.name}</h3>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#FFEEC3]/30 text-[#B8922D] text-xs sm:text-sm font-bold rounded-md sm:rounded-lg">
                            {property.currency}{property.price}
                            <span className="text-[#C9A032] font-normal">/{property.priceUnit?.replace('per ', '')}</span>
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1">{property.description}</p>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                            {property.guests} guests
                          </span>
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                            {property.bedrooms} bedrooms
                          </span>
                          {property.parking && (
                            <span className="flex items-center gap-1 sm:gap-1.5">
                              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                              Parking
                            </span>
                          )}
                          {property.amenities && property.amenities.length > 0 && (
                            <span className="text-[#B8922D] font-medium">
                              +{property.amenities.length} amenities
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:ml-4">
                        <button
                          onClick={() => handleToggleStatus(property)}
                          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${
                            property.isActive
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {property.isActive ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(property)}
                          className="p-2 sm:p-2.5 bg-[#FFEEC3]/30 text-[#B8922D] rounded-lg sm:rounded-xl hover:bg-[#FFEEC3]/50 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-2 sm:p-2.5 bg-red-50 text-red-500 rounded-lg sm:rounded-xl hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProperties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 sm:mb-5">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">No properties found</h3>
              <p className="text-slate-500 mb-4 sm:mb-6 text-center max-w-md text-sm sm:text-base">
                {searchQuery ? 'Try adjusting your search or filters' : 'Get started by adding your first property listing'}
              </p>
              <button
                onClick={openNewModal}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition-all font-medium text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Your First Property
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] flex items-center justify-center">
                    {editingProperty ? <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                      {editingProperty ? 'Edit Property' : 'Add New Property'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">Fill in the property details below</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                </button>
              </div>
              {/* Language selector */}
              <div className="flex items-center gap-1.5 px-4 sm:px-6 pb-3 flex-wrap">
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Translation mode banner */}
              {selectedLang !== 'en' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Editing <strong>{selectedLang.toUpperCase()}</strong> translation — English values shown as placeholders.</span>
                </div>
              )}

              {/* Basic Info Section */}
              <div className="space-y-3 sm:space-y-4 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                  Basic Information
                </div>

                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">Property Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                    placeholder="e.g., Lanzarote Beachfront Villa"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">
                    Description {selectedLang === 'en' ? '*' : `(${selectedLang.toUpperCase()})`}
                  </label>
                  <textarea
                    value={selectedLang === 'en' ? formData.description : (propertyTranslations[selectedLang as 'fr'|'de'|'nl'|'es']?.description || '')}
                    onChange={(e) => selectedLang === 'en'
                      ? setFormData({ ...formData, description: e.target.value })
                      : updateTranslation(selectedLang as 'fr'|'de'|'nl'|'es', 'description', e.target.value)}
                    placeholder={selectedLang === 'en' ? 'Describe the property, its features and surroundings...' : formData.description || 'Description translation...'}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border rounded-lg sm:rounded-xl focus:outline-none transition-all h-20 sm:h-24 resize-none text-xs sm:text-sm ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
                    required={selectedLang === 'en'}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-3 sm:space-y-4 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <Euro className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                  Pricing
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">Price *</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-1.5 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                    >
                      <option value="€">€ Euro</option>
                      <option value="$">$ Dollar</option>
                      <option value="£">£ Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">Per</label>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                      className="w-full px-1.5 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                    >
                      <option value="per night">Night</option>
                      <option value="per week">Week</option>
                      <option value="per month">Month</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Capacity Section */}
              <div className="space-y-3 sm:space-y-4 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                  Capacity & Features
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">Guests *</label>
                    <input
                      type="number"
                      value={formData.guests === 0 ? '' : formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value === '' ? 0 : Number(e.target.value) })}
                      onBlur={(e) => { if (e.target.value === '' || Number(e.target.value) < 1) setFormData(prev => ({ ...prev, guests: 1 })) }}
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                      min="1"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">Bedrooms *</label>
                    <input
                      type="number"
                      value={formData.bedrooms === 0 ? '' : formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value === '' ? 0 : Number(e.target.value) })}
                      onBlur={(e) => { if (e.target.value === '' || Number(e.target.value) < 1) setFormData(prev => ({ ...prev, bedrooms: 1 })) }}
                      className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                      min="1"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">
                      Parking {selectedLang !== 'en' && `(${selectedLang.toUpperCase()})`}
                    </label>
                    <input
                      type="text"
                      value={selectedLang === 'en' ? formData.parking : (propertyTranslations[selectedLang as 'fr'|'de'|'nl'|'es']?.parking || '')}
                      onChange={(e) => selectedLang === 'en'
                        ? setFormData({ ...formData, parking: e.target.value })
                        : updateTranslation(selectedLang as 'fr'|'de'|'nl'|'es', 'parking', e.target.value)}
                      className={`w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border rounded-lg sm:rounded-xl focus:outline-none transition-all text-xs sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
                      placeholder={selectedLang === 'en' ? 'e.g., 2 cars' : formData.parking || 'Parking translation...'}
                    />
                  </div>
                </div>

                {/* Map Location URL */}
                <div>
                  <label className="block text-[10px] sm:text-sm font-medium text-slate-600 mb-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DFB13B]" />
                      Map Location URL
                    </div>
                  </label>
                  <input
                    type="url"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm placeholder:text-[10px] sm:placeholder:text-sm"
                    placeholder="e.g., https://maps.app.goo.gl/..."
                  />
                  <p className="text-[9px] sm:text-xs text-slate-400 mt-1">Google Maps share link for "View on Map" feature</p>
                </div>
              </div>

              {/* Image Selection */}
              <div className="space-y-3 sm:space-y-4 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                  Property Image
                </div>

                {/* Custom Image Preview */}
                {formData.imageUrl && (
                  <div className="relative">
                    <div className="relative h-32 sm:h-40 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-indigo-500">
                      <img
                        src={getImageUrl(formData.imageUrl) || ''}
                        alt="Custom property image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#DFB13B] text-white text-xs rounded-lg font-medium">
                        Custom Image
                      </div>
                      <button
                        type="button"
                        onClick={removeCustomImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Drag & Drop Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#DFB13B] bg-[#FFEEC3]/20'
                      : 'border-slate-200 hover:border-[#DFB13B]/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#DFB13B] animate-spin" />
                      <span className="text-sm text-slate-600">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FFEEC3]/30 flex items-center justify-center">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#DFB13B]" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-700">
                          {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image URL Input */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700">Or enter image URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleImageUrlSubmit())}
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:bg-white transition-all text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleImageUrlSubmit}
                      className="px-4 py-2.5 sm:py-3 bg-[#DFB13B] text-white rounded-lg sm:rounded-xl hover:bg-[#C9A032] transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Default Image Selection */}
                {!formData.imageUrl && (
                  <>
                    <div className="text-xs text-slate-500 text-center">Or select a default image</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {availableImages.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.name })}
                          className={`relative h-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden transition-all ${
                            formData.image === img.name && !formData.imageUrl
                              ? 'ring-2 ring-[#DFB13B] ring-offset-2 scale-[0.98]'
                              : 'hover:scale-[0.98]'
                          }`}
                        >
                          <div className={`w-full h-full bg-gradient-to-br ${img.color} flex items-center justify-center`}>
                            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 sm:p-2">
                            <span className="text-[10px] sm:text-[11px] text-white font-medium">{img.label}</span>
                          </div>
                          {formData.image === img.name && !formData.imageUrl && (
                            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-[#DFB13B] rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-3 sm:space-y-4 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                    Gallery Images (Side Images)
                  </div>
                  {formData.galleryImages.length > 0 && (
                    <span className="text-xs bg-[#DFB13B] text-white px-2 py-0.5 rounded-full">
                      {formData.galleryImages.length} image{formData.galleryImages.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Add additional images for the property gallery. These will appear alongside the main image.</p>

                {/* Gallery Images Preview */}
                {formData.galleryImages.length > 0 && (
                  <div>
                    <p className="text-xs text-green-600 font-medium mb-2">Current Gallery Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {formData.galleryImages.map((img, index) => (
                      <div key={index} className="relative h-24 sm:h-28 rounded-xl overflow-hidden border-2 border-slate-200">
                        <img
                          src={getImageUrl(img) || ''}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-800/80 text-white text-[10px] rounded font-medium">
                          Image {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                {/* Add Gallery Image Button */}
                <div
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#DFB13B]/50 hover:bg-slate-50 transition-all"
                >
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => { handleGalleryImageUpload(e.target.files); e.target.value = '' }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFEEC3]/30 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-[#DFB13B]" />
                    </div>
                    <p className="text-xs font-medium text-slate-600">Add Gallery Images</p>
                    <p className="text-[10px] text-slate-400">Select multiple images at once</p>
                  </div>
                </div>
              </div>

              {/* Amenities with Icons */}
              <div className="space-y-3 sm:space-y-4 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB13B]" />
                    Amenities
                  </div>
                  {formData.amenities.length > 0 && (
                    <span className="text-xs bg-[#DFB13B] text-white px-2 py-0.5 rounded-full">
                      {formData.amenities.length} selected
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500">Select the amenities available at this property. These will be displayed with icons on the property page.</p>

                {/* Predefined Amenities Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {predefinedAmenities.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity.id)
                    const IconComponent = amenity.icon
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity.id) })
                          } else {
                            setFormData({ ...formData, amenities: [...formData.amenities, amenity.id] })
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-[#DFB13B] bg-[#FFEEC3]/30 text-[#B8922D]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-[#DFB13B]/20' : 'bg-slate-100'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#DFB13B]' : 'text-slate-500'}`} />
                        </div>
                        <span className="text-xs font-medium line-clamp-1">{amenity.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#DFB13B] ml-auto flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Custom Amenity Input */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-2">Add custom amenities (for property card display):</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all text-xs sm:text-sm"
                      placeholder="Type a custom amenity..."
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-3 py-2 bg-[#DFB13B] text-white rounded-lg hover:bg-[#C9A032] transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Show custom amenities (non-predefined ones) */}
                {formData.amenities.filter(a => !predefinedAmenities.some(p => p.id === a)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
                    <span className="text-[10px] sm:text-xs text-slate-400 w-full">Custom amenities:</span>
                    {formData.amenities.filter(a => !predefinedAmenities.some(p => p.id === a)).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Overview Section */}
              <div className="space-y-3 sm:space-y-4 bg-blue-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  Overview Section
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Overview Title</label>
                    <input
                      type="text"
                      value={formData.overview.title}
                      onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, title: e.target.value } })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm"
                      placeholder="e.g., Your Perfect Escape"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Description 1</label>
                    <textarea
                      value={formData.overview.description1}
                      onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, description1: e.target.value } })}
                      rows={4}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm resize-y"
                      placeholder="First paragraph of the overview description..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Description 2</label>
                    <textarea
                      value={formData.overview.description2}
                      onChange={(e) => setFormData({ ...formData, overview: { ...formData.overview, description2: e.target.value } })}
                      rows={4}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm resize-y"
                      placeholder="Second paragraph of the overview description..."
                    />
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Highlights</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={highlightInput}
                        onChange={(e) => setHighlightInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (highlightInput.trim()) {
                              setFormData({ ...formData, overview: { ...formData.overview, highlights: [...formData.overview.highlights, highlightInput.trim()] } })
                              setHighlightInput('')
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm"
                        placeholder="Add a highlight and press Enter"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (highlightInput.trim()) {
                            setFormData({ ...formData, overview: { ...formData.overview, highlights: [...formData.overview.highlights, highlightInput.trim()] } })
                            setHighlightInput('')
                          }
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {formData.overview.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                        {formData.overview.highlights.map((highlight, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {highlight}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, overview: { ...formData.overview, highlights: formData.overview.highlights.filter((_, i) => i !== idx) } })}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs">
                        📸
                      </span>
                      Feature Cards with Images (max 4)
                    </label>
                    <div className="space-y-4">
                      {formData.overview.features.map((feature, idx) => (
                        <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl p-4 relative shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">Card {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, overview: { ...formData.overview, features: formData.overview.features.filter((_, i) => i !== idx) } })}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Card Title</label>
                              <input
                                type="text"
                                value={feature.title}
                                onChange={(e) => {
                                  const newFeatures = [...formData.overview.features]
                                  newFeatures[idx].title = e.target.value
                                  setFormData({ ...formData, overview: { ...formData.overview, features: newFeatures } })
                                }}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="e.g., Private Terrace, Ocean Views"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Card Description</label>
                              <textarea
                                value={feature.description}
                                onChange={(e) => {
                                  const newFeatures = [...formData.overview.features]
                                  newFeatures[idx].description = e.target.value
                                  setFormData({ ...formData, overview: { ...formData.overview, features: newFeatures } })
                                }}
                                rows={2}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                                placeholder="Brief description of this feature..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-2">Card Image</label>

                              {/* Image Preview or Upload Area */}
                              <div className="flex items-start gap-3">
                                {feature.imageUrl && feature.imageUrl.trim() !== '' ? (
                                  <div className="relative w-24 h-20 rounded-lg overflow-hidden border-2 border-slate-200 flex-shrink-0">
                                    <img
                                      src={getImageUrl(feature.imageUrl) || ''}
                                      alt={feature.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10"%3EInvalid%3C/text%3E%3C/svg%3E'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newFeatures = [...formData.overview.features]
                                        newFeatures[idx].imageUrl = ''
                                        setFormData({ ...formData, overview: { ...formData.overview, features: newFeatures } })
                                      }}
                                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                      title="Remove image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-24 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 flex-shrink-0">
                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}

                                {/* Upload and URL Input */}
                                <div className="flex-1 space-y-2">
                                  {/* Upload Button */}
                                  <input
                                    type="file"
                                    ref={featureImageRefs[idx]}
                                    onChange={(e) => handleFeatureImageUpload(e, idx)}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => featureImageRefs[idx]?.current?.click()}
                                    disabled={uploadingFeatureImage === idx}
                                    className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                  >
                                    {uploadingFeatureImage === idx ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload Image
                                      </>
                                    )}
                                  </button>

                                  {/* Or divider */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                    <span className="text-xs text-slate-400">or</span>
                                    <div className="flex-1 h-px bg-slate-200"></div>
                                  </div>

                                  {/* URL Input */}
                                  <input
                                    type="text"
                                    value={feature.imageUrl}
                                    onChange={(e) => {
                                      const newFeatures = [...formData.overview.features]
                                      newFeatures[idx].imageUrl = e.target.value
                                      setFormData({ ...formData, overview: { ...formData.overview, features: newFeatures } })
                                    }}
                                    placeholder="Paste image URL"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {formData.overview.features.length < 4 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, overview: { ...formData.overview, features: [...formData.overview.features, { title: '', description: '', imageUrl: '' }] } })}
                          className="w-full py-3 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 text-sm font-medium hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Feature Card ({formData.overview.features.length}/4)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-3 sm:space-y-4 bg-green-50/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                  Location Section
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Location Title</label>
                    <input
                      type="text"
                      value={formData.location.title}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, title: e.target.value } })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs sm:text-sm"
                      placeholder="e.g., Explore the Area"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Location Description</label>
                    <textarea
                      value={formData.location.description}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, description: e.target.value } })}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs sm:text-sm resize-none"
                      placeholder="Description about the location..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">
                      Google Maps Embed URL
                      <span className="text-[9px] sm:text-[10px] text-slate-400 ml-1">(Required format: https://www.google.com/maps/embed?pb=...)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.mapEmbedUrl}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, mapEmbedUrl: e.target.value } })}
                      className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm ${
                        formData.location.mapEmbedUrl && !formData.location.mapEmbedUrl.startsWith('https://www.google.com/maps/embed')
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-slate-200 focus:ring-green-500/20 focus:border-green-500'
                      }`}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    {formData.location.mapEmbedUrl && !formData.location.mapEmbedUrl.startsWith('https://www.google.com/maps/embed') && (
                      <p className="text-[9px] sm:text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Invalid URL format. Must start with "https://www.google.com/maps/embed"
                      </p>
                    )}
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-[9px] sm:text-[10px] text-blue-700 font-medium mb-1">How to get the embed URL:</p>
                      <ol className="text-[9px] sm:text-[10px] text-blue-600 space-y-0.5 ml-3 list-decimal">
                        <li>Open Google Maps and search for your location</li>
                        <li>Click "Share" button</li>
                        <li>Click "Embed a map" tab</li>
                        <li>Copy the URL from the iframe src attribute (starts with https://www.google.com/maps/embed?pb=)</li>
                      </ol>
                    </div>
                  </div>

                  {/* Nearby Places */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-2">Nearby Places (max 3)</label>
                    <div className="space-y-3">
                      {formData.location.places.map((place, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 relative">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, location: { ...formData.location, places: formData.location.places.filter((_, i) => i !== idx) } })}
                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded z-10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="grid grid-cols-1 gap-2 pr-6">
                            <input
                              type="text"
                              value={place.title}
                              onChange={(e) => {
                                const newPlaces = [...formData.location.places]
                                newPlaces[idx].title = e.target.value
                                setFormData({ ...formData, location: { ...formData.location, places: newPlaces } })
                              }}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                              placeholder="Place name (e.g., Playa del Reducto)"
                            />
                            {/* Image Upload/URL Section */}
                            <div className="space-y-2">
                              {place.imageUrl ? (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                  <img
                                    src={getImageUrl(place.imageUrl) || place.imageUrl}
                                    alt={place.title || 'Place image'}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                  <span className="text-xs text-green-700 flex-1 truncate">{place.imageUrl}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPlaces = [...formData.location.places]
                                      newPlaces[idx].imageUrl = ''
                                      setFormData({ ...formData, location: { ...formData.location, places: newPlaces } })
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={place.imageUrl}
                                    onChange={(e) => {
                                      const newPlaces = [...formData.location.places]
                                      newPlaces[idx].imageUrl = e.target.value
                                      setFormData({ ...formData, location: { ...formData.location, places: newPlaces } })
                                    }}
                                    className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                                    placeholder="Image URL or paste link"
                                  />
                                  <input
                                    type="file"
                                    id={`place-image-upload-${idx}`}
                                    accept="image/*"
                                    onChange={(e) => {
                                      handlePlaceImageUpload(e.target.files, idx, e)
                                    }}
                                    className="hidden"
                                    disabled={uploadingPlaceImage === idx}
                                  />
                                  <button
                                    type="button"
                                    className="flex items-center gap-1 px-2 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs cursor-pointer transition-colors shrink-0"
                                    onClick={() => {
                                      const input = document.getElementById(`place-image-upload-${idx}`) as HTMLInputElement
                                      if (input) input.click()
                                    }}
                                    disabled={uploadingPlaceImage === idx}
                                  >
                                    {uploadingPlaceImage === idx ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Upload className="w-3 h-3" />
                                    )}
                                    <span className="hidden sm:inline">Upload</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {formData.location.places.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, location: { ...formData.location, places: [...formData.location.places, { title: '', imageUrl: '' }] } })}
                          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-xs hover:border-green-400 hover:text-green-500 transition-all"
                        >
                          + Add Nearby Place
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Map Embed URL */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-600 mb-1">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Google Maps Embed URL (for map display)
                      </div>
                    </label>
                    <input
                      type="text"
                      value={formData.location.mapEmbedUrl}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, mapEmbedUrl: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs sm:text-sm"
                      placeholder="e.g., https://www.google.com/maps/embed?pb=..."
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Go to Google Maps → Click Share → Click "Embed a map" → Copy the src URL from iframe</p>
                  </div>
                </div>
              </div>

              {/* Host Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Host Name (Optional)</label>
                <input
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFB13B]/20 focus:bg-white transition-all text-sm"
                  placeholder="e.g., Maria"
                />
              </div>

              {/* Cleanliness — translatable */}
              {selectedLang !== 'en' && (
                <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Cleanliness ({selectedLang.toUpperCase()})
                  </div>
                  <input
                    type="text"
                    value={propertyTranslations[selectedLang as 'fr'|'de'|'nl'|'es']?.cleanliness?.title || ''}
                    onChange={e => updateTranslation(selectedLang as 'fr'|'de'|'nl'|'es', 'cleanliness.title', e.target.value)}
                    placeholder={formData.cleanliness.title || `Cleanliness title in ${selectedLang.toUpperCase()}...`}
                    className="w-full px-3 py-2 bg-white border border-violet-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400"
                  />
                  <textarea
                    value={propertyTranslations[selectedLang as 'fr'|'de'|'nl'|'es']?.cleanliness?.description || ''}
                    onChange={e => updateTranslation(selectedLang as 'fr'|'de'|'nl'|'es', 'cleanliness.description', e.target.value)}
                    rows={2}
                    placeholder={formData.cleanliness.description || `Cleanliness description in ${selectedLang.toUpperCase()}...`}
                    className="w-full px-3 py-2 bg-white border border-violet-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 resize-none"
                  />
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex gap-2 sm:gap-3 bg-slate-50">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{editingProperty ? 'Update Property' : 'Add Property'}</span>
                    <span className="sm:hidden">{editingProperty ? 'Update' : 'Add'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">Section Settings</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Customize the properties section</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSectionSettingsSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Section Title *</label>
                <input
                  type="text"
                  value={sectionSettings.title}
                  onChange={(e) => setSectionSettings({ ...sectionSettings, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm"
                  placeholder="e.g., Our Apartments"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Section Description *</label>
                <textarea
                  value={sectionSettings.description}
                  onChange={(e) => setSectionSettings({ ...sectionSettings, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all h-28 sm:h-32 resize-none text-sm"
                  placeholder="Describe your properties section..."
                  required
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Save Settings</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overview Settings Modal */}
      {isOverviewModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800">Overview Section Settings</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Customize the rental home page overview</p>
                </div>
              </div>
              <button onClick={() => setIsOverviewModalOpen(false)} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleOverviewSettingsSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {/* Title Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Title Line 1 *</label>
                  <input
                    type="text"
                    value={overviewSettings.title1}
                    onChange={(e) => setOverviewSettings({ ...overviewSettings, title1: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm"
                    placeholder="e.g., Find a Space That Feels"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Title Line 2 *</label>
                  <input
                    type="text"
                    value={overviewSettings.title2}
                    onChange={(e) => setOverviewSettings({ ...overviewSettings, title2: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm"
                    placeholder="e.g., Like Your Island Home"
                    required
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Description 1 *</label>
                <textarea
                  value={overviewSettings.description1}
                  onChange={(e) => setOverviewSettings({ ...overviewSettings, description1: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all h-20 resize-none text-sm"
                  placeholder="First paragraph..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">Description 2</label>
                <textarea
                  value={overviewSettings.description2}
                  onChange={(e) => setOverviewSettings({ ...overviewSettings, description2: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all h-20 resize-none text-sm"
                  placeholder="Second paragraph..."
                />
              </div>

              {/* Feature Cards */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Feature Cards</h3>
                <div className="space-y-4">
                  {overviewSettings.cards.map((card, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">{index + 1}</span>
                          <span className="text-sm font-medium text-slate-700">Card {index + 1}</span>
                        </div>
                        {overviewSettings.cards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOverviewCard(index)}
                            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                            title="Remove card"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateOverviewCard(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            placeholder="Card title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                          <input
                            type="text"
                            value={card.description}
                            onChange={(e) => updateOverviewCard(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            placeholder="Card description"
                          />
                        </div>
                      </div>
                      {/* Image Upload */}
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Card Image</label>
                        <div className="flex items-center gap-3">
                          {card.imageUrl && card.imageUrl.trim() !== '' ? (
                            <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-200">
                              <img src={getImageUrl(card.imageUrl) || ''} alt={card.title} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => updateOverviewCard(index, 'imageUrl', '')}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-20 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <input
                            type="file"
                            ref={overviewImageRefs[index]}
                            onChange={(e) => handleOverviewImageUpload(e, index)}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => overviewImageRefs[index]?.current?.click()}
                            disabled={uploadingOverviewImage === index}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                          >
                            {uploadingOverviewImage === index ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="w-3 h-3" /> Upload</>
                            )}
                          </button>
                          <span className="text-xs text-slate-500">or</span>
                          <input
                            type="text"
                            value={card.imageUrl}
                            onChange={(e) => updateOverviewCard(index, 'imageUrl', e.target.value)}
                            placeholder="Paste image URL"
                            className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Card Button */}
                  {overviewSettings.cards.length < 4 && (
                    <button
                      type="button"
                      onClick={addOverviewCard}
                      className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-sm font-medium">Add Card</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOverviewModalOpen(false)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 text-slate-600 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Save Overview</span>
                      <span className="sm:hidden">Save</span>
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

export default Properties

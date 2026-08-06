import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Sparkles,
  Clock,
  Euro,
  Filter,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Heart,
  Users,
  FileText,
  Image,
  Upload,
  Menu,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

import { API_BASE_URL, getImageUrl } from "../config/api";

// Helper function to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const apiKey = localStorage.getItem('admin_api_key');
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers['x-api-key'] = apiKey;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Import massage images
import m1 from "../assets/m1.png";
import m2 from "../assets/m2.png";
import m3 from "../assets/m3.png";
import m4 from "../assets/m4.png";
import m5 from "../assets/m5.png";
import m6 from "../assets/m6.png";
import m7 from "../assets/m7.png";
import m8 from "../assets/m8.png";
import m9 from "../assets/m9.png";

// Image mapping
const imageMap: { [key: string]: string } = {
  "m1.png": m1,
  "m2.png": m2,
  "m3.png": m3,
  "m4.png": m4,
  "m5.png": m5,
  "m6.png": m6,
  "m7.png": m7,
  "m8.png": m8,
  "m9.png": m9,
};

// Available images for selection with colors
const availableImages = [
  {
    name: "m1.png",
    label: "Massage 1",
    color: "from-rose-400 to-rose-600",
    src: m1,
  },
  {
    name: "m2.png",
    label: "Massage 2",
    color: "from-violet-400 to-violet-600",
    src: m2,
  },
  {
    name: "m3.png",
    label: "Massage 3",
    color: "from-blue-400 to-blue-600",
    src: m3,
  },
  {
    name: "m4.png",
    label: "Massage 4",
    color: "from-cyan-400 to-cyan-600",
    src: m4,
  },
  {
    name: "m5.png",
    label: "Massage 5",
    color: "from-emerald-400 to-emerald-600",
    src: m5,
  },
  {
    name: "m6.png",
    label: "Massage 6",
    color: "from-amber-400 to-amber-600",
    src: m6,
  },
  {
    name: "m7.png",
    label: "Massage 7",
    color: "from-orange-400 to-orange-600",
    src: m7,
  },
  {
    name: "m8.png",
    label: "Massage 8",
    color: "from-pink-400 to-pink-600",
    src: m8,
  },
  {
    name: "m9.png",
    label: "Massage 9",
    color: "from-indigo-400 to-indigo-600",
    src: m9,
  },
];

// Category configurations
const categories = [
  {
    value: "massage",
    label: "Massage",
    color: "from-blue-400 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    value: "facial",
    label: "Facial",
    color: "from-pink-400 to-pink-600",
    bgLight: "bg-pink-50",
    textColor: "text-pink-600",
  },
  {
    value: "pmu",
    label: "PMU",
    color: "from-purple-400 to-purple-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    value: "therapy",
    label: "Therapy",
    color: "from-emerald-400 to-emerald-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
];

interface ContentSection {
  title: string;
  description: string;
}

interface ServiceBenefit {
  description: string;
}

interface ServiceTargetAudience {
  description: string;
}

interface ServiceImage {
  url: string;
  caption: string;
}

interface ServiceLangTranslation {
  description?: string;
  benefits?: { description: string }[];
  targetAudience?: { description: string }[];
}

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  image: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  contentSections?: ContentSection[];
  benefits?: ServiceBenefit[];
  targetAudience?: ServiceTargetAudience[];
  serviceImages?: ServiceImage[];
  translations?: { fr?: ServiceLangTranslation; de?: ServiceLangTranslation; nl?: ServiceLangTranslation; es?: ServiceLangTranslation };
}

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  image: string;
  imageUrl: string;
  bannerImageUrl: string;
  isActive: boolean;
  contentSections: ContentSection[];
  benefits: ServiceBenefit[];
  targetAudience: ServiceTargetAudience[];
  serviceImages: ServiceImage[];
}

interface BenefitItem {
  _id?: string;
  description: string;
}

interface TargetAudienceItem {
  _id?: string;
  description: string;
}

interface ServicePageContent {
  _id?: string;
  benefits: BenefitItem[];
  targetAudience: TargetAudienceItem[];
  benefitsTitle: string;
  targetAudienceTitle: string;
}

const initialFormData: ServiceFormData = {
  title: "",
  description: "",
  category: "massage",
  duration: 60,
  price: 0,
  image: "m1.png",
  imageUrl: "",
  bannerImageUrl: "",
  isActive: true,
  contentSections: [],
  benefits: [],
  targetAudience: [],
  serviceImages: [],
};

const Services = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Translation state
  const emptyTranslations = { fr: {}, de: {}, nl: {}, es: {} };
  const [serviceTranslations, setServiceTranslations] = useState<Record<string, ServiceLangTranslation>>(emptyTranslations);
  const [selectedLang, setSelectedLang] = useState<'en' | 'fr' | 'de' | 'nl' | 'es'>('en');

  // Service Page Content state (Benefits & Target Audience)
  const [servicePageContent, setServicePageContent] =
    useState<ServicePageContent>({
      benefits: [],
      targetAudience: [],
      benefitsTitle: "Benefits You'll Feel",
      targetAudienceTitle: "Who It's For",
    });
  const [_loadingContent, _setLoadingContent] = useState(true);
  const [_savingContent, _setSavingContent] = useState(false);
  const [newBenefit, setNewBenefit] = useState("");
  const [newTargetAudience, setNewTargetAudience] = useState("");
  const [_editingBenefitIndex, _setEditingBenefitIndex] = useState<
    number | null
  >(null);
  const [_editingTargetIndex, _setEditingTargetIndex] = useState<number | null>(
    null
  );
  const [editBenefitText, setEditBenefitText] = useState("");
  const [editTargetText, setEditTargetText] = useState("");

  // Per-service benefits/targetAudience state (for modal)
  const [newServiceBenefit, setNewServiceBenefit] = useState("");
  const [newServiceTarget, setNewServiceTarget] = useState("");

  // Inline editing for service benefits/targetAudience
  const [editingServiceBenefitIndex, setEditingServiceBenefitIndex] = useState<
    number | null
  >(null);
  const [editingServiceTargetIndex, setEditingServiceTargetIndex] = useState<
    number | null
  >(null);
  const [editServiceBenefitText, setEditServiceBenefitText] = useState("");
  const [editServiceTargetText, setEditServiceTargetText] = useState("");

  // Content sections state (for detailed content like "Energy points: ...")
  const [newContentSectionTitle, setNewContentSectionTitle] = useState("");
  const [newContentSectionDesc, setNewContentSectionDesc] = useState("");
  const [editingContentSectionIndex, setEditingContentSectionIndex] = useState<
    number | null
  >(null);
  const [editContentSectionTitle, setEditContentSectionTitle] = useState("");
  const [editContentSectionDesc, setEditContentSectionDesc] = useState("");

  // Service images state (gallery images for service page - max 4)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Main service image upload state
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  // Banner image upload state
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  // Fetch services and content
  useEffect(() => {
    fetchServices();
    fetchServicePageContent();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Use admin endpoint to get ALL services (including inactive)
      const response = await fetch(`${API_BASE_URL}/services/admin/all`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      } else {
        setError("Failed to fetch services");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicePageContent = async () => {
    try {
      _setLoadingContent(true);
      const response = await fetch(`${API_BASE_URL}/service-page-content`);
      const data = await response.json();

      if (data.success) {
        setServicePageContent(data.data);
      }
    } catch (err) {
      console.error("Error fetching service page content:", err);
    } finally {
      _setLoadingContent(false);
    }
  };

  const _saveServicePageContent = async () => {
    try {
      _setSavingContent(true);
      const response = await fetch(`${API_BASE_URL}/service-page-content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(servicePageContent),
      });
      const data = await response.json();

      if (data.success) {
        setServicePageContent(data.data);
        alert("Content saved successfully!");
      } else {
        alert("Failed to save content: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving service page content:", err);
      alert("Error saving content. Please check console for details.");
    } finally {
      _setSavingContent(false);
    }
  };

  // Add new benefit
  const _handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    const updatedContent = {
      ...servicePageContent,
      benefits: [
        ...servicePageContent.benefits,
        { description: newBenefit.trim() },
      ],
    };
    setServicePageContent(updatedContent);
    setNewBenefit("");
  };

  // Remove benefit
  const _handleRemoveBenefit = (index: number) => {
    const updatedBenefits = servicePageContent.benefits.filter(
      (_, i) => i !== index
    );
    setServicePageContent({ ...servicePageContent, benefits: updatedBenefits });
  };

  // Start editing benefit
  const _handleStartEditBenefit = (index: number) => {
    _setEditingBenefitIndex(index);
    setEditBenefitText(servicePageContent.benefits[index].description);
  };

  // Save edited benefit
  const _handleSaveEditBenefit = (index: number) => {
    if (!editBenefitText.trim()) return;
    const updatedBenefits = [...servicePageContent.benefits];
    updatedBenefits[index] = {
      ...updatedBenefits[index],
      description: editBenefitText.trim(),
    };
    setServicePageContent({ ...servicePageContent, benefits: updatedBenefits });
    _setEditingBenefitIndex(null);
    setEditBenefitText("");
  };

  // Add new target audience
  const _handleAddTargetAudience = () => {
    if (!newTargetAudience.trim()) return;
    const updatedContent = {
      ...servicePageContent,
      targetAudience: [
        ...servicePageContent.targetAudience,
        { description: newTargetAudience.trim() },
      ],
    };
    setServicePageContent(updatedContent);
    setNewTargetAudience("");
  };

  // Remove target audience
  const _handleRemoveTargetAudience = (index: number) => {
    const updatedTargetAudience = servicePageContent.targetAudience.filter(
      (_, i) => i !== index
    );
    setServicePageContent({
      ...servicePageContent,
      targetAudience: updatedTargetAudience,
    });
  };

  // Start editing target audience
  const _handleStartEditTarget = (index: number) => {
    _setEditingTargetIndex(index);
    setEditTargetText(servicePageContent.targetAudience[index].description);
  };

  // Save edited target audience
  const _handleSaveEditTarget = (index: number) => {
    if (!editTargetText.trim()) return;
    const updatedTargetAudience = [...servicePageContent.targetAudience];
    updatedTargetAudience[index] = {
      ...updatedTargetAudience[index],
      description: editTargetText.trim(),
    };
    setServicePageContent({
      ...servicePageContent,
      targetAudience: updatedTargetAudience,
    });
    _setEditingTargetIndex(null);
    setEditTargetText("");
  };

  // Per-service benefit handlers (for modal form)
  const handleAddServiceBenefit = () => {
    if (!newServiceBenefit.trim()) return;
    setFormData({
      ...formData,
      benefits: [
        ...formData.benefits,
        { description: newServiceBenefit.trim() },
      ],
    });
    setNewServiceBenefit("");
  };

  const handleRemoveServiceBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  // Per-service target audience handlers (for modal form)
  const handleAddServiceTarget = () => {
    if (!newServiceTarget.trim()) return;
    setFormData({
      ...formData,
      targetAudience: [
        ...formData.targetAudience,
        { description: newServiceTarget.trim() },
      ],
    });
    setNewServiceTarget("");
  };

  const handleRemoveServiceTarget = (index: number) => {
    setFormData({
      ...formData,
      targetAudience: formData.targetAudience.filter((_, i) => i !== index),
    });
  };

  // Start editing service benefit
  const handleStartEditServiceBenefit = (index: number) => {
    setEditingServiceBenefitIndex(index);
    setEditServiceBenefitText(formData.benefits[index].description);
  };

  // Save edited service benefit
  const handleSaveEditServiceBenefit = (index: number) => {
    if (!editServiceBenefitText.trim()) return;
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = {
      ...updatedBenefits[index],
      description: editServiceBenefitText.trim(),
    };
    setFormData({ ...formData, benefits: updatedBenefits });
    setEditingServiceBenefitIndex(null);
    setEditServiceBenefitText("");
  };

  // Start editing service target audience
  const handleStartEditServiceTarget = (index: number) => {
    setEditingServiceTargetIndex(index);
    setEditServiceTargetText(formData.targetAudience[index].description);
  };

  // Save edited service target audience
  const handleSaveEditServiceTarget = (index: number) => {
    if (!editServiceTargetText.trim()) return;
    const updatedTargetAudience = [...formData.targetAudience];
    updatedTargetAudience[index] = {
      ...updatedTargetAudience[index],
      description: editServiceTargetText.trim(),
    };
    setFormData({ ...formData, targetAudience: updatedTargetAudience });
    setEditingServiceTargetIndex(null);
    setEditServiceTargetText("");
  };

  // Content section handlers
  const handleAddContentSection = () => {
    if (!newContentSectionTitle.trim() || !newContentSectionDesc.trim()) return;
    setFormData({
      ...formData,
      contentSections: [
        ...formData.contentSections,
        {
          title: newContentSectionTitle.trim(),
          description: newContentSectionDesc.trim(),
        },
      ],
    });
    setNewContentSectionTitle("");
    setNewContentSectionDesc("");
  };

  const handleRemoveContentSection = (index: number) => {
    setFormData({
      ...formData,
      contentSections: formData.contentSections.filter((_, i) => i !== index),
    });
  };

  const handleStartEditContentSection = (index: number) => {
    setEditingContentSectionIndex(index);
    setEditContentSectionTitle(formData.contentSections[index].title);
    setEditContentSectionDesc(formData.contentSections[index].description);
  };

  const handleSaveEditContentSection = (index: number) => {
    if (!editContentSectionTitle.trim() || !editContentSectionDesc.trim())
      return;
    const updated = [...formData.contentSections];
    updated[index] = {
      title: editContentSectionTitle.trim(),
      description: editContentSectionDesc.trim(),
    };
    setFormData({ ...formData, contentSections: updated });
    setEditingContentSectionIndex(null);
    setEditContentSectionTitle("");
    setEditContentSectionDesc("");
  };

  // Service images handlers - drag & drop upload (max 4 images)
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Check max 4 images limit
      const remainingSlots = 4 - formData.serviceImages.length;
      if (remainingSlots <= 0) {
        alert("Maximum 4 images allowed per service");
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setUploadingImage(true);

      // Get auth headers (without Content-Type for FormData)
      const apiKey = localStorage.getItem('admin_api_key');
      const token = localStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (apiKey) headers['x-api-key'] = apiKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          const formDataUpload = new FormData();
          formDataUpload.append("image", file);

          const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: "POST",
            headers,
            body: formDataUpload,
          });

          const data = await response.json();
          if (data.success) {
            return { url: data.data.url, caption: "" };
          }
          throw new Error(data.message || "Upload failed");
        });

        const uploadedImages = await Promise.all(uploadPromises);
        setFormData((prev) => ({
          ...prev,
          serviceImages: [...prev.serviceImages, ...uploadedImages],
        }));
      } catch (error) {
        console.error("Error uploading images:", error);
        alert("Error uploading images. Please try again.");
      } finally {
        setUploadingImage(false);
      }
    },
    [formData.serviceImages.length]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveServiceImage = (index: number) => {
    setFormData({
      ...formData,
      serviceImages: formData.serviceImages.filter((_, i) => i !== index),
    });
  };

  // Add image via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (formData.serviceImages.length >= 4) {
      alert("Maximum 4 images allowed per service");
      return;
    }
    setFormData({
      ...formData,
      serviceImages: [
        ...formData.serviceImages,
        { url: imageUrlInput.trim(), caption: "" },
      ],
    });
    setImageUrlInput("");
  };

  // Upload main service image
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMainImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      // Get auth headers (without Content-Type for FormData)
      const apiKey = localStorage.getItem('admin_api_key');
      const token = localStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (apiKey) headers['x-api-key'] = apiKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        headers,
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.data.url,
        }));
      } else {
        alert("Failed to upload image: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading main image:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setUploadingMainImage(false);
      if (mainImageInputRef.current) {
        mainImageInputRef.current.value = "";
      }
    }
  };

  // Upload banner image
  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      // Get auth headers (without Content-Type for FormData)
      const apiKey = localStorage.getItem('admin_api_key');
      const token = localStorage.getItem('admin_token');
      const headers: Record<string, string> = {};
      if (apiKey) headers['x-api-key'] = apiKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        headers,
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          bannerImageUrl: data.data.url,
        }));
      } else {
        alert("Failed to upload banner image: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error uploading banner image:", error);
      alert("Error uploading banner image. Please try again.");
    } finally {
      setUploadingBannerImage(false);
      if (bannerImageInputRef.current) {
        bannerImageInputRef.current.value = "";
      }
    }
  };

  // Open modal for adding new service
  const handleAddNew = () => {
    setEditingService(null);
    setFormData(initialFormData);
    setServiceTranslations(emptyTranslations);
    setSelectedLang('en');
    setNewServiceBenefit("");
    setNewServiceTarget("");
    setNewContentSectionTitle("");
    setNewContentSectionDesc("");
    setEditingServiceBenefitIndex(null);
    setEditingServiceTargetIndex(null);
    setEditServiceBenefitText("");
    setEditServiceTargetText("");
    setShowModal(true);
  };

  // Open modal for editing service
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      duration: service.duration,
      price: service.price,
      image: service.image,
      imageUrl: service.imageUrl || "",
      bannerImageUrl: service.bannerImageUrl || "",
      isActive: service.isActive,
      contentSections: service.contentSections || [],
      benefits: service.benefits || [],
      targetAudience: service.targetAudience || [],
      serviceImages: service.serviceImages || [],
    });
    setServiceTranslations({
      fr: service.translations?.fr || {},
      de: service.translations?.de || {},
      nl: service.translations?.nl || {},
      es: service.translations?.es || {},
    });
    setSelectedLang('en');
    setNewServiceBenefit("");
    setNewServiceTarget("");
    setNewContentSectionTitle("");
    setNewContentSectionDesc("");
    setEditingServiceBenefitIndex(null);
    setEditingServiceTargetIndex(null);
    setEditingContentSectionIndex(null);
    setEditServiceBenefitText("");
    setEditServiceTargetText("");
    setEditContentSectionTitle("");
    setEditContentSectionDesc("");
    setShowModal(true);
  };

  // Update a translation field for a specific language
  const updateTranslation = (lang: string, field: string, value: string) => {
    setServiceTranslations(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  // Update a translation array item (benefits/targetAudience)
  const updateTranslationArrayItem = (lang: string, field: string, index: number, value: string) => {
    setServiceTranslations(prev => {
      const arr = [...((prev[lang] as Record<string, {description: string}[]>)?.[field] || [])];
      arr[index] = { description: value };
      return { ...prev, [lang]: { ...prev[lang], [field]: arr } };
    });
  };

  // Save service (create or update)
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      const url = editingService
        ? `${API_BASE_URL}/services/${editingService._id}`
        : `${API_BASE_URL}/services`;

      const method = editingService ? "PUT" : "POST";

      // Debug: Log what's being sent
      console.log("Saving service with data:", formData);
      console.log("serviceImages being sent:", formData.serviceImages);

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...formData, translations: serviceTranslations }),
      });

      const data = await response.json();

      if (data.success) {
        // Update services list directly from the server response
        // to avoid race condition where fetchServices() returns stale data
        if (editingService && data.data) {
          setServices(prev => prev.map(s => s._id === editingService._id ? data.data : s));
        } else {
          // New service — refetch the full list
          await fetchServices();
        }
        setShowModal(false);
        setFormData(initialFormData);
        setEditingService(null);
      } else {
        alert(data.message || "Failed to save service");
      }
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Error saving service");
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        fetchServices();
      } else {
        alert(data.message || "Failed to delete service");
      }
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Error deleting service");
    }
  };

  // Toggle active status - optimistic update for smooth UX
  const handleToggleStatus = async (service: Service) => {
    const newIsActive = !service.isActive;

    // Optimistic update - update UI immediately
    setServices(prevServices =>
      prevServices.map(s =>
        s._id === service._id ? { ...s, isActive: newIsActive } : s
      )
    );

    try {
      const response = await fetch(`${API_BASE_URL}/services/${service._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        // FIXED: Only send the field being updated to prevent overwriting other fields
        body: JSON.stringify({ isActive: newIsActive }),
      });

      const data = await response.json();

      if (!data.success) {
        // Revert on failure
        setServices(prevServices =>
          prevServices.map(s =>
            s._id === service._id ? { ...s, isActive: !newIsActive } : s
          )
        );
        alert("Failed to update visibility");
      }
    } catch (err) {
      // Revert on error
      setServices(prevServices =>
        prevServices.map(s =>
          s._id === service._id ? { ...s, isActive: !newIsActive } : s
        )
      );
      console.error("Error toggling status:", err);
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || service.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Get category config
  const getCategoryConfig = (category: string) => {
    return categories.find((c) => c.value === category) || categories[0];
  };

  // Get image source
  const getImageSrc = (image: string) => {
    return imageMap[image] || m1;
  };

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const avgPrice =
    services.length > 0
      ? (
          services.reduce((acc, s) => acc + s.price, 0) / services.length
        ).toFixed(0)
      : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Services
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                  Manage your services and pricing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search - Hidden on mobile, shown in action bar instead */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-100/80 border-0 rounded-xl text-sm w-48 lg:w-64 focus:ring-2 focus:ring-[#DFB13B]/20 focus:bg-white transition-all outline-none"
                />
              </div>
              {/* Notification */}

              {/* Profile */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-[#DFB13B]/20 flex-shrink-0">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">
                    Total Services
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                    {totalServices}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#DFB13B] to-[#C9A032] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">
                    Active Services
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                    {activeServices}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#DFB13B] via-[#DFB13B] to-[#FFEEC3] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                  <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-500">
                    Avg. Price
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800">
                      €{avgPrice}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Euro className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search - Only shown on mobile */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] transition-all outline-none"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:border-slate-300 transition"
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">
                    {filterCategory === "all"
                      ? "All"
                      : getCategoryConfig(filterCategory).label}
                  </span>
                  <span className="xs:hidden">
                    {filterCategory === "all"
                      ? "All"
                      : getCategoryConfig(filterCategory).label.slice(0, 3)}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-2 min-w-[160px] z-20">
                    <button
                      onClick={() => {
                        setFilterCategory("all");
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition ${
                        filterCategory === "all"
                          ? "text-[#B8922D] font-medium bg-[#FFEEC3]/30"
                          : "text-slate-600"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setFilterCategory(cat.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition flex items-center gap-2 ${
                          filterCategory === cat.value
                            ? "text-[#B8922D] font-medium bg-[#FFEEC3]/30"
                            : "text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`}
                        ></span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-[#FFEEC3]/30 text-[#B8922D]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition ${
                    viewMode === "list"
                      ? "bg-[#FFEEC3]/30 text-[#B8922D]"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <span className="text-xs sm:text-sm text-slate-500">
                {filteredServices.length}/{totalServices}
              </span>
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition shadow-lg shadow-[#DFB13B]/30 text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-[#DFB13B] mb-4" />
              <span className="text-slate-500">Loading services...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium">Connection Error</p>
                <p className="text-sm text-red-500">
                  {error}. Please make sure the backend server is running.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredServices.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No services found
              </h3>
              <p className="text-slate-500 mb-6">
                Get started by adding your first service
              </p>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DFB13B] text-white rounded-xl hover:bg-[#C9A032] transition"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>
          )}

          {/* Services Grid */}
          {!loading &&
            !error &&
            filteredServices.length > 0 &&
            viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service, index) => {
                  const catConfig = getCategoryConfig(service.category);
                  return (
                    <div
                      key={service._id}
                      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                        !service.isActive
                          ? 'bg-slate-100 border-slate-200 grayscale'
                          : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Grey overlay for inactive */}
                      {!service.isActive && (
                        <div className="absolute inset-0 bg-slate-500/20 z-10 pointer-events-none"></div>
                      )}

                      {/* Image */}
                      <div className="h-36 relative overflow-hidden">
                        <img
                          src={service.imageUrl ? (getImageUrl(service.imageUrl) || service.imageUrl) : getImageSrc(service.image)}
                          alt={service.title}
                          className={`w-full h-full object-cover ${!service.isActive ? 'opacity-50' : ''}`}
                        />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-20">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${catConfig.bgLight} ${catConfig.textColor}`}
                          >
                            {catConfig.label}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md z-20 ${
                          service.isActive
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-slate-700/90 text-white'
                        }`}>
                          {service.isActive ? 'Active' : 'Hidden'}
                        </div>

                        {/* Inactive Overlay on Image */}
                        {!service.isActive && (
                          <div className="absolute inset-0 bg-slate-600/50 flex items-center justify-center z-10">
                            <EyeOff className="w-10 h-10 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-semibold text-slate-800 mb-1 truncate">
                          {service.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        {/* Price & Duration */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {service.duration} mins
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-bold text-[#B8922D]">
                              €{service.price}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 relative z-20">
                          <button
                            onClick={() => handleToggleStatus(service)}
                            className={`p-2.5 rounded-xl transition-all ${
                              service.isActive
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                            }`}
                            title={service.isActive ? 'Hide service' : 'Show service'}
                          >
                            {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(service)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-slate-600 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded-xl transition text-sm font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          {/* Services List View */}
          {!loading &&
            !error &&
            filteredServices.length > 0 &&
            viewMode === "list" && (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                          Service
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                          Category
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                          Duration
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                          Price
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">
                          Status
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => {
                        const catConfig = getCategoryConfig(service.category);
                        return (
                          <tr
                            key={service._id}
                            className="border-t border-slate-100 hover:bg-slate-50/50 transition"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                                  <img
                                    src={
                                      service.imageUrl ? (getImageUrl(service.imageUrl) || service.imageUrl) : getImageSrc(service.image)
                                    }
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {service.title}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${catConfig.bgLight} ${catConfig.textColor}`}
                              >
                                {catConfig.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">
                              {service.duration} mins
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-[#B8922D]">
                                €{service.price}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleStatus(service)}
                                className={`p-2 rounded-lg transition-all ${
                                  service.isActive
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                                title={service.isActive ? 'Hide service' : 'Show service'}
                              >
                                {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(service)}
                                  className="p-2 text-slate-500 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded-lg transition"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(service._id)}
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredServices.map((service) => {
                    const catConfig = getCategoryConfig(service.category);
                    return (
                      <div
                        key={service._id}
                        className="bg-white rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={
                                service.imageUrl ? (getImageUrl(service.imageUrl) || service.imageUrl) : getImageSrc(service.image)
                              }
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 truncate">
                                  {service.title}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                  {service.description}
                                </p>
                              </div>
                              <button
                                onClick={() => handleToggleStatus(service)}
                                className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                                  service.isActive
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                                title={service.isActive ? 'Hide service' : 'Show service'}
                              >
                                {service.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${catConfig.bgLight} ${catConfig.textColor}`}
                              >
                                {catConfig.label}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration}m
                              </span>
                              <span className="font-semibold text-sm text-[#B8922D]">
                                €{service.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleEdit(service)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded-lg transition text-xs font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <div className="w-px h-5 bg-slate-200"></div>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          {/* Service Detail Page Content Section */}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#DFB13B] to-[#C9A032]">
              <div className="relative px-4 sm:px-8 py-4 sm:py-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                    {editingService ? (
                      <Edit2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-bold text-white">
                      {editingService ? "Edit Service" : "Add New Service"}
                    </h2>
                    <p className="text-[#FFEEC3] text-xs sm:text-sm mt-0.5 truncate">
                      {editingService ? "Update service details" : "Create a new service"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Language selector */}
              <div className="flex items-center gap-1.5 px-4 sm:px-8 pb-3 flex-wrap">
                <span className="text-xs text-white/70 mr-1">Language:</span>
                {(['en', 'fr', 'de', 'nl', 'es'] as const).map(lang => (
                  <button key={lang} type="button" onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${selectedLang === lang ? 'bg-white text-[#C9A032] shadow-sm' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-200px)]">
              {/* Translation mode banner */}
              {selectedLang !== 'en' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-700">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Editing <strong>{selectedLang.toUpperCase()}</strong> translation — English values shown as placeholders.</span>
                </div>
              )}

              {/* Title — not translatable */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Swedish Massage"
                  disabled={selectedLang !== 'en'}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all outline-none text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Description {selectedLang === 'en' ? '*' : `(${selectedLang.toUpperCase()})`}
                </label>
                <textarea
                  value={selectedLang === 'en' ? formData.description : ((serviceTranslations[selectedLang] as ServiceLangTranslation)?.description || '')}
                  onChange={(e) => selectedLang === 'en'
                    ? setFormData({ ...formData, description: e.target.value })
                    : updateTranslation(selectedLang, 'description', e.target.value)}
                  placeholder={selectedLang === 'en' ? 'Describe the service...' : formData.description || 'Description translation...'}
                  rows={3}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none resize-none text-sm sm:text-base ${selectedLang !== 'en' ? 'border-violet-200 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400' : 'border-slate-200 focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B]'}`}
                />
              </div>

              {/* Category & Duration Row */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all outline-none appearance-none cursor-pointer text-sm sm:text-base"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    Duration (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full pl-8 sm:pl-11 pr-2 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all outline-none text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Price
                </label>
                <div className="relative">
                  <Euro className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value === '' ? 0 : parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full pl-8 sm:pl-11 pr-2 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Service Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Service Image{" "}
                  <span className="font-normal text-slate-400">(URL or Upload)</span>
                </label>

                {/* Show uploaded image preview if exists */}
                {formData.imageUrl && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={getImageUrl(formData.imageUrl) || formData.imageUrl}
                      alt="Uploaded preview"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-[#DFB13B]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all outline-none text-sm sm:text-base"
                  />
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => mainImageInputRef.current?.click()}
                    disabled={uploadingMainImage}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-[#DFB13B] text-white rounded-xl hover:bg-[#C9A032] transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploadingMainImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline text-sm">Upload</span>
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2">
                  Upload an image or paste an image URL for this service
                </p>
              </div>

              {/* Banner Image URL or Upload */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                  Banner Image{" "}
                  <span className="font-normal text-slate-400">(For service detail page hero)</span>
                </label>

                {/* Show uploaded banner image preview if exists */}
                {formData.bannerImageUrl && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={getImageUrl(formData.bannerImageUrl) || formData.bannerImageUrl}
                      alt="Banner preview"
                      className="w-40 h-20 object-cover rounded-xl border-2 border-violet-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerImageUrl: "" })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.bannerImageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, bannerImageUrl: e.target.value })
                    }
                    placeholder="https://example.com/banner-image.jpg"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all outline-none text-sm sm:text-base"
                  />
                  <input
                    ref={bannerImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerImageInputRef.current?.click()}
                    disabled={uploadingBannerImage}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploadingBannerImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline text-sm">Upload</span>
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2">
                  This image appears as the hero banner on the service detail page
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-700 text-sm sm:text-base">
                    Visibility
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Show this service to customers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors flex-shrink-0 ${
                    formData.isActive ? "bg-[#DFB13B]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow transition-transform ${
                      formData.isActive
                        ? "translate-x-6 sm:translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Content Sections - Detailed descriptions with titles */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <label className="text-sm font-semibold text-slate-700">
                    Content Sections{" "}
                    <span className="font-normal text-slate-400">
                      (Detailed descriptions with titles)
                    </span>
                  </label>
                </div>

                {/* Add new content section */}
                <div className="space-y-2 mb-3">
                  <input
                    type="text"
                    value={newContentSectionTitle}
                    onChange={(e) => setNewContentSectionTitle(e.target.value)}
                    placeholder="Section title (e.g., 'Energy points')"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none text-sm"
                  />
                  <div className="flex gap-2">
                    <textarea
                      value={newContentSectionDesc}
                      onChange={(e) => setNewContentSectionDesc(e.target.value)}
                      placeholder="Section description..."
                      rows={2}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none text-sm resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddContentSection}
                      className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition self-end"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content sections list */}
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {formData.contentSections.map((section, index) => (
                    <div
                      key={index}
                      className="p-4 bg-amber-50 rounded-xl group"
                    >
                      {editingContentSectionIndex === index ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editContentSectionTitle}
                            onChange={(e) =>
                              setEditContentSectionTitle(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20"
                            placeholder="Section title"
                            autoFocus
                          />
                          <textarea
                            value={editContentSectionDesc}
                            onChange={(e) =>
                              setEditContentSectionDesc(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                            rows={3}
                            placeholder="Section description"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveEditContentSection(index)
                              }
                              className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContentSectionIndex(null);
                                setEditContentSectionTitle("");
                                setEditContentSectionDesc("");
                              }}
                              className="px-3 py-1.5 text-xs bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-amber-700 mb-1">
                                {section.title}
                              </h4>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                                {section.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEditContentSection(index)
                                }
                                className="p-1.5 text-slate-400 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveContentSection(index)
                                }
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {formData.contentSections.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No content sections added. Add detailed descriptions for
                      this service (e.g., "Energy points", "Self-healing of the
                      body").
                    </p>
                  )}
                </div>
              </div>

              {/* Service-Specific Benefits */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <label className="text-sm font-semibold text-slate-700">
                    Service Benefits{" "}
                    <span className="font-normal text-slate-400">
                      {selectedLang !== 'en' ? `(${selectedLang.toUpperCase()} translations)` : '(Unique to this service)'}
                    </span>
                  </label>
                </div>

                {/* Add new benefit — only in EN mode */}
                {selectedLang === 'en' && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newServiceBenefit}
                      onChange={(e) => setNewServiceBenefit(e.target.value)}
                      placeholder="Add a benefit for this service..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddServiceBenefit())
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddServiceBenefit}
                      className="px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Benefits list */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedLang !== 'en' ? (
                    // Translation mode: show EN text + translation input
                    formData.benefits.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">No benefits to translate.</p>
                    ) : formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg border border-violet-100">
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 mb-0.5">EN: {benefit.description}</p>
                          <input
                            type="text"
                            value={(serviceTranslations[selectedLang] as ServiceLangTranslation)?.benefits?.[index]?.description || ''}
                            onChange={e => updateTranslationArrayItem(selectedLang, 'benefits', index, e.target.value)}
                            placeholder={`Benefit ${index + 1} in ${selectedLang.toUpperCase()}...`}
                            className="w-full px-2 py-1.5 border border-violet-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 bg-white"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    // EN mode: full edit UI
                    <>
                    {formData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-rose-50 rounded-lg group"
                      >
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 shrink-0"></div>
                        {editingServiceBenefitIndex === index ? (
                          <div className="flex-1 flex flex-col gap-2">
                            <textarea
                              value={editServiceBenefitText}
                              onChange={(e) => setEditServiceBenefitText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleSaveEditServiceBenefit(index)}
                                className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center gap-1">
                                <Save className="w-3 h-3" /> Save
                              </button>
                              <button type="button" onClick={() => { setEditingServiceBenefitIndex(null); setEditServiceBenefitText(""); }}
                                className="px-3 py-1.5 text-xs bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="flex-1 text-sm text-slate-600 whitespace-pre-wrap">{benefit.description}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                              <button type="button" onClick={() => handleStartEditServiceBenefit(index)}
                                className="p-1.5 text-slate-400 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded transition">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => handleRemoveServiceBenefit(index)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {formData.benefits.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3">
                        No benefits added. Add benefits specific to this service.
                      </p>
                    )}
                    </>
                  )}
                </div>
              </div>

              {/* Service-Specific Target Audience */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <label className="text-sm font-semibold text-slate-700">
                    Who It's For{" "}
                    <span className="font-normal text-slate-400">
                      {selectedLang !== 'en' ? `(${selectedLang.toUpperCase()} translations)` : '(Target audience for this service)'}
                    </span>
                  </label>
                </div>

                {/* Add new target — only in EN mode */}
                {selectedLang === 'en' && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newServiceTarget}
                    onChange={(e) => setNewServiceTarget(e.target.value)}
                    placeholder="Add target audience for this service..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none text-sm"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddServiceTarget())
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddServiceTarget}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                )}

                {/* Target audience list */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedLang !== 'en' ? (
                    formData.targetAudience.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">No target audience to translate.</p>
                    ) : formData.targetAudience.map((target, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg border border-violet-100">
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 mb-0.5">EN: {target.description}</p>
                          <input
                            type="text"
                            value={(serviceTranslations[selectedLang] as ServiceLangTranslation)?.targetAudience?.[index]?.description || ''}
                            onChange={e => updateTranslationArrayItem(selectedLang, 'targetAudience', index, e.target.value)}
                            placeholder={`Audience ${index + 1} in ${selectedLang.toUpperCase()}...`}
                            className="w-full px-2 py-1.5 border border-violet-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 bg-white"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                    {formData.targetAudience.map((target, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg group">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                        {editingServiceTargetIndex === index ? (
                          <div className="flex-1 flex flex-col gap-2">
                            <textarea value={editServiceTargetText}
                              onChange={(e) => setEditServiceTargetText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                              rows={2} autoFocus />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleSaveEditServiceTarget(index)}
                                className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center gap-1">
                                <Save className="w-3 h-3" /> Save
                              </button>
                              <button type="button" onClick={() => { setEditingServiceTargetIndex(null); setEditServiceTargetText(""); }}
                                className="px-3 py-1.5 text-xs bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="flex-1 text-sm text-slate-600">{target.description}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                              <button type="button" onClick={() => handleStartEditServiceTarget(index)}
                                className="p-1.5 text-slate-400 hover:text-[#B8922D] hover:bg-[#FFEEC3]/30 rounded transition">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => handleRemoveServiceTarget(index)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {formData.targetAudience.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3">
                        No target audience added. Specify who this service is for.
                      </p>
                    )}
                    </>
                  )}
                </div>
              </div>

              {/* Service Images Gallery - Drag & Drop Upload (Max 4) */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-[#DFB13B]" />
                    <label className="text-sm font-semibold text-slate-700">
                      Service Gallery{" "}
                      <span className="font-normal text-slate-400">
                        (Max 4 images)
                      </span>
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formData.serviceImages.length}/4 images
                  </span>
                </div>

                {formData.serviceImages.length < 4 && (
                  <div className="space-y-3 mb-4">
                    {/* Add via URL */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddImageUrl())
                        }
                        placeholder="Paste image URL here..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#DFB13B]/20 focus:border-[#DFB13B] focus:bg-white transition-all outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        disabled={!imageUrlInput.trim()}
                        className="px-4 py-2.5 bg-[#DFB13B] text-white rounded-xl hover:bg-[#C9A032] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-xs text-slate-400">
                        or upload from PC
                      </span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    {/* Drag & Drop Upload Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-[#DFB13B] bg-[#FFEEC3]/20"
                          : "border-slate-300 hover:border-[#DFB13B]/50 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 text-[#DFB13B] animate-spin mb-2" />
                          <p className="text-sm text-slate-600">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 text-[#DFB13B] mb-2" />
                          <p className="text-sm font-medium text-slate-700">
                            {isDragging
                              ? "Drop images here"
                              : "Drag & drop or click to browse"}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Uploaded Images Grid */}
                {formData.serviceImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.serviceImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative group rounded-md overflow-hidden bg-slate-100 w-14 h-14"
                      >
                        <img
                          src={getImageUrl(img.url) || img.url}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><rect fill="%23f1f5f9" width="56" height="56"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="8">Err</text></svg>';
                          }}
                        />
                        {/* Delete button overlay */}
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceImage(index)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        {/* Image number badge */}
                        <div className="absolute bottom-0.5 left-0.5 px-1 py-px bg-black/50 text-white text-[8px] rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.serviceImages.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No images uploaded yet. Drag & drop or click to upload.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-5 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#DFB13B] to-[#C9A032] text-white rounded-xl hover:shadow-lg hover:shadow-[#DFB13B]/30 transition shadow-lg shadow-[#DFB13B]/30 font-medium disabled:opacity-50 text-sm sm:text-base"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                {saving ? "Saving..." : "Save Service"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {showFilterDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  );
};

export default Services;

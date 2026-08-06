const Service = require('../models/Service');
const translationService = require('../services/translationService');
const { autoTranslateService } = require('../services/autoTranslateService');

// Get all services (with optional translation from DB)
exports.getAllServices = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    console.log(`📖 [DB READ] Fetching services for language: ${lang}`);

    const services = await Service.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });

    // If language is English, return original data
    if (lang === 'en') {
      console.log(`📖 [DB READ] Returning ${services.length} services in English (original)`);
      return res.status(200).json({
        success: true,
        count: services.length,
        data: services,
        language: 'en'
      });
    }

    // For other languages, use stored translations from DB (cost-efficient approach)
    const supportedLangs = ['fr', 'de', 'nl', 'es'];
    if (supportedLangs.includes(lang)) {
      let translatedCount = 0;
      let noTranslationCount = 0;

      const translatedServices = services.map(service => {
        const serviceObj = service.toObject();
        const translation = serviceObj.translations?.[lang];

        if (translation && translation.description) {
          translatedCount++;
          // Use stored translation from DB (keep title in English)
          return {
            ...serviceObj,
            title: serviceObj.title,
            description: translation.description || serviceObj.description,
            benefits: translation.benefits?.length > 0 ? translation.benefits : serviceObj.benefits,
            targetAudience: translation.targetAudience?.length > 0 ? translation.targetAudience : serviceObj.targetAudience,
            contentSections: translation.contentSections?.length > 0 ? translation.contentSections : serviceObj.contentSections
          };
        }

        noTranslationCount++;
        // No translation stored, return original
        return serviceObj;
      });

      console.log(`📖 [DB READ] Returning ${services.length} services in ${lang} (${translatedCount} translated from DB, ${noTranslationCount} no translation stored)`);

      return res.status(200).json({
        success: true,
        count: translatedServices.length,
        data: translatedServices,
        language: lang
      });
    }

    // Unsupported language, return original
    console.log(`📖 [DB READ] Unsupported language ${lang}, returning English`);
    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
      language: 'en'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// Get all services for admin (including inactive)
exports.getAllServicesAdmin = async (req, res) => {
  try {
    console.log(`📖 [DB READ] Admin fetching all services (including inactive)`);
    const services = await Service.find({}).sort({ displayOrder: 1, createdAt: 1 });

    console.log(`📖 [DB READ] Returning ${services.length} services for admin`);
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

// Get single service by ID (with optional translation from DB)
exports.getServiceById = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // If language is English, return original data
    if (lang === 'en') {
      return res.status(200).json({
        success: true,
        data: service,
        language: 'en'
      });
    }

    // For other languages, use stored translations from DB
    const supportedLangs = ['fr', 'de', 'nl', 'es'];
    if (supportedLangs.includes(lang)) {
      const serviceObj = service.toObject();
      const translation = serviceObj.translations?.[lang];

      if (translation) {
        // Use stored translation from DB (keep title in English)
        const translatedService = {
          ...serviceObj,
          title: serviceObj.title,
          description: translation.description || serviceObj.description,
          benefits: translation.benefits?.length > 0 ? translation.benefits : serviceObj.benefits,
          targetAudience: translation.targetAudience?.length > 0 ? translation.targetAudience : serviceObj.targetAudience,
          contentSections: translation.contentSections?.length > 0 ? translation.contentSections : serviceObj.contentSections
        };

        return res.status(200).json({
          success: true,
          data: translatedService,
          language: lang
        });
      }
    }

    // No translation or unsupported language, return original
    res.status(200).json({
      success: true,
      data: service,
      language: 'en'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
};

// Create new service (Admin only)
exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
  try {
    // Debug: Log what's being received
    console.log('Updating service with data:', JSON.stringify(req.body, null, 2));
    console.log('serviceImages received:', req.body.serviceImages);

    // Get the existing service first
    const existingService = await Service.findById(req.params.id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    let updateData = { ...req.body };

    // Preserve existing image if not explicitly being updated
    // (prevent accidental overwrites when editing other fields)
    if (!req.body.image || req.body.image === existingService.image) {
      updateData.image = existingService.image;
    }

    // CRITICAL: Preserve imageUrl if not provided in request
    // This prevents accidental deletion when toggling visibility or updating other fields
    if (req.body.imageUrl === undefined) {
      updateData.imageUrl = existingService.imageUrl;
    }

    // Preserve bannerImageUrl if not provided in request
    if (req.body.bannerImageUrl === undefined) {
      updateData.bannerImageUrl = existingService.bannerImageUrl;
    }

    // Preserve existing translations if not provided in request
    if (req.body.translations === undefined) {
      updateData.translations = existingService.translations;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
};

// Trigger auto-translation for a service (Admin only - explicit action)
exports.translateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    console.log('[Service Translate] Running auto-translation for:', service.title);
    const translations = await autoTranslateService(service.toObject());

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { translations },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service translated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error translating service',
      error: error.message
    });
  }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
};

// REMOVED: assignUniqueImages function
// This function was removed to prevent accidental overwrites of uploaded images
// If you need to assign default images, do it manually in seed.js only

// Add gallery images to ALL services (massage, facial, and other categories)
exports.addAllServicesGalleryImages = async (req, res) => {
  try {
    // Comprehensive gallery images for all service types
    const allGalleryImages = {
      // Massage/Therapy images
      massage: [
        { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', caption: 'Professional massage therapy' },
        { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Relaxing spa environment' },
        { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', caption: 'Therapeutic massage treatment' },
        { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Peaceful spa experience' }
      ],
      therapy: [
        { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Deep tissue therapy' },
        { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Therapeutic session' },
        { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Professional bodywork' },
        { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa relaxation room' }
      ],
      // Facial/Skincare images
      facial: [
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Luxurious facial treatment' },
        { url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800', caption: 'Professional skincare session' },
        { url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', caption: 'Relaxing facial spa' },
        { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Premium skincare experience' }
      ],
      // PMU/Beauty images
      pmu: [
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Professional beauty treatment' },
        { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Permanent makeup artistry' },
        { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Beauty enhancement session' },
        { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Expert beauty care' }
      ],
      // Default/General wellness images
      default: [
        { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Therapy session' },
        { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Calming spa atmosphere' },
        { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Rejuvenating treatment' },
        { url: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800', caption: 'Luxury spa experience' }
      ]
    };

    // Find ALL active services
    const allServices = await Service.find({ isActive: true });

    if (allServices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No services found'
      });
    }

    const results = [];

    // Update each service with appropriate gallery images
    for (const service of allServices) {
      // Determine which image set to use based on category
      let galleryImages;
      const category = (service.category || '').toLowerCase();

      if (category.includes('massage')) {
        galleryImages = allGalleryImages.massage;
      } else if (category.includes('therapy')) {
        galleryImages = allGalleryImages.therapy;
      } else if (category.includes('facial')) {
        galleryImages = allGalleryImages.facial;
      } else if (category.includes('pmu') || category.includes('beauty')) {
        galleryImages = allGalleryImages.pmu;
      } else {
        galleryImages = allGalleryImages.default;
      }

      // Only update if service doesn't already have gallery images or force update is requested
      if (!service.serviceImages || service.serviceImages.length === 0 || req.query.force === 'true') {
        await Service.findByIdAndUpdate(
          service._id,
          { serviceImages: galleryImages },
          { new: true }
        );
        results.push({ title: service.title, category: service.category, status: 'updated', imagesAdded: galleryImages.length });
      } else {
        results.push({ title: service.title, category: service.category, status: 'skipped', reason: 'already has images' });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${allServices.length} services`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding gallery images to all services',
      error: error.message
    });
  }
};

// Add gallery images to all massage/therapy services
exports.addMassageGalleryImages = async (req, res) => {
  try {
    // Sample massage/spa/wellness related images from Unsplash
    const massageGalleryImages = [
      // Set 1 - Hot Stone Massage themed
      [
        { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', caption: 'Hot stone massage therapy' },
        { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Relaxing spa environment' },
        { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', caption: 'Professional massage treatment' },
        { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Peaceful spa experience' }
      ],
      // Set 2 - Deep Tissue themed
      [
        { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Deep tissue massage technique' },
        { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Therapeutic massage session' },
        { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Professional bodywork' },
        { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Spa relaxation room' }
      ],
      // Set 3 - Swedish/Relaxation themed
      [
        { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Swedish massage therapy' },
        { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Calming spa atmosphere' },
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Treatment room' },
        { url: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800', caption: 'Luxury spa experience' }
      ],
      // Set 4 - Aromatherapy themed
      [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', caption: 'Aromatherapy massage oils' },
        { url: 'https://images.unsplash.com/photo-1595450547833-95af46363172?w=800', caption: 'Essential oil therapy' },
        { url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800', caption: 'Relaxing aromatherapy' },
        { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Spa journey' }
      ],
      // Set 5 - Couples/Relaxation themed
      [
        { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Couples massage room' },
        { url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800', caption: 'Romantic spa setting' },
        { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Luxury suite' },
        { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Premium spa service' }
      ],
      // Set 6 - Thai/Sports themed
      [
        { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800', caption: 'Thai massage technique' },
        { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Sports massage therapy' },
        { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Athletic recovery massage' },
        { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Professional treatment' }
      ],
      // Set 7 - Prenatal/Gentle themed
      [
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Gentle massage therapy' },
        { url: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800', caption: 'Relaxing treatment room' },
        { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', caption: 'Peaceful spa environment' },
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800', caption: 'Nurturing care' }
      ],
      // Set 8 - Reflexology themed
      [
        { url: 'https://images.unsplash.com/photo-1595450547833-95af46363172?w=800', caption: 'Reflexology treatment' },
        { url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800', caption: 'Foot massage therapy' },
        { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Pressure point massage' },
        { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Holistic healing' }
      ]
    ];

    // Find all massage and therapy services
    const massageServices = await Service.find({
      category: { $in: ['massage', 'therapy'] }
    });

    if (massageServices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No massage/therapy services found'
      });
    }

    const results = [];

    // Update each service with gallery images
    for (let i = 0; i < massageServices.length; i++) {
      const service = massageServices[i];
      const imageSetIndex = i % massageGalleryImages.length;
      const galleryImages = massageGalleryImages[imageSetIndex];

      // Only update if service doesn't already have gallery images or force update is requested
      if (!service.serviceImages || service.serviceImages.length === 0 || req.query.force === 'true') {
        const updated = await Service.findByIdAndUpdate(
          service._id,
          { serviceImages: galleryImages },
          { new: true }
        );
        results.push({ title: service.title, status: 'updated', imagesAdded: galleryImages.length });
      } else {
        results.push({ title: service.title, status: 'skipped', reason: 'already has images' });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${massageServices.length} massage/therapy services`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding gallery images',
      error: error.message
    });
  }
};

// Add gallery images to all facial services
exports.addFacialGalleryImages = async (req, res) => {
  try {
    // Sample facial/skincare related images from Unsplash
    const facialGalleryImages = [
      // Set 1 - Classic Facial themed
      [
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Luxurious facial treatment' },
        { url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800', caption: 'Professional skincare session' },
        { url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', caption: 'Relaxing facial spa' },
        { url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800', caption: 'Premium skincare experience' }
      ],
      // Set 2 - Anti-Aging themed
      [
        { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800', caption: 'Anti-aging facial therapy' },
        { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Rejuvenating skin treatment' },
        { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Youth-restoring facial' },
        { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Premium anti-aging care' }
      ],
      // Set 3 - Hydrating/Moisturizing themed
      [
        { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', caption: 'Hydrating facial mask' },
        { url: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800', caption: 'Deep moisture treatment' },
        { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', caption: 'Nourishing skin therapy' },
        { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800', caption: 'Spa hydration ritual' }
      ],
      // Set 4 - Deep Cleansing themed
      [
        { url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800', caption: 'Deep cleansing facial' },
        { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', caption: 'Pore purifying treatment' },
        { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800', caption: 'Detox facial therapy' },
        { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', caption: 'Clear skin treatment' }
      ],
      // Set 5 - Glow/Brightening themed
      [
        { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', caption: 'Brightening facial glow' },
        { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800', caption: 'Radiant skin treatment' },
        { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', caption: 'Luminous complexion therapy' },
        { url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', caption: 'Glowing skin ritual' }
      ],
      // Set 6 - Natural/Organic themed
      [
        { url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800', caption: 'Natural skincare treatment' },
        { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', caption: 'Organic facial therapy' },
        { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800', caption: 'Botanical skin ritual' },
        { url: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', caption: 'Pure ingredients care' }
      ]
    ];

    // Find all facial services
    const facialServices = await Service.find({
      category: { $in: ['facial', 'facial care'] }
    });

    if (facialServices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No facial services found'
      });
    }

    const results = [];

    // Update each service with gallery images
    for (let i = 0; i < facialServices.length; i++) {
      const service = facialServices[i];
      const imageSetIndex = i % facialGalleryImages.length;
      const galleryImages = facialGalleryImages[imageSetIndex];

      // Only update if service doesn't already have gallery images or force update is requested
      if (!service.serviceImages || service.serviceImages.length === 0 || req.query.force === 'true') {
        await Service.findByIdAndUpdate(
          service._id,
          { serviceImages: galleryImages },
          { new: true }
        );
        results.push({ title: service.title, status: 'updated', imagesAdded: galleryImages.length });
      } else {
        results.push({ title: service.title, status: 'skipped', reason: 'already has images' });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${facialServices.length} facial services`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding gallery images',
      error: error.message
    });
  }
};

// Update service translations (Admin only)
// Stores pre-translated content in DB for cost-efficient multi-language support
exports.updateServiceTranslations = async (req, res) => {
  try {
    const { id } = req.params;
    const { translations } = req.body;

    // Validate translations object
    if (!translations || typeof translations !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Translations object is required'
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update translations for each language provided
    const updateData = { translations: { ...service.translations } };

    for (const lang of ['fr', 'de', 'nl', 'es']) {
      if (translations[lang]) {
        updateData.translations[lang] = {
          title: translations[lang].title || '',
          description: translations[lang].description || '',
          benefits: (translations[lang].benefits || []).map(b =>
            typeof b === 'string' ? { description: b } : b
          ),
          targetAudience: (translations[lang].target_audience || translations[lang].targetAudience || []).map(t =>
            typeof t === 'string' ? { description: t } : t
          ),
          contentSections: translations[lang].contentSections || []
        };
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service translations updated successfully',
      data: updatedService
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating service translations',
      error: error.message
    });
  }
};

// Bulk update translations for multiple services
exports.bulkUpdateTranslations = async (req, res) => {
  try {
    const { services } = req.body;

    if (!services || !Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'Services array is required'
      });
    }

    const results = [];

    for (const serviceData of services) {
      const { serviceId, title, translations } = serviceData;

      // Find service by ID or title
      let service;
      if (serviceId) {
        service = await Service.findById(serviceId);
      } else if (title) {
        service = await Service.findOne({ title: { $regex: new RegExp(title, 'i') } });
      }

      if (!service) {
        results.push({ title: title || serviceId, status: 'not_found' });
        continue;
      }

      // Build translations update
      const updateData = { translations: { ...service.translations } };

      for (const lang of ['fr', 'de', 'nl']) {
        if (translations[lang]) {
          updateData.translations[lang] = {
            title: translations[lang].title || '',
            description: translations[lang].description || '',
            benefits: (translations[lang].benefits || []).map(b =>
              typeof b === 'string' ? { description: b } : b
            ),
            targetAudience: (translations[lang].target_audience || translations[lang].targetAudience || []).map(t =>
              typeof t === 'string' ? { description: t } : t
            ),
            contentSections: translations[lang].contentSections || []
          };
        }
      }

      // Also update English content if provided
      if (translations.en) {
        if (translations.en.title) updateData.title = translations.en.title;
        if (translations.en.description) updateData.description = translations.en.description;
        if (translations.en.benefits) {
          updateData.benefits = translations.en.benefits.map(b =>
            typeof b === 'string' ? { description: b } : b
          );
        }
        if (translations.en.target_audience || translations.en.targetAudience) {
          updateData.targetAudience = (translations.en.target_audience || translations.en.targetAudience).map(t =>
            typeof t === 'string' ? { description: t } : t
          );
        }
      }

      await Service.findByIdAndUpdate(service._id, updateData, { new: true });
      results.push({ title: service.title, status: 'updated' });
    }

    res.status(200).json({
      success: true,
      message: `Processed ${services.length} services`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk updating translations',
      error: error.message
    });
  }
};

// Update service image (Admin only)
exports.updateServiceImage = async (req, res) => {
  try {
    const { image, imageUrl } = req.body;

    const updateData = {};
    if (image) updateData.image = image;
    if (imageUrl) updateData.imageUrl = imageUrl;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service image updated successfully',
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating service image',
      error: error.message
    });
  }
};

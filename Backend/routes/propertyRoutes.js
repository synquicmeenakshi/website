const express = require('express');
const router = express.Router();
const { Property, SectionSettings } = require('../models/Property');
const { autoTranslateProperty, autoTranslateSectionSettings } = require('../services/autoTranslateService');

const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'nl', 'es'];

// Helper function to get translated property from stored translations
const getTranslatedProperty = (property, lang) => {
  const propertyObj = property.toObject ? property.toObject() : { ...property };

  // If language is English or translations don't exist, return original
  if (lang === 'en' || !propertyObj.translations || !propertyObj.translations[lang]) {
    return propertyObj;
  }

  const translation = propertyObj.translations[lang];

  // Build translated overview if it exists
  let translatedOverview = propertyObj.overview;
  if (translation.overview && propertyObj.overview) {
    // Translate features array if available
    let translatedFeatures = propertyObj.overview.features || [];
    if (translation.overview.features?.length > 0 && propertyObj.overview.features?.length > 0) {
      translatedFeatures = propertyObj.overview.features.map((feature, idx) => ({
        ...feature,
        title: translation.overview.features[idx]?.title || feature.title,
        description: translation.overview.features[idx]?.description || feature.description
      }));
    }

    translatedOverview = {
      ...propertyObj.overview,
      title: translation.overview.title || propertyObj.overview.title,
      description1: translation.overview.description1 || propertyObj.overview.description1,
      description2: translation.overview.description2 || propertyObj.overview.description2,
      highlights: translation.overview.highlights?.length > 0
        ? translation.overview.highlights
        : (propertyObj.overview.highlights || []),
      features: translatedFeatures
    };
  }

  // Build translated location if it exists
  let translatedLocation = propertyObj.location;
  if (translation.location && propertyObj.location) {
    // Translate places array if available
    let translatedPlaces = propertyObj.location.places || [];
    if (translation.location.places?.length > 0 && propertyObj.location.places?.length > 0) {
      translatedPlaces = propertyObj.location.places.map((place, idx) => ({
        ...place,
        title: translation.location.places[idx]?.title || place.title
      }));
    }

    translatedLocation = {
      ...propertyObj.location,
      title: translation.location.title || propertyObj.location.title,
      description: translation.location.description || propertyObj.location.description,
      places: translatedPlaces
    };
  }

  // Return property with translated fields, falling back to original if translation is missing
  return {
    ...propertyObj,
    name: translation.name || propertyObj.name,
    description: translation.description || propertyObj.description,
    priceUnit: translation.priceUnit || propertyObj.priceUnit,
    parking: translation.parking || propertyObj.parking,
    cleanliness: {
      title: translation.cleanliness?.title || propertyObj.cleanliness?.title,
      description: translation.cleanliness?.description || propertyObj.cleanliness?.description
    },
    amenities: translation.amenities?.length > 0 ? translation.amenities : (propertyObj.amenities || []),
    overview: translatedOverview,
    location: translatedLocation
  };
};

// Helper function to get translated section settings from stored translations
const getTranslatedSectionSettings = (settings, lang) => {
  const settingsObj = settings.toObject ? settings.toObject() : { ...settings };

  // If language is English or translations don't exist, return original
  if (lang === 'en' || !settingsObj.translations || !settingsObj.translations[lang]) {
    return settingsObj;
  }

  const translation = settingsObj.translations[lang];

  // Return settings with translated fields, falling back to original if translation is missing
  return {
    ...settingsObj,
    title: translation.title || settingsObj.title,
    description: translation.description || settingsObj.description
  };
};

// POST - Seed initial properties (run once to add default data)
// IMPORTANT: This route must be before /:id route
router.post('/seed', async (req, res) => {
  try {
    // Check if properties already exist
    const existingCount = await Property.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Properties already exist in database'
      });
    }

    const defaultProperties = [
      {
        name: 'Lanzarote',
        description: 'Modern oceanfront villa with infinity pool.',
        price: 350,
        currency: '€',
        priceUnit: 'per night',
        guests: 8,
        bedrooms: 4,
        parking: 'Covered Parking for 2',
        image: 'Apat1.png',
        cleanliness: {
          title: 'Cleanliness',
          description: 'Professionally cleaned and sanitized before every stay.'
        },
        amenities: ['Infinity Pool', 'High-Speed WIFI', 'Free Parking'],
        displayOrder: 0
      },
      {
        name: 'Casa Miramar',
        description: 'Modern oceanfront villa with infinity pool.',
        price: 350,
        currency: '€',
        priceUnit: 'per night',
        guests: 8,
        bedrooms: 4,
        parking: 'Covered Parking for 2',
        image: 'Apat2.png',
        cleanliness: {
          title: 'Cleanliness',
          description: 'Professionally cleaned and sanitized before every stay.'
        },
        amenities: ['Infinity Pool', 'High-Speed WIFI', 'Free Parking'],
        displayOrder: 1
      }
    ];

    // Seed default section settings
    const defaultSectionSettings = {
      sectionType: 'apartments',
      title: 'Apartments',
      description: 'Discover our handpicked collection of premium apartments, each offering modern amenities and stunning views for an unforgettable stay.'
    };

    await SectionSettings.findOneAndUpdate(
      { sectionType: 'apartments' },
      defaultSectionSettings,
      { upsert: true, new: true }
    );

    const properties = await Property.insertMany(defaultProperties);

    console.log('✅ Default properties seeded successfully');

    res.status(201).json({
      success: true,
      message: 'Default properties seeded successfully',
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed properties',
      error: error.message
    });
  }
});

// POST - Seed default highlights for existing properties
router.post('/seed-highlights', async (req, res) => {
  try {
    // Default highlights that match frontend fallback
    const defaultHighlights = [
      'Fully equipped modern kitchen',
      'High-speed Wi-Fi throughout',
      'Premium linens and towels provided',
      'Walking distance to beach and restaurants',
      'Private terrace with stunning views',
      'Air conditioning in all rooms',
      'Free parking available',
      'Weekly cleaning service included'
    ];

    // Find all properties
    const properties = await Property.find({});
    let updated = 0;

    for (const property of properties) {
      // Only update if highlights are empty or don't exist
      if (!property.overview || !property.overview.highlights || property.overview.highlights.length === 0) {
        await Property.findByIdAndUpdate(property._id, {
          $set: {
            'overview.highlights': defaultHighlights,
            'overview.title': property.overview?.title || 'Property Overview',
            'overview.description1': property.overview?.description1 || property.description,
            'overview.description2': property.overview?.description2 || '',
            'overview.features': property.overview?.features || []
          }
        });
        updated++;
      }
    }

    console.log(`✅ Seeded highlights for ${updated} properties`);

    res.status(200).json({
      success: true,
      message: `Default highlights seeded successfully for ${updated} properties`,
      totalProperties: properties.length,
      updatedProperties: updated
    });
  } catch (error) {
    console.error('❌ Error seeding highlights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed highlights',
      error: error.message
    });
  }
});

// GET section settings (with optional translation from DB)
router.get('/section-settings/:type', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    let settings = await SectionSettings.findOne({ sectionType: req.params.type });

    if (!settings) {
      // Return default settings if not found
      settings = {
        sectionType: req.params.type,
        title: 'Apartments',
        description: 'Discover our handpicked collection of premium apartments.'
      };
    }

    // If language is English or not supported, return original data
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(200).json({
        success: true,
        data: settings,
        language: 'en'
      });
    }

    // Get translated section settings from stored translations in DB
    const translatedSettings = getTranslatedSectionSettings(settings, lang);

    res.status(200).json({
      success: true,
      data: translatedSettings,
      language: lang
    });
  } catch (error) {
    console.error('❌ Error fetching section settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section settings',
      error: error.message
    });
  }
});

// PUT - Update section settings
router.put('/section-settings/:type', async (req, res) => {
  try {
    const { title, description, isActive } = req.body;

    const settings = await SectionSettings.findOneAndUpdate(
      { sectionType: req.params.type },
      { title, description, isActive },
      { upsert: true, new: true, runValidators: true }
    );

    console.log('✅ Section settings updated:', req.params.type);

    res.status(200).json({
      success: true,
      message: 'Section settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error updating section settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update section settings',
      error: error.message
    });
  }
});

// POST - Trigger translation for section settings
router.post('/section-settings/:type/translate', async (req, res) => {
  try {
    const settings = await SectionSettings.findOne({ sectionType: req.params.type });
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Section settings not found' });
    }

    const translations = await autoTranslateSectionSettings({
      title: settings.title,
      description: settings.description,
      sectionType: req.params.type
    });

    const updated = await SectionSettings.findOneAndUpdate(
      { sectionType: req.params.type },
      { translations },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Section settings translated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to translate section settings', error: error.message });
  }
});

// GET all properties (with optional filter for admin and translation from DB)
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all properties...');
    const { all, lang = 'en' } = req.query;

    // If 'all' query param is true, return all properties (for admin)
    const filter = all === 'true' ? {} : { isActive: true };
    const properties = await Property.find(filter).sort({ displayOrder: 1, createdAt: -1 });

    // If language is English or not supported, return original data
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(200).json({
        success: true,
        count: properties.length,
        data: properties,
        language: 'en'
      });
    }

    // Get translated properties from stored translations in DB
    const translatedProperties = properties.map(property =>
      getTranslatedProperty(property, lang)
    );

    res.status(200).json({
      success: true,
      count: translatedProperties.length,
      data: translatedProperties,
      language: lang
    });
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
});

// GET single property by ID (with optional translation from DB)
router.get('/:id', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // If language is English or not supported, return original data
    if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(200).json({
        success: true,
        data: property,
        language: 'en'
      });
    }

    // Get translated property from stored translations in DB
    const translatedProperty = getTranslatedProperty(property, lang);

    res.status(200).json({
      success: true,
      data: translatedProperty,
      language: lang
    });
  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
});

// POST - Create new property
router.post('/', async (req, res) => {
  try {
    const {
      name, description, price, currency, priceUnit,
      guests, bedrooms, parking, image, imageUrl, galleryImages,
      cleanliness, amenities, hostName, overview, location, mapUrl, displayOrder
    } = req.body;

    const property = await Property.create({
      name,
      description,
      price,
      currency,
      priceUnit,
      guests,
      bedrooms,
      parking,
      mapUrl,
      image,
      imageUrl,
      galleryImages: galleryImages || [],
      cleanliness,
      amenities,
      hostName,
      overview,
      location,
      displayOrder
    });

    console.log('✅ New property created:', property.name);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    console.error('❌ Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message
    });
  }
});

// POST - Trigger translation for a property
router.post('/:id/translate', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const translations = await autoTranslateProperty(property.toObject());

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { translations },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property translated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to translate property', error: error.message });
  }
});

// PUT - Update property
router.put('/:id', async (req, res) => {
  try {
    // Log received data for debugging
    console.log('[Property Update] Received galleryImages:', req.body.galleryImages);

    const updateData = { ...req.body };

    console.log('[Property Update] updateData being saved:', JSON.stringify(updateData, null, 2));

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    console.log('✅ Property updated:', property.name);
    console.log('✅ Saved galleryImages:', property.galleryImages);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('❌ Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
});

// PUT - Toggle property visibility
router.put('/:id/toggle', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.isActive = !property.isActive;
    await property.save();

    console.log('✅ Property visibility toggled:', property.name, property.isActive);

    res.status(200).json({
      success: true,
      message: `Property ${property.isActive ? 'activated' : 'deactivated'} successfully`,
      data: property
    });
  } catch (error) {
    console.error('❌ Error toggling property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle property',
      error: error.message
    });
  }
});

// DELETE - Delete property (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    console.log('✅ Property deleted:', property.name);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
});

// DELETE - Permanently delete property
router.delete('/:id/permanent', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    console.log('✅ Property permanently deleted:', property.name);

    res.status(200).json({
      success: true,
      message: 'Property permanently deleted'
    });
  } catch (error) {
    console.error('❌ Error permanently deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete property',
      error: error.message
    });
  }
});

module.exports = router;

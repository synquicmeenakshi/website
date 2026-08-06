const Service = require('../models/Service');
const { Property } = require('../models/Property');
const Testimonial = require('../models/Testimonial');
const RentalTestimonial = require('../models/RentalTestimonial');
const translationService = require('../services/translationService');

/**
 * Get all services with translation
 * GET /api/translate/services?lang=de
 */
const getTranslatedServices = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    // Validate language
    if (!translationService.SUPPORTED_LANGUAGES[lang]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${lang}. Supported: ${Object.keys(translationService.SUPPORTED_LANGUAGES).join(', ')}`
      });
    }

    // Get all active services
    const services = await Service.find({ isActive: true }).sort({ displayOrder: 1 });

    // Translate if needed
    if (lang === 'en') {
      return res.json({
        success: true,
        data: services,
        language: lang
      });
    }

    // Translate all services
    const translatedServices = await Promise.all(
      services.map(service => translationService.translateService(service, lang))
    );

    res.json({
      success: true,
      data: translatedServices,
      language: lang
    });
  } catch (error) {
    console.error('Error fetching translated services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translated services',
      error: error.message
    });
  }
};

/**
 * Get single service with translation
 * GET /api/translate/services/:id?lang=de
 */
const getTranslatedServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    // Validate language
    if (!translationService.SUPPORTED_LANGUAGES[lang]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${lang}`
      });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Translate if needed
    const translatedService = lang === 'en'
      ? service
      : await translationService.translateService(service, lang);

    res.json({
      success: true,
      data: translatedService,
      language: lang
    });
  } catch (error) {
    console.error('Error fetching translated service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translated service',
      error: error.message
    });
  }
};

/**
 * Get all properties with translation
 * GET /api/translate/properties?lang=de
 */
const getTranslatedProperties = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    // Validate language
    if (!translationService.SUPPORTED_LANGUAGES[lang]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${lang}`
      });
    }

    // Get all active properties
    const properties = await Property.find({ isActive: true }).sort({ displayOrder: 1 });

    // Translate if needed
    if (lang === 'en') {
      return res.json({
        success: true,
        data: properties,
        language: lang
      });
    }

    // Translate all properties
    const translatedProperties = await Promise.all(
      properties.map(property => translationService.translateProperty(property, lang))
    );

    res.json({
      success: true,
      data: translatedProperties,
      language: lang
    });
  } catch (error) {
    console.error('Error fetching translated properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translated properties',
      error: error.message
    });
  }
};

/**
 * Get single property with translation
 * GET /api/translate/properties/:id?lang=de
 */
const getTranslatedPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    // Validate language
    if (!translationService.SUPPORTED_LANGUAGES[lang]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${lang}`
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Translate if needed
    const translatedProperty = lang === 'en'
      ? property
      : await translationService.translateProperty(property, lang);

    res.json({
      success: true,
      data: translatedProperty,
      language: lang
    });
  } catch (error) {
    console.error('Error fetching translated property:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translated property',
      error: error.message
    });
  }
};

/**
 * Get testimonials with translation
 * GET /api/translate/testimonials?lang=de&type=massage
 */
const getTranslatedTestimonials = async (req, res) => {
  try {
    const { lang = 'en', type = 'massage' } = req.query;

    // Validate language
    if (!translationService.SUPPORTED_LANGUAGES[lang]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${lang}`
      });
    }

    // Get testimonials based on type
    const Model = type === 'rental' ? RentalTestimonial : Testimonial;
    const testimonials = await Model.find({ isActive: true }).sort({ displayOrder: 1 });

    // Translate if needed
    if (lang === 'en') {
      return res.json({
        success: true,
        data: testimonials,
        language: lang,
        type
      });
    }

    // Translate all testimonials
    const translatedTestimonials = await Promise.all(
      testimonials.map(testimonial => translationService.translateTestimonial(testimonial, lang))
    );

    res.json({
      success: true,
      data: translatedTestimonials,
      language: lang,
      type
    });
  } catch (error) {
    console.error('Error fetching translated testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translated testimonials',
      error: error.message
    });
  }
};

/**
 * Translate custom text
 * POST /api/translate/text
 * Body: { text: "Hello", targetLang: "de" }
 */
const translateText = async (req, res) => {
  try {
    const { text, targetLang, texts } = req.body;

    // Validate language
    if (!translationService.SUPPORTED_LANGUAGES[targetLang]) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${targetLang}`
      });
    }

    // Handle batch translation
    if (texts && Array.isArray(texts)) {
      const translatedTexts = await translationService.translateBatch(texts, targetLang);
      return res.json({
        success: true,
        data: translatedTexts,
        language: targetLang
      });
    }

    // Handle single text translation
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const translatedText = await translationService.translateText(text, targetLang);

    res.json({
      success: true,
      data: {
        original: text,
        translated: translatedText
      },
      language: targetLang
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating text',
      error: error.message
    });
  }
};

/**
 * Get supported languages
 * GET /api/translate/languages
 */
const getSupportedLanguages = async (req, res) => {
  res.json({
    success: true,
    data: translationService.SUPPORTED_LANGUAGES
  });
};

/**
 * Get translation statistics
 * GET /api/translate/stats
 */
const getTranslationStats = async (req, res) => {
  try {
    const stats = await translationService.getTranslationStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching translation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translation stats',
      error: error.message
    });
  }
};

/**
 * Clear translation cache for a document
 * DELETE /api/translate/cache/:id
 */
const clearCache = async (req, res) => {
  try {
    const { id } = req.params;
    await translationService.clearTranslationCache(id);
    res.json({
      success: true,
      message: 'Translation cache cleared'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message
    });
  }
};

module.exports = {
  getTranslatedServices,
  getTranslatedServiceById,
  getTranslatedProperties,
  getTranslatedPropertyById,
  getTranslatedTestimonials,
  translateText,
  getSupportedLanguages,
  getTranslationStats,
  clearCache
};

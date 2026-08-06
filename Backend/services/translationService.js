const translate = require('@vitalets/google-translate-api');
const Translation = require('../models/Translation');

// Supported languages (matching frontend i18n config)
const SUPPORTED_LANGUAGES = {
  en: 'English',
  de: 'German',
  nl: 'Dutch',
  fr: 'French',
  es: 'Spanish'
};

/**
 * Translate a single text string
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (de, es, fr)
 * @param {string} contentType - Type of content (service, property, etc.)
 * @param {string} referenceId - Optional reference to original document
 * @param {string} fieldName - Optional field name
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, targetLang, contentType = 'general', referenceId = null, fieldName = null) {
  // Don't translate if target is English (source language)
  if (targetLang === 'en' || !text || text.trim() === '') {
    return text;
  }

  // Validate target language
  if (!SUPPORTED_LANGUAGES[targetLang]) {
    throw new Error(`Unsupported language: ${targetLang}`);
  }

  try {
    // Check cache first
    const cached = await Translation.findTranslation(text, targetLang);
    if (cached) {
      console.log(`[Translation] Cache hit for "${text.substring(0, 30)}..." -> ${targetLang}`);
      return cached.translatedText;
    }

    // Translate using Google Translate API
    console.log(`[Translation] Translating "${text.substring(0, 30)}..." to ${targetLang}`);
    const result = await translate(text, {
      to: targetLang,
    });

    const translatedText = result.text;

    // Cache the translation
    await Translation.saveTranslation({
      originalText: text,
      sourceLanguage: 'en',
      targetLanguage: targetLang,
      translatedText,
      contentType,
      referenceId,
      fieldName
    });

    return translatedText;
  } catch (error) {
    console.error(`[Translation] Error translating text:`, error.message);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language code
 * @param {string} contentType - Type of content
 * @returns {Promise<string[]>} - Array of translated texts
 */
async function translateBatch(texts, targetLang, contentType = 'general') {
  if (targetLang === 'en' || !texts || texts.length === 0) {
    return texts;
  }

  const results = [];

  for (const text of texts) {
    const translated = await translateText(text, targetLang, contentType);
    results.push(translated);
  }

  return results;
}

/**
 * Translate an object's specified fields
 * @param {Object} obj - Object to translate
 * @param {string[]} fields - Array of field names to translate
 * @param {string} targetLang - Target language code
 * @param {string} contentType - Type of content
 * @param {string} referenceId - Optional reference to original document
 * @returns {Promise<Object>} - Object with translated fields
 */
async function translateObject(obj, fields, targetLang, contentType = 'general', referenceId = null) {
  if (targetLang === 'en' || !obj) {
    return obj;
  }

  const translated = { ...obj };

  for (const field of fields) {
    if (translated[field]) {
      if (Array.isArray(translated[field])) {
        // Handle array fields
        translated[field] = await translateBatch(translated[field], targetLang, contentType);
      } else if (typeof translated[field] === 'string') {
        // Handle string fields
        translated[field] = await translateText(
          translated[field],
          targetLang,
          contentType,
          referenceId,
          field
        );
      }
    }
  }

  return translated;
}

/**
 * Translate a service document
 * @param {Object} service - Service document
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} - Translated service
 */
async function translateService(service, targetLang) {
  if (targetLang === 'en') {
    return service;
  }

  const serviceObj = service.toObject ? service.toObject() : { ...service };
  const referenceId = serviceObj._id;

  // Translate main fields
  const translated = await translateObject(
    serviceObj,
    ['title', 'description'],
    targetLang,
    'service',
    referenceId
  );

  // Translate content sections
  if (translated.contentSections && translated.contentSections.length > 0) {
    translated.contentSections = await Promise.all(
      translated.contentSections.map(async (section) => ({
        ...section,
        title: await translateText(section.title, targetLang, 'service', referenceId, 'contentSections.title'),
        description: await translateText(section.description, targetLang, 'service', referenceId, 'contentSections.description')
      }))
    );
  }

  // Translate benefits
  if (translated.benefits && translated.benefits.length > 0) {
    translated.benefits = await Promise.all(
      translated.benefits.map(async (benefit) => ({
        ...benefit,
        title: await translateText(benefit.title, targetLang, 'service', referenceId, 'benefits.title'),
        description: await translateText(benefit.description, targetLang, 'service', referenceId, 'benefits.description')
      }))
    );
  }

  // Translate target audience
  if (translated.targetAudience && translated.targetAudience.length > 0) {
    translated.targetAudience = await translateBatch(translated.targetAudience, targetLang, 'service');
  }

  return translated;
}

/**
 * Translate a property document
 * @param {Object} property - Property document
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} - Translated property
 */
async function translateProperty(property, targetLang) {
  if (targetLang === 'en') {
    return property;
  }

  const propertyObj = property.toObject ? property.toObject() : { ...property };

  // Check if property has stored translations in the database
  const storedTranslation = propertyObj.translations?.[targetLang];

  if (storedTranslation && storedTranslation.description) {
    // Use stored translations from DB (cost-efficient approach)

    // Build translated overview if available
    let translatedOverview = propertyObj.overview;
    if (storedTranslation.overview && propertyObj.overview) {
      let translatedFeatures = propertyObj.overview.features || [];
      if (storedTranslation.overview.features?.length > 0 && propertyObj.overview.features?.length > 0) {
        translatedFeatures = propertyObj.overview.features.map((feature, idx) => ({
          ...feature,
          title: storedTranslation.overview.features[idx]?.title || feature.title,
          description: storedTranslation.overview.features[idx]?.description || feature.description
        }));
      }
      translatedOverview = {
        ...propertyObj.overview,
        title: storedTranslation.overview.title || propertyObj.overview.title,
        description1: storedTranslation.overview.description1 || propertyObj.overview.description1,
        description2: storedTranslation.overview.description2 || propertyObj.overview.description2,
        highlights: storedTranslation.overview.highlights?.length > 0
          ? storedTranslation.overview.highlights
          : (propertyObj.overview.highlights || []),
        features: translatedFeatures
      };
    }

    // Build translated location if available
    let translatedLocation = propertyObj.location;
    if (storedTranslation.location && propertyObj.location) {
      let translatedPlaces = propertyObj.location.places || [];
      if (storedTranslation.location.places?.length > 0 && propertyObj.location.places?.length > 0) {
        translatedPlaces = propertyObj.location.places.map((place, idx) => ({
          ...place,
          title: storedTranslation.location.places[idx]?.title || place.title
        }));
      }
      translatedLocation = {
        ...propertyObj.location,
        title: storedTranslation.location.title || propertyObj.location.title,
        description: storedTranslation.location.description || propertyObj.location.description,
        places: translatedPlaces
      };
    }

    return {
      ...propertyObj,
      name: storedTranslation.name || propertyObj.name,
      description: storedTranslation.description || propertyObj.description,
      priceUnit: storedTranslation.priceUnit || propertyObj.priceUnit,
      parking: storedTranslation.parking || propertyObj.parking,
      cleanliness: storedTranslation.cleanliness || propertyObj.cleanliness,
      amenities: storedTranslation.amenities?.length > 0 ? storedTranslation.amenities : propertyObj.amenities,
      overview: translatedOverview,
      location: translatedLocation
    };
  }

  // Fallback: If no stored translation, use real-time translation
  const referenceId = propertyObj._id;

  // Translate main fields (keep name in English, only translate description)
  const translated = await translateObject(
    propertyObj,
    ['description'],
    targetLang,
    'property',
    referenceId
  );

  // Translate amenities
  if (translated.amenities && translated.amenities.length > 0) {
    translated.amenities = await translateBatch(translated.amenities, targetLang, 'property');
  }

  // Translate cleanliness section
  if (translated.cleanliness) {
    translated.cleanliness = {
      ...translated.cleanliness,
      title: await translateText(translated.cleanliness.title, targetLang, 'property', referenceId, 'cleanliness.title'),
      description: await translateText(translated.cleanliness.description, targetLang, 'property', referenceId, 'cleanliness.description')
    };
  }

  return translated;
}

/**
 * Translate a testimonial document
 * @param {Object} testimonial - Testimonial document
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} - Translated testimonial
 */
async function translateTestimonial(testimonial, targetLang) {
  if (targetLang === 'en') {
    return testimonial;
  }

  const testimonialObj = testimonial.toObject ? testimonial.toObject() : { ...testimonial };
  const referenceId = testimonialObj._id;

  return translateObject(
    testimonialObj,
    ['text', 'role'],
    targetLang,
    'testimonial',
    referenceId
  );
}

/**
 * Clear translation cache for a document
 * @param {string} referenceId - Document ID
 */
async function clearTranslationCache(referenceId) {
  await Translation.clearDocumentTranslations(referenceId);
}

/**
 * Get translation statistics
 * @returns {Promise<Object>} - Translation statistics
 */
async function getTranslationStats() {
  const total = await Translation.countDocuments();
  const byLanguage = await Translation.aggregate([
    { $group: { _id: '$targetLanguage', count: { $sum: 1 } } }
  ]);
  const byContentType = await Translation.aggregate([
    { $group: { _id: '$contentType', count: { $sum: 1 } } }
  ]);

  return {
    total,
    byLanguage: byLanguage.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byContentType: byContentType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };
}

module.exports = {
  SUPPORTED_LANGUAGES,
  translateText,
  translateBatch,
  translateObject,
  translateService,
  translateProperty,
  translateTestimonial,
  clearTranslationCache,
  getTranslationStats
};

/**
 * Auto-Translation Service
 *
 * Automatically translates content when admin creates/updates items
 * and stores translations in DB for cost-efficient retrieval.
 *
 * Uses DeepL API only during admin operations,
 * then stores translations in DB for user browsing (no API calls).
 */

const axios = require('axios');

const TARGET_LANGUAGES = ['fr', 'de', 'nl', 'es'];

// DeepL language codes (some differ from standard ISO codes)
const DEEPL_LANGUAGE_MAP = {
  'fr': 'FR',
  'de': 'DE',
  'nl': 'NL',
  'es': 'ES'
};

// DeepL API configuration
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

// Rate limiting configuration
const RATE_LIMIT_DELAY_MS = 500; // Delay between API calls to avoid rate limiting

/**
 * Sleep utility for rate limiting
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Translate a single text string to a specific language using DeepL API
 * @param {string} text - Text to translate (English)
 * @param {string} targetLang - Target language code (fr, de, nl)
 * @returns {Promise<string>} - Translated text
 */
async function translateWithDeepL(text, targetLang, retryCount = 0) {
  if (!text || text.trim() === '' || !DEEPL_API_KEY) {
    return text;
  }

  try {
    console.log(`🌐 [DeepL API CALL] Translating to ${targetLang}: "${text.substring(0, 50)}..."`);

    const response = await axios.post(DEEPL_API_URL,
      {
        text: [text],
        source_lang: 'EN',
        target_lang: DEEPL_LANGUAGE_MAP[targetLang] || targetLang.toUpperCase()
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Add delay after successful call to avoid rate limiting
    await sleep(RATE_LIMIT_DELAY_MS);

    if (response.data && response.data.translations && response.data.translations[0]) {
      console.log(`✅ [DeepL API SUCCESS] ${targetLang}: "${response.data.translations[0].text.substring(0, 50)}..."`);
      return response.data.translations[0].text;
    }
    return text;
  } catch (error) {
    // Handle rate limiting with exponential backoff
    if (error.response && error.response.status === 429 && retryCount < 3) {
      const waitTime = (retryCount + 1) * 5000; // 5s, 10s, 15s
      console.log(`⏳ [DeepL RATE LIMITED] Waiting ${waitTime/1000}s before retry...`);
      await sleep(waitTime);
      return translateWithDeepL(text, targetLang, retryCount + 1);
    }
    console.error(`❌ [DeepL API ERROR] ${targetLang}:`, error.message);
    return text; // Fallback to original
  }
}

/**
 * Translate a single text string to all target languages
 * @param {string} text - Text to translate (English)
 * @returns {Promise<Object>} - Object with translations { fr: '...', de: '...', nl: '...' }
 */
async function translateToAllLanguages(text) {
  if (!text || text.trim() === '') {
    return { fr: '', de: '', nl: '', es: '' };
  }

  if (!DEEPL_API_KEY) {
    console.warn('[AutoTranslate] DEEPL_API_KEY not configured, skipping translation');
    return { fr: text, de: text, nl: text, es: text };
  }

  const translations = {};

  for (const lang of TARGET_LANGUAGES) {
    try {
      translations[lang] = await translateWithDeepL(text, lang);
    } catch (error) {
      console.error(`[AutoTranslate] Error translating to ${lang}:`, error.message);
      translations[lang] = text; // Fallback to original
    }
  }

  return translations;
}

/**
 * Translate an array of strings to all target languages
 * @param {string[]} texts - Array of texts to translate
 * @returns {Promise<Object>} - { fr: [...], de: [...], nl: [...] }
 */
async function translateArrayToAllLanguages(texts) {
  if (!texts || texts.length === 0) {
    return { fr: [], de: [], nl: [], es: [] };
  }

  const translations = { fr: [], de: [], nl: [], es: [] };

  for (const text of texts) {
    const translated = await translateToAllLanguages(text);
    translations.fr.push(translated.fr);
    translations.de.push(translated.de);
    translations.nl.push(translated.nl);
    translations.es.push(translated.es);
  }

  return translations;
}

/**
 * Auto-translate Service content and return translations object for DB storage
 * @param {Object} serviceData - Service data with English content
 * @returns {Promise<Object>} - Translations object { fr: {...}, de: {...}, nl: {...} }
 */
async function autoTranslateService(serviceData) {
  console.log('[AutoTranslate] Translating service:', serviceData.title);

  const translations = { fr: {}, de: {}, nl: {}, es: {} };

  try {
    // Translate title
    if (serviceData.title) {
      const titleTranslations = await translateToAllLanguages(serviceData.title);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].title = titleTranslations[lang];
      }
    }

    // Translate description
    if (serviceData.description) {
      const descTranslations = await translateToAllLanguages(serviceData.description);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].description = descTranslations[lang];
      }
    }

    // Translate benefits
    if (serviceData.benefits && serviceData.benefits.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].benefits = [];
      }

      for (const benefit of serviceData.benefits) {
        const titleTrans = benefit.title ? await translateToAllLanguages(benefit.title) : { fr: '', de: '', nl: '' };
        const descTrans = benefit.description ? await translateToAllLanguages(benefit.description) : { fr: '', de: '', nl: '' };

        for (const lang of TARGET_LANGUAGES) {
          translations[lang].benefits.push({
            title: titleTrans[lang],
            description: descTrans[lang]
          });
        }
      }
    }

    // Translate targetAudience
    if (serviceData.targetAudience && serviceData.targetAudience.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].targetAudience = [];
      }

      for (const audience of serviceData.targetAudience) {
        const titleTrans = audience.title ? await translateToAllLanguages(audience.title) : { fr: '', de: '', nl: '' };
        const descTrans = audience.description ? await translateToAllLanguages(audience.description) : { fr: '', de: '', nl: '' };

        for (const lang of TARGET_LANGUAGES) {
          translations[lang].targetAudience.push({
            title: titleTrans[lang],
            description: descTrans[lang]
          });
        }
      }
    }

    // Translate contentSections
    if (serviceData.contentSections && serviceData.contentSections.length > 0) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].contentSections = [];
      }

      for (const section of serviceData.contentSections) {
        const titleTrans = section.title ? await translateToAllLanguages(section.title) : { fr: '', de: '', nl: '' };
        const descTrans = section.description ? await translateToAllLanguages(section.description) : { fr: '', de: '', nl: '' };

        for (const lang of TARGET_LANGUAGES) {
          translations[lang].contentSections.push({
            title: titleTrans[lang],
            description: descTrans[lang]
          });
        }
      }
    }

    console.log('[AutoTranslate] Service translation complete');
    return translations;
  } catch (error) {
    console.error('[AutoTranslate] Error translating service:', error.message);
    return translations;
  }
}

/**
 * Auto-translate Testimonial content and return translations object for DB storage
 * @param {Object} testimonialData - Testimonial data with English content
 * @returns {Promise<Object>} - Translations object { fr: {...}, de: {...}, nl: {...} }
 */
async function autoTranslateTestimonial(testimonialData) {
  console.log('[AutoTranslate] Translating testimonial for:', testimonialData.name);

  const translations = { fr: {}, de: {}, nl: {}, es: {} };

  try {
    // Translate text
    if (testimonialData.text) {
      const textTranslations = await translateToAllLanguages(testimonialData.text);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].text = textTranslations[lang];
      }
    }

    // Translate role (if it's not a username like @user)
    if (testimonialData.role && !testimonialData.role.startsWith('@')) {
      const roleTranslations = await translateToAllLanguages(testimonialData.role);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].role = roleTranslations[lang];
      }
    } else {
      // Keep role as-is for usernames
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].role = testimonialData.role || '';
      }
    }

    console.log('[AutoTranslate] Testimonial translation complete');
    return translations;
  } catch (error) {
    console.error('[AutoTranslate] Error translating testimonial:', error.message);
    return translations;
  }
}

/**
 * Auto-translate Property content and return translations object for DB storage
 * @param {Object} propertyData - Property data with English content
 * @returns {Promise<Object>} - Translations object { fr: {...}, de: {...}, nl: {...} }
 */
async function autoTranslateProperty(propertyData) {
  console.log('[AutoTranslate] Translating property:', propertyData.name);

  const translations = { fr: {}, de: {}, nl: {}, es: {} };

  try {
    // Translate name (keep as-is if it's a proper noun/place name)
    // For property names, we usually keep them as-is but translate description
    for (const lang of TARGET_LANGUAGES) {
      translations[lang].name = propertyData.name || '';
    }

    // Translate description
    if (propertyData.description) {
      const descTranslations = await translateToAllLanguages(propertyData.description);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].description = descTranslations[lang];
      }
    }

    // Translate priceUnit
    if (propertyData.priceUnit) {
      const priceUnitTranslations = await translateToAllLanguages(propertyData.priceUnit);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].priceUnit = priceUnitTranslations[lang];
      }
    }

    // Translate parking
    if (propertyData.parking) {
      const parkingTranslations = await translateToAllLanguages(propertyData.parking);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].parking = parkingTranslations[lang];
      }
    }

    // Translate cleanliness
    if (propertyData.cleanliness) {
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].cleanliness = {};
      }

      if (propertyData.cleanliness.title) {
        const titleTrans = await translateToAllLanguages(propertyData.cleanliness.title);
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].cleanliness.title = titleTrans[lang];
        }
      }

      if (propertyData.cleanliness.description) {
        const descTrans = await translateToAllLanguages(propertyData.cleanliness.description);
        for (const lang of TARGET_LANGUAGES) {
          translations[lang].cleanliness.description = descTrans[lang];
        }
      }
    }

    // Translate amenities
    if (propertyData.amenities && propertyData.amenities.length > 0) {
      const amenitiesTranslations = await translateArrayToAllLanguages(propertyData.amenities);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].amenities = amenitiesTranslations[lang];
      }
    }

    console.log('[AutoTranslate] Property translation complete');
    return translations;
  } catch (error) {
    console.error('[AutoTranslate] Error translating property:', error.message);
    return translations;
  }
}

/**
 * Auto-translate Section Settings content
 * @param {Object} settingsData - Section settings data with English content
 * @returns {Promise<Object>} - Translations object { fr: {...}, de: {...}, nl: {...} }
 */
async function autoTranslateSectionSettings(settingsData) {
  console.log('[AutoTranslate] Translating section settings:', settingsData.sectionType);

  const translations = { fr: {}, de: {}, nl: {}, es: {} };

  try {
    // Translate title
    if (settingsData.title) {
      const titleTranslations = await translateToAllLanguages(settingsData.title);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].title = titleTranslations[lang];
      }
    }

    // Translate description
    if (settingsData.description) {
      const descTranslations = await translateToAllLanguages(settingsData.description);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].description = descTranslations[lang];
      }
    }

    console.log('[AutoTranslate] Section settings translation complete');
    return translations;
  } catch (error) {
    console.error('[AutoTranslate] Error translating section settings:', error.message);
    return translations;
  }
}

/**
 * Auto-translate FAQ content and return translations object for DB storage
 * @param {Object} faqData - FAQ data with English content
 * @returns {Promise<Object>} - Translations object { fr: {...}, de: {...}, nl: {...} }
 */
async function autoTranslateFAQ(faqData) {
  console.log('[AutoTranslate] Translating FAQ:', faqData.question?.substring(0, 50));

  const translations = { fr: {}, de: {}, nl: {}, es: {} };

  try {
    // Translate question
    if (faqData.question) {
      const questionTranslations = await translateToAllLanguages(faqData.question);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].question = questionTranslations[lang];
      }
    }

    // Translate answer
    if (faqData.answer) {
      const answerTranslations = await translateToAllLanguages(faqData.answer);
      for (const lang of TARGET_LANGUAGES) {
        translations[lang].answer = answerTranslations[lang];
      }
    }

    console.log('[AutoTranslate] FAQ translation complete');
    return translations;
  } catch (error) {
    console.error('[AutoTranslate] Error translating FAQ:', error.message);
    return translations;
  }
}

module.exports = {
  TARGET_LANGUAGES,
  translateToAllLanguages,
  translateArrayToAllLanguages,
  autoTranslateService,
  autoTranslateTestimonial,
  autoTranslateProperty,
  autoTranslateSectionSettings,
  autoTranslateFAQ
};

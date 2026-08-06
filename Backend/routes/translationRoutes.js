const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

// Get supported languages
router.get('/languages', translationController.getSupportedLanguages);

// Get translation statistics
router.get('/stats', translationController.getTranslationStats);

// Translate services
router.get('/services', translationController.getTranslatedServices);
router.get('/services/:id', translationController.getTranslatedServiceById);

// Translate properties
router.get('/properties', translationController.getTranslatedProperties);
router.get('/properties/:id', translationController.getTranslatedPropertyById);

// Translate testimonials
router.get('/testimonials', translationController.getTranslatedTestimonials);

// Translate custom text
router.post('/text', translationController.translateText);

// Clear translation cache for a document
router.delete('/cache/:id', translationController.clearCache);

module.exports = router;

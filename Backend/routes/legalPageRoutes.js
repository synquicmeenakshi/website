const express = require('express');
const router = express.Router();
const legalPageController = require('../controllers/legalPageController');

// Get all legal pages (admin)
router.get('/', legalPageController.getAllLegalPages);

// Get legal page by type (with language query param)
// Example: GET /api/legal-pages/privacy-policy?language=fr
router.get('/:pageType', legalPageController.getLegalPage);

// Update legal page (admin)
router.put('/:pageType/:language', legalPageController.updateLegalPage);

module.exports = router;

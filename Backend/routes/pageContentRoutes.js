const express = require('express');
const router = express.Router();
const {
  getPageContent,
  getAllPageContents,
  updatePageContent,
  updateHeroSection,
  updateStatistics,
  deletePageContent,
  seedPageContent
} = require('../controllers/pageContentController');

// Public routes
router.get('/', getAllPageContents);
router.get('/:pageId', getPageContent);

// Admin routes
router.put('/:pageId', updatePageContent);
router.patch('/:pageId/hero', updateHeroSection);
router.patch('/:pageId/statistics', updateStatistics);
router.delete('/:pageId', deletePageContent);

// Seed default content
router.post('/seed', seedPageContent);

module.exports = router;

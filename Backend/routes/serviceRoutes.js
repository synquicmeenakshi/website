const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');
const {
  getAllServices,
  getAllServicesAdmin,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceImage,
  addAllServicesGalleryImages,
  addMassageGalleryImages,
  addFacialGalleryImages,
  updateServiceTranslations,
  bulkUpdateTranslations,
  translateService
} = require('../controllers/serviceController');

// Public routes (no authentication required)
router.get('/', getAllServices);

// Admin routes (authentication required) - MUST be before /:id routes
router.get('/admin/all', authMiddleware, getAllServicesAdmin);

// Public route for single service
router.get('/:id', getServiceById);

// Admin write routes
router.post('/', authMiddleware, strictLimiter, createService);
router.put('/:id', authMiddleware, strictLimiter, updateService);
router.delete('/:id', authMiddleware, strictLimiter, deleteService);

// Image management routes (authentication required)
router.patch('/:id/image', authMiddleware, strictLimiter, updateServiceImage);
router.post('/add-all-gallery-images', authMiddleware, strictLimiter, addAllServicesGalleryImages);
router.post('/add-massage-gallery-images', authMiddleware, strictLimiter, addMassageGalleryImages);
router.post('/add-facial-gallery-images', authMiddleware, strictLimiter, addFacialGalleryImages);

// Translation management routes (authentication required)
router.patch('/:id/translations', authMiddleware, strictLimiter, updateServiceTranslations);
router.post('/bulk-translations', authMiddleware, strictLimiter, bulkUpdateTranslations);
router.post('/:id/translate', authMiddleware, strictLimiter, translateService);

module.exports = router;

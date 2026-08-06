const express = require('express');
const router = express.Router();
const {
  getAllTestimonials,
  getAllTestimonialsAdmin,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  seedTestimonials,
  translateTestimonial
} = require('../controllers/testimonialController');

// Public routes
router.get('/', getAllTestimonials);
router.get('/admin', getAllTestimonialsAdmin);
router.get('/:id', getTestimonialById);

// Admin routes
router.post('/', createTestimonial);
router.post('/seed', seedTestimonials);
router.post('/:id/translate', translateTestimonial);
router.put('/:id', updateTestimonial);
router.delete('/:id', deleteTestimonial);

module.exports = router;

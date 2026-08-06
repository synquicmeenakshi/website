const express = require('express');
const router = express.Router();
const {
  getAllFAQs,
  getAllFAQsAdmin,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  updateFAQOrder,
  seedFAQs,
  translateFAQ
} = require('../controllers/faqController');

// Public routes
router.get('/', getAllFAQs);                    // GET /api/faqs?category=massage&lang=fr
router.get('/admin', getAllFAQsAdmin);          // GET /api/faqs/admin?category=massage

// Admin routes
router.post('/', createFAQ);                    // POST /api/faqs
router.post('/seed', seedFAQs);                 // POST /api/faqs/seed
router.get('/:id', getFAQById);                 // GET /api/faqs/:id
router.post('/:id/translate', translateFAQ);    // POST /api/faqs/:id/translate
router.put('/:id', updateFAQ);                  // PUT /api/faqs/:id
router.put('/order/bulk', updateFAQOrder);      // PUT /api/faqs/order/bulk
router.delete('/:id', deleteFAQ);               // DELETE /api/faqs/:id

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { bookingLimiter, strictLimiter } = require('../middleware/rateLimiter');

const {
  getSlots,
  getWindow,
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
} = require('../controllers/consultationController');

// Public — slot availability. Declared before /:id so they are not read as ids.
router.get('/slots', getSlots);
router.get('/window', getWindow);

// Public — the booking form. Rate limited to blunt abuse.
router.post('/', bookingLimiter, createConsultation);

// Admin
router.get('/', authMiddleware, getAllConsultations);
router.get('/:id', authMiddleware, getConsultationById);
router.patch('/:id', authMiddleware, strictLimiter, updateConsultation);
router.delete('/:id', authMiddleware, strictLimiter, deleteConsultation);

module.exports = router;

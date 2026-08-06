const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { bookingLimiter, strictLimiter } = require('../middleware/rateLimiter');

const {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation
} = require('../controllers/consultationController');

// Public — the booking form. Rate limited to blunt abuse.
router.post('/', bookingLimiter, createConsultation);

// Admin
router.get('/', authMiddleware, getAllConsultations);
router.get('/:id', authMiddleware, getConsultationById);
router.patch('/:id', authMiddleware, strictLimiter, updateConsultation);
router.delete('/:id', authMiddleware, strictLimiter, deleteConsultation);

module.exports = router;

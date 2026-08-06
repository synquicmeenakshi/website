const express = require('express');
const router = express.Router();
const {
  createRentalBooking,
  getAllRentalBookings,
  getRentalBookingById,
  updateRentalBookingStatus,
  updatePaymentStatus,
  cancelRentalBooking,
  deleteRentalBooking
} = require('../controllers/rentalBookingController');

// Public route - Create rental booking
router.post('/rental', createRentalBooking);

// Admin routes - Get all bookings
router.get('/', getAllRentalBookings);

// Get single booking by ID
router.get('/:id', getRentalBookingById);

// Update booking status
router.patch('/:id/status', updateRentalBookingStatus);

// Update payment status
router.patch('/:id/payment', updatePaymentStatus);

// Cancel booking
router.patch('/:id/cancel', cancelRentalBooking);

// Delete booking
router.delete('/:id', deleteRentalBooking);

module.exports = router;

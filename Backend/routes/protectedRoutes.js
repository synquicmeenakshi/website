/**
 * Protected Routes Helper
 * Use this to easily protect all admin routes across the application
 */

const authMiddleware = require('../middleware/auth');
const { strictLimiter, uploadLimiter, bookingLimiter, contactLimiter } = require('../middleware/rateLimiter');

/**
 * Protect a route with authentication and strict rate limiting
 * Use for: POST, PUT, PATCH, DELETE operations
 */
const adminProtect = [authMiddleware, strictLimiter];

/**
 * Protect upload routes with authentication and upload-specific rate limiting
 */
const uploadProtect = [authMiddleware, uploadLimiter];

/**
 * Protect booking routes with booking-specific rate limiting (no auth)
 * Use for: User-facing booking/appointment creation
 */
const bookingProtect = [bookingLimiter];

/**
 * Protect contact form routes with contact-specific rate limiting (no auth)
 * Use for: Contact form submissions
 */
const contactProtect = [contactLimiter];

module.exports = {
  adminProtect,
  uploadProtect,
  bookingProtect,
  contactProtect
};

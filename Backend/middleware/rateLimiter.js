/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per IP
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health' || req.path === '/api'
});

// Strict rate limiter for sensitive operations - 10 requests per 15 minutes
// Skips rate limiting for authenticated admin requests
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests for this operation. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated admin requests
  skip: (req) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    const validApiKey = process.env.ADMIN_API_KEY;
    if (apiKey && validApiKey) {
      const key = apiKey.replace('Bearer ', '');
      return key === validApiKey;
    }
    return false;
  }
});

// Upload rate limiter - 20 uploads per 15 minutes
// Skips rate limiting for authenticated admin requests
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 uploads per windowMs
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated admin requests
  skip: (req) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    const validApiKey = process.env.ADMIN_API_KEY;
    if (apiKey && validApiKey) {
      const key = apiKey.replace('Bearer ', '');
      return key === validApiKey;
    }
    return false;
  }
});

// Contact form limiter - 5 submissions per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 contact form submissions per hour
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Booking limiter - 10 bookings per hour
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 bookings per hour
  message: {
    success: false,
    message: 'Too many booking requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  strictLimiter,
  uploadLimiter,
  contactLimiter,
  bookingLimiter
};

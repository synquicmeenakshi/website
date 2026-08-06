/**
 * Route Security Configuration Guide
 *
 * This file documents which routes need authentication and rate limiting.
 * Apply these patterns to all route files.
 */

const SECURITY_PATTERNS = {
  // Public routes - no authentication
  public: {
    methods: ['GET'],
    description: 'Public read-only access',
    examples: [
      'GET /api/services',
      'GET /api/properties',
      'GET /api/testimonials',
      'GET /api/page-content',
      'GET /api/faqs'
    ]
  },

  // User routes - rate limited but no auth
  user: {
    methods: ['POST'],
    rateLimiter: 'bookingLimiter or contactLimiter',
    description: 'User actions like booking, contact forms',
    examples: [
      'POST /api/appointments (bookingLimiter)',
      'POST /api/contact (contactLimiter)',
      'POST /api/enrollments (bookingLimiter)',
      'PATCH /api/appointments/:id/cancel (bookingLimiter)'
    ]
  },

  // Admin routes - authentication + strict rate limiting
  admin: {
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    middleware: 'authMiddleware + strictLimiter',
    description: 'Admin-only operations',
    examples: [
      'POST /api/services (create)',
      'PUT /api/services/:id (update)',
      'DELETE /api/services/:id (delete)',
      'POST /api/upload/image',
      'DELETE /api/upload/image/:filename',
      'DELETE /api/appointments/clear-all'
    ]
  },

  // Upload routes - authentication + upload rate limiting
  upload: {
    methods: ['POST'],
    middleware: 'authMiddleware + uploadLimiter',
    description: 'File upload operations',
    examples: [
      'POST /api/upload/image',
      'POST /api/upload/images'
    ]
  }
};

// Routes that need to be secured
const ROUTES_TO_SECURE = [
  // Properties
  { file: 'propertyRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },

  // Testimonials
  { file: 'testimonialRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { file: 'rentalTestimonialRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },

  // Page Content
  { file: 'pageContentRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { file: 'servicePageContentRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { file: 'legalPageRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { file: 'rentalPageRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },

  // Bookings & Enrollments
  { file: 'rentalBooking.js', adminMethods: ['PUT', 'PATCH', 'DELETE'], publicPost: true },
  { file: 'enrollmentRoutes.js', adminMethods: ['PUT', 'PATCH', 'DELETE'], publicPost: true },

  // Contact Forms (rate limited but public)
  { file: 'contactRoutes.js', publicPost: true, useContactLimiter: true },
  { file: 'rcontactRoutes.js', publicPost: true, useContactLimiter: true },

  // Blocked Dates
  { file: 'blockedDateRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },

  // Messages
  { file: 'messageRoutes.js', adminMethods: ['DELETE', 'PATCH'] },

  // FAQs
  { file: 'faqRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] },

  // Translations
  { file: 'translationRoutes.js', adminMethods: ['POST', 'PUT', 'PATCH', 'DELETE'] }
];

module.exports = {
  SECURITY_PATTERNS,
  ROUTES_TO_SECURE
};

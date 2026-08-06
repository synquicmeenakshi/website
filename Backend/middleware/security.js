/**
 * Security Middleware Configuration
 * Input sanitization and XSS protection
 */

const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/**
 * Sanitize user input to prevent NoSQL injection
 * Removes any keys that start with $ or contain .
 */
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Sanitized potentially malicious input: ${key}`);
  }
});

/**
 * Prevent HTTP Parameter Pollution attacks
 */
const preventParameterPollution = hpp();

/**
 * Custom XSS sanitization middleware
 * Sanitizes string inputs to prevent XSS attacks
 */
const xssSanitize = (req, res, next) => {
  try {
    // Helper function to sanitize strings
    const sanitize = (value) => {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters and scripts
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
      return value;
    };

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitize(req.body[key]);
        } else if (typeof req.body[key] === 'object') {
          // Recursively sanitize nested objects
          const sanitizeObject = (obj) => {
            Object.keys(obj).forEach(k => {
              if (typeof obj[k] === 'string') {
                obj[k] = sanitize(obj[k]);
              } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                sanitizeObject(obj[k]);
              }
            });
          };
          sanitizeObject(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitize(req.query[key]);
        }
      });
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitize(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    console.error('XSS sanitization error:', error);
    next(); // Continue even if sanitization fails
  }
};

module.exports = {
  sanitizeInput,
  preventParameterPollution,
  xssSanitize
};

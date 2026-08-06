/**
 * Authentication Middleware
 * Simple API key based authentication for admin routes
 */

const authMiddleware = (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

    // Check if API key is provided
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No API key provided.'
      });
    }

    // Remove 'Bearer ' prefix if present
    const key = apiKey.replace('Bearer ', '');

    // Verify API key against environment variable
    const validApiKey = process.env.ADMIN_API_KEY;

    if (!validApiKey) {
      console.error('⚠️ ADMIN_API_KEY not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    if (key !== validApiKey) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Invalid API key.'
      });
    }

    // API key is valid, proceed
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

module.exports = authMiddleware;

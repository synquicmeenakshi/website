const express = require('express');
const router = express.Router();
const { login, verifyToken, changePassword } = require('../controllers/authController');
const { strictLimiter } = require('../middleware/rateLimiter');

// Login route - rate limited to prevent brute force
router.post('/login', strictLimiter, login);

// Verify token (check if user is still authenticated)
router.get('/verify', verifyToken);

// Change password (requires valid token)
router.post('/change-password', strictLimiter, changePassword);

module.exports = router;

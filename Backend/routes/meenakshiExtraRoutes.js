/**
 * Routes added to close the proposal gaps: payments, availability, blog,
 * enquiries and customer records.
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { strictLimiter, contactLimiter, bookingLimiter } = require('../middleware/rateLimiter');

const payments = require('../controllers/paymentController');
const availability = require('../controllers/availabilityController');
const blog = require('../controllers/meenakshiBlogController');
const enquiries = require('../controllers/meenakshiEnquiryController');
const customers = require('../controllers/customerController');

/* ---- payments ------------------------------------------------------------ */
router.get('/payments/config', payments.getConfig);
router.post('/payments/order', bookingLimiter, payments.createOrder);
router.post('/payments/verify', bookingLimiter, payments.verifyPayment);
router.get('/payments/summary', authMiddleware, payments.getSummary);

/* ---- availability -------------------------------------------------------- */
router.get('/availability/settings', authMiddleware, availability.getSettings);
router.put('/availability/settings', authMiddleware, strictLimiter, availability.updateSettings);
router.get('/availability/blocked', authMiddleware, availability.listBlocked);
router.post('/availability/blocked', authMiddleware, strictLimiter, availability.createBlocked);
router.delete('/availability/blocked/:id', authMiddleware, strictLimiter, availability.deleteBlocked);

/* ---- blog ---------------------------------------------------------------- */
// Admin listing is declared before /:slug so 'admin' is not read as a slug.
router.get('/blog/admin/all', authMiddleware, blog.listAll);
router.post('/blog', authMiddleware, strictLimiter, blog.createPost);
router.put('/blog/:id', authMiddleware, strictLimiter, blog.updatePost);
router.delete('/blog/:id', authMiddleware, strictLimiter, blog.deletePost);
router.get('/blog', blog.listPosts);
router.get('/blog/:slug', blog.getPost);

/* ---- enquiries ----------------------------------------------------------- */
router.post('/enquiries', contactLimiter, enquiries.createEnquiry);
router.get('/enquiries', authMiddleware, enquiries.getAllEnquiries);
router.patch('/enquiries/:id', authMiddleware, strictLimiter, enquiries.updateEnquiry);
router.delete('/enquiries/:id', authMiddleware, strictLimiter, enquiries.deleteEnquiry);

/* ---- customers ----------------------------------------------------------- */
router.get('/customers', authMiddleware, customers.getCustomers);

module.exports = router;

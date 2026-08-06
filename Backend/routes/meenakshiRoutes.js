const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { strictLimiter } = require('../middleware/rateLimiter');

const { getContent } = require('../controllers/meenakshiContentController');
const {
  list, create, update, remove, reorder, getSettings, updateSettings
} = require('../controllers/meenakshiAdminController');

/* ---- public -------------------------------------------------------------- */
// Everything the site renders, in one request. No auth: this is the public
// marketing site's content.
router.get('/content', getContent);

/* ---- admin ---------------------------------------------------------------
   Settings routes are declared before /:collection so 'settings' is never
   swallowed by the collection parameter. */
router.get('/admin/settings', authMiddleware, getSettings);
router.put('/admin/settings', authMiddleware, strictLimiter, updateSettings);

router.get('/admin/:collection', authMiddleware, list);
router.post('/admin/:collection', authMiddleware, strictLimiter, create);
router.patch('/admin/:collection/reorder', authMiddleware, reorder);
router.put('/admin/:collection/:id', authMiddleware, strictLimiter, update);
router.delete('/admin/:collection/:id', authMiddleware, strictLimiter, remove);

module.exports = router;

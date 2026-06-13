const express = require('express');
const router = express.Router();
const { shorten, getUrls, deleteUrl, getAnalytics } = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');
const { validateShorten } = require('../middleware/validationMiddleware');

router.post('/shorten', protect, validateShorten, shorten);
router.get('/urls', protect, getUrls);
router.delete('/urls/:id', protect, deleteUrl);
router.get('/urls/:id/analytics', protect, getAnalytics);

module.exports = router;

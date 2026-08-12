const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  triggerSOS,
  getSOSHistory,
  getSOSById,
  cancelSOS,
  resolveSOS,
  getActiveSOS
} = require('../controllers/sosController');
const { protect } = require('../middlewares/authMiddleware');

// Rate limiting middleware to prevent accidental repeated SOS spamming (5 requests max per minute per IP)
const sosRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: 'Too many SOS requests in a short time. Please wait 1 minute before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use(protect); // All SOS routes require authentication

// Mount endpoints supporting both /api/sos and /api/v1/sos patterns
router.post('/', sosRateLimiter, triggerSOS);
router.post('/trigger', sosRateLimiter, triggerSOS);

router.get('/history', getSOSHistory);
router.get('/active', getActiveSOS);

router.post('/cancel', cancelSOS);
router.put('/cancel', cancelSOS);
router.put('/:id/cancel', cancelSOS);

router.post('/resolve', resolveSOS);
router.put('/resolve', resolveSOS);
router.put('/:id/resolve', resolveSOS);

router.get('/:id', getSOSById);

module.exports = router;

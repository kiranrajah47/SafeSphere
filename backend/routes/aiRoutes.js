const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { askSafetyAdvice } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Rate Limiter Middleware for AI Endpoint: Max 25 requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded: You have reached the maximum number of AI assistant requests allowed per 15 minutes. Please try again shortly or use the Emergency SOS button for immediate danger.'
  }
});

router.post('/safety-advice', protect, aiLimiter, askSafetyAdvice);
router.post('/chat', protect, aiLimiter, askSafetyAdvice);
router.post('/', protect, aiLimiter, askSafetyAdvice);

module.exports = router;

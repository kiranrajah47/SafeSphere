const express = require('express');
const router = express.Router();
const { askSafetyAdvice } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/safety-advice', protect, askSafetyAdvice);

module.exports = router;

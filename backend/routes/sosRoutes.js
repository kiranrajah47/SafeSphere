const express = require('express');
const router = express.Router();
const {
  triggerSOS,
  pingLocation,
  cancelSOS,
  resolveSOS,
  getActiveSOS
} = require('../controllers/sosController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/trigger', protect, triggerSOS);
router.post('/ping', protect, pingLocation);
router.post('/cancel', protect, cancelSOS);
router.post('/resolve', protect, resolveSOS);
router.get('/active', protect, getActiveSOS);

module.exports = router;

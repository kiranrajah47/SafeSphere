const express = require('express');
const router = express.Router();
const { shareLocation, getLocationPreferences } = require('../controllers/locationController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/share', protect, shareLocation);
router.get('/preferences', protect, getLocationPreferences);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  startJourney,
  checkInJourney,
  completeJourney,
  getActiveJourney
} = require('../controllers/journeyController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/start', protect, startJourney);
router.post('/check-in', protect, checkInJourney);
router.post('/complete', protect, completeJourney);
router.get('/active', protect, getActiveJourney);

module.exports = router;

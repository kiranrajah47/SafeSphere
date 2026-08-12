const express = require('express');
const router = express.Router();
const {
  startJourney,
  updateJourneyLocation,
  togglePauseJourney,
  completeJourney,
  cancelJourney,
  escalateJourney,
  getActiveJourney,
  getJourneyHistory
} = require('../controllers/journeyController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All journey routes require authentication

router.post('/start', startJourney);
router.put('/location', updateJourneyLocation);
router.put('/pause', togglePauseJourney);
router.post('/complete', completeJourney);
router.post('/cancel', cancelJourney);
router.post('/escalate', escalateJourney);

router.get('/active', getActiveJourney);
router.get('/history', getJourneyHistory);

module.exports = router;

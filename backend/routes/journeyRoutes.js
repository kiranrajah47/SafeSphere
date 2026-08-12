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

// Action endpoints
router.post('/start', startJourney);
router.post('/', startJourney); // Alias for POST /api/journeys

router.put('/location', updateJourneyLocation);
router.put('/position', updateJourneyLocation);
router.put('/:id/location', updateJourneyLocation); // Alias for PUT /api/journeys/:id/location

router.put('/pause', togglePauseJourney);
router.put('/:id/pause', togglePauseJourney);

router.post('/complete', completeJourney);
router.put('/complete', completeJourney);
router.put('/:id/complete', completeJourney);

router.post('/cancel', cancelJourney);
router.put('/cancel', cancelJourney);
router.put('/:id/cancel', cancelJourney);

router.post('/escalate', escalateJourney);

// Data retrieval endpoints
router.get('/active', getActiveJourney);
router.get('/history', getJourneyHistory);
router.get('/', getActiveJourney); // Alias for GET /api/journeys
router.get('/:id', getActiveJourney); // Alias for GET /api/journeys/:id

module.exports = router;

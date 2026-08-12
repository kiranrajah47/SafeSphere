const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  upvoteIncident,
  updateIncidentStatus
} = require('../controllers/incidentController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.post('/', protect, createIncident);
router.get('/', getIncidents);
router.post('/:id/upvote', protect, upvoteIncident);
router.put('/:id/status', protect, requireAdmin, updateIncidentStatus);

module.exports = router;

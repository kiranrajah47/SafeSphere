const express = require('express');
const router = express.Router();
const {
  submitIncidentReport,
  getIncidentReports,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident
} = require('../controllers/incidentController');
const { protect, adminCheck } = require('../middlewares/authMiddleware');

router.get('/', getIncidentReports);
router.post('/', protect, submitIncidentReport);

router.get('/:id', getIncidentById);
router.put('/:id/status', protect, adminCheck, updateIncidentStatus);
router.delete('/:id', protect, deleteIncident);

module.exports = router;

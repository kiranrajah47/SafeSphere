const express = require('express');
const router = express.Router();
const {
  getAlerts,
  createAlert,
  getAlertById,
  updateAlert,
  deleteAlert,
  flagAlert
} = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getAlerts);
router.post('/', protect, createAlert);

router.get('/:id', getAlertById);
router.put('/:id', protect, updateAlert);
router.delete('/:id', protect, deleteAlert);

router.post('/:id/flag', protect, flagAlert);
router.post('/:id/report', protect, flagAlert);

module.exports = router;

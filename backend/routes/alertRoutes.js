const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.get('/', getAlerts);
router.post('/', protect, requireAdmin, createAlert);
router.delete('/:id', protect, requireAdmin, deleteAlert);

module.exports = router;

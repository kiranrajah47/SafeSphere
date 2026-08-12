const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

module.exports = router;

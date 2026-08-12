const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');

router.get('/stats', protect, requireAdmin, getAdminStats);
router.get('/users', protect, requireAdmin, getAllUsers);
router.put('/users/:id/role', protect, requireAdmin, updateUserRole);

module.exports = router;

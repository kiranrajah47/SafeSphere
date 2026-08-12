const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getAdminIncidents,
  moderateIncident,
  getAdminAlerts,
  deleteAdminAlert,
  resolveAdminAlert,
  getAdminResources,
  createResourceGuide,
  editResourceGuide,
  deleteResourceGuide,
  togglePublishStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// ALL admin routes require authentication and admin role privileges!
router.use(protect, adminOnly);

// Stats Overview
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);

// Incident Moderation
router.get('/incidents', getAdminIncidents);
router.put('/incidents/:id/status', moderateIncident);

// Alert Moderation
router.get('/alerts', getAdminAlerts);
router.delete('/alerts/:id', deleteAdminAlert);
router.put('/alerts/:id/resolve', resolveAdminAlert);

// Resource & Safety Guide Management
router.get('/resources', getAdminResources);
router.post('/resources', createResourceGuide);
router.put('/resources/:id', editResourceGuide);
router.delete('/resources/:id', deleteResourceGuide);
router.put('/resources/:id/publish', togglePublishStatus);

module.exports = router;

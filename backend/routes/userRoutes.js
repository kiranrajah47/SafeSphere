const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
  updateMedicalInfo
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.put('/profile', protect, updateProfile);
router.get('/contacts', protect, getEmergencyContacts);
router.post('/contacts', protect, addEmergencyContact);
router.delete('/contacts/:id', protect, deleteEmergencyContact);
router.put('/medical', protect, updateMedicalInfo);

module.exports = router;

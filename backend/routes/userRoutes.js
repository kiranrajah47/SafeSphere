const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  updateMedicalInfo
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All profile routes require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/medical', updateMedicalInfo);

module.exports = router;

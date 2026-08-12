const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Get logged in user profile details
// @route   GET /api/v1/users/profile or /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash -otpCode -resetPasswordToken')
      .populate('emergencyContacts');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details (name, phone, profileImage)
// @route   PUT /api/v1/users/profile or /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (avatar !== undefined) user.profileImage = avatar;

    const updatedUser = await user.save();

    return res.json({
      success: true,
      message: 'Profile details updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        createdAt: updatedUser.createdAt,
        medicalInfo: updatedUser.medicalInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/users/change-password or /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully! Please use your new password next time you sign in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical & emergency information
// @route   PUT /api/v1/users/medical or /api/users/medical
// @access  Private
const updateMedicalInfo = async (req, res, next) => {
  try {
    const { bloodGroup, allergies, medicalConditions, emergencyNotes } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Convert comma-separated string to array if provided as string
    let allergiesArr = user.medicalInfo?.allergies || [];
    if (typeof allergies === 'string') {
      allergiesArr = allergies.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(allergies)) {
      allergiesArr = allergies;
    }

    let conditionsArr = user.medicalInfo?.medicalConditions || [];
    if (typeof medicalConditions === 'string') {
      conditionsArr = medicalConditions.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(medicalConditions)) {
      conditionsArr = medicalConditions;
    }

    user.medicalInfo = {
      bloodGroup: bloodGroup !== undefined ? bloodGroup : (user.medicalInfo?.bloodGroup || 'Unknown'),
      allergies: allergiesArr,
      medicalConditions: conditionsArr,
      emergencyNotes: emergencyNotes !== undefined ? emergencyNotes : (user.medicalInfo?.emergencyNotes || '')
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Emergency medical information updated successfully',
      data: user.medicalInfo
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateMedicalInfo
};

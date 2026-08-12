const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');

// @desc    Update user profile details
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    return res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        medicalInfo: updatedUser.medicalInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's emergency contacts
// @route   GET /api/v1/users/contacts
// @access  Private
const getEmergencyContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user._id });
    return res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new emergency contact
// @route   POST /api/v1/users/contacts
// @access  Private
const addEmergencyContact = async (req, res, next) => {
  try {
    const { name, relationship, phone, email, notifyViaSMS } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({ success: false, message: 'Name, relationship, and phone number are required' });
    }

    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name,
      relationship,
      phone,
      email: email || '',
      notifyViaSMS: notifyViaSMS !== undefined ? notifyViaSMS : true
    });

    // Link contact to User document
    await User.findByIdAndUpdate(req.user._id, {
      $push: { emergencyContacts: contact._id }
    });

    return res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an emergency contact
// @route   DELETE /api/v1/users/contacts/:id
// @access  Private
const deleteEmergencyContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    await EmergencyContact.deleteOne({ _id: req.params.id });

    // Remove from User document
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { emergencyContacts: req.params.id }
    });

    return res.json({
      success: true,
      message: 'Emergency contact removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical profile info
// @route   PUT /api/v1/users/medical
// @access  Private
const updateMedicalInfo = async (req, res, next) => {
  try {
    const { bloodGroup, allergies, medicalConditions, emergencyNotes } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.medicalInfo = {
      bloodGroup: bloodGroup || user.medicalInfo.bloodGroup,
      allergies: Array.isArray(allergies) ? allergies : user.medicalInfo.allergies,
      medicalConditions: Array.isArray(medicalConditions) ? medicalConditions : user.medicalInfo.medicalConditions,
      emergencyNotes: emergencyNotes !== undefined ? emergencyNotes : user.medicalInfo.emergencyNotes
    };

    await user.save();

    return res.json({
      success: true,
      data: user.medicalInfo
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
  updateMedicalInfo
};

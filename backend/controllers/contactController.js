const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');

// Helper phone validator (Allows +, spaces, dashes, digits; min 7 digits)
const isValidPhone = (phone) => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

// @desc    Get logged in user's emergency contacts
// @route   GET /api/v1/contacts or /api/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user._id })
      .sort({ isPrimary: -1, createdAt: -1 });

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
// @route   POST /api/v1/contacts or /api/contacts
// @access  Private
const addContact = async (req, res, next) => {
  try {
    const { name, relationship, phone, email, isPrimary, notifyViaSMS } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({ success: false, message: 'Name, relationship, and phone number are required' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (at least 7 digits)' });
    }

    // If marked primary, unset isPrimary on user's existing contacts
    if (isPrimary) {
      await EmergencyContact.updateMany(
        { userId: req.user._id },
        { isPrimary: false }
      );
    }

    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      isPrimary: isPrimary === true,
      notifyViaSMS: notifyViaSMS !== undefined ? notifyViaSMS : true
    });

    // Link contact ID to User document
    await User.findByIdAndUpdate(req.user._id, {
      $push: { emergencyContacts: contact._id }
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing emergency contact
// @route   PUT /api/v1/contacts/:id or /api/contacts/:id
// @access  Private
const updateContact = async (req, res, next) => {
  try {
    const { name, relationship, phone, email, isPrimary, notifyViaSMS } = req.body;

    // Verify contact exists and belongs to current user
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found or access denied' });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (at least 7 digits)' });
    }

    // If marking as primary, reset primary flag on all other contacts of this user
    if (isPrimary && !contact.isPrimary) {
      await EmergencyContact.updateMany(
        { userId: req.user._id },
        { isPrimary: false }
      );
    }

    if (name !== undefined) contact.name = name.trim();
    if (relationship !== undefined) contact.relationship = relationship.trim();
    if (phone !== undefined) contact.phone = phone.trim();
    if (email !== undefined) contact.email = email.trim();
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;
    if (notifyViaSMS !== undefined) contact.notifyViaSMS = notifyViaSMS;

    const updatedContact = await contact.save();

    return res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: updatedContact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an emergency contact
// @route   DELETE /api/v1/contacts/:id or /api/contacts/:id
// @access  Private
const deleteContact = async (req, res, next) => {
  try {
    // Verify contact belongs to user
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found or access denied' });
    }

    await EmergencyContact.deleteOne({ _id: req.params.id });

    // Unlink from User document
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

module.exports = {
  getContacts,
  addContact,
  updateContact,
  deleteContact
};

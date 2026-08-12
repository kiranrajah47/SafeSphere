const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const { sendSMSAlert } = require('../services/smsService');
const { getIO } = require('../config/socket');

// @desc    Trigger emergency SOS alert
// @route   POST /api/v1/sos or /api/sos
// @access  Private
const triggerSOS = async (req, res, next) => {
  try {
    let { latitude, longitude, coordinates, address, message, notes, emergencyType } = req.body;

    // Support coordinates array [lng, lat]
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      longitude = coordinates[0];
      latitude = coordinates[1];
    }

    // Default Fallbacks if GPS coordinates are missing or invalid
    let lat = parseFloat(latitude);
    let lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      // Fallback to user's saved currentLocation in DB, or default coordinates
      if (req.user?.currentLocation?.coordinates && req.user.currentLocation.coordinates.length === 2) {
        lng = req.user.currentLocation.coordinates[0];
        lat = req.user.currentLocation.coordinates[1];
      } else {
        lng = 77.2090;
        lat = 28.6139;
      }
    }

    // Check existing active SOS for this user
    let sos = await SOSAlert.findOne({ user: req.user._id, status: { $in: ['active', 'ACTIVE'] } });
    if (sos) {
      return res.status(200).json({
        success: true,
        message: 'Active SOS alert already running',
        data: sos
      });
    }

    // Retrieve user's trusted emergency contacts
    const contacts = await EmergencyContact.find({ userId: req.user._id });
    const contactIds = contacts.map(c => c._id);

    // Create SOS Document
    sos = await SOSAlert.create({
      user: req.user._id,
      userId: req.user._id,
      status: 'active',
      emergencyType: emergencyType || 'PANIC',
      message: message || notes || `${emergencyType || 'PANIC'} emergency distress signal!`,
      notes: notes || message || '',
      latitude: lat,
      longitude: lng,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      },
      locationHistory: [{ latitude: lat, longitude: lng, coordinates: [lng, lat], timestamp: new Date() }],
      contactsNotified: contactIds,
      contactsNotifiedCount: contacts.length,
      triggeredAt: new Date()
    });

    // Update user state in database
    await User.findByIdAndUpdate(req.user._id, {
      isSOSActive: true,
      currentLocation: {
        type: 'Point',
        coordinates: [lng, lat],
        lastUpdated: new Date()
      }
    });

    // Notify contacts via SMS Service (Twilio or Mock console)
    let smsMode = 'MOCK_CONSOLE';
    for (const contact of contacts) {
      if (contact.phone) {
        const smsMessage = `🚨 [SafeSphere ALERT] ${req.user.name} triggered an Emergency ${sos.emergencyType} SOS! ` +
          `Location: https://maps.google.com/?q=${lat},${lng}. Contact: ${req.user.phone}`;
        const smsRes = await sendSMSAlert(contact.phone, smsMessage);
        if (smsRes?.mode) smsMode = smsRes.mode;
      }
    }

    sos.notificationResult = {
      mode: smsMode,
      status: smsMode === 'TWILIO' ? 'DISPATCHED' : 'SIMULATED_MOCK_CONSOLE',
      dispatchedAt: new Date()
    };
    await sos.save();

    // Broadcast WebSockets event
    try {
      const { emitGlobalEvent, getIO } = require('../config/socket');
      const payload = {
        sos,
        user: {
          _id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          medicalInfo: req.user.medicalInfo
        }
      };
      emitGlobalEvent('sos-created', payload);
      const io = getIO();
      io.to('admin_room').emit('sos_created', payload);
      io.to(`user_${req.user._id}`).emit('sos_created', payload);
    } catch (e) {
      console.warn('[Socket Broadcast Warning]', e.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Emergency SOS triggered successfully',
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get SOS history for authenticated user
// @route   GET /api/v1/sos/history or /api/sos/history
// @access  Private
const getSOSHistory = async (req, res, next) => {
  try {
    const history = await SOSAlert.find({
      $or: [{ user: req.user._id }, { userId: req.user._id }]
    })
    .sort({ triggeredAt: -1 })
    .limit(50);

    return res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single SOS event details by ID
// @route   GET /api/v1/sos/:id or /api/sos/:id
// @access  Private
const getSOSById = async (req, res, next) => {
  try {
    const sos = await SOSAlert.findById(req.params.id)
      .populate('user', 'name phone email medicalInfo')
      .populate('contactsNotified', 'name phone relationship');

    if (!sos) {
      return res.status(404).json({ success: false, message: 'SOS event not found' });
    }

    if (!sos.user._id.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this SOS record' });
    }

    return res.json({
      success: true,
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel active SOS event
// @route   PUT /api/v1/sos/:id/cancel or /api/sos/:id/cancel
// @access  Private
const cancelSOS = async (req, res, next) => {
  try {
    const sosId = req.params.id !== 'cancel' ? req.params.id : null;
    
    let sos;
    if (sosId) {
      sos = await SOSAlert.findOne({ _id: sosId, user: req.user._id });
    } else {
      sos = await SOSAlert.findOne({ user: req.user._id, status: { $in: ['active', 'ACTIVE'] } });
    }

    if (!sos) {
      return res.status(404).json({ success: false, message: 'No active SOS event found to cancel' });
    }

    sos.status = 'cancelled';
    sos.resolvedAt = new Date();
    sos.resolvedBy = req.user._id;
    await sos.save();

    await User.findByIdAndUpdate(req.user._id, { isSOSActive: false });

    try {
      const io = getIO();
      io.to('admin_room').emit('sos_cancelled', { sosId: sos._id, userId: req.user._id });
      io.to(`user_${req.user._id}`).emit('sos_cancelled', { sosId: sos._id });
    } catch (e) {}

    return res.json({
      success: true,
      message: 'SOS event cancelled successfully',
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve active SOS event
// @route   PUT /api/v1/sos/:id/resolve or /api/sos/:id/resolve
// @access  Private
const resolveSOS = async (req, res, next) => {
  try {
    const sosId = req.params.id !== 'resolve' ? req.params.id : req.body.sosId;

    let sos;
    if (sosId) {
      sos = await SOSAlert.findById(sosId);
    } else {
      sos = await SOSAlert.findOne({ user: req.user._id, status: { $in: ['active', 'ACTIVE'] } });
    }

    if (!sos) {
      return res.status(404).json({ success: false, message: 'SOS event record not found' });
    }

    sos.status = 'resolved';
    sos.resolvedAt = new Date();
    sos.resolvedBy = req.user._id;
    await sos.save();

    await User.findByIdAndUpdate(sos.user || sos.userId, { isSOSActive: false });

    try {
      const { emitGlobalEvent, getIO } = require('../config/socket');
      emitGlobalEvent('sos-resolved', { sosId: sos._id, userId: sos.user || sos.userId });
      emitGlobalEvent('sos-cancelled', { sosId: sos._id, userId: sos.user || sos.userId });
      const io = getIO();
      io.to('admin_room').emit('sos_resolved', { sosId: sos._id });
      io.to(`user_${sos.user || sos.userId}`).emit('sos_resolved', { sosId: sos._id });
    } catch (e) {}

    return res.json({
      success: true,
      message: 'SOS event marked as resolved',
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active SOS for current user or global active list for admin
// @route   GET /api/v1/sos/active or /api/sos/active
// @access  Private
const getActiveSOS = async (req, res, next) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'responder') {
      const activeAlerts = await SOSAlert.find({ status: { $in: ['active', 'ACTIVE'] } })
        .populate('user', 'name phone email medicalInfo currentLocation')
        .sort({ triggeredAt: -1 });

      return res.json({
        success: true,
        count: activeAlerts.length,
        data: activeAlerts
      });
    }

    const activeSOS = await SOSAlert.findOne({ user: req.user._id, status: { $in: ['active', 'ACTIVE'] } });
    return res.json({
      success: true,
      data: activeSOS
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerSOS,
  getSOSHistory,
  getSOSById,
  cancelSOS,
  resolveSOS,
  getActiveSOS
};

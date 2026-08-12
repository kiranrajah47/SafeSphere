const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const { sendSMSAlert } = require('../services/smsService');
const { getIO } = require('../config/socket');

// @desc    Trigger emergency SOS alert
// @route   POST /api/v1/sos/trigger
// @access  Private
const triggerSOS = async (req, res, next) => {
  try {
    const { emergencyType, coordinates, address, notes } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Valid coordinates array [longitude, latitude] is required' });
    }

    // Check if user already has an active SOS
    const existingSOS = await SOSAlert.findOne({ userId: req.user._id, status: 'ACTIVE' });
    if (existingSOS) {
      return res.status(200).json({
        success: true,
        message: 'Active SOS alert already running',
        data: existingSOS
      });
    }

    const sos = await SOSAlert.create({
      userId: req.user._id,
      emergencyType: emergencyType || 'PANIC',
      location: {
        type: 'Point',
        coordinates,
        address: address || 'Emergency live location ping'
      },
      locationHistory: [{ coordinates, timestamp: new Date() }],
      notes: notes || ''
    });

    // Update user state
    await User.findByIdAndUpdate(req.user._id, {
      isSOSActive: true,
      currentLocation: {
        type: 'Point',
        coordinates,
        lastUpdated: new Date()
      }
    });

    // Notify Emergency Contacts via SMS Mock
    const contacts = await EmergencyContact.find({ userId: req.user._id });
    let notifiedCount = 0;

    for (const contact of contacts) {
      if (contact.notifyViaSMS && contact.phone) {
        const message = `🚨 EMERGENCY SOS ALERT! ${req.user.name} has triggered a ${sos.emergencyType} alert. ` +
          `Location: https://maps.google.com/?q=${coordinates[1]},${coordinates[0]}. Contact: ${req.user.phone}`;
        await sendSMSAlert(contact.phone, message);
        notifiedCount++;
      }
    }

    sos.contactsNotifiedCount = notifiedCount;
    await sos.save();

    // Broadcast via Socket.IO
    try {
      const io = getIO();
      const payload = {
        sos,
        user: {
          _id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          medicalInfo: req.user.medicalInfo
        }
      };
      io.to('admin_room').emit('sos_alert_created', payload);
      io.to(`user_${req.user._id}`).emit('sos_alert_created', payload);
    } catch (e) {
      console.warn('[Socket Broadcast Warning]', e.message);
    }

    return res.status(201).json({
      success: true,
      message: 'SOS Emergency Alert triggered successfully',
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ping location updates for active SOS
// @route   POST /api/v1/sos/ping
// @access  Private
const pingLocation = async (req, res, next) => {
  try {
    const { coordinates, address } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Valid coordinates array [lng, lat] is required' });
    }

    const sos = await SOSAlert.findOne({ userId: req.user._id, status: 'ACTIVE' });
    if (!sos) {
      return res.status(404).json({ success: false, message: 'No active SOS alert found for user' });
    }

    sos.location = {
      type: 'Point',
      coordinates,
      address: address || sos.location.address
    };
    sos.locationHistory.push({ coordinates, timestamp: new Date() });
    await sos.save();

    // Update user model location
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: {
        type: 'Point',
        coordinates,
        lastUpdated: new Date()
      }
    });

    // Broadcast socket live position ping
    try {
      const io = getIO();
      const updateData = { sosId: sos._id, userId: req.user._id, coordinates, address };
      io.to(`sos_${sos._id}`).emit('sos_location_updated', updateData);
      io.to('admin_room').emit('sos_location_updated', updateData);
    } catch (e) {
      // Ignore socket error in tests
    }

    return res.json({
      success: true,
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel active SOS (User initiated)
// @route   POST /api/v1/sos/cancel
// @access  Private
const cancelSOS = async (req, res, next) => {
  try {
    const sos = await SOSAlert.findOne({ userId: req.user._id, status: 'ACTIVE' });
    if (!sos) {
      return res.status(404).json({ success: false, message: 'No active SOS alert to cancel' });
    }

    sos.status = 'CANCELLED';
    sos.resolvedAt = new Date();
    sos.resolvedBy = req.user._id;
    await sos.save();

    await User.findByIdAndUpdate(req.user._id, { isSOSActive: false });

    try {
      const io = getIO();
      io.to('admin_room').emit('sos_alert_cancelled', { sosId: sos._id, userId: req.user._id });
      io.to(`user_${req.user._id}`).emit('sos_alert_cancelled', { sosId: sos._id });
    } catch (e) {}

    return res.json({
      success: true,
      message: 'SOS Alert cancelled successfully',
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve active SOS (User or Admin)
// @route   POST /api/v1/sos/resolve
// @access  Private
const resolveSOS = async (req, res, next) => {
  try {
    const { sosId } = req.body;
    const sos = await SOSAlert.findById(sosId || req.body.id);

    if (!sos) {
      return res.status(404).json({ success: false, message: 'SOS record not found' });
    }

    sos.status = 'RESOLVED';
    sos.resolvedAt = new Date();
    sos.resolvedBy = req.user._id;
    await sos.save();

    await User.findByIdAndUpdate(sos.userId, { isSOSActive: false });

    try {
      const io = getIO();
      io.to('admin_room').emit('sos_alert_resolved', { sosId: sos._id });
      io.to(`user_${sos.userId}`).emit('sos_alert_resolved', { sosId: sos._id });
    } catch (e) {}

    return res.json({
      success: true,
      message: 'SOS Alert marked as resolved',
      data: sos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active SOS list or current user's active SOS
// @route   GET /api/v1/sos/active
// @access  Private
const getActiveSOS = async (req, res, next) => {
  try {
    // If Admin/Responder, return all active SOS
    if (req.user.role === 'admin' || req.user.role === 'responder') {
      const activeAlerts = await SOSAlert.find({ status: 'ACTIVE' })
        .populate('userId', 'name phone email medicalInfo currentLocation')
        .sort({ triggeredAt: -1 });

      return res.json({
        success: true,
        count: activeAlerts.length,
        data: activeAlerts
      });
    }

    // Standard user returns their own active SOS
    const userSOS = await SOSAlert.findOne({ userId: req.user._id, status: 'ACTIVE' });
    return res.json({
      success: true,
      data: userSOS
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerSOS,
  pingLocation,
  cancelSOS,
  resolveSOS,
  getActiveSOS
};

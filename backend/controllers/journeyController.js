const SafeJourney = require('../models/SafeJourney');
const EmergencyContact = require('../models/EmergencyContact');
const { sendSMSAlert } = require('../services/smsService');
const { getIO } = require('../config/socket');

// @desc    Start a new Safe Journey
// @route   POST /api/v1/journey/start or /api/journey/start
// @access  Private
const startJourney = async (req, res, next) => {
  try {
    let { destinationName, estimatedDurationMinutes, expectedDurationMinutes, contactId, trustedContactId, guardianId, latitude, longitude, address } = req.body;

    const durationMins = parseInt(estimatedDurationMinutes || expectedDurationMinutes, 10);
    const targetContactId = contactId || trustedContactId || guardianId;

    if (!destinationName || isNaN(durationMins) || durationMins <= 0) {
      return res.status(400).json({ success: false, message: 'Destination name and estimated duration in minutes are required' });
    }

    // Check if user already has an active journey running
    let activeTrip = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'IN_PROGRESS'] }
    });

    if (activeTrip) {
      return res.status(200).json({
        success: true,
        message: 'Safe Journey is already active',
        data: activeTrip
      });
    }

    const startLat = parseFloat(latitude) || 28.6139;
    const startLng = parseFloat(longitude) || 77.2090;
    const expectedArrival = new Date(Date.now() + durationMins * 60 * 1000);

    let contact = null;
    if (targetContactId) {
      contact = await EmergencyContact.findOne({ _id: targetContactId, userId: req.user._id });
    }

    const journey = await SafeJourney.create({
      user: req.user._id,
      userId: req.user._id,
      destinationName: destinationName.trim(),
      startLocation: {
        latitude: startLat,
        longitude: startLng,
        address: address || 'Starting Position',
        type: 'Point',
        coordinates: [startLng, startLat]
      },
      currentLocation: {
        latitude: startLat,
        longitude: startLng,
        address: address || 'Starting Position',
        updatedAt: new Date()
      },
      locationHistory: [{ latitude: startLat, longitude: startLng, timestamp: new Date() }],
      estimatedDurationMinutes: durationMins,
      expectedArrivalTime: expectedArrival,
      trustedContact: contact ? contact._id : null,
      trustedContactsNotified: contact ? [contact._id] : [],
      status: 'in_progress'
    });

    // Notify contact if provided
    if (contact && contact.phone) {
      const msg = `🛡️ [SafeSphere] ${req.user.name} has started a Safe Journey to "${journey.destinationName}". Expected arrival: ${expectedArrival.toLocaleTimeString()}. Watchdog active.`;
      sendSMSAlert(contact.phone, msg).catch(e => {});
    }

    const populated = await journey.populate('trustedContact', 'name phone relationship');

    try {
      const { emitGlobalEvent, getIO } = require('../config/socket');
      emitGlobalEvent('journey-started', populated);
      const io = getIO();
      io.to(`user_${req.user._id}`).emit('journey_started', populated);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Safe Journey started successfully! Watchdog protection active.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live journey position (Periodic foreground location watch)
// @route   PUT /api/v1/journey/location or /api/journey/location
// @access  Private
const updateJourneyLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, address } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude required' });
    }

    const journey = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'IN_PROGRESS'] }
    });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active Safe Journey found' });
    }

    journey.currentLocation = {
      latitude: lat,
      longitude: lng,
      address: address || `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      updatedAt: new Date()
    };

    journey.locationHistory.push({
      latitude: lat,
      longitude: lng,
      timestamp: new Date()
    });

    await journey.save();

    return res.json({
      success: true,
      message: 'Journey location updated',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pause or Resume Safe Journey
// @route   PUT /api/v1/journey/pause or /api/journey/pause
// @access  Private
const togglePauseJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'IN_PROGRESS'] }
    });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active Safe Journey found' });
    }

    journey.isPaused = !journey.isPaused;
    journey.status = journey.isPaused ? 'paused' : 'in_progress';
    await journey.save();

    return res.json({
      success: true,
      message: journey.isPaused ? 'Safe Journey paused' : 'Safe Journey resumed',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark journey completed safely
// @route   POST /api/v1/journey/complete or /api/journey/complete
// @access  Private
const completeJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'overdue', 'IN_PROGRESS'] }
    }).populate('trustedContact');

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active journey found to complete' });
    }

    journey.status = 'completed';
    journey.completedAt = new Date();
    await journey.save();

    // Notify contact of safe arrival
    if (journey.trustedContact && journey.trustedContact.phone) {
      const msg = `✅ [SafeSphere] ${req.user.name} has arrived safely at "${journey.destinationName}". Safe Journey disarmed.`;
      sendSMSAlert(journey.trustedContact.phone, msg).catch(e => {});
    }

    try {
      const io = getIO();
      io.to(`user_${req.user._id}`).emit('journey_completed', journey);
    } catch (e) {}

    return res.json({
      success: true,
      message: 'Glad you arrived safely! Safe Journey disarmed.',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel active journey
// @route   POST /api/v1/journey/cancel or /api/journey/cancel
// @access  Private
const cancelJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'overdue', 'IN_PROGRESS'] }
    });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active journey found to cancel' });
    }

    journey.status = 'cancelled';
    journey.cancelledAt = new Date();
    await journey.save();

    return res.json({
      success: true,
      message: 'Safe Journey cancelled',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Escalate overdue journey to emergency contacts
// @route   POST /api/v1/journey/escalate or /api/journey/escalate
// @access  Private
const escalateJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'overdue', 'IN_PROGRESS'] }
    }).populate('trustedContact');

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active journey found to escalate' });
    }

    journey.status = 'escalated';
    journey.escalatedAt = new Date();
    await journey.save();

    // Trigger SMS dispatch & In-App / Email notification via Notification Service Abstraction
    try {
      const { notifyJourneyWarning } = require('../services/notificationService');
      await notifyJourneyWarning(journey, req.user, journey.trustedContact);
    } catch (nErr) {
      console.warn('[Journey Notification Service Call Failed]', nErr.message);
    }

    try {
      const { emitGlobalEvent, getIO } = require('../config/socket');
      emitGlobalEvent('journey-warning', { journey, user: { _id: req.user._id, name: req.user.name, phone: req.user.phone } });
      const io = getIO();
      io.to('admin_room').emit('journey_escalated', { journey, user: req.user });
      io.to(`user_${req.user._id}`).emit('journey_escalated', journey);
    } catch (e) {}

    return res.json({
      success: true,
      message: '🚨 Safety check failed. Journey escalated to emergency contacts.',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current active journey for logged in user
// @route   GET /api/v1/journey/active or /api/journey/active
// @access  Private
const getActiveJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({
      $or: [{ user: req.user._id }, { userId: req.user._id }],
      status: { $in: ['in_progress', 'paused', 'overdue', 'IN_PROGRESS'] }
    }).populate('trustedContact', 'name phone relationship');

    // Check if expected arrival time is exceeded
    if (journey && journey.status === 'in_progress' && new Date() > journey.expectedArrivalTime) {
      journey.status = 'overdue';
      journey.safetyCheckTriggered = true;
      await journey.save();
    }

    return res.json({
      success: true,
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journey history for user
// @route   GET /api/v1/journey/history or /api/journey/history
// @access  Private
const getJourneyHistory = async (req, res, next) => {
  try {
    const history = await SafeJourney.find({
      $or: [{ user: req.user._id }, { userId: req.user._id }]
    })
    .populate('trustedContact', 'name relationship')
    .sort({ createdAt: -1 })
    .limit(30);

    return res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startJourney,
  updateJourneyLocation,
  togglePauseJourney,
  completeJourney,
  cancelJourney,
  escalateJourney,
  getActiveJourney,
  getJourneyHistory
};

const SafeJourney = require('../models/SafeJourney');

// @desc    Start a Safe Journey session
// @route   POST /api/v1/journey/start
// @access  Private
const startJourney = async (req, res, next) => {
  try {
    const { destinationName, startCoordinates, destinationCoordinates, estimatedDurationMinutes, checkInIntervalMinutes } = req.body;

    if (!destinationName || !estimatedDurationMinutes) {
      return res.status(400).json({ success: false, message: 'Destination name and estimated duration (minutes) are required' });
    }

    // Cancel any existing active journey
    await SafeJourney.updateMany(
      { userId: req.user._id, status: 'IN_PROGRESS' },
      { status: 'CANCELLED' }
    );

    const now = new Date();
    const durationMs = parseInt(estimatedDurationMinutes) * 60 * 1000;
    const expectedArrivalTime = new Date(now.getTime() + durationMs);

    const journey = await SafeJourney.create({
      userId: req.user._id,
      destinationName,
      startLocation: {
        type: 'Point',
        coordinates: startCoordinates || [77.2090, 28.6139]
      },
      destinationLocation: {
        type: 'Point',
        coordinates: destinationCoordinates || [77.2090, 28.6139]
      },
      estimatedDurationMinutes: parseInt(estimatedDurationMinutes),
      checkInIntervalMinutes: parseInt(checkInIntervalMinutes) || 15,
      expectedArrivalTime,
      lastCheckInAt: now,
      status: 'IN_PROGRESS'
    });

    return res.status(201).json({
      success: true,
      message: 'Safe Journey mode activated successfully',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send periodic watchdog check-in
// @route   POST /api/v1/journey/check-in
// @access  Private
const checkInJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({ userId: req.user._id, status: 'IN_PROGRESS' });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active Safe Journey found' });
    }

    journey.lastCheckInAt = new Date();
    await journey.save();

    return res.json({
      success: true,
      message: 'Check-in confirmed successfully',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete Safe Journey safely
// @route   POST /api/v1/journey/complete
// @access  Private
const completeJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({ userId: req.user._id, status: 'IN_PROGRESS' });

    if (!journey) {
      return res.status(404).json({ success: false, message: 'No active Safe Journey to complete' });
    }

    journey.status = 'COMPLETED';
    await journey.save();

    return res.json({
      success: true,
      message: 'Safe Journey completed! Glad you arrived safely.',
      data: journey
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active Safe Journey status
// @route   GET /api/v1/journey/active
// @access  Private
const getActiveJourney = async (req, res, next) => {
  try {
    const journey = await SafeJourney.findOne({ userId: req.user._id, status: 'IN_PROGRESS' });
    return res.json({
      success: true,
      data: journey || null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startJourney,
  checkInJourney,
  completeJourney,
  getActiveJourney
};

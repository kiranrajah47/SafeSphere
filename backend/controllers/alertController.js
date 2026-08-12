const CommunityAlert = require('../models/CommunityAlert');
const { getIO } = require('../config/socket');

// @desc    Get all active community safety alerts
// @route   GET /api/v1/alerts
// @access  Public
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await CommunityAlert.find({
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null }
      ]
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create & broadcast community alert (Admin only)
// @route   POST /api/v1/alerts
// @access  Private (Admin)
const createAlert = async (req, res, next) => {
  try {
    const { title, message, category, severity, radiusKm, center, expiresHours } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const expiresAt = expiresHours ? new Date(Date.now() + expiresHours * 3600 * 1000) : new Date(Date.now() + 24 * 3600 * 1000);

    const alert = await CommunityAlert.create({
      authorId: req.user._id,
      title,
      message,
      category: category || 'GENERAL',
      severity: severity || 'INFO',
      affectedArea: {
        center: center || [77.2090, 28.6139],
        radiusKm: radiusKm || 10
      },
      expiresAt,
      isBroadcast: true
    });

    try {
      const io = getIO();
      io.emit('community_alert_new', alert);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete community alert
// @route   DELETE /api/v1/alerts/:id
// @access  Private (Admin)
const deleteAlert = async (req, res, next) => {
  try {
    await CommunityAlert.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert
};

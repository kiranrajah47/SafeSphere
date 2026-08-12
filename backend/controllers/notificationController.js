const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user in-app notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    const totalCount = await Notification.countDocuments({ user: req.user._id });

    return res.json({
      success: true,
      unreadCount,
      totalCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();

    return res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notification & location preferences
// @route   GET /api/v1/notifications/preferences OR /api/v1/location/preferences
// @access  Private
const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences currentLocation');
    const defaultPrefs = {
      inApp: true,
      sms: true,
      email: true,
      sosAlerts: true,
      communityAlerts: true,
      journeyWarnings: true,
      incidentUpdates: true,
      resourceUpdates: true
    };

    return res.json({
      success: true,
      data: {
        notificationPreferences: user.notificationPreferences || defaultPrefs,
        currentLocation: user.currentLocation
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/v1/notifications/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const {
      inApp,
      sms,
      email,
      sosAlerts,
      communityAlerts,
      journeyWarnings,
      incidentUpdates,
      resourceUpdates
    } = req.body;

    const user = await User.findById(req.user._id);

    user.notificationPreferences = {
      inApp: inApp !== undefined ? Boolean(inApp) : user.notificationPreferences?.inApp ?? true,
      sms: sms !== undefined ? Boolean(sms) : user.notificationPreferences?.sms ?? true,
      email: email !== undefined ? Boolean(email) : user.notificationPreferences?.email ?? true,
      sosAlerts: sosAlerts !== undefined ? Boolean(sosAlerts) : user.notificationPreferences?.sosAlerts ?? true,
      communityAlerts: communityAlerts !== undefined ? Boolean(communityAlerts) : user.notificationPreferences?.communityAlerts ?? true,
      journeyWarnings: journeyWarnings !== undefined ? Boolean(journeyWarnings) : user.notificationPreferences?.journeyWarnings ?? true,
      incidentUpdates: incidentUpdates !== undefined ? Boolean(incidentUpdates) : user.notificationPreferences?.incidentUpdates ?? true,
      resourceUpdates: resourceUpdates !== undefined ? Boolean(resourceUpdates) : user.notificationPreferences?.resourceUpdates ?? true
    };

    await user.save();

    return res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notificationPreferences
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences
};

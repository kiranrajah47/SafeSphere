const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const EmergencyContact = require('../models/EmergencyContact');
const SafeJourney = require('../models/SafeJourney');
const IncidentReport = require('../models/IncidentReport');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');

// @desc    Get aggregated User Safety Dashboard summary data
// @route   GET /api/v1/dashboard or /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch User details
    const user = await User.findById(userId).select('-passwordHash');

    // 2. Fetch Active SOS if running
    const activeSOS = await SOSAlert.findOne({
      user: userId,
      status: { $in: ['active', 'ACTIVE'] }
    });

    // 3. Fetch Emergency Contacts
    const contacts = await EmergencyContact.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

    // 4. Fetch Active Safe Journey if running
    const activeJourney = await SafeJourney.findOne({
      $or: [{ user: userId }, { userId }],
      status: { $in: ['in_progress', 'paused', 'IN_PROGRESS'] }
    }).populate('trustedContact');

    // 5. Fetch Recent Incidents
    const recentIncidents = await IncidentReport.find({ status: { $in: ['verified', 'pending'] } })
      .sort({ createdAt: -1 })
      .limit(10);

    // 6. Fetch Active Community Alerts
    const nearbyAlerts = await Alert.find({ isResolved: false })
      .sort({ createdAt: -1 })
      .limit(10);

    // 7. Unread Notifications Count
    const unreadNotificationsCount = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    return res.json({
      success: true,
      data: {
        user,
        activeSOS,
        emergencyContacts: contacts,
        activeJourney,
        recentIncidents,
        nearbyAlerts,
        unreadNotificationsCount,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardData };

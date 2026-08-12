const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const IncidentReport = require('../models/IncidentReport');
const CommunityAlert = require('../models/CommunityAlert');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSOSCount = await SOSAlert.countDocuments({ status: 'ACTIVE' });
    const pendingIncidentsCount = await IncidentReport.countDocuments({ status: 'PENDING' });
    const totalIncidentsCount = await IncidentReport.countDocuments();
    const activeAlertsCount = await CommunityAlert.countDocuments();

    const recentSOS = await SOSAlert.find()
      .populate('userId', 'name phone email')
      .sort({ triggeredAt: -1 })
      .limit(10);

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeSOSCount,
          pendingIncidentsCount,
          totalIncidentsCount,
          activeAlertsCount
        },
        recentSOS
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Admin)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'responder', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role value' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole
};

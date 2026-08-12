const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const IncidentReport = require('../models/IncidentReport');
const Alert = require('../models/Alert');
const Resource = require('../models/Resource');
const SafetyGuide = require('../models/SafetyGuide');

// @desc    Get Admin Dashboard Stats Overview
// @route   GET /api/v1/admin/stats or /api/admin/stats
// @access  Private (Admin Only)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSOSCount = await SOSAlert.countDocuments({ status: { $in: ['active', 'ACTIVE'] } });
    const pendingIncidentsCount = await IncidentReport.countDocuments({ status: { $in: ['pending', 'PENDING'] } });
    const verifiedAlertsCount = await Alert.countDocuments({ status: { $in: ['active', 'ACTIVE'] } });
    const resourceCount = await SafetyGuide.countDocuments() + await Resource.countDocuments();

    const recentSOS = await SOSAlert.find()
      .populate('user', 'name phone email')
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeSOSCount,
        pendingIncidentsCount,
        verifiedAlertsCount,
        resourceCount,
        recentSOS
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Users (with search)
// @route   GET /api/v1/admin/users or /api/admin/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash -otpCode -resetPasswordToken')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Deactivate / Activate User)
// @route   PUT /api/v1/admin/users/:id/status or /api/admin/users/:id/status
// @access  Private (Admin Only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      success: true,
      message: `User "${user.name}" account status set to ${user.isActive ? 'Active' : 'Deactivated'}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Role (Admin)
// @route   PUT /api/v1/admin/users/:id/role or /api/admin/users/:id/role
// @access  Private (Admin Only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either "user" or "admin"' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
    return res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Incidents for Moderation Review
// @route   GET /api/v1/admin/incidents or /api/admin/incidents
// @access  Private (Admin Only)
const getAdminIncidents = async (req, res, next) => {
  try {
    const incidents = await IncidentReport.find()
      .populate('reporterId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate Incident Report (Verify, Reject, Resolve)
// @route   PUT /api/v1/admin/incidents/:id/status or /api/admin/incidents/:id/status
// @access  Private (Admin Only)
const moderateIncident = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['pending', 'verified', 'rejected', 'resolved'].includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Status must be pending, verified, rejected, or resolved' });
    }

    const incident = await IncidentReport.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    incident.status = status.toLowerCase();
    if (adminNotes) incident.adminNotes = adminNotes;
    incident.reviewedBy = req.user._id;
    incident.reviewedAt = new Date();

    await incident.save();

    return res.json({
      success: true,
      message: `Incident report status updated to "${incident.status}"`,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Community Alerts for Admin Moderation
// @route   GET /api/v1/admin/alerts or /api/admin/alerts
// @access  Private (Admin Only)
const getAdminAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find()
      .populate('createdBy', 'name email phone')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove Inappropriate Community Alert
// @route   DELETE /api/v1/admin/alerts/:id or /api/admin/alerts/:id
// @access  Private (Admin Only)
const deleteAdminAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await Alert.deleteOne({ _id: req.params.id });

    return res.json({
      success: true,
      message: 'Inappropriate alert deleted by administrator'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve Active Community Alert
// @route   PUT /api/v1/admin/alerts/:id/resolve or /api/admin/alerts/:id/resolve
// @access  Private (Admin Only)
const resolveAdminAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'resolved';
    await alert.save();

    return res.json({
      success: true,
      message: 'Community alert marked as resolved',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Resource Safety Guides (Admin Management)
// @route   GET /api/v1/admin/resources or /api/admin/resources
// @access  Private (Admin Only)
const getAdminResources = async (req, res, next) => {
  try {
    const guides = await SafetyGuide.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Resource Safety Guide or Video
// @route   POST /api/v1/admin/resources or /api/admin/resources
// @access  Private (Admin Only)
const createResourceGuide = async (req, res, next) => {
  try {
    const { title, description, content, type, categoryGroup, category, readTime, videoUrl, videoDuration, thumbnailUrl } = req.body;

    if (!title || !description || !type || !categoryGroup || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, type, categoryGroup, and category are required' });
    }

    const guide = await SafetyGuide.create({
      title: title.trim(),
      description: description.trim(),
      content: content || description,
      type: type.toUpperCase(),
      categoryGroup: categoryGroup.toUpperCase(),
      category,
      readTime: readTime || '5 min read',
      videoUrl: videoUrl || '',
      videoDuration: videoDuration || '',
      thumbnailUrl: thumbnailUrl || '',
      author: 'SafeSphere Medical & Safety Board',
      isPublished: true
    });

    return res.status(201).json({
      success: true,
      message: 'Safety resource guide created successfully',
      data: guide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit Resource Safety Guide
// @route   PUT /api/v1/admin/resources/:id or /api/admin/resources/:id
// @access  Private (Admin Only)
const editResourceGuide = async (req, res, next) => {
  try {
    const guide = await SafetyGuide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Resource guide not found' });
    }

    return res.json({
      success: true,
      message: 'Resource guide updated successfully',
      data: guide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Resource Safety Guide
// @route   DELETE /api/v1/admin/resources/:id or /api/admin/resources/:id
// @access  Private (Admin Only)
const deleteResourceGuide = async (req, res, next) => {
  try {
    const guide = await SafetyGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Resource guide not found' });
    }

    await SafetyGuide.deleteOne({ _id: req.params.id });

    return res.json({
      success: true,
      message: 'Resource guide deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish / Unpublish Resource Guide or Video
// @route   PUT /api/v1/admin/resources/:id/publish or /api/admin/resources/:id/publish
// @access  Private (Admin Only)
const togglePublishStatus = async (req, res, next) => {
  try {
    const guide = await SafetyGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Resource guide not found' });
    }

    guide.isPublished = !guide.isPublished;
    await guide.save();

    return res.json({
      success: true,
      message: `Resource guide "${guide.title}" is now ${guide.isPublished ? 'Published' : 'Unpublished'}`,
      data: guide
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getAdminIncidents,
  moderateIncident,
  getAdminAlerts,
  deleteAdminAlert,
  resolveAdminAlert,
  getAdminResources,
  createResourceGuide,
  editResourceGuide,
  deleteResourceGuide,
  togglePublishStatus
};

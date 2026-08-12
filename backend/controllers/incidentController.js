const IncidentReport = require('../models/IncidentReport');
const { getIO } = require('../config/socket');

// @desc    Create incident report
// @route   POST /api/v1/incidents
// @access  Private
const createIncident = async (req, res, next) => {
  try {
    const { title, description, category, severity, coordinates, address, mediaUrls } = req.body;

    if (!title || !description || !category || !coordinates) {
      return res.status(400).json({ success: false, message: 'Title, description, category, and coordinates [lng, lat] are required' });
    }

    const incident = await IncidentReport.create({
      reporterId: req.user._id,
      title,
      description,
      category,
      severity: severity || 'MEDIUM',
      location: {
        type: 'Point',
        coordinates,
        address: address || ''
      },
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : []
    });

    // Broadcast real-time incident event
    try {
      const io = getIO();
      io.emit('incident_created', incident);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incident reports (filter by radius or category)
// @route   GET /api/v1/incidents
// @access  Public
const getIncidents = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm, category, status } = req.query;

    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    if (lat && lng) {
      const radiusInMeters = (parseFloat(radiusKm) || 10) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    const incidents = await IncidentReport.find(query)
      .populate('reporterId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote/Confirm incident report
// @route   POST /api/v1/incidents/:id/upvote
// @access  Private
const upvoteIncident = async (req, res, next) => {
  try {
    const incident = await IncidentReport.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    const hasUpvoted = incident.upvotes.includes(req.user._id);
    if (hasUpvoted) {
      // Remove upvote
      incident.upvotes = incident.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Add upvote
      incident.upvotes.push(req.user._id);
    }

    await incident.save();

    return res.json({
      success: true,
      upvotesCount: incident.upvotes.length,
      hasUpvoted: !hasUpvoted,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update incident status (Admin/Moderator)
// @route   PUT /api/v1/incidents/:id/status
// @access  Private (Admin)
const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'VERIFIED', 'DISMISSED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const incident = await IncidentReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    try {
      const io = getIO();
      io.emit('incident_status_updated', incident);
    } catch (e) {}

    return res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  upvoteIncident,
  updateIncidentStatus
};

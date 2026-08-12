const Alert = require('../models/Alert');
const { getIO } = require('../config/socket');

// Helper Haversine Distance Formula in Km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Seed initial default community alerts if empty
const seedDefaultAlerts = async () => {
  const count = await Alert.countDocuments();
  if (count === 0) {
    // Requires at least one user ID or placeholder
    const defaultUser = '660000000000000000000000';
    await Alert.create([
      {
        title: 'Road Blockage & Traffic Hazard',
        description: 'Tree branch fallen blocking right lane on Main Express Highway.',
        category: 'Road hazard',
        severity: 'medium',
        latitude: 28.6200,
        longitude: 77.2100,
        location: { type: 'Point', coordinates: [77.2100, 28.6200], address: 'Main Express Highway, New Delhi' },
        createdBy: defaultUser,
        status: 'active'
      },
      {
        title: 'Minor Vehicle Collision',
        description: 'Two-car fender bender near Ring Road Roundabout. Traffic slowing down.',
        category: 'Accident',
        severity: 'medium',
        latitude: 28.6100,
        longitude: 77.2250,
        location: { type: 'Point', coordinates: [77.2250, 28.6100], address: 'Ring Road Roundabout, New Delhi' },
        createdBy: defaultUser,
        status: 'active'
      },
      {
        title: 'Waterpipe Burst & Flooding Alert',
        description: 'Substantial water leakage flooding pedestrian sidewalk near Metro Gate 3.',
        category: 'Natural disaster',
        severity: 'low',
        latitude: 28.6280,
        longitude: 77.2150,
        location: { type: 'Point', coordinates: [77.2150, 28.6280], address: 'Metro Gate 3 Plaza, New Delhi' },
        createdBy: defaultUser,
        status: 'active'
      }
    ]);
  }
};

seedDefaultAlerts().catch(e => console.warn('[Alert Seed Warning]', e.message));

// @desc    Get community alerts with filters (location radius, category, severity, time range)
// @route   GET /api/v1/alerts or /api/alerts
// @access  Public
const getAlerts = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lng = parseFloat(req.query.lng) || 77.2090;
    const radiusKm = parseFloat(req.query.radiusKm) || 50;
    const category = req.query.category;
    const severity = req.query.severity;
    const timeRange = req.query.timeRange || 'all'; // '24h' | '7d' | '30d' | 'all'

    let query = { status: { $in: ['active', 'flagged'] } };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (severity && severity !== 'ALL') {
      query.severity = severity.toLowerCase();
    }

    if (timeRange !== 'all') {
      const now = new Date();
      let cutOffDate = new Date();
      if (timeRange === '24h') cutOffDate.setDate(now.getDate() - 1);
      else if (timeRange === '7d') cutOffDate.setDate(now.getDate() - 7);
      else if (timeRange === '30d') cutOffDate.setDate(now.getDate() - 30);
      query.createdAt = { $gte: cutOffDate };
    }

    const alerts = await Alert.find(query)
      .populate('createdBy', 'name email phone avatar')
      .sort({ createdAt: -1 });

    const processedAlerts = alerts.map((a) => {
      const aLat = a.latitude || a.location?.coordinates?.[1] || 28.6139;
      const aLng = a.longitude || a.location?.coordinates?.[0] || 77.2090;
      const distKm = calculateDistanceKm(lat, lng, aLat, aLng);

      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        category: a.category,
        severity: a.severity,
        latitude: aLat,
        longitude: aLng,
        location: a.location,
        createdBy: a.createdBy,
        status: a.status,
        flaggedCount: a.flaggedCount || 0,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        distanceKm: distKm,
        distanceText: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`
      };
    })
    .filter(a => a.distanceKm <= radiusKm);

    return res.json({
      success: true,
      count: processedAlerts.length,
      data: processedAlerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new community alert
// @route   POST /api/v1/alerts or /api/alerts
// @access  Private
const createAlert = async (req, res, next) => {
  try {
    let { title, description, category, severity, latitude, longitude, coordinates, address } = req.body;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      longitude = coordinates[0];
      latitude = coordinates[1];
    }

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, and category are required' });
    }

    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    const alert = await Alert.create({
      title: title.trim(),
      description: description.trim(),
      category,
      severity: severity ? severity.toLowerCase() : 'medium',
      latitude: lat,
      longitude: lng,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      },
      createdBy: req.user._id,
      status: 'active'
    });

    const populated = await alert.populate('createdBy', 'name email phone avatar');

    // Broadcast WebSockets event
    try {
      const { emitGlobalEvent } = require('../config/socket');
      emitGlobalEvent('alert-created', populated);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Community alert posted successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single alert details
// @route   GET /api/v1/alerts/:id or /api/alerts/:id
// @access  Public
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('createdBy', 'name email phone avatar');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    return res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an alert (Author or Admin only)
// @route   PUT /api/v1/alerts/:id or /api/alerts/:id
// @access  Private
const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Check authorization: Must be author or admin
    if (!alert.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this alert' });
    }

    const { title, description, category, severity, status } = req.body;

    if (title) alert.title = title.trim();
    if (description) alert.description = description.trim();
    if (category) alert.category = category;
    if (severity) alert.severity = severity.toLowerCase();
    if (status) alert.status = status.toLowerCase();

    const updatedAlert = await alert.save();

    try {
      const { emitGlobalEvent } = require('../config/socket');
      emitGlobalEvent('alert-updated', updatedAlert);
    } catch (e) {}

    return res.json({
      success: true,
      message: 'Alert updated successfully',
      data: updatedAlert
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an alert (Author or Admin only)
// @route   DELETE /api/v1/alerts/:id or /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (!alert.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this alert' });
    }

    await Alert.deleteOne({ _id: req.params.id });

    return res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report / Flag inappropriate or false alert
// @route   POST /api/v1/alerts/:id/flag or /api/alerts/:id/flag
// @access  Private
const flagAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    // Check if user already flagged this alert
    if (alert.flaggedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already reported this alert' });
    }

    alert.flaggedBy.push(req.user._id);
    alert.flaggedCount = alert.flaggedBy.length;

    // If flagged by 3 or more users, mark status as flagged
    if (alert.flaggedCount >= 3) {
      alert.status = 'flagged';
    }

    await alert.save();

    return res.json({
      success: true,
      message: 'Thank you. Alert reported for moderation review.',
      flaggedCount: alert.flaggedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  createAlert,
  getAlertById,
  updateAlert,
  deleteAlert,
  flagAlert
};

const IncidentReport = require('../models/IncidentReport');
const { getIO } = require('../config/socket');

// Helper Haversine Distance Formula
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

// Seed sample incidents if empty
const seedSampleIncidents = async () => {
  const count = await IncidentReport.countDocuments();
  if (count === 0) {
    const defaultUser = '660000000000000000000000';
    await IncidentReport.create([
      {
        title: 'Bicycle Theft from Public Parking',
        incidentType: 'Theft',
        category: 'Theft',
        description: 'Black mountain bike stolen near Central Station bike rack around 4:00 PM.',
        severity: 'medium',
        latitude: 28.6180,
        longitude: 77.2120,
        location: { type: 'Point', coordinates: [77.2120, 28.6180], address: 'Central Station Parking, New Delhi' },
        reporterId: defaultUser,
        status: 'pending'
      },
      {
        title: 'Verbal Harassment Reported Near Park',
        incidentType: 'Harassment',
        category: 'Harassment',
        description: 'Aggressive group shouting at passersby along the jogging trail.',
        severity: 'high',
        latitude: 28.6050,
        longitude: 77.2180,
        location: { type: 'Point', coordinates: [77.2180, 28.6050], address: 'Lodi Gardens Jogging Trail, New Delhi' },
        reporterId: defaultUser,
        status: 'verified'
      }
    ]);
  }
};

seedSampleIncidents().catch(e => console.warn('[Incident Seed Warning]', e.message));

// @desc    Submit a user incident report (Status: pending)
// @route   POST /api/v1/incidents or /api/incidents
// @access  Private
const submitIncidentReport = async (req, res, next) => {
  try {
    let { title, incidentType, category, description, latitude, longitude, coordinates, address, dateTime, image, severity } = req.body;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      longitude = coordinates[0];
      latitude = coordinates[1];
    }

    const type = incidentType || category;

    if (!title || !description || !type) {
      return res.status(400).json({ success: false, message: 'Incident title, description, and incident type are required' });
    }

    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    const report = await IncidentReport.create({
      title: title.trim(),
      incidentType: type,
      category: type,
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || `(${lat.toFixed(4)}, ${lng.toFixed(4)})`
      },
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      image: image || '',
      severity: severity ? severity.toLowerCase() : 'medium',
      reporterId: req.user._id,
      status: 'pending' // User reports enter pending review status
    });

    const populated = await report.populate('reporterId', 'name email phone avatar');

    // Notify admins via Socket.IO
    try {
      const io = getIO();
      io.to('admin_room').emit('incident_submitted', populated);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Incident report submitted successfully and submitted for moderation review.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incident reports (with status & radius filters)
// @route   GET /api/v1/incidents or /api/incidents
// @access  Public
const getIncidentReports = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lng = parseFloat(req.query.lng) || 77.2090;
    const radiusKm = parseFloat(req.query.radiusKm) || 50;
    const status = req.query.status; // 'pending' | 'verified' | 'rejected' | 'resolved' | 'all'
    const incidentType = req.query.incidentType || req.query.category;

    let query = {};

    // By default, non-admins see verified or public reports, unless status is explicitly requested
    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (incidentType && incidentType !== 'ALL') {
      query.incidentType = incidentType;
    }

    const reports = await IncidentReport.find(query)
      .populate('reporterId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    const processed = reports.map((r) => {
      const rLat = r.latitude || r.location?.coordinates?.[1] || 28.6139;
      const rLng = r.longitude || r.location?.coordinates?.[0] || 77.2090;
      const distKm = calculateDistanceKm(lat, lng, rLat, rLng);

      return {
        _id: r._id,
        title: r.title,
        incidentType: r.incidentType || r.category,
        category: r.incidentType || r.category,
        description: r.description,
        latitude: rLat,
        longitude: rLng,
        location: r.location,
        dateTime: r.dateTime || r.createdAt,
        image: r.image || '',
        severity: r.severity,
        status: r.status?.toLowerCase(),
        reporterId: r.reporterId,
        adminNotes: r.adminNotes || '',
        createdAt: r.createdAt,
        distanceKm: distKm,
        distanceText: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`
      };
    })
    .filter(r => r.distanceKm <= radiusKm);

    return res.json({
      success: true,
      count: processed.length,
      data: processed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single incident report details
// @route   GET /api/v1/incidents/:id or /api/incidents/:id
// @access  Public
const getIncidentById = async (req, res, next) => {
  try {
    const report = await IncidentReport.findById(req.params.id)
      .populate('reporterId', 'name email phone avatar')
      .populate('reviewedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update incident report status (Admin / Moderator Only)
// @route   PUT /api/v1/incidents/:id/status or /api/incidents/:id/status
// @access  Private (Admin)
const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'verified', 'rejected', 'resolved'].includes(status.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Valid status required (pending, verified, rejected, resolved)' });
    }

    const report = await IncidentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    report.status = status.toLowerCase();
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    await report.save();

    try {
      const { emitGlobalEvent, getIO } = require('../config/socket');
      const { notifyIncidentVerified } = require('../services/notificationService');

      if (report.status === 'verified') {
        emitGlobalEvent('incident-verified', report);
        if (report.reporterId) {
          notifyIncidentVerified(report, { _id: report.reporterId }).catch(() => {});
        }
      }
      emitGlobalEvent('incident-status-updated', { reportId: report._id, status: report.status });
      const io = getIO();
      io.emit('incident_status_updated', { reportId: report._id, status: report.status });
    } catch (e) {}

    return res.json({
      success: true,
      message: `Incident report status updated to "${report.status}"`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete incident report
// @route   DELETE /api/v1/incidents/:id or /api/incidents/:id
// @access  Private (Reporter or Admin)
const deleteIncident = async (req, res, next) => {
  try {
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    if (!report.reporterId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this incident report' });
    }

    await IncidentReport.deleteOne({ _id: req.params.id });

    return res.json({
      success: true,
      message: 'Incident report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitIncidentReport,
  getIncidentReports,
  getIncidentById,
  updateIncidentStatus,
  deleteIncident
};

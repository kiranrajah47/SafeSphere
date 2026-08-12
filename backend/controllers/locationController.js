const User = require('../models/User');

// @desc    Share / Update user location coordinates
// @route   POST /api/v1/location/share or /api/location/share
// @access  Private (or optional auth)
const shareLocation = async (req, res, next) => {
  try {
    let { latitude, longitude, coordinates, address } = req.body;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      longitude = coordinates[0];
      latitude = coordinates[1];
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude coordinates are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude must be numbers' });
    }

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        currentLocation: {
          type: 'Point',
          coordinates: [lng, lat],
          lastUpdated: new Date()
        }
      });
    }

    return res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat],
        address: address || `(${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user location preferences
// @route   GET /api/v1/location/preferences or /api/location/preferences
// @access  Private
const getLocationPreferences = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: {
        autoShareInEmergency: true,
        highAccuracyMode: true,
        defaultRadiusKm: 5,
        mapTileProvider: 'OpenStreetMap'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shareLocation,
  getLocationPreferences
};

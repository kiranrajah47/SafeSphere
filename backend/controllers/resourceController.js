const Resource = require('../models/Resource');

// Haversine Distance Formula in Kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Format Distance String (e.g. "450 m" or "1.2 km")
function formatDistance(distKm) {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

// Seed initial verified default emergency stations if database is empty
const seedDefaultResources = async () => {
  const count = await Resource.countDocuments();
  if (count === 0) {
    await Resource.create([
      {
        name: 'Central City Police Headquarters',
        category: 'POLICE',
        phone: '100',
        address: 'Parliament Street, Connaught Place, New Delhi',
        location: { type: 'Point', coordinates: [77.2150, 28.6250] },
        latitude: 28.6250,
        longitude: 77.2150,
        operatingHours: '24/7',
        isVerified: true,
        source: 'VERIFIED_DIRECTORY'
      },
      {
        name: 'AIIMS Emergency Medical & Trauma Center',
        category: 'HOSPITAL',
        phone: '102',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
        location: { type: 'Point', coordinates: [77.2100, 28.5672] },
        latitude: 28.5672,
        longitude: 77.2100,
        operatingHours: '24/7 ER Service',
        isVerified: true,
        source: 'VERIFIED_DIRECTORY'
      },
      {
        name: 'City Fire & Rescue Station Station 1',
        category: 'FIRE',
        phone: '101',
        address: 'Connaught Circus, Barakhamba, New Delhi',
        location: { type: 'Point', coordinates: [77.2200, 28.6300] },
        latitude: 28.6300,
        longitude: 77.2200,
        operatingHours: '24/7 Dispatch',
        isVerified: true,
        source: 'VERIFIED_DIRECTORY'
      },
      {
        name: 'Apollo 24/7 Pharmacy & Emergency Care',
        category: 'PHARMACY',
        phone: '+1 800 200 2000',
        address: 'Janpath Road, Connaught Place, New Delhi',
        location: { type: 'Point', coordinates: [77.2180, 28.6200] },
        latitude: 28.6200,
        longitude: 77.2180,
        operatingHours: 'Open 24 Hours',
        isVerified: true,
        source: 'VERIFIED_DIRECTORY'
      },
      {
        name: 'Rapid Dispatch Ambulance Squad',
        category: 'AMBULANCE',
        phone: '102',
        address: 'Ring Road EMS Hub, New Delhi',
        location: { type: 'Point', coordinates: [77.2050, 28.6100] },
        latitude: 28.6100,
        longitude: 77.2050,
        operatingHours: '24/7 Standby Dispatch',
        isVerified: true,
        source: 'VERIFIED_DIRECTORY'
      }
    ]);
  }
};

// Seed defaults on start
seedDefaultResources().catch(e => console.warn('[Resource Seed Error]', e.message));

// @desc    Get nearby emergency assistance resources
// @route   GET /api/v1/resources/nearby or /api/resources/nearby
// @access  Public / Private
const getNearbyResources = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6139;
    const lng = parseFloat(req.query.lng) || 77.2090;
    const category = req.query.category || 'ALL';
    const radiusKm = parseFloat(req.query.radiusKm) || 25;

    let query = {};
    if (category !== 'ALL') {
      if (category === 'FIRE') {
        query.category = { $in: ['FIRE', 'FIRE_STATION'] };
      } else {
        query.category = category;
      }
    }

    const resources = await Resource.find(query);

    // Calculate exact Haversine distance relative to user position
    const processed = resources.map((r) => {
      const targetLat = r.latitude || r.location?.coordinates?.[1] || 28.6139;
      const targetLng = r.longitude || r.location?.coordinates?.[0] || 77.2090;
      const distKm = calculateDistanceKm(lat, lng, targetLat, targetLng);

      return {
        _id: r._id,
        name: r.name,
        category: r.category,
        phone: r.phone,
        address: r.address || 'Address details',
        latitude: targetLat,
        longitude: targetLng,
        coordinates: [targetLng, targetLat],
        operatingHours: r.operatingHours,
        isVerified: r.isVerified,
        source: r.source || 'VERIFIED_DIRECTORY',
        distanceKm: distKm,
        distanceText: formatDistance(distKm),
        // OpenStreetMap Directions Link
        directionsUrl: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${lat},${lng};${targetLat},${targetLng}`,
        // Google Maps Fallback Directions Link
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`
      };
    })
    .filter(r => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({
      success: true,
      count: processed.length,
      userLocation: { lat, lng },
      data: processed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get national emergency hotlines
// @route   GET /api/v1/resources/hotlines or /api/resources/hotlines
// @access  Public
const getHotlines = async (req, res, next) => {
  try {
    const hotlines = [
      { name: 'National Emergency Number', category: 'HELPLINE', phone: '112', operatingHours: '24/7 Toll-Free' },
      { name: 'Police Control Room', category: 'POLICE', phone: '100', operatingHours: '24/7 Toll-Free' },
      { name: 'Medical Ambulance ER', category: 'AMBULANCE', phone: '102', operatingHours: '24/7 Toll-Free' },
      { name: 'Fire & Rescue Services', category: 'FIRE', phone: '101', operatingHours: '24/7 Toll-Free' },
      { name: 'National Disaster Helpline', category: 'HELPLINE', phone: '1078', operatingHours: '24/7 Toll-Free' }
    ];

    return res.json({
      success: true,
      count: hotlines.length,
      data: hotlines
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyResources,
  getHotlines
};

const Directory = require('../models/Directory');

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

// Seed sample directory entries if empty
const seedSampleDirectory = async () => {
  const count = await Directory.countDocuments();
  if (count === 0) {
    await Directory.create([
      {
        name: 'Central Police Station Dispatch',
        category: 'Police',
        phone: '100',
        address: 'Connaught Place, New Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        location: { type: 'Point', coordinates: [77.2167, 28.6315] },
        description: 'Primary 24/7 central police headquarters and emergency unit.',
        available: true,
        isDemoData: true
      },
      {
        name: 'AIIMS Emergency Medical Trauma Center',
        category: 'Hospitals',
        phone: '102',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
        latitude: 28.5672,
        longitude: 77.2100,
        location: { type: 'Point', coordinates: [77.2100, 28.5672] },
        description: 'Level 1 Trauma & Emergency Care Unit.',
        available: true,
        isDemoData: true
      },
      {
        name: 'Apollo 24/7 Pharmacy',
        category: 'Pharmacies',
        phone: '+91 11 2692 5858',
        address: 'Mathura Road, Sarita Vihar, New Delhi',
        latitude: 28.5398,
        longitude: 77.2840,
        location: { type: 'Point', coordinates: [77.2840, 28.5398] },
        description: 'Open 24 hours for prescription medications and first-aid supplies.',
        available: true,
        isDemoData: true
      },
      {
        name: 'Fire & Rescue HQ Station',
        category: 'Fire stations',
        phone: '101',
        address: 'Barakhamba Road, New Delhi',
        latitude: 28.6289,
        longitude: 77.2245,
        location: { type: 'Point', coordinates: [77.2245, 28.6289] },
        description: '24/7 Fire rescue team and hazmat emergency response.',
        available: true,
        isDemoData: true
      },
      {
        name: 'National Disaster Management Helpline',
        category: 'Disaster management',
        phone: '1078',
        address: 'NDMA Bhawan, A-1, Safdarjung Enclave, New Delhi',
        latitude: 28.5610,
        longitude: 77.1980,
        location: { type: 'Point', coordinates: [77.1980, 28.5610] },
        description: 'Official National Disaster Response Force (NDRF) helpline.',
        available: true,
        isDemoData: true
      },
      {
        name: 'KIRAN Mental Health Emergency Support',
        category: 'Mental health resources',
        phone: '1800-599-0019',
        address: 'National 24/7 Mental Health Helpline',
        latitude: 28.6139,
        longitude: 77.2090,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        description: 'Toll-free 24/7 psychological support and crisis counseling helpline.',
        available: true,
        isDemoData: true
      }
    ]);
  }
};

seedSampleDirectory().catch(e => console.warn('[Directory Seed Warning]', e.message));

// @desc    Get Directory entries with category, search, and distance filtering
// @route   GET /api/v1/directory or /api/directory
// @access  Public (or Optional Auth)
const getDirectoryEntries = async (req, res, next) => {
  try {
    const { category, search, lat, lng, radiusKm } = req.query;

    let query = {};
    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let entries = await Directory.find(query).sort({ createdAt: -1 });

    // Filter by radius if GPS lat/lng provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radius = parseFloat(radiusKm || '50');

      entries = entries.map(item => {
        const obj = item.toObject();
        obj.distanceKm = parseFloat(calculateDistanceKm(userLat, userLng, item.latitude, item.longitude).toFixed(2));
        return obj;
      }).filter(item => item.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Directory entry by ID
// @route   GET /api/v1/directory/:id or /api/directory/:id
// @access  Public
const getDirectoryEntryById = async (req, res, next) => {
  try {
    const entry = await Directory.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Directory entry not found' });
    }

    return res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Directory entry (Admin / Responder Only)
// @route   POST /api/v1/directory or /api/directory
// @access  Private (Admin)
const createDirectoryEntry = async (req, res, next) => {
  try {
    const { name, category, phone, address, latitude, longitude, description, available } = req.body;

    if (!name || !category || !phone || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, phone, address, latitude, and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const entry = await Directory.create({
      name: name.trim(),
      category,
      phone: phone.trim(),
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      location: { type: 'Point', coordinates: [lng, lat] },
      description: description ? description.trim() : '',
      available: available !== undefined ? Boolean(available) : true,
      isDemoData: false,
      createdBy: req.user?._id
    });

    return res.status(201).json({
      success: true,
      message: 'Directory entry created successfully',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Directory entry (Admin / Responder Only)
// @route   PUT /api/v1/directory/:id or /api/directory/:id
// @access  Private (Admin)
const updateDirectoryEntry = async (req, res, next) => {
  try {
    const entry = await Directory.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Directory entry not found' });
    }

    const { name, category, phone, address, latitude, longitude, description, available } = req.body;

    if (name) entry.name = name.trim();
    if (category) entry.category = category;
    if (phone) entry.phone = phone.trim();
    if (address) entry.address = address.trim();
    if (description !== undefined) entry.description = description.trim();
    if (available !== undefined) entry.available = Boolean(available);

    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      entry.latitude = lat;
      entry.longitude = lng;
      entry.location = { type: 'Point', coordinates: [lng, lat] };
    }

    await entry.save();

    return res.json({
      success: true,
      message: 'Directory entry updated successfully',
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Directory entry (Admin Only)
// @route   DELETE /api/v1/directory/:id or /api/directory/:id
// @access  Private (Admin)
const deleteDirectoryEntry = async (req, res, next) => {
  try {
    const entry = await Directory.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Directory entry not found' });
    }

    await entry.deleteOne();

    return res.json({
      success: true,
      message: 'Directory entry removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDirectoryEntries,
  getDirectoryEntryById,
  createDirectoryEntry,
  updateDirectoryEntry,
  deleteDirectoryEntry
};

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['POLICE', 'HOSPITAL', 'FIRE_STATION', 'HELPLINE', 'LEGAL_AID', 'SHELTER'], required: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.2090, 28.6139] } // Default: [lng, lat]
  },
  isNationalHotline: { type: Boolean, default: false },
  operatingHours: { type: String, default: '24/7' }
}, {
  timestamps: true
});

resourceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Resource', resourceSchema);

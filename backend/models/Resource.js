const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['POLICE', 'HOSPITAL', 'PHARMACY', 'FIRE', 'FIRE_STATION', 'AMBULANCE', 'HELPLINE', 'LEGAL_AID', 'SHELTER'], 
    required: true 
  },
  phone: { type: String, default: '', trim: true },
  address: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  latitude: { type: Number },
  longitude: { type: Number },
  isNationalHotline: { type: Boolean, default: false },
  operatingHours: { type: String, default: '24/7' },
  isVerified: { type: Boolean, default: true },
  source: { type: String, default: 'VERIFIED_DIRECTORY' }
}, {
  timestamps: true
});

resourceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Resource', resourceSchema);

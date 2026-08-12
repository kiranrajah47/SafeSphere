const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Police',
      'Hospitals',
      'Pharmacies',
      'Fire stations',
      'Ambulance',
      'Disaster management',
      'Mental health resources',
      'Other emergency services'
    ],
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  description: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  isDemoData: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

directorySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Directory', directorySchema);

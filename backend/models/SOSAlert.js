const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'RESOLVED'], default: 'ACTIVE', index: true },
  emergencyType: { type: String, enum: ['PANIC', 'MEDICAL', 'FIRE', 'CRIME', 'ACCIDENT'], default: 'PANIC' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String, default: 'Location details unavailable' }
  },
  locationHistory: [{
    coordinates: { type: [Number] },
    timestamp: { type: Date, default: Date.now }
  }],
  notes: { type: String, default: '' },
  contactsNotifiedCount: { type: Number, default: 0 },
  triggeredAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

sosAlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);

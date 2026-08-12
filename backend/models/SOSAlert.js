const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Alias for user
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'cancelled', 'ACTIVE', 'RESOLVED', 'CANCELLED'], 
    default: 'active', 
    lowercase: true,
    index: true 
  },
  emergencyType: { type: String, enum: ['PANIC', 'MEDICAL', 'FIRE', 'CRIME', 'ACCIDENT'], default: 'PANIC' },
  message: { type: String, default: '' },
  notes: { type: String, default: '' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String, default: 'Live Coordinates' }
  },
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    coordinates: [Number],
    timestamp: { type: Date, default: Date.now }
  }],
  contactsNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }],
  contactsNotifiedCount: { type: Number, default: 0 },
  notificationResult: {
    mode: { type: String, enum: ['MOCK_CONSOLE', 'TWILIO'], default: 'MOCK_CONSOLE' },
    status: { type: String, default: 'SIMULATED' },
    dispatchedAt: { type: Date, default: Date.now }
  },
  triggeredAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

sosAlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);

const mongoose = require('mongoose');

const safeJourneySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Alias
  destinationName: { type: String, required: true, trim: true },
  startLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  destinationLocation: {
    latitude: Number,
    longitude: Number,
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    updatedAt: { type: Date, default: Date.now }
  },
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  estimatedDurationMinutes: { type: Number, required: true },
  expectedArrivalTime: { type: Date, required: true },
  trustedContact: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' },
  trustedContactsNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }],
  isPaused: { type: Boolean, default: false },
  safetyCheckTriggered: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['in_progress', 'paused', 'completed', 'cancelled', 'overdue', 'escalated', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED', 'ALERT_TRIGGERED'],
    default: 'in_progress',
    lowercase: true,
    index: true
  },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  escalatedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('SafeJourney', safeJourneySchema);

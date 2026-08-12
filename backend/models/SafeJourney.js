const mongoose = require('mongoose');

const safeJourneySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  destinationName: { type: String, required: true },
  startLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  destinationLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  estimatedDurationMinutes: { type: Number, required: true },
  checkInIntervalMinutes: { type: Number, default: 15 },
  expectedArrivalTime: { type: Date, required: true },
  lastCheckInAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ALERT_TRIGGERED', 'CANCELLED'], default: 'IN_PROGRESS' },
  trustedContactsNotified: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('SafeJourney', safeJourneySchema);

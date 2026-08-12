const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: [
      'Accident',
      'Fire',
      'Crime',
      'Medical emergency',
      'Road hazard',
      'Suspicious activity',
      'Missing person',
      'Natural disaster',
      'Other'
    ],
    required: true,
    index: true
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String, default: 'Location details' }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    lowercase: true,
    index: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled', 'flagged'],
    default: 'active',
    lowercase: true,
    index: true
  },
  flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  flaggedCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

alertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', alertSchema);

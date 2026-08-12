const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  incidentType: {
    type: String,
    enum: [
      'Accident',
      'Theft',
      'Harassment',
      'Medical emergency',
      'Fire',
      'Road hazard',
      'Suspicious activity',
      'Missing person',
      'Other'
    ],
    required: true,
    index: true
  },
  category: { type: String }, // Alias
  description: { type: String, required: true, trim: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String, default: 'Location details' }
  },
  dateTime: { type: Date, default: Date.now },
  image: { type: String, default: '' },
  mediaUrls: [{ type: String }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'medium',
    lowercase: true
  },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'resolved', 'PENDING', 'VERIFIED', 'REJECTED', 'RESOLVED'],
    default: 'pending',
    lowercase: true,
    index: true
  },
  adminNotes: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, {
  timestamps: true
});

incidentReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);

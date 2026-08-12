const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['HARASSMENT', 'ACCIDENT', 'THEFT', 'HAZARD', 'SUSPICIOUS_ACTIVITY', 'NATURAL_DISASTER', 'OTHER'], 
    required: true 
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String, default: '' }
  },
  mediaUrls: [{ type: String }],
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'DISMISSED', 'RESOLVED'], default: 'PENDING' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

incidentReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);

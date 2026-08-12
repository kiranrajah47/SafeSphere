const mongoose = require('mongoose');

const communityAlertSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['WEATHER', 'SECURITY', 'INFRASTRUCTURE', 'CIVIL_DEFENSE', 'GENERAL'], default: 'GENERAL' },
  severity: { type: String, enum: ['INFO', 'WARNING', 'DANGER', 'CRITICAL'], default: 'INFO' },
  affectedArea: {
    center: { type: [Number], default: [0, 0] }, // [lng, lat]
    radiusKm: { type: Number, default: 10 }
  },
  expiresAt: { type: Date },
  isBroadcast: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CommunityAlert', communityAlertSchema);

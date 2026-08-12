const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: '' },
  isOtpVerified: { type: Boolean, default: false },
  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiresAt: { type: Date, default: null },
  medicalInfo: {
    bloodGroup: { type: String, default: 'Unknown' },
    allergies: { type: [String], default: [] },
    medicalConditions: { type: [String], default: [] },
    emergencyNotes: { type: String, default: '' }
  },
  emergencyContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }],
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [77.2090, 28.6139] }, // [lng, lat]
    lastUpdated: { type: Date, default: Date.now }
  },
  isSOSActive: { type: Boolean, default: false },
  notificationPreferences: {
    inApp: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sosAlerts: { type: Boolean, default: true },
    communityAlerts: { type: Boolean, default: true },
    journeyWarnings: { type: Boolean, default: true },
    incidentUpdates: { type: Boolean, default: true },
    resourceUpdates: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

userSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('User', userSchema);

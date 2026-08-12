const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetId: { type: String },
  details: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminLog', adminLogSchema);

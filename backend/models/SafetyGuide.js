const mongoose = require('mongoose');

const safetyGuideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // Full article markdown/text content
  type: { type: String, enum: ['ARTICLE', 'VIDEO'], required: true },
  categoryGroup: { type: String, enum: ['SAFETY', 'HEALTH'], required: true },
  category: { 
    type: String, 
    enum: [
      // Safety Categories
      'Personal safety',
      'Emergency preparedness',
      'Fire safety',
      'Road safety',
      'Travel safety',
      'Disaster preparedness',
      // Health Categories
      'First aid',
      'CPR',
      'Basic emergency response',
      'Mental wellbeing',
      'Accident response',
      'General health awareness'
    ],
    required: true,
    index: true
  },
  readTime: { type: String, default: '5 min read' },
  videoUrl: { type: String, default: '' },
  videoDuration: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  author: { type: String, default: 'SafeSphere Medical & Safety Board' },
  isPublished: { type: Boolean, default: true },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

safetyGuideSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('SafetyGuide', safetyGuideSchema);

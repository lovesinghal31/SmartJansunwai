const mongoose = require('mongoose');

const slaSettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  departmentId: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  responseTimeHours: { type: Number, required: true },
  resolutionTimeHours: { type: Number, required: true },
  escalationLevels: { type: Number, required: true },
  isActive: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SlaSettings', slaSettingsSchema);

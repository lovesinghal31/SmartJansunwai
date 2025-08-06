const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  headOfficialId: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  slaHours: { type: Number, required: true },
  isActive: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Department', departmentSchema);

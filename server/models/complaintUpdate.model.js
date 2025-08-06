const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  complaintId: { type: String, required: true },
  officialId: { type: String },
  message: { type: String, required: true },
  status: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComplaintUpdate', complaintUpdateSchema);

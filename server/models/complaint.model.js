const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  citizenId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, required: true },
  status: { type: String, required: true },
  assignedTo: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);

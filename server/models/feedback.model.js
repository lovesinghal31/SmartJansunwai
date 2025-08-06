const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  complaintId: { type: String, required: true },
  citizenId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

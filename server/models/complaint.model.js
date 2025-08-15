const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const complaintSchema = new mongoose.Schema({
  // --- New fields to add ---
  name: { type: String, required: true },
  contact: { type: String, required: true },
  password: { type: String, required: true, select: false }, // 'select: false' hides it from being returned in queries by default
  aiAnalysis: {
    priority: String,
    isComplaintValid: Boolean,
    suggestedCategory: String,
    estimatedResolutionDays: Number,
  },
  
  // --- Existing fields ---
  id: { type: String, required: true, unique: true },
  citizenId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, required: true }, // This will now be set by the AI
  status: { type: String, required: true, default: 'submitted' },
  assignedTo: { type: String },
  attachments: [{ type: String }],
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// --- Hashes password before saving a new complaint ---
complaintSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);

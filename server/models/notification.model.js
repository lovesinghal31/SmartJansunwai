import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String },
  metadata: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

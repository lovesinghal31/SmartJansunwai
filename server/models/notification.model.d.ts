import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: string;
  expiresAt?: Date;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
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

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

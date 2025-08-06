import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String },
  email: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;

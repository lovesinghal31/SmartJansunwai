import { Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  password: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

const User: Model<IUser>;
export default UserModel;

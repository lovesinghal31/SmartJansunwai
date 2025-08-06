import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/municipal_complaints';

export async function connectMongoose() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, {});
    console.log('Mongoose connected');
  }
}

// Script to update all existing complaints to have a status field if missing
// Run this with: node scripts/fix-complaint-status.js

// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({
    path: '../.env'
});
// const Complaint = require('../server/models/complaint.model');
import Complaint from '../server/models/complaint.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartjansunwai';

async function main() {
  await mongoose.connect(MONGO_URI);
  const result = await Complaint.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'submitted' } }
  );
  console.log(`Updated ${result.modifiedCount || result.nModified} complaints to add status.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

import { MongoClient, Db } from 'mongodb';
import * as schema from "@shared/schema";

let client: MongoClient;
let database: Db;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'municipal_complaints';

export async function connectToDatabase(): Promise<Db> {
  if (database) {
    return database;
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
  }

  database = client.db(DATABASE_NAME);
  
  // Create indexes for better performance
  await createIndexes(database);
  
  return database;
}

async function createIndexes(db: Db) {
  // User indexes
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  
  // Complaint indexes
  await db.collection('complaints').createIndex({ citizenId: 1 });
  await db.collection('complaints').createIndex({ status: 1 });
  await db.collection('complaints').createIndex({ category: 1 });
  await db.collection('complaints').createIndex({ createdAt: -1 });
  
  // Complaint updates indexes
  await db.collection('complaint_updates').createIndex({ complaintId: 1 });
  await db.collection('complaint_updates').createIndex({ createdAt: -1 });
  
  // Feedback indexes
  await db.collection('feedback').createIndex({ complaintId: 1 }, { unique: true });
  
  // Notification indexes
  await db.collection('notifications').createIndex({ userId: 1 });
  await db.collection('notifications').createIndex({ isRead: 1 });
  
  // Audit log indexes
  await db.collection('audit_logs').createIndex({ userId: 1 });
  await db.collection('audit_logs').createIndex({ createdAt: -1 });
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Export database instance
export { database as db };
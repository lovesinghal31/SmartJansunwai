import { MongoClient } from 'mongodb';

async function testDatabase() {
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('municipal_complaints');
    
    // Check complaints collection
    const complaints = await db.collection('complaints').find({}).toArray();
    console.log('Total complaints in database:', complaints.length);
    
    if (complaints.length > 0) {
      console.log('Sample complaint:', complaints[0]);
    }
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray();
    console.log('Total users in database:', users.length);
    
    const officials = users.filter(u => u.role === 'official');
    console.log('Officials in database:', officials.length);
    
    if (officials.length > 0) {
      console.log('Sample official:', officials[0]);
    }
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDatabase();

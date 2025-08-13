import { MongoClient } from 'mongodb';

async function fixStatusValues() {
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('municipal_complaints');
    
    // Update all complaints with 'pending' status to 'submitted'
    const result = await db.collection('complaints').updateMany(
      { status: 'pending' },
      { $set: { status: 'submitted' } }
    );
    
    console.log(`Updated ${result.modifiedCount} complaints from 'pending' to 'submitted'`);
    
    // Check current complaints
    const complaints = await db.collection('complaints').find({}).toArray();
    console.log('Current complaints:');
    complaints.forEach(complaint => {
      console.log(`- ${complaint.title}: ${complaint.category} (${complaint.status})`);
    });
    
    // Check current users
    const users = await db.collection('users').find({}).toArray();
    console.log('\nCurrent users:');
    users.forEach(user => {
      console.log(`- ${user.username}: ${user.role} (${user.department || 'no department'})`);
    });
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error fixing status values:', error);
  }
}

fixStatusValues();

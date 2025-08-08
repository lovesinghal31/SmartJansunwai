import { MongoClient } from 'mongodb';

async function fixPendingStatus() {
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('municipal_complaints');
    
    // Find complaints with 'pending' status
    const pendingComplaints = await db.collection('complaints').find({ status: 'pending' }).toArray();
    console.log(`Found ${pendingComplaints.length} complaints with 'pending' status`);
    
    if (pendingComplaints.length > 0) {
      // Update all complaints with 'pending' status to 'submitted'
      const result = await db.collection('complaints').updateMany(
        { status: 'pending' },
        { $set: { status: 'submitted' } }
      );
      
      console.log(`Updated ${result.modifiedCount} complaints from 'pending' to 'submitted'`);
    }
    
    // Show all complaints after update
    const allComplaints = await db.collection('complaints').find({}).toArray();
    console.log('\nAll complaints after update:');
    allComplaints.forEach(complaint => {
      console.log(`- ${complaint.title}: category=${complaint.category}, status=${complaint.status}`);
    });
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error fixing pending status:', error);
  }
}

fixPendingStatus();

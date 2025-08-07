const { MongoClient } = require('mongodb');

async function testFeedback() {
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('municipal_complaints');
    
    // Check complaints collection
    const complaints = await db.collection('complaints').find({}).toArray();
    console.log('Total complaints in database:', complaints.length);
    
    // Check feedback collection
    const feedback = await db.collection('feedback').find({}).toArray();
    console.log('Total feedback in database:', feedback.length);
    
    // Check users collection for citizens
    const users = await db.collection('users').find({}).toArray();
    const citizens = users.filter(u => u.role === 'citizen');
    console.log('Citizens in database:', citizens.length);
    
    // Check resolved complaints
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed');
    console.log('Resolved complaints:', resolvedComplaints.length);
    
    if (resolvedComplaints.length > 0) {
      console.log('Sample resolved complaint:', resolvedComplaints[0]);
    }
    
    if (citizens.length > 0) {
      console.log('Sample citizen:', citizens[0]);
    }
    
    if (feedback.length > 0) {
      console.log('Sample feedback:', feedback[0]);
    }
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Feedback test error:', error);
  }
}

testFeedback();

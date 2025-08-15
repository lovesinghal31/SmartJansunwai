import { MongoClient } from 'mongodb';

async function createTestComplaint() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('municipal_complaints');

  // Create a test complaint for road-transportation
  const testComplaint = {
    id: 'test-road-complaint',
    title: 'Test Road Complaint',
    description: 'This is a test complaint for road transportation',
    category: 'road-transportation',
    priority: 'medium',
    status: 'submitted', // Use valid status
    citizenId: 'test-citizen',
    location: 'Test Location',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Insert the test complaint
  await db.collection('complaints').insertOne(testComplaint);
  console.log('Test complaint created:', testComplaint);

  // Verify it was created
  const complaints = await db.collection('complaints').find({}).toArray();
  console.log(`Total complaints now: ${complaints.length}`);
  complaints.forEach(c => {
    console.log(`- ${c.title}: category="${c.category}", status="${c.status}"`);
  });

  await client.close();
}

createTestComplaint().catch(console.error);

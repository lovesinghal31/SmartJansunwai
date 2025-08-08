import { MongoClient } from 'mongodb';

async function quickFix() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('municipal_complaints');

  console.log('=== QUICK FIX ===');
  
  // Check current state
  const complaints = await db.collection('complaints').find({}).toArray();
  const users = await db.collection('users').find({}).toArray();
  
  console.log(`Complaints: ${complaints.length}`);
  complaints.forEach(c => console.log(`- ${c.title}: category="${c.category}", status="${c.status}"`));
  
  console.log(`\nUsers: ${users.length}`);
  users.forEach(u => console.log(`- ${u.username}: role="${u.role}", department="${u.department || 'none'}"`));
  
  // Fix any complaints with invalid status
  const validStatuses = ['submitted', 'in-progress', 'under-review', 'resolved'];
  for (const c of complaints) {
    if (!validStatuses.includes(c.status)) {
      console.log(`Fixing complaint "${c.title}" status from "${c.status}" to "submitted"`);
      await db.collection('complaints').updateOne(
        { id: c.id },
        { $set: { status: 'submitted' } }
      );
    }
  }
  
  // Ensure we have a test complaint for road-transportation
  const roadComplaint = complaints.find(c => c.category === 'road-transportation');
  if (!roadComplaint) {
    console.log('Creating test road complaint...');
    await db.collection('complaints').insertOne({
      id: 'test-road-' + Date.now(),
      title: 'Test Road Issue',
      description: 'Test complaint for road transportation',
      category: 'road-transportation',
      priority: 'medium',
      status: 'submitted',
      citizenId: 'test-citizen',
      location: 'Test Location',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  await client.close();
  console.log('Quick fix complete!');
}

quickFix().catch(console.error);

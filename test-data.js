import { MongoClient } from 'mongodb';

async function addTestData() {
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('municipal_complaints');
    
    // Add test complaints
    const testComplaints = [
      {
        id: 'complaint-1',
        title: 'Water Supply Issue',
        description: 'No water supply in Ward 1 for 3 days',
        category: 'water-supply',
        priority: 'high',
        status: 'submitted',
        citizenId: 'citizen-1',
        location: 'Ward 1, Indore',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'complaint-2',
        title: 'Road Pothole',
        description: 'Large pothole on main road causing traffic',
        category: 'road-transportation',
        priority: 'medium',
        status: 'in-progress',
        citizenId: 'citizen-2',
        location: 'Ward 2, Indore',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'complaint-4',
        title: 'Sanitation Issue',
        description: 'Garbage not being collected regularly',
        category: 'sanitation',
        priority: 'medium',
        status: 'under-review',
        citizenId: 'citizen-4',
        location: 'Ward 4, Indore',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'complaint-3',
        title: 'Street Light Not Working',
        description: 'Street light broken for 2 weeks',
        category: 'street-lighting',
        priority: 'low',
        status: 'resolved',
        citizenId: 'citizen-3',
        location: 'Ward 3, Indore',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Add test users
    const testUsers = [
      {
        id: 'official-1',
        username: 'water_official',
        password: 'hashed_password',
        role: 'official',
        department: 'Water Supply & Sewerage',
        email: 'water@indore.gov.in',
        phone: '+91 9876543210',
        createdAt: new Date()
      },
      {
        id: 'official-2',
        username: 'road_official',
        password: 'hashed_password',
        role: 'official',
        department: 'Roads & Transportation',
        email: 'roads@indore.gov.in',
        phone: '+91 9876543211',
        createdAt: new Date()
      },
      {
        id: 'official-3',
        username: 'light_official',
        password: 'hashed_password',
        role: 'official',
        department: 'Street Lighting',
        email: 'lighting@indore.gov.in',
        phone: '+91 9876543212',
        createdAt: new Date()
      }
    ];
    
    // Clear existing data
    await db.collection('complaints').deleteMany({});
    await db.collection('users').deleteMany({});
    
    // Insert test data
    await db.collection('complaints').insertMany(testComplaints);
    await db.collection('users').insertMany(testUsers);
    
    console.log('Test data added successfully');
    console.log('Added complaints:', testComplaints.length);
    console.log('Added users:', testUsers.length);
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

addTestData();

const { MongoClient } = require('mongodb');

async function testNotifications() {
  try {
    // Connect to MongoDB
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('municipal_complaints');
    
    // Check notifications collection
    const notifications = await db.collection('notifications').find({}).toArray();
    console.log('Total notifications in database:', notifications.length);
    
    // Check users collection
    const users = await db.collection('users').find({}).toArray();
    console.log('Total users in database:', users.length);
    
    if (notifications.length > 0) {
      console.log('Sample notification:', notifications[0]);
      
      // Check if the user ID in the notification exists
      const notificationUserId = notifications[0].userId;
      const userExists = users.find(u => u.id === notificationUserId);
      console.log('User ID from notification:', notificationUserId);
      console.log('User exists:', !!userExists);
      
      if (userExists) {
        console.log('User details:', {
          id: userExists.id,
          username: userExists.username,
          role: userExists.role
        });
      }
    }
    
    if (users.length > 0) {
      console.log('Sample user:', {
        id: users[0].id,
        username: users[0].username,
        role: users[0].role
      });
      
      // Check notifications for the first user
      const userNotifications = await db.collection('notifications').find({ userId: users[0].id }).toArray();
      console.log('Notifications for first user:', userNotifications.length);
    }
    
    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Notifications test error:', error);
  }
}

testNotifications();

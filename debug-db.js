const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb://localhost:27017/local-league-cricket';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db('local-league-cricket');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Test creating a user
    const users = db.collection('users');
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      createdAt: new Date()
    };
    
    const result = await users.insertOne(testUser);
    console.log('👤 Created test user:', result.insertedId);
    
    // Clean up
    await users.deleteOne({ _id: result.insertedId });
    console.log('🧹 Cleaned up test user');
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await client.close();
  }
}

testConnection();
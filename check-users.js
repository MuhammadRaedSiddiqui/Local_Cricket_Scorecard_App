const { MongoClient } = require('mongodb');

async function checkUsers() {
  const uri = 'mongodb://localhost:27017/local-league-cricket';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db('local-league-cricket');
    const users = db.collection('users');
    
    const userCount = await users.countDocuments();
    console.log('👥 Total users:', userCount);
    
    const allUsers = await users.find({}).toArray();
    console.log('📋 Users:');
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkUsers();
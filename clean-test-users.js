// List users in database
const { connectDB } = require('./lib/db');
const User = require('./models/User').default;

const listUsers = async () => {
  try {
    await connectDB();
    const users = await User.find({}, 'name email createdAt').lean();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Created: ${user.createdAt}`);
    });
    console.log(`Total users: ${users.length}`);
    
    // Clean up test users
    const testEmails = [
      'test@example.com',
      'testuser@example.com', 
      'john.doe@example.com',
      'jane.smith@example.com',
      'user@test.com',
      'cricket@test.com',
      'scorer@example.com'
    ];
    
    const result = await User.deleteMany({ 
      email: { $in: testEmails } 
    });
    
    console.log(`Deleted ${result.deletedCount} test users`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listUsers();
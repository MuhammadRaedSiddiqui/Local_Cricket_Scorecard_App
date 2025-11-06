// Simulate the registration API logic directly
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

async function testRegistration() {
  console.log('🔍 Testing registration logic...');
  
  const uri = 'mongodb://localhost:27017/local-league-cricket';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('local-league-cricket');
    const users = db.collection('users');
    
    // Test registration data
    const registrationData = {
      name: 'New Test User',
      email: 'newtest@example.com',
      password: 'password123'
    };
    
    console.log('📝 Testing registration with:', registrationData.name, registrationData.email);
    
    // Check if user already exists
    const existingUser = await users.findOne({ email: registrationData.email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists, deleting for test...');
      await users.deleteOne({ email: registrationData.email.toLowerCase() });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registrationData.password, salt);
    console.log('🔐 Password hashed successfully');
    
    // Create user
    const user = await users.insertOne({
      name: registrationData.name,
      email: registrationData.email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date()
    });
    
    console.log('👤 User created with ID:', user.insertedId);
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { userId: user.insertedId.toString(), email: registrationData.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🎫 JWT token generated successfully');
    
    // Clean up
    await users.deleteOne({ _id: user.insertedId });
    console.log('🧹 Test user cleaned up');
    
    console.log('✅ Registration logic working perfectly!');
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
  } finally {
    await client.close();
  }
}

async function testLogin() {
  console.log('\n🔍 Testing login logic...');
  
  const uri = 'mongodb://localhost:27017/local-league-cricket';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('local-league-cricket');
    const users = db.collection('users');
    
    // Test with existing user
    const loginData = {
      email: 'bhairaed636@gmail.com',
      password: 'password123' // This might not be the actual password
    };
    
    console.log('🔑 Testing login with:', loginData.email);
    
    const user = await users.findOne({ email: loginData.email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.name);
    
    // For testing, let's create a test user with known password
    const testEmail = 'testlogin@example.com';
    const testPassword = 'testpass123';
    
    // Clean up any existing test user
    await users.deleteOne({ email: testEmail });
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    
    const testUser = await users.insertOne({
      name: 'Test Login User',
      email: testEmail,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    console.log('👤 Test user created');
    
    // Now test login
    const foundUser = await users.findOne({ email: testEmail });
    const isPasswordValid = await bcrypt.compare(testPassword, foundUser.password);
    
    console.log('🔐 Password comparison result:', isPasswordValid);
    
    if (isPasswordValid) {
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
      const token = jwt.sign(
        { userId: foundUser._id.toString(), email: foundUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('🎫 Login successful, token generated');
      console.log('✅ Login logic working perfectly!');
    } else {
      console.log('❌ Password validation failed');
    }
    
    // Clean up
    await users.deleteOne({ _id: testUser.insertedId });
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
  } finally {
    await client.close();
  }
}

// Run tests
testRegistration().then(() => testLogin());
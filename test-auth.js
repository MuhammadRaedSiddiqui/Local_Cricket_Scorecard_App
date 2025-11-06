// Test authentication logic directly
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

async function testAuth() {
  console.log('🔍 Testing authentication logic...');
  
  const uri = 'mongodb://localhost:27017/local-league-cricket';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('local-league-cricket');
    const users = db.collection('users');
    
    // Test finding a user
    const testUser = await users.findOne({ email: 'bhairaed636@gmail.com' });
    if (testUser) {
      console.log('👤 Found user:', testUser.name, testUser.email);
      
      // Test password comparison
      const testPassword = 'password123';
      console.log('🔐 Testing password comparison...');
      
      // Since we don't know the actual password, let's check the structure
      console.log('🔑 User has password field:', !!testUser.password);
      console.log('🔑 Password length:', testUser.password?.length);
      
      // Test JWT creation
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
      console.log('🔐 JWT Secret exists:', !!JWT_SECRET);
      console.log('🔐 JWT Secret length:', JWT_SECRET.length);
      
      const token = jwt.sign(
        { userId: testUser._id.toString(), email: testUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('🎫 Generated JWT token:', token.substring(0, 50) + '...');
      
      // Test token verification
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified successfully:', decoded);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testAuth();
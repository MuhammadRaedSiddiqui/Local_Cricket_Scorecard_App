// Test with different email
const testRegistration = async () => {
  try {
    const timestamp = Date.now();
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${timestamp}@example.com`,
        password: 'password123'
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', data.error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testRegistration();
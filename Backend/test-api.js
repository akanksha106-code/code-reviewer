const axios = require('axios');

// Test user registration
async function testRegister() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      username: 'testuser3',
      email: 'test3@example.com',
      password: 'password123'
    });
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Server might not be running.');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
  }
}

// Test user login
async function testLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test3@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might not be running.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the tests
async function runTests() {
  // First test registration
  const registrationResult = await testRegister();
  
  // Then test login if registration worked or was already registered
  if (registrationResult || true) {
    await testLogin();
  }
}

runTests(); 
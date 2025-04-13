const http = require('http');

// First, check if the server is running
function checkServer() {
  console.log('Checking if server is running...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Server check STATUS: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Server is running! Response:', responseData);
      console.log('Now testing registration...');
      setTimeout(testRegister, 1000); // Wait 1 second before next request
    });
  });

  req.on('error', (e) => {
    console.error('ERROR: Server is not running or not accessible!');
    console.error('Error details:', e.message);
    console.error('Please make sure your server is running on port 3001.');
    console.error('Try restarting the server with: node server.js');
  });

  req.end();
}

// Test user registration
function testRegister() {
  console.log('Testing user registration...');
  
  const data = JSON.stringify({
    username: 'testuser4',
    email: 'test4@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Registration STATUS: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Registration Response:', responseData);
      // If registration was successful, try login
      if (res.statusCode === 201) {
        console.log('Registration successful! Now testing login...');
        setTimeout(testLogin, 1000); // Wait 1 second before next request
      } else {
        console.log('Registration failed or user already exists. Trying login anyway...');
        setTimeout(testLogin, 1000);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Registration Request error:', e.message);
  });

  req.write(data);
  req.end();
}

// Test user login
function testLogin() {
  console.log('Testing user login...');
  
  const data = JSON.stringify({
    email: 'test4@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Login STATUS: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Login Response:', responseData);
      if (res.statusCode === 200) {
        console.log('Login successful!');
      } else {
        console.log('Login failed.');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Login Request error:', e.message);
  });

  req.write(data);
  req.end();
}

// Start by checking if the server is running
console.log('======= API TEST SCRIPT =======');
console.log('This script will:');
console.log('1. Check if the server is running');
console.log('2. Test user registration');
console.log('3. Test user login');
console.log('=============================');
checkServer(); 
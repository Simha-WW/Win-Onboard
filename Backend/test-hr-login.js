require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testHRLogin() {
  console.log('\n=== TESTING HR LOGIN WITH EMAIL/PASSWORD ===\n');
  
  const loginData = {
    email: 'pulipatisimha@gmail.com',
    password: 'admin123'
  };
  
  console.log('Attempting HR login with:');
  console.log(`  Email: ${loginData.email}`);
  console.log(`  Password: ${loginData.password}\n`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/hr/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!\n');
    console.log('Response:');
    console.log(`  Success: ${response.data.success}`);
    console.log(`  Message: ${response.data.message}`);
    console.log(`  Token: ${response.data.token ? response.data.token.substring(0, 50) + '...' : 'N/A'}`);
    console.log('\nUser Details:');
    console.log(`  ID: ${response.data.user.id}`);
    console.log(`  Email: ${response.data.user.email}`);
    console.log(`  Name: ${response.data.user.firstName} ${response.data.user.lastName}`);
    console.log(`  Role: ${response.data.user.role}`);
    console.log(`  Department: ${response.data.user.department || 'N/A'}`);
    
    console.log('\n✅ HR Login endpoint is working correctly!\n');
    
    // Test with wrong password
    console.log('\n=== TESTING WITH WRONG PASSWORD ===\n');
    try {
      await axios.post(`${API_BASE_URL}/auth/hr/login`, {
        email: 'pulipatisimha@gmail.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected wrong password');
        console.log(`   Message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testHRLogin();

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testHRLoginEndpoint() {
  console.log('\n=== TESTING HR LOGIN ENDPOINT ===\n');
  
  const loginData = {
    email: 'pulipatisimha@gmail.com',
    password: 'admin@123'
  };
  
  console.log('Testing endpoint:', `${API_BASE_URL}/auth/hr/login`);
  console.log('Email:', loginData.email);
  console.log('Password:', loginData.password);
  console.log('');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/hr/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: null // Don't throw on any status
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ Login successful!');
      console.log('Token:', response.data.token ? response.data.token.substring(0, 50) + '...' : 'N/A');
      console.log('User:', response.data.user);
    } else {
      console.log('\n❌ Login failed');
      console.log('Error:', response.data.message || response.data);
    }
  } catch (error) {
    console.error('\n❌ Request failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testHRLoginEndpoint();

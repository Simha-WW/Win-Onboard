/**
 * Quick test for send to IT and vendor
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_FRESHER_ID = 13; // abhinay lakkireddy - doesn't have IT task yet

async function quickTest() {
  try {
    console.log('Testing Send to IT and Vendor functionality...\n');
    console.log(`Fresher ID: ${TEST_FRESHER_ID}`);
    console.log(`API URL: ${API_URL}/it/send-to-it\n`);

    const response = await axios.post(
      `${API_URL}/it/send-to-it`,
      { fresherId: TEST_FRESHER_ID },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('\nResponse:', JSON.stringify(response.data, null, 2));
    console.log('\n' + '='.repeat(60));
    console.log('Please check these email inboxes:');
    console.log('1. srivarshini929@gmail.com (IT team)');
    console.log('2. vijayasimhatest@gmail.com (Vendor)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

quickTest();

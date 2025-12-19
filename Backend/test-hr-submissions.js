/**
 * Test script for HR BGV submissions endpoint
 * Tests the /api/bgv/hr/submissions endpoint
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testHRSubmissions() {
  console.log('🧪 Testing HR BGV Submissions Endpoint\n');

  try {
    // Step 1: Login as HR user
    console.log('Step 1: Logging in as HR user...');
    const loginResponse = await axios.post(`${API_URL}/auth/hr-email`, {
      email: 'pulipatisimha@gmail.com'
    });

    if (!loginResponse.data.success) {
      console.error('❌ HR login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ HR login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Step 2: Fetch BGV submissions
    console.log('Step 2: Fetching BGV submissions...');
    const submissionsResponse = await axios.get(`${API_URL}/bgv/hr/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!submissionsResponse.data.success) {
      console.error('❌ Failed to fetch submissions:', submissionsResponse.data.message);
      return;
    }

    console.log('✅ Successfully fetched submissions');
    console.log(`Found ${submissionsResponse.data.data.length} submissions\n`);

    // Display submissions
    if (submissionsResponse.data.data.length === 0) {
      console.log('ℹ️  No BGV submissions found. This is expected if no freshers have submitted their BGV forms yet.');
    } else {
      console.log('📋 BGV Submissions:');
      submissionsResponse.data.data.forEach((sub, index) => {
        console.log(`\n${index + 1}. ${sub.first_name} ${sub.last_name}`);
        console.log(`   Email: ${sub.email}`);
        console.log(`   Designation: ${sub.designation}`);
        console.log(`   Status: ${sub.submission_status}`);
        console.log(`   Submitted: ${sub.submitted_at}`);
        console.log(`   Verifications: ${sub.verified_count}/${sub.total_verifications}`);
      });
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testHRSubmissions();

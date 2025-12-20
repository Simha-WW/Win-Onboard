/**
 * Test Vendor Verification Flow
 * 
 * This script tests the complete vendor verification workflow:
 * 1. Fetch BGV submissions with vendor status
 * 2. Test vendor-verify endpoint
 * 3. Test vendor-reject endpoint
 * 4. Verify status updates in the database
 */

const axios = require('axios');
const readline = require('readline');

const API_BASE_URL = 'http://localhost:3000/api';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function login() {
  console.log('🔐 Logging in as HR user...\n');
  
  const email = await question('Enter HR email: ');
  const password = await question('Enter HR password: ');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/hr/login`, {
      email: email.trim(),
      password: password.trim()
    });
    
    console.log('✅ Login successful!\n');
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

async function fetchBGVSubmissions(token) {
  console.log('📋 Fetching BGV submissions...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/bgv/hr/submissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const submissions = response.data;
    console.log(`Found ${submissions.length} submissions:\n`);
    
    submissions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.first_name} ${sub.last_name} (ID: ${sub.fresher_id})`);
      console.log(`   Email: ${sub.email}`);
      console.log(`   Sent to IT: ${sub.sent_to_it === 1 ? 'Yes' : 'No'}`);
      console.log(`   Vendor Verified: ${sub.vendor_verified === 1 ? 'Yes' : 'No'}`);
      console.log(`   Vendor Rejected: ${sub.vendor_rejected === 1 ? 'Yes' : 'No'}`);
      console.log(`   Status: ${getStatus(sub)}`);
      console.log('');
    });
    
    return submissions;
  } catch (error) {
    console.error('❌ Failed to fetch submissions:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

function getStatus(submission) {
  if (submission.vendor_verified === 1) return '✅ Verified by Vendor';
  if (submission.vendor_rejected === 1) return '❌ Rejected by Vendor';
  if (submission.sent_to_it === 1) return '📧 Sent to IT & Vendor (Pending Verification)';
  if (submission.verified_count === submission.total_verifications && submission.total_verifications > 0) {
    return '🎯 Ready to Send to IT & Vendor';
  }
  return '⏳ Pending Review';
}

async function testVendorVerify(token, fresherId) {
  console.log(`\n✅ Testing vendor-verify for fresher ID: ${fresherId}...\n`);
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/hr/vendor-verify`,
      { fresherId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testVendorReject(token, fresherId, reason) {
  console.log(`\n❌ Testing vendor-reject for fresher ID: ${fresherId}...\n`);
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/hr/vendor-reject`,
      { fresherId, reason },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Vendor Verification Flow Test\n');
  console.log('=' .repeat(50) + '\n');
  
  // Step 1: Login
  const token = await login();
  
  // Step 2: Fetch submissions
  const submissions = await fetchBGVSubmissions(token);
  
  if (submissions.length === 0) {
    console.log('No submissions found. Exiting...');
    rl.close();
    return;
  }
  
  // Step 3: Ask what action to take
  console.log('\nWhat would you like to test?');
  console.log('1. Verify a candidate');
  console.log('2. Reject a candidate');
  console.log('3. Both (verify one, reject another)');
  console.log('4. Exit');
  
  const choice = await question('\nEnter your choice (1-4): ');
  
  switch (choice.trim()) {
    case '1':
      const verifyId = await question('\nEnter Fresher ID to verify: ');
      await testVendorVerify(token, parseInt(verifyId));
      
      // Fetch again to see the update
      console.log('\n' + '='.repeat(50));
      console.log('📋 Updated submissions:');
      console.log('='.repeat(50) + '\n');
      await fetchBGVSubmissions(token);
      break;
      
    case '2':
      const rejectId = await question('\nEnter Fresher ID to reject: ');
      const reason = await question('Enter rejection reason: ');
      await testVendorReject(token, parseInt(rejectId), reason);
      
      // Fetch again to see the update
      console.log('\n' + '='.repeat(50));
      console.log('📋 Updated submissions:');
      console.log('='.repeat(50) + '\n');
      await fetchBGVSubmissions(token);
      break;
      
    case '3':
      const vId = await question('\nEnter Fresher ID to VERIFY: ');
      await testVendorVerify(token, parseInt(vId));
      
      const rId = await question('\nEnter Fresher ID to REJECT: ');
      const rReason = await question('Enter rejection reason: ');
      await testVendorReject(token, parseInt(rId), rReason);
      
      // Fetch again to see the updates
      console.log('\n' + '='.repeat(50));
      console.log('📋 Updated submissions:');
      console.log('='.repeat(50) + '\n');
      await fetchBGVSubmissions(token);
      break;
      
    case '4':
      console.log('\nExiting...');
      break;
      
    default:
      console.log('\nInvalid choice. Exiting...');
  }
  
  rl.close();
  console.log('\n✨ Test completed!\n');
}

// Run the test
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  rl.close();
  process.exit(1);
});

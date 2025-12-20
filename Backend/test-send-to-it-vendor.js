/**
 * Test Send to IT and Vendor functionality
 * This script tests the "Send to IT and Vendor" button functionality
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test data - replace with actual fresher ID from your system
const TEST_FRESHER_ID = 4; // Update this with a valid fresher ID

async function testSendToITAndVendor() {
  console.log('='.repeat(60));
  console.log('Testing Send to IT and Vendor Functionality');
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Verify fresher exists
    console.log('Step 1: Checking if fresher exists...');
    try {
      const fresherCheck = await axios.get(`${API_URL}/hr/freshers/${TEST_FRESHER_ID}`);
      console.log(`✅ Fresher found: ${fresherCheck.data.data?.first_name} ${fresherCheck.data.data?.last_name}`);
    } catch (error) {
      console.error('❌ Fresher not found. Please update TEST_FRESHER_ID with a valid fresher ID.');
      process.exit(1);
    }
    console.log();

    // Step 2: Send to IT and Vendor
    console.log('Step 2: Sending to IT and Vendor...');
    const response = await axios.post(
      `${API_URL}/it/send-to-it`,
      { fresherId: TEST_FRESHER_ID },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Successfully sent to IT and Vendor!');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      console.log();
      
      // Step 3: Verify IT task was created
      console.log('Step 3: Verifying IT task creation...');
      const itTaskResponse = await axios.get(`${API_URL}/it/tasks/fresher/${TEST_FRESHER_ID}`);
      
      if (itTaskResponse.data.success) {
        console.log('✅ IT task created successfully!');
        console.log('   Task ID:', itTaskResponse.data.data.id);
        console.log('   Sent Date:', itTaskResponse.data.data.sent_to_it_date);
      } else {
        console.log('⚠️ IT task not found');
      }
    } else {
      console.log('❌ Failed to send to IT and Vendor');
      console.log('   Error:', response.data.message);
    }
    console.log();

    // Step 4: Check emails
    console.log('Step 4: Email Verification');
    console.log('   ✉️ IT Team Email: Check inbox for equipment setup notification');
    console.log('   ✉️ Vendor Email (vijayasimhatest@gmail.com): Check inbox for document verification request');
    console.log();
    
    console.log('='.repeat(60));
    console.log('Test completed! Please check the email inboxes:');
    console.log('1. IT team members should receive equipment setup email');
    console.log('2. vijayasimhatest@gmail.com should receive document verification email');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Helper function to test with multiple freshers
async function testMultipleFreshers(fresherIds) {
  console.log('Testing with multiple freshers...');
  console.log();
  
  for (const fresherId of fresherIds) {
    console.log(`\n--- Testing Fresher ID: ${fresherId} ---`);
    try {
      const response = await axios.post(
        `${API_URL}/it/send-to-it`,
        { fresherId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data.success) {
        console.log(`✅ Success for fresher ${fresherId}`);
      } else {
        console.log(`❌ Failed for fresher ${fresherId}: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Error for fresher ${fresherId}: ${error.message}`);
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  if (args[0] === 'multiple') {
    // Test with multiple IDs: node test-send-to-it-vendor.js multiple 1,2,3
    const ids = args[1] ? args[1].split(',').map(id => parseInt(id.trim())) : [1, 2, 3];
    testMultipleFreshers(ids);
  } else {
    // Test with single ID: node test-send-to-it-vendor.js 5
    const fresherId = parseInt(args[0]);
    if (!isNaN(fresherId)) {
      TEST_FRESHER_ID = fresherId;
    }
    testSendToITAndVendor();
  }
} else {
  testSendToITAndVendor();
}

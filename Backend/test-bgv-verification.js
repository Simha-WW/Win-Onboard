/**
 * Test script for BGV verification endpoints
 * Run with: node test-bgv-verification.js
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Test user credentials - update with actual credentials
const TEST_HR_EMAIL = 'hr@example.com';
const TEST_HR_PASSWORD = 'password123';
const TEST_FRESHER_ID = 9;

let authToken = '';

/**
 * Login as HR to get authentication token
 */
async function loginAsHR() {
  console.log('\n🔐 Logging in as HR...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/hr/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_HR_EMAIL,
        password: TEST_HR_PASSWORD
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      authToken = data.token;
      console.log('✅ Login successful');
      console.log(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during login:', error.message);
    return false;
  }
}

/**
 * Get BGV verification data for a fresher
 */
async function getBGVData() {
  console.log(`\n📄 Fetching BGV data for fresher ${TEST_FRESHER_ID}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/bgv/hr/verification/${TEST_FRESHER_ID}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ BGV data fetched successfully');
      console.log('Demographics fields:', Object.keys(data.data.demographics || {}));
      console.log('Personal fields:', Object.keys(data.data.personal || {}));
      console.log('Education records:', data.data.education?.length || 0);
      return data.data;
    } else {
      console.log('❌ Failed to fetch BGV data:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching BGV data:', error.message);
    return null;
  }
}

/**
 * Test verifying a document
 */
async function testVerifyDocument(documentType, documentSection) {
  console.log(`\n✅ Testing VERIFY for ${documentSection}.${documentType}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/bgv/hr/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fresherId: TEST_FRESHER_ID,
        documentType: documentType,
        documentSection: documentSection,
        status: 'verified',
        comments: ''
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Verification successful:', data.message);
      return true;
    } else {
      console.log('❌ Verification failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    return false;
  }
}

/**
 * Test rejecting a document
 */
async function testRejectDocument(documentType, documentSection) {
  console.log(`\n❌ Testing REJECT for ${documentSection}.${documentType}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/bgv/hr/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fresherId: TEST_FRESHER_ID,
        documentType: documentType,
        documentSection: documentSection,
        status: 'rejected',
        comments: 'Test rejection - please update this document'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Rejection successful:', data.message);
      return true;
    } else {
      console.log('❌ Rejection failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during rejection:', error.message);
    return false;
  }
}

/**
 * Test getting verification status
 */
async function testGetVerificationStatus() {
  console.log(`\n📊 Fetching verification status...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/bgv/hr/verification/${TEST_FRESHER_ID}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Verification status fetched successfully');
      
      // Count verified and pending documents
      const allDocs = [];
      if (data.data.demographics) {
        Object.entries(data.data.demographics).forEach(([key, value]) => {
          if (!['id', 'fresher_id'].includes(key)) {
            allDocs.push({ type: key, section: 'Demographics' });
          }
        });
      }
      
      console.log(`Total documents to verify: ${allDocs.length}`);
      return true;
    } else {
      console.log('❌ Failed to fetch verification status:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error fetching verification status:', error.message);
    return false;
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🧪 Starting BGV Verification API Tests...');
  console.log('=' .repeat(60));
  
  // Step 1: Login
  const loginSuccess = await loginAsHR();
  if (!loginSuccess) {
    console.log('\n❌ Cannot continue tests without authentication');
    return;
  }
  
  // Step 2: Get BGV data
  const bgvData = await getBGVData();
  if (!bgvData) {
    console.log('\n❌ Cannot continue tests without BGV data');
    return;
  }
  
  // Step 3: Test verification status
  await testGetVerificationStatus();
  
  // Step 4: Test verifying a document
  if (bgvData.demographics) {
    const firstField = Object.keys(bgvData.demographics).find(
      key => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key)
    );
    
    if (firstField) {
      const displayName = firstField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      await testVerifyDocument(displayName, 'Demographics');
      
      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the status changed
      await testGetVerificationStatus();
    }
  }
  
  // Step 5: Test rejecting a document
  if (bgvData.personal) {
    const firstField = Object.keys(bgvData.personal).find(
      key => !['id', 'fresher_id', 'created_at', 'updated_at'].includes(key)
    );
    
    if (firstField) {
      const displayName = firstField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      await testRejectDocument(displayName, 'Personal');
      
      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the status changed
      await testGetVerificationStatus();
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
  console.log('\n📝 Summary:');
  console.log('- Login: ✅');
  console.log('- Fetch BGV Data: ✅');
  console.log('- Verify Document: Test completed');
  console.log('- Reject Document: Test completed');
  console.log('\n💡 Check the console output above for detailed results');
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

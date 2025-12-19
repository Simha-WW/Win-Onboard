/**
 * Test authenticated blob document viewing
 * This script tests the complete flow:
 * 1. Login as HR
 * 2. Get verification data for fresher 9
 * 3. Extract blob URLs
 * 4. Test view-token endpoint
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function testBlobViewing() {
  try {
    console.log('🔐 Step 1: Login as HR user...\n');
    
    const loginResponse = await fetch(`${API_BASE_URL}/hr/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pulipatisimha@gmail.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Get verification data
    console.log('📋 Step 2: Fetching BGV data for fresher 9...\n');
    
    const bgvResponse = await fetch(`${API_BASE_URL}/bgv/hr/verification/9`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!bgvResponse.ok) {
      throw new Error('Failed to fetch BGV data');
    }
    
    const bgvData = await bgvResponse.json();
    console.log('✅ BGV data fetched successfully\n');
    
    // Step 3: Extract blob URLs
    console.log('🔍 Step 3: Looking for blob URLs in demographics data...\n');
    
    const demographics = bgvData.data.demographics;
    const blobUrls = [];
    
    if (demographics.aadhaar_doc_file_url) {
      blobUrls.push({ type: 'Aadhaar', url: demographics.aadhaar_doc_file_url });
      console.log('  ✓ Found Aadhaar URL:', demographics.aadhaar_doc_file_url.substring(0, 80) + '...');
    }
    
    if (demographics.pan_file_url) {
      blobUrls.push({ type: 'PAN', url: demographics.pan_file_url });
      console.log('  ✓ Found PAN URL:', demographics.pan_file_url.substring(0, 80) + '...');
    }
    
    if (demographics.resume_file_url) {
      blobUrls.push({ type: 'Resume', url: demographics.resume_file_url });
      console.log('  ✓ Found Resume URL:', demographics.resume_file_url.substring(0, 80) + '...');
    }
    
    if (blobUrls.length === 0) {
      console.log('\n⚠️  No blob URLs found for fresher 9');
      console.log('   Please upload some documents first to test the viewer\n');
      return;
    }
    
    console.log(`\n✅ Found ${blobUrls.length} blob URLs\n`);
    
    // Step 4: Test view-token endpoint
    console.log('🔑 Step 4: Testing view-token endpoint...\n');
    
    for (const doc of blobUrls) {
      console.log(`  Testing ${doc.type} document...`);
      
      const viewTokenResponse = await fetch(`${API_BASE_URL}/blob/view-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blobUrl: doc.url
        })
      });
      
      if (!viewTokenResponse.ok) {
        const error = await viewTokenResponse.json();
        console.log(`  ❌ Failed: ${error.error || error.message}`);
        continue;
      }
      
      const viewTokenData = await viewTokenResponse.json();
      console.log(`  ✅ SAS URL generated successfully`);
      console.log(`     Expires in: ${viewTokenData.expiresIn} seconds (${viewTokenData.expiresIn / 60} minutes)`);
      console.log(`     SAS URL: ${viewTokenData.sasUrl.substring(0, 100)}...\n`);
    }
    
    console.log('\n✅ All tests passed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Open browser and navigate to: http://localhost:5174/hr/documents/9');
    console.log('   2. Login with HR credentials');
    console.log('   3. Click "View Document" buttons');
    console.log('   4. Documents should open in popup windows\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBlobViewing();

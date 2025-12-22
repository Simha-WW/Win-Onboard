/**
 * Test Policies API
 * Quick test to verify policies endpoint is working
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPolicies() {
  try {
    console.log('🧪 Testing Policies API...\n');

    // First login to get a token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'pulipati.simha@winwire.com',
        password: '1234'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Test policies endpoint
    console.log('2. Fetching policies...');
    const policiesResponse = await fetch(`${API_BASE_URL}/policies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!policiesResponse.ok) {
      throw new Error(`Policies fetch failed: ${policiesResponse.status}`);
    }

    const policiesData = await policiesResponse.json();
    console.log('✅ Policies fetched successfully\n');

    console.log('📄 Policy Documents:');
    console.log('='.repeat(80));
    
    policiesData.data.forEach((policy, index) => {
      console.log(`\n${index + 1}. ${policy.name}`);
      console.log(`   File: ${policy.fileName || 'N/A'}`);
      console.log(`   Type: ${policy.type}`);
      console.log(`   Size: ${policy.size}`);
      console.log(`   Status: ${policy.status}`);
      console.log(`   Available: ${policy.sasUrl ? 'Yes ✅' : 'No ❌'}`);
      if (policy.sasUrl) {
        console.log(`   SAS URL: ${policy.sasUrl.substring(0, 80)}...`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total policies: ${policiesData.data.length}`);
    console.log(`✅ Available PDFs: ${policiesData.data.filter(p => p.sasUrl).length}`);
    console.log(`❌ Placeholders: ${policiesData.data.filter(p => !p.sasUrl).length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testPolicies();

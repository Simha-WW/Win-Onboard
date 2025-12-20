/**
 * Test script for Documents API endpoints
 * Tests Employment History, Passport & Visa, and Bank/PF/NPS APIs
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/documents';

// You'll need to replace this with a valid token
// Get it by logging in as a fresher
const AUTH_TOKEN = 'your-jwt-token-here';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testEmploymentHistory() {
  console.log('\n📋 Testing Employment History API...');
  
  try {
    // Test POST - Save employment history
    const employmentData = [
      {
        company_name: 'Tech Corp',
        designation: 'Software Engineer',
        start_date: '2020-01-01',
        end_date: '2022-12-31',
        reason_for_leaving: 'Career growth',
        offer_letter_url: 'https://example.com/offer.pdf',
        experience_letter_url: 'https://example.com/exp.pdf',
        payslips_url: 'https://example.com/payslips.pdf'
      },
      {
        company_name: 'StartupXYZ',
        designation: 'Junior Developer',
        start_date: '2018-06-01',
        end_date: '2019-12-31',
        reason_for_leaving: 'Better opportunity',
        offer_letter_url: null,
        experience_letter_url: 'https://example.com/exp2.pdf',
        payslips_url: null
      }
    ];
    
    console.log('📤 Saving employment history...');
    const saveResponse = await axios.post(`${BASE_URL}/employment-history`, employmentData, { headers });
    console.log('✅ Save response:', saveResponse.data);
    
    // Test GET - Retrieve employment history
    console.log('📥 Retrieving employment history...');
    const getResponse = await axios.get(`${BASE_URL}/employment-history`, { headers });
    console.log('✅ Retrieved data:', JSON.stringify(getResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Employment History test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPassportVisa() {
  console.log('\n📋 Testing Passport & Visa API...');
  
  try {
    // Test POST - Save passport/visa info
    const passportData = {
      has_passport: true,
      passport_number: 'A12345678',
      passport_issue_date: '2018-01-15',
      passport_expiry_date: '2028-01-14',
      passport_copy_url: 'https://example.com/passport.pdf',
      has_visa: true,
      visa_type: 'H1B',
      visa_expiry_date: '2025-12-31',
      visa_document_url: 'https://example.com/visa.pdf'
    };
    
    console.log('📤 Saving passport/visa info...');
    const saveResponse = await axios.post(`${BASE_URL}/passport-visa`, passportData, { headers });
    console.log('✅ Save response:', saveResponse.data);
    
    // Test GET - Retrieve passport/visa info
    console.log('📥 Retrieving passport/visa info...');
    const getResponse = await axios.get(`${BASE_URL}/passport-visa`, { headers });
    console.log('✅ Retrieved data:', JSON.stringify(getResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Passport/Visa test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBankPfNps() {
  console.log('\n📋 Testing Bank/PF/NPS API...');
  
  try {
    // Test POST - Save bank/pf/nps info
    const bankData = {
      number_of_bank_accounts: 2,
      bank_account_number: '1234567890',
      ifsc_code: 'HDFC0001234',
      name_as_per_bank: 'John Doe',
      bank_name: 'HDFC Bank',
      branch: 'Bangalore Main Branch',
      cancelled_cheque_url: 'https://example.com/cheque.pdf',
      uan_pf_number: '101234567890',
      pran_nps_number: '123456789012'
    };
    
    console.log('📤 Saving bank/pf/nps info...');
    const saveResponse = await axios.post(`${BASE_URL}/bank-pf-nps`, bankData, { headers });
    console.log('✅ Save response:', saveResponse.data);
    
    // Test GET - Retrieve bank/pf/nps info
    console.log('📥 Retrieving bank/pf/nps info...');
    const getResponse = await axios.get(`${BASE_URL}/bank-pf-nps`, { headers });
    console.log('✅ Retrieved data:', JSON.stringify(getResponse.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Bank/PF/NPS test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Documents API Tests...');
  console.log('='.repeat(50));
  
  if (AUTH_TOKEN === 'your-jwt-token-here') {
    console.log('\n⚠️  WARNING: Please update AUTH_TOKEN in the script with a valid JWT token');
    console.log('   You can get a token by logging in as a fresher user');
    console.log('\n   Skipping tests...');
    return;
  }
  
  const results = {
    employmentHistory: await testEmploymentHistory(),
    passportVisa: await testPassportVisa(),
    bankPfNps: await testBankPfNps()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('  Employment History:', results.employmentHistory ? '✅ PASSED' : '❌ FAILED');
  console.log('  Passport & Visa:', results.passportVisa ? '✅ PASSED' : '❌ FAILED');
  console.log('  Bank/PF/NPS:', results.bankPfNps ? '✅ PASSED' : '❌ FAILED');
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'));
}

// Run the tests
runTests().catch(console.error);

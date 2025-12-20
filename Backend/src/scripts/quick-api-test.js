/**
 * Quick API test - Login and test Documents endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/fresher/login`, {
      email: 'saitharakreddyv59@gmail.com',
      password: 'Test@123'
    });
    
    if (response.data.success && response.data.data.token) {
      console.log('✅ Login successful');
      return response.data.data.token;
    } else {
      console.log('❌ Login failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testDocumentsEndpoints(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  console.log('\n📋 Testing Documents API endpoints...\n');
  
  // 1. Test Employment History
  console.log('1️⃣ Testing Employment History...');
  try {
    const employmentData = [{
      company_name: 'Acme Corp',
      designation: 'Software Developer',
      employment_start_date: '2021-01-01',
      employment_end_date: '2023-12-31',
      reason_for_leaving: 'Career growth',
      offer_letter_url: 'https://example.com/offer.pdf',
      experience_letter_url: 'https://example.com/exp.pdf',
      payslips_url: 'https://example.com/payslips.pdf'
    }];
    
    const saveResp = await axios.post(`${BASE_URL}/documents/employment-history`, 
      { employmentHistory: employmentData }, 
      { headers }
    );
    console.log('   ✅ POST /documents/employment-history:', saveResp.data.message);
    
    const getResp = await axios.get(`${BASE_URL}/documents/employment-history`, { headers });
    console.log('   ✅ GET /documents/employment-history:', getResp.data.data.length, 'records');
    
  } catch (error) {
    console.error('   ❌ Employment History failed:', error.response?.data || error.message);
  }
  
  // 2. Test Passport & Visa
  console.log('\n2️⃣ Testing Passport & Visa...');
  try {
    const passportData = {
      has_passport: true,
      passport_number: 'P1234567',
      passport_issue_date: '2020-01-15',
      passport_expiry_date: '2030-01-14',
      passport_copy_url: 'https://example.com/passport.pdf',
      has_visa: false,
      visa_type: null,
      visa_expiry_date: null,
      visa_document_url: null
    };
    
    const saveResp = await axios.post(`${BASE_URL}/documents/passport-visa`, passportData, { headers });
    console.log('   ✅ POST /documents/passport-visa:', saveResp.data.message);
    
    const getResp = await axios.get(`${BASE_URL}/documents/passport-visa`, { headers });
    console.log('   ✅ GET /documents/passport-visa:', getResp.data.data ? 'Data found' : 'No data');
    
  } catch (error) {
    console.error('   ❌ Passport & Visa failed:', error.response?.data || error.message);
  }
  
  // 3. Test Bank/PF/NPS
  console.log('\n3️⃣ Testing Bank/PF/NPS...');
  try {
    const bankData = {
      number_of_bank_accounts: 1,
      bank_account_number: '987654321',
      ifsc_code: 'SBIN0001234',
      name_as_per_bank: 'Test User',
      bank_name: 'State Bank of India',
      branch: 'Main Branch',
      cancelled_cheque_url: 'https://example.com/cheque.pdf',
      uan_pf_number: '101234567890',
      pran_nps_number: '123456789012'
    };
    
    const saveResp = await axios.post(`${BASE_URL}/documents/bank-pf-nps`, bankData, { headers });
    console.log('   ✅ POST /documents/bank-pf-nps:', saveResp.data.message);
    
    const getResp = await axios.get(`${BASE_URL}/documents/bank-pf-nps`, { headers });
    console.log('   ✅ GET /documents/bank-pf-nps:', getResp.data.data ? 'Data found' : 'No data');
    
  } catch (error) {
    console.error('   ❌ Bank/PF/NPS failed:', error.response?.data || error.message);
  }
  
  console.log('\n🎉 API tests completed!\n');
}

async function main() {
  const token = await login();
  if (token) {
    await testDocumentsEndpoints(token);
  } else {
    console.log('\n❌ Cannot run tests without valid token');
  }
}

main().catch(console.error);

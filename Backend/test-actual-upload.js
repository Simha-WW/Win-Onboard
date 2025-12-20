/**
 * Test Script: Actual File Upload Test
 * This script simulates a real file upload with the API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');
require('dotenv').config();

const API_BASE = 'http://localhost:3000/api';

const dbConfig = {
  server: process.env.DB_SERVER || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create a test PDF file as base64
function createTestPDF() {
  // Minimal PDF file content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
409
%%EOF`;

  return Buffer.from(pdfContent).toString('base64');
}

// Login and get token
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE}/auth/fresher`, {
      email: 'vijayasimha98@gmail.com',
      password: 'Simha@98'
    });
    
    if (response.data.success && response.data.data.token) {
      console.log('✅ Login successful');
      return response.data.data.token;
    } else {
      throw new Error('Login failed: No token received');
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    throw error;
  }
}

// Test passport/visa upload
async function testPassportUpload(token) {
  console.log('\n' + '='.repeat(60));
  console.log('📝 Testing Passport/Visa Upload');
  console.log('='.repeat(60));
  
  try {
    const testPdfBase64 = createTestPDF();
    
    const passportData = {
      passport_number: 'TEST' + Date.now(),
      date_of_issue: '2020-01-01',
      date_of_expiry: '2030-01-01',
      place_of_issue: 'Mumbai',
      passport_copy_file: `data:application/pdf;base64,${testPdfBase64}`,
      passport_copy_file_name: `test-passport-${Date.now()}.pdf`,
      has_visa: true,
      visa_type: 'Tourist',
      visa_country: 'USA',
      visa_valid_from: '2024-01-01',
      visa_valid_to: '2025-01-01',
      visa_document_file: `data:application/pdf;base64,${testPdfBase64}`,
      visa_document_file_name: `test-visa-${Date.now()}.pdf`
    };
    
    console.log('📤 Sending passport data with files...');
    console.log('   Passport Number:', passportData.passport_number);
    console.log('   Passport File Name:', passportData.passport_copy_file_name);
    console.log('   Visa File Name:', passportData.visa_document_file_name);
    
    const response = await axios.post(
      `${API_BASE}/bgv/passport-visa`,
      passportData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response:', response.data);
    
    // Wait a bit for database to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check database
    console.log('\n🔍 Checking database...');
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1 
        fresher_id,
        passport_number,
        passport_copy_url,
        visa_document_url,
        updated_at
      FROM passport_visa
      ORDER BY updated_at DESC
    `);
    
    if (result.recordset.length > 0) {
      const record = result.recordset[0];
      console.log('\n📊 Database Record:');
      console.log('   Fresher ID:', record.fresher_id);
      console.log('   Passport Number:', record.passport_number);
      console.log('   Passport URL:', record.passport_copy_url);
      console.log('   Visa URL:', record.visa_document_url);
      console.log('   Updated:', record.updated_at);
      
      if (record.passport_copy_url && record.passport_copy_url.includes('.blob.core.windows.net')) {
        console.log('\n✅ SUCCESS: Passport file uploaded to blob storage!');
      } else {
        console.log('\n❌ FAIL: Passport URL not a blob URL:', record.passport_copy_url);
      }
      
      if (record.visa_document_url && record.visa_document_url.includes('.blob.core.windows.net')) {
        console.log('✅ SUCCESS: Visa file uploaded to blob storage!');
      } else {
        console.log('❌ FAIL: Visa URL not a blob URL:', record.visa_document_url);
      }
    } else {
      console.log('❌ No records found in database');
    }
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test banking upload
async function testBankingUpload(token) {
  console.log('\n' + '='.repeat(60));
  console.log('💳 Testing Bank/PF/NPS Upload');
  console.log('='.repeat(60));
  
  try {
    const testPdfBase64 = createTestPDF();
    
    const bankingData = {
      bank_name: 'Test Bank',
      branch_name: 'Test Branch',
      account_number: 'TEST' + Date.now(),
      ifsc_code: 'TEST0001234',
      account_holder_name: 'Test User',
      cancelled_cheque_file: `data:application/pdf;base64,${testPdfBase64}`,
      cancelled_cheque_file_name: `test-cheque-${Date.now()}.pdf`,
      pf_uan_number: 'UAN' + Date.now(),
      pran_number: 'PRAN' + Date.now()
    };
    
    console.log('📤 Sending banking data with file...');
    console.log('   Bank Name:', bankingData.bank_name);
    console.log('   Account Number:', bankingData.account_number);
    console.log('   Cheque File Name:', bankingData.cancelled_cheque_file_name);
    
    const response = await axios.post(
      `${API_BASE}/bgv/bank-pf-nps`,
      bankingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response:', response.data);
    
    // Wait a bit for database to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check database
    console.log('\n🔍 Checking database...');
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT TOP 1 
        fresher_id,
        bank_name,
        bank_account_number,
        cancelled_cheque_url,
        updated_at
      FROM bank_pf_nps
      ORDER BY updated_at DESC
    `);
    
    if (result.recordset.length > 0) {
      const record = result.recordset[0];
      console.log('\n📊 Database Record:');
      console.log('   Fresher ID:', record.fresher_id);
      console.log('   Bank Name:', record.bank_name);
      console.log('   Account Number:', record.bank_account_number);
      console.log('   Cheque URL:', record.cancelled_cheque_url);
      console.log('   Updated:', record.updated_at);
      
      if (record.cancelled_cheque_url && record.cancelled_cheque_url.includes('.blob.core.windows.net')) {
        console.log('\n✅ SUCCESS: Cheque file uploaded to blob storage!');
      } else {
        console.log('\n❌ FAIL: Cheque URL not a blob URL:', record.cancelled_cheque_url);
      }
    } else {
      console.log('❌ No records found in database');
    }
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Actual File Upload Tests\n');
  
  try {
    const token = await login();
    
    await testPassportUpload(token);
    await testBankingUpload(token);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };

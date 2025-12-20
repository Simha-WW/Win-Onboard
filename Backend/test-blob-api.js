/**
 * Test Blob Upload API
 * Tests the complete flow including demographics save with file uploads
 */

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';

// Create a simple test PDF file
function createTestPDF() {
  const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R \n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Times-Roman\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000261 00000 n \n0000000349 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n444\n%%EOF');
  return pdfContent;
}

async function testBlobUpload() {
  try {
    console.log('🧪 Testing Blob Upload API\n');

    // Step 1: Login to get auth token
    console.log('1️⃣ Logging in to get auth token...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vijayasimhatest@gmail.com',
        password: 'test123' // Update with actual password
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Login failed:', error);
      console.log('\n⚠️ Please update the password in the test script or try another user');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, got auth token\n');

    // Step 2: Create test file (base64)
    console.log('2️⃣ Creating test PDF file...');
    const testPDF = createTestPDF();
    const base64PDF = testPDF.toString('base64');
    console.log('✅ Test PDF created (size:', testPDF.length, 'bytes)\n');

    // Step 3: Save demographics with file uploads
    console.log('3️⃣ Saving demographics with file uploads...');
    const demographicsData = {
      salutation: 'Mr',
      first_name: 'Test',
      middle_name: 'Middle',
      last_name: 'User',
      name_for_records: 'Test Middle User',
      dob_as_per_records: '1990-01-01',
      celebrated_dob: '1990-01-01',
      gender: 'Male',
      blood_group: 'O+',
      whatsapp_number: '9876543210',
      linkedin_url: 'https://linkedin.com/in/testuser',
      aadhaar_card_number: '123456789012',
      pan_card_number: 'ABCDE1234F',
      comm_house_number: '123',
      comm_street_name: 'Test Street',
      comm_city: 'Test City',
      comm_district: 'Test District',
      comm_state: 'Test State',
      comm_country: 'India',
      comm_pin_code: '560001',
      perm_same_as_comm: true,
      perm_house_number: '123',
      perm_street_name: 'Test Street',
      perm_city: 'Test City',
      perm_district: 'Test District',
      perm_state: 'Test State',
      perm_country: 'India',
      perm_pin_code: '560001',
      // File uploads
      aadhaar_file_data: base64PDF,
      aadhaar_file_name: 'test_aadhaar.pdf',
      aadhaar_file_type: 'application/pdf',
      aadhaar_file_size: testPDF.length,
      pan_file_data: base64PDF,
      pan_file_name: 'test_pan.pdf',
      pan_file_type: 'application/pdf',
      pan_file_size: testPDF.length,
      resume_file_data: base64PDF,
      resume_file_name: 'test_resume.pdf',
      resume_file_type: 'application/pdf',
      resume_file_size: testPDF.length
    };

    const saveResponse = await fetch(`${API_BASE}/bgv/demographics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(demographicsData)
    });

    const saveData = await saveResponse.json();
    
    if (!saveResponse.ok) {
      console.error('❌ Demographics save failed:', saveData);
      return;
    }

    console.log('✅ Demographics saved successfully\n');
    console.log('📊 Response:', JSON.stringify(saveData, null, 2));

    // Step 4: Check if files were uploaded to blob and URLs saved to DB
    console.log('\n4️⃣ Verifying blob upload and database update...');
    
    const mssql = require('mssql');
    const mssqlConfig = {
      server: process.env.SERVER_NAME,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    };

    const pool = await mssql.connect(mssqlConfig);
    const result = await pool.request().query(`
      SELECT TOP 1 
        aadhaar_doc_file_url, 
        pan_file_url, 
        resume_file_url,
        aadhaar_file_name,
        pan_file_name,
        resume_file_name
      FROM bgv_demographics 
      ORDER BY created_at DESC
    `);

    if (result.recordset.length === 0) {
      console.log('❌ No demographics record found');
      return;
    }

    const demo = result.recordset[0];
    console.log('\n📋 Database Record:');
    console.log('- Aadhaar URL:', demo.aadhaar_doc_file_url || '❌ NULL');
    console.log('- PAN URL:', demo.pan_file_url || '❌ NULL');
    console.log('- Resume URL:', demo.resume_file_url || '❌ NULL');
    console.log('- Aadhaar File Name:', demo.aadhaar_file_name || '❌ NULL');
    console.log('- PAN File Name:', demo.pan_file_name || '❌ NULL');
    console.log('- Resume File Name:', demo.resume_file_name || '❌ NULL');

    const allFilesUploaded = demo.aadhaar_doc_file_url && demo.pan_file_url && demo.resume_file_url;
    
    console.log('\n' + (allFilesUploaded ? '✅ SUCCESS: All files uploaded to blob and URLs saved to database!' : '❌ FAILURE: Some file URLs are missing'));

    await pool.close();

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBlobUpload();

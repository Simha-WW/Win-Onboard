/**
 * Complete test for document upload flow
 * Tests: base64 file -> backend -> blob storage -> database
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Create a test PDF file
function createTestPDF() {
  const pdfContent = Buffer.from([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, // %PDF-1.4
    0x0a, 0x25, 0xc3, 0xa4, 0xc3, 0xbc, 0xc3, 0xb6, // header
    0x0a, 0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, // 1 0 obj
    0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65  // <</Type
  ]);
  return pdfContent;
}

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Document Upload Flow\n');

    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.token) {
      console.error('❌ Login failed. Creating test user first...');
      
      // Try to get any existing fresher token
      const mssql = require('mssql');
      const config = {
        server: process.env.SERVER_NAME || 'localhost',
        database: process.env.DB_NAME || 'hackathon',
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
          requestTimeout: 30000,
          connectTimeout: 30000
        },
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
      };

      if (process.env.DB_USERNAME) {
        config.user = process.env.DB_USERNAME;
        config.password = process.env.DB_PASSWORD;
      } else {
        config.options.trustedConnection = true;
      }

      const pool = await mssql.connect(config);
      
      // Get a test fresher
      const result = await pool.request().query(`
        SELECT TOP 1 fresher_id, email_id FROM freshers_table
      `);

      if (result.recordset.length === 0) {
        console.error('❌ No freshers in database. Please create one first.');
        process.exit(1);
      }

      const testFresher = result.recordset[0];
      console.log('✅ Using fresher:', testFresher.fresher_id, testFresher.email_id);
      
      // Create JWT token manually for testing
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          id: testFresher.fresher_id,
          email: testFresher.email_id,
          role: 'fresher'
        },
        process.env.JWT_SECRET || 'winonboard_development_secret_key_change_in_production_minimum_32_chars',
        { expiresIn: '24h' }
      );

      loginData.token = token;
      loginData.user = { id: testFresher.fresher_id, email: testFresher.email_id };
      
      await pool.close();
    }

    const token = loginData.token;
    const fresherId = loginData.user.id;
    console.log('✅ Logged in. Fresher ID:', fresherId);

    // Step 2: Create test PDF file
    console.log('\nStep 2: Creating test PDF files...');
    const aadhaarPDF = createTestPDF();
    const panPDF = createTestPDF();
    const resumePDF = createTestPDF();
    
    const aadhaarBase64 = aadhaarPDF.toString('base64');
    const panBase64 = panPDF.toString('base64');
    const resumeBase64 = resumePDF.toString('base64');
    
    console.log('✅ Test files created');
    console.log('   Aadhaar size:', aadhaarBase64.length, 'bytes');
    console.log('   PAN size:', panBase64.length, 'bytes');
    console.log('   Resume size:', resumeBase64.length, 'bytes');

    // Step 3: Submit demographics with files
    console.log('\nStep 3: Submitting demographics with files...');
    const demographicsData = {
      salutation: 'Mr',
      first_name: 'Test',
      middle_name: 'User',
      last_name: 'Upload',
      name_for_records: 'Test User Upload',
      dob_as_per_records: '1995-01-15',
      celebrated_dob: '1995-01-15',
      gender: 'Male',
      blood_group: 'O+',
      whatsapp_number: '9876543210',
      linkedin_url: 'https://linkedin.com/in/testuser',
      aadhaar_card_number: '123456789012',
      pan_card_number: 'ABCDE1234F',
      
      // File data
      aadhaar_file_data: aadhaarBase64,
      aadhaar_file_name: 'test_aadhaar.pdf',
      aadhaar_file_type: 'application/pdf',
      aadhaar_file_size: aadhaarPDF.length,
      
      pan_file_data: panBase64,
      pan_file_name: 'test_pan.pdf',
      pan_file_type: 'application/pdf',
      pan_file_size: panPDF.length,
      
      resume_file_data: resumeBase64,
      resume_file_name: 'test_resume.pdf',
      resume_file_type: 'application/pdf',
      resume_file_size: resumePDF.length,
      
      // Address
      comm_house_number: '123',
      comm_street_name: 'Test Street',
      comm_city: 'Test City',
      comm_district: 'Test District',
      comm_state: 'Test State',
      comm_country: 'India',
      comm_pin_code: '123456',
      perm_same_as_comm: true
    };

    const demographicsResponse = await fetch('http://localhost:3000/api/bgv/demographics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(demographicsData)
    });

    const demographicsResult = await demographicsResponse.json();
    
    if (!demographicsResponse.ok) {
      console.error('❌ Demographics submission failed:', demographicsResult);
      process.exit(1);
    }

    console.log('✅ Demographics submitted successfully');
    console.log('   Response:', JSON.stringify(demographicsResult, null, 2));

    // Step 4: Verify in database
    console.log('\nStep 4: Verifying in database...');
    const mssql = require('mssql');
    const config = {
      server: process.env.SERVER_NAME || 'localhost',
      database: process.env.DB_NAME || 'hackathon',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
        connectTimeout: 30000
      },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
    };

    if (process.env.DB_USERNAME) {
      config.user = process.env.DB_USERNAME;
      config.password = process.env.DB_PASSWORD;
    } else {
      config.options.trustedConnection = true;
    }

    const pool = await mssql.connect(config);
    
    const dbResult = await pool.request()
      .input('fresherId', mssql.Int, fresherId)
      .query(`
        SELECT 
          aadhaar_doc_file_url,
          pan_file_url,
          resume_file_url,
          aadhaar_file_name,
          pan_file_name,
          resume_file_name
        FROM bgv_demographics d
        JOIN bgv_submissions s ON d.submission_id = s.id
        WHERE s.fresher_id = @fresherId
      `);

    if (dbResult.recordset.length === 0) {
      console.error('❌ No demographics found in database');
      process.exit(1);
    }

    const dbData = dbResult.recordset[0];
    console.log('✅ Database record found:');
    console.log('   Aadhaar URL:', dbData.aadhaar_doc_file_url);
    console.log('   Aadhaar Name:', dbData.aadhaar_file_name);
    console.log('   PAN URL:', dbData.pan_file_url);
    console.log('   PAN Name:', dbData.pan_file_name);
    console.log('   Resume URL:', dbData.resume_file_url);
    console.log('   Resume Name:', dbData.resume_file_name);

    // Check if URLs are present
    if (dbData.aadhaar_doc_file_url && dbData.pan_file_url && dbData.resume_file_url) {
      console.log('\n✅✅✅ SUCCESS! Files uploaded to blob storage and URLs saved to database!');
    } else {
      console.log('\n⚠️ WARNING: Some file URLs are missing:');
      if (!dbData.aadhaar_doc_file_url) console.log('   - Aadhaar URL is NULL');
      if (!dbData.pan_file_url) console.log('   - PAN URL is NULL');
      if (!dbData.resume_file_url) console.log('   - Resume URL is NULL');
    }

    await pool.close();

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

testCompleteFlow();

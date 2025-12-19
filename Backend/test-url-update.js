const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testUrlUpdate() {
  let pool;
  try {
    console.log('📡 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected\n');

    // Test 1: Check current values
    console.log('🔍 Current values for fresher_id = 9:');
    const current = await pool.request().query(`
      SELECT fresher_id, aadhaar_doc_file_url, pan_file_url, resume_file_url 
      FROM bgv_demographics 
      WHERE fresher_id = 9
    `);
    console.log(JSON.stringify(current.recordset, null, 2));
    console.log('');

    // Test 2: Try direct UPDATE with test URLs
    console.log('🧪 Testing direct UPDATE with test URLs...');
    const testAadhaarUrl = 'https://winbuildwinonboard.blob.core.windows.net/winbuild-winonboard/test/aadhaar.pdf';
    const testPanUrl = 'https://winbuildwinonboard.blob.core.windows.net/winbuild-winonboard/test/pan.pdf';
    const testResumeUrl = 'https://winbuildwinonboard.blob.core.windows.net/winbuild-winonboard/test/resume.pdf';

    await pool.request()
      .input('aadhaarUrl', sql.NVarChar(1000), testAadhaarUrl)
      .input('panUrl', sql.NVarChar(1000), testPanUrl)
      .input('resumeUrl', sql.NVarChar(1000), testResumeUrl)
      .input('fresherId', sql.Int, 9)
      .query(`
        UPDATE bgv_demographics SET
          aadhaar_doc_file_url = @aadhaarUrl,
          pan_file_url = @panUrl,
          resume_file_url = @resumeUrl
        WHERE fresher_id = @fresherId
      `);
    
    console.log('✅ UPDATE executed\n');

    // Test 3: Verify update worked
    console.log('🔍 Values after UPDATE:');
    const after = await pool.request().query(`
      SELECT fresher_id, aadhaar_doc_file_url, pan_file_url, resume_file_url 
      FROM bgv_demographics 
      WHERE fresher_id = 9
    `);
    console.log(JSON.stringify(after.recordset, null, 2));

    if (after.recordset[0].aadhaar_doc_file_url) {
      console.log('\n✅ SUCCESS: URLs are being saved correctly!');
      console.log('The issue must be in how the URLs are being passed from the upload result.');
    } else {
      console.log('\n❌ FAILED: Even direct UPDATE didn\'t work. Database column issue?');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n📡 Connection closed');
    }
  }
}

testUrlUpdate();

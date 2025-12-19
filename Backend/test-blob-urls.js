/**
 * Test script to check blob URLs in database
 */

require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function testBlobUrls() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);
    
    console.log('✅ Connected successfully\n');
    
    // Check for blob URLs in bgv_demographics
    console.log('📋 Checking bgv_demographics table for blob URLs...\n');
    const result = await pool.request().query(`
      SELECT TOP 5 
        fresher_id,
        aadhaar_doc_file_url,
        pan_file_url,
        resume_file_url
      FROM bgv_demographics
      WHERE aadhaar_doc_file_url IS NOT NULL 
         OR pan_file_url IS NOT NULL 
         OR resume_file_url IS NOT NULL
      ORDER BY fresher_id DESC
    `);
    
    if (result.recordset.length === 0) {
      console.log('❌ No blob URLs found in database');
      console.log('   Upload some documents first to test the viewer');
    } else {
      console.log(`✅ Found ${result.recordset.length} records with blob URLs:\n`);
      
      result.recordset.forEach(record => {
        console.log(`Fresher ID: ${record.fresher_id}`);
        if (record.aadhaar_doc_file_url) {
          console.log(`  Aadhaar: ${record.aadhaar_doc_file_url.substring(0, 60)}...`);
        }
        if (record.pan_file_url) {
          console.log(`  PAN: ${record.pan_file_url.substring(0, 60)}...`);
        }
        if (record.resume_file_url) {
          console.log(`  Resume: ${record.resume_file_url.substring(0, 60)}...`);
        }
        console.log('');
      });
      
      console.log('\n📝 Test Instructions:');
      console.log('1. Navigate to: http://localhost:5174/hr/documents/' + result.recordset[0].fresher_id);
      console.log('2. Look for documents with "View Document" buttons');
      console.log('3. Click "View Document" to test authenticated blob viewing');
      console.log('4. Document should open in a popup window\n');
    }
    
    // Check educational documents with URLs
    console.log('📋 Checking educational_details table for blob URLs...\n');
    const eduResult = await pool.request().query(`
      SELECT TOP 5
        id,
        fresher_id,
        qualification,
        document_urls
      FROM educational_details
      WHERE document_urls IS NOT NULL
      ORDER BY fresher_id DESC
    `);
    
    if (eduResult.recordset.length > 0) {
      console.log(`✅ Found ${eduResult.recordset.length} educational records with document URLs:\n`);
      eduResult.recordset.forEach(record => {
        console.log(`Fresher ID: ${record.fresher_id}, Qualification: ${record.qualification}`);
        console.log(`  URLs: ${record.document_urls.substring(0, 60)}...`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No educational documents with URLs found yet\n');
    }
    
    await sql.close();
    console.log('✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBlobUrls();

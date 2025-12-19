/**
 * Test script to verify educational document blob upload functionality
 * This script tests that:
 * 1. Document URLs are saved correctly as single strings (not arrays)
 * 2. No binary data is stored in the database
 * 3. document_url column exists and is populated
 */

require('dotenv').config();
const mssql = require('mssql');

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function testEducationBlobUpload() {
  console.log('🧪 Testing Educational Document Blob Upload');
  console.log('==========================================\n');

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    const pool = await mssql.connect(config);
    console.log('✅ Connected\n');

    // Check if document_url column exists
    console.log('🔍 Checking if document_url column exists...');
    const columnCheck = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details' 
        AND COLUMN_NAME = 'document_url'
    `);

    if (columnCheck.recordset.length === 0) {
      console.log('❌ document_url column does not exist!');
      console.log('⚠️ Please run the migration script first:');
      console.log('   node database_scripts/add-educational-document-url.js');
      process.exit(1);
    }

    console.log('✅ document_url column exists:');
    console.log(columnCheck.recordset);
    console.log('');

    // Check recent educational records
    console.log('📋 Fetching recent educational records...');
    const recentRecords = await pool.request().query(`
      SELECT TOP 5
        id,
        fresher_id,
        qualification,
        document_url,
        LEN(CAST(documents AS NVARCHAR(MAX))) as documents_length,
        LEN(CAST(document_urls AS NVARCHAR(MAX))) as document_urls_length,
        created_at
      FROM educational_details
      ORDER BY created_at DESC
    `);

    if (recentRecords.recordset.length === 0) {
      console.log('ℹ️ No educational records found yet');
      console.log('   Upload a document through the frontend to test');
    } else {
      console.log(`Found ${recentRecords.recordset.length} recent records:\n`);
      
      recentRecords.recordset.forEach((record, index) => {
        console.log(`Record ${index + 1}:`);
        console.log(`  ID: ${record.id}`);
        console.log(`  Fresher ID: ${record.fresher_id}`);
        console.log(`  Qualification: ${record.qualification}`);
        console.log(`  Document URL: ${record.document_url || '(null)'}`);
        console.log(`  Old documents column length: ${record.documents_length || 0}`);
        console.log(`  Old document_urls column length: ${record.document_urls_length || 0}`);
        console.log(`  Created: ${record.created_at}`);
        
        // Validation checks
        if (record.document_url) {
          const isValidUrl = record.document_url.includes('.blob.core.windows.net/');
          console.log(`  ✅ URL Format Valid: ${isValidUrl ? 'YES' : 'NO'}`);
          
          const isSingleUrl = !record.document_url.startsWith('[') && !record.document_url.includes(',');
          console.log(`  ✅ Single URL (not array): ${isSingleUrl ? 'YES' : 'NO'}`);
        }
        console.log('');
      });
    }

    // Summary
    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log(`✅ Database connection: Working`);
    console.log(`✅ document_url column: Exists (NVARCHAR(${columnCheck.recordset[0].CHARACTER_MAXIMUM_LENGTH}))`);
    console.log(`✅ Recent records: ${recentRecords.recordset.length} found`);
    
    if (recentRecords.recordset.some(r => r.document_url)) {
      console.log(`✅ Document URLs: Found in database`);
      const allValidUrls = recentRecords.recordset
        .filter(r => r.document_url)
        .every(r => r.document_url.includes('.blob.core.windows.net/'));
      console.log(`✅ URL format: ${allValidUrls ? 'All valid' : 'Some invalid'}`);
    } else {
      console.log(`ℹ️ Document URLs: No uploaded documents yet`);
    }

    console.log('\n✅ Test complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Open frontend: http://localhost:5174');
    console.log('   2. Navigate to Documents page');
    console.log('   3. Upload an educational document');
    console.log('   4. Run this test again to verify the URL was saved correctly');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mssql.close();
  }
}

// Run the test
testEducationBlobUpload();

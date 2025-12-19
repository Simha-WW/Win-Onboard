/**
 * End-to-end test for blob URL storage
 * This simulates the complete flow: upload to blob -> save URL to database
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import the actual services
async function testBlobUrlFlow() {
  try {
    console.log('🚀 Starting end-to-end blob URL test\n');

    // Step 1: Import blob storage service
    const { blobStorage } = require('./src/services/blob.service.ts');
    console.log('✅ Blob storage service imported');
    console.log('   Configured:', blobStorage.isConfigured());
    
    if (!blobStorage.isConfigured()) {
      console.log('❌ Blob storage not configured!');
      console.log('   Check AZURE_STORAGE_CONNECTION_STRING in .env');
      return;
    }

    // Step 2: Create a test buffer (simulate uploaded file)
    const testBuffer = Buffer.from('Test PDF content');
    console.log('\n📄 Created test buffer:', testBuffer.length, 'bytes');

    // Step 3: Upload to blob storage
    console.log('\n📤 Uploading to Azure Blob Storage...');
    const uploadResult = await blobStorage.uploadDocument(
      testBuffer,
      'test-aadhaar.pdf',
      'application/pdf',
      9,
      'aadhaar'
    );

    console.log('✅ Upload successful!');
    console.log('   Blob Name:', uploadResult.blobName);
    console.log('   Blob URL:', uploadResult.blobUrl);
    console.log('   Content Type:', uploadResult.contentType);
    console.log('   Size:', uploadResult.size);

    // Step 4: Save URL to database
    const sql = require('mssql');
    const config = {
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      server: process.env.SERVER_NAME,
      database: process.env.DB_NAME,
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    };

    console.log('\n💾 Saving URL to database...');
    const pool = await sql.connect(config);
    
    await pool.request()
      .input('aadhaarUrl', sql.NVarChar(1000), uploadResult.blobUrl)
      .input('fresherId', sql.Int, 9)
      .query(`
        UPDATE bgv_demographics SET
          aadhaar_doc_file_url = @aadhaarUrl
        WHERE fresher_id = @fresherId
      `);
    
    console.log('✅ Database updated');

    // Step 5: Verify
    console.log('\n🔍 Verifying database...');
    const result = await pool.request().query(`
      SELECT fresher_id, aadhaar_doc_file_url 
      FROM bgv_demographics 
      WHERE fresher_id = 9
    `);

    const saved = result.recordset[0];
    console.log('   Saved URL:', saved.aadhaar_doc_file_url);

    if (saved.aadhaar_doc_file_url === uploadResult.blobUrl) {
      console.log('\n✅✅✅ SUCCESS! URL saved correctly!');
    } else {
      console.log('\n❌ FAILED! URLs don\'t match:');
      console.log('   Expected:', uploadResult.blobUrl);
      console.log('   Got:', saved.aadhaar_doc_file_url);
    }

    await pool.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run with proper TypeScript support
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

testBlobUrlFlow();

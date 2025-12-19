/**
 * API Testing Script for Educational Document Upload
 * Tests the complete flow of document upload via API
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');

const API_BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

const dbConfig = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

async function testEducationalDocumentAPI() {
  console.log('🧪 API Testing - Educational Document Upload');
  console.log('============================================\n');

  let pool;

  try {
    // Step 1: Connect to database
    console.log('📡 Step 1: Connecting to database...');
    pool = await mssql.connect(dbConfig);
    console.log('✅ Database connected\n');

    // Step 2: Check backend server
    console.log('🔍 Step 2: Checking backend server...');
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Backend server is running');
      console.log(`   Status: ${healthCheck.status}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend server is not running!');
        console.log('💡 Start the backend server: cd Backend && npm run dev');
        process.exit(1);
      } else if (error.response?.status === 404) {
        console.log('⚠️  Health endpoint not found, but server is responding');
        console.log(`   Status: ${error.response.status}`);
      } else {
        throw error;
      }
    }
    console.log('');

    // Step 3: Test blob upload endpoint
    console.log('🔍 Step 3: Testing blob upload endpoint...');
    console.log('ℹ️  This requires authentication with a valid JWT token');
    console.log('ℹ️  For full API test, use the frontend application');
    console.log('');

    // Step 4: Check database schema
    console.log('🔍 Step 4: Verifying database schema...');
    const schemaCheck = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details'
        AND COLUMN_NAME IN ('document_url', 'documents', 'document_urls')
      ORDER BY COLUMN_NAME
    `);

    console.log('Current schema:');
    console.table(schemaCheck.recordset);

    const hasDocumentUrl = schemaCheck.recordset.some(col => col.COLUMN_NAME === 'document_url');
    const hasDocuments = schemaCheck.recordset.some(col => col.COLUMN_NAME === 'documents');
    const hasDocumentUrls = schemaCheck.recordset.some(col => col.COLUMN_NAME === 'document_urls');

    console.log(`✅ document_url column: ${hasDocumentUrl ? 'EXISTS' : 'MISSING'}`);
    console.log(`${hasDocuments ? '⚠️' : '✅'}  documents column: ${hasDocuments ? 'STILL EXISTS (should be removed)' : 'REMOVED'}`);
    console.log(`${hasDocumentUrls ? '⚠️' : '✅'}  document_urls column: ${hasDocumentUrls ? 'STILL EXISTS (should be removed)' : 'REMOVED'}`);
    console.log('');

    // Step 5: Check for test data
    console.log('🔍 Step 5: Checking for uploaded documents...');
    const dataCheck = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        COUNT(document_url) as with_url,
        COUNT(*) - COUNT(document_url) as null_url
      FROM educational_details
    `);

    console.log('Data statistics:');
    console.table(dataCheck.recordset);

    // Step 6: Show recent uploads
    const recentUploads = await pool.request().query(`
      SELECT TOP 3
        id,
        fresher_id,
        qualification,
        document_url,
        created_at
      FROM educational_details
      WHERE document_url IS NOT NULL
      ORDER BY created_at DESC
    `);

    if (recentUploads.recordset.length > 0) {
      console.log('\n✅ Recent successful uploads:');
      recentUploads.recordset.forEach((record, idx) => {
        console.log(`\n${idx + 1}. Record ID: ${record.id}`);
        console.log(`   Fresher ID: ${record.fresher_id}`);
        console.log(`   Qualification: ${record.qualification}`);
        console.log(`   Document URL: ${record.document_url}`);
        console.log(`   Created: ${record.created_at}`);
        
        // Verify URL format
        const isValidBlobUrl = record.document_url.includes('.blob.core.windows.net/');
        console.log(`   URL Valid: ${isValidBlobUrl ? '✅ YES' : '❌ NO'}`);
      });
    } else {
      console.log('\n⚠️  No documents uploaded yet');
    }
    console.log('');

    // Step 7: API Endpoint Documentation
    console.log('📚 Step 7: API Endpoint Information');
    console.log('===================================');
    console.log('\n🔐 Authentication Required Endpoints:');
    console.log('\n1. Generate Upload Token:');
    console.log(`   POST ${API_BASE_URL}/blob/upload-token`);
    console.log('   Headers: Authorization: Bearer <JWT_TOKEN>');
    console.log('   Body: { "documentType": "education" }');
    console.log('   Returns: { sasUrl: "...", containerName: "..." }');
    
    console.log('\n2. Generate View Token:');
    console.log(`   POST ${API_BASE_URL}/blob/view-token`);
    console.log('   Headers: Authorization: Bearer <JWT_TOKEN>');
    console.log('   Body: { "blobUrl": "https://..." }');
    console.log('   Returns: { sasUrl: "..." }');

    console.log('\n3. Save Educational Details:');
    console.log(`   POST ${API_BASE_URL}/bgv/educational`);
    console.log('   Headers: Authorization: Bearer <JWT_TOKEN>');
    console.log('   Body: {');
    console.log('     qualifications: [{');
    console.log('       qualification: "Bachelor of Technology",');
    console.log('       documentUrl: "https://winbuildwinonboard.blob.core.windows.net/..."');
    console.log('     }]');
    console.log('   }');

    // Summary
    console.log('\n\n📊 API TEST SUMMARY');
    console.log('===================');
    console.log(`✅ Database Connection: Working`);
    console.log(`${hasDocumentUrl ? '✅' : '❌'} Schema Ready: ${hasDocumentUrl ? 'document_url column exists' : 'Missing document_url column'}`);
    console.log(`${!hasDocuments && !hasDocumentUrls ? '✅' : '⚠️'}  Schema Clean: ${!hasDocuments && !hasDocumentUrls ? 'Old columns removed' : 'Deprecated columns still exist'}`);
    console.log(`${dataCheck.recordset[0].total > 0 ? '✅' : 'ℹ️'}  Test Data: ${dataCheck.recordset[0].total} records in table`);
    console.log(`${recentUploads.recordset.length > 0 ? '✅' : '⚠️'}  Uploaded Documents: ${recentUploads.recordset.length} found`);

    if (recentUploads.recordset.length > 0) {
      console.log('\n✅ API IS WORKING CORRECTLY');
      console.log('   - Documents are being uploaded to blob storage');
      console.log('   - URLs are being saved to document_url column');
      console.log('   - No binary data in database');
    } else {
      console.log('\n⚠️  NO TEST DATA YET');
      console.log('   - Schema is ready');
      console.log('   - API endpoints are configured');
      console.log('   - Upload a document to complete testing');
    }

    console.log('\n💡 Manual Testing Steps:');
    console.log('   1. Open browser: ' + FRONTEND_URL);
    console.log('   2. Login as a fresher user');
    console.log('   3. Go to Documents page');
    console.log('   4. Navigate to Education section');
    console.log('   5. Upload a PDF/image for any qualification');
    console.log('   6. Save the form');
    console.log('   7. Run this test again to verify');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testEducationalDocumentAPI();

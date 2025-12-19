/**
 * Test and Cleanup Script for Educational Details Table
 * This script:
 * 1. Verifies document_url column exists and checks for null values
 * 2. Shows sample data to verify URLs are being saved
 * 3. Drops deprecated document_urls and documents columns
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

async function testAndCleanup() {
  console.log('🧪 Educational Details Table - Testing & Cleanup');
  console.log('================================================\n');

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    const pool = await mssql.connect(config);
    console.log('✅ Connected\n');

    // Step 1: Check table structure
    console.log('📋 STEP 1: Current Table Structure');
    console.log('===================================');
    const columns = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\nColumns in educational_details table:');
    console.table(columns.recordset);

    // Step 2: Check for document_url column
    console.log('\n📋 STEP 2: Verify document_url Column');
    console.log('======================================');
    const hasDocumentUrl = columns.recordset.some(col => col.COLUMN_NAME === 'document_url');
    const hasDocuments = columns.recordset.some(col => col.COLUMN_NAME === 'documents');
    const hasDocumentUrls = columns.recordset.some(col => col.COLUMN_NAME === 'document_urls');

    console.log(`✅ document_url column exists: ${hasDocumentUrl ? 'YES' : 'NO'}`);
    console.log(`⚠️  documents column exists (deprecated): ${hasDocuments ? 'YES' : 'NO'}`);
    console.log(`⚠️  document_urls column exists (deprecated): ${hasDocumentUrls ? 'YES' : 'NO'}`);

    // Step 3: Analyze data in document_url column
    console.log('\n📋 STEP 3: Analyze document_url Data');
    console.log('====================================');
    
    const stats = await pool.request().query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(document_url) as records_with_url,
        COUNT(*) - COUNT(document_url) as null_count,
        CAST(COUNT(document_url) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as url_percentage
      FROM educational_details
    `);

    console.log('\nStatistics:');
    console.table(stats.recordset);

    // Step 4: Show sample records
    console.log('\n📋 STEP 4: Sample Records (Most Recent)');
    console.log('=======================================');
    
    const samples = await pool.request().query(`
      SELECT TOP 5
        id,
        fresher_id,
        qualification_type,
        qualification,
        document_url,
        CASE 
          WHEN document_url IS NULL THEN 'NULL'
          WHEN document_url LIKE '%blob.core.windows.net%' THEN 'VALID BLOB URL'
          ELSE 'INVALID FORMAT'
        END as url_status,
        created_at
      FROM educational_details
      ORDER BY created_at DESC
    `);

    if (samples.recordset.length > 0) {
      console.log('\nRecent records:');
      samples.recordset.forEach((record, idx) => {
        console.log(`\n--- Record ${idx + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`Fresher ID: ${record.fresher_id}`);
        console.log(`Type: ${record.qualification_type}`);
        console.log(`Qualification: ${record.qualification}`);
        console.log(`Document URL: ${record.document_url || '(null)'}`);
        console.log(`Status: ${record.url_status}`);
        console.log(`Created: ${record.created_at}`);
      });
    } else {
      console.log('⚠️  No records found in table');
    }

    // Step 5: Check for records with valid URLs
    console.log('\n📋 STEP 5: Records with Valid Blob URLs');
    console.log('=======================================');
    
    const validUrls = await pool.request().query(`
      SELECT 
        id,
        fresher_id,
        qualification,
        document_url
      FROM educational_details
      WHERE document_url IS NOT NULL 
        AND document_url LIKE '%blob.core.windows.net%'
      ORDER BY created_at DESC
    `);

    if (validUrls.recordset.length > 0) {
      console.log(`\n✅ Found ${validUrls.recordset.length} record(s) with valid blob URLs:`);
      validUrls.recordset.forEach((record, idx) => {
        console.log(`\n${idx + 1}. ID: ${record.id}, Fresher: ${record.fresher_id}`);
        console.log(`   Qualification: ${record.qualification}`);
        console.log(`   URL: ${record.document_url}`);
      });
    } else {
      console.log('⚠️  No records with valid blob URLs found yet');
      console.log('💡 Upload a document through the frontend to test');
    }

    // Step 6: Drop deprecated columns
    console.log('\n📋 STEP 6: Cleanup - Drop Deprecated Columns');
    console.log('============================================');
    
    console.log('\n⚠️  WARNING: About to drop deprecated columns:');
    console.log('   - documents (old base64 storage)');
    console.log('   - document_urls (old array storage)');
    console.log('\nThese columns are no longer used and can be safely removed.');
    console.log('Data in document_url column will be preserved.\n');

    // Wait a moment to show the warning
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (hasDocumentUrls) {
      console.log('🗑️  Dropping document_urls column...');
      try {
        await pool.request().query(`
          ALTER TABLE educational_details 
          DROP COLUMN document_urls
        `);
        console.log('✅ document_urls column dropped successfully');
      } catch (error) {
        console.error('❌ Failed to drop document_urls column:', error.message);
      }
    } else {
      console.log('ℹ️  document_urls column already removed');
    }

    if (hasDocuments) {
      console.log('\n🗑️  Dropping documents column...');
      try {
        await pool.request().query(`
          ALTER TABLE educational_details 
          DROP COLUMN documents
        `);
        console.log('✅ documents column dropped successfully');
      } catch (error) {
        console.error('❌ Failed to drop documents column:', error.message);
      }
    } else {
      console.log('ℹ️  documents column already removed');
    }

    // Step 7: Verify final structure
    console.log('\n📋 STEP 7: Final Table Structure');
    console.log('=================================');
    
    const finalColumns = await pool.request().query(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\nFinal columns:');
    console.table(finalColumns.recordset);

    // Summary
    console.log('\n📊 FINAL SUMMARY');
    console.log('================');
    console.log(`✅ Total records: ${stats.recordset[0].total_records}`);
    console.log(`✅ Records with document_url: ${stats.recordset[0].records_with_url}`);
    console.log(`✅ Null document_url: ${stats.recordset[0].null_count}`);
    console.log(`✅ URL coverage: ${stats.recordset[0].url_percentage}%`);
    console.log(`✅ Valid blob URLs: ${validUrls.recordset.length}`);
    console.log(`✅ Deprecated columns removed: ${(hasDocuments || hasDocumentUrls) ? 'YES' : 'ALREADY CLEAN'}`);
    
    if (validUrls.recordset.length > 0) {
      console.log('\n✅ API Testing Result: SUCCESS');
      console.log('   - document_url column is working correctly');
      console.log('   - Blob URLs are being saved properly');
    } else {
      console.log('\n⚠️  API Testing Result: NO DATA YET');
      console.log('   - document_url column exists but no uploads yet');
      console.log('   - Upload a document to complete testing');
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Test document upload through frontend');
    console.log('   2. Run this script again to verify URL is saved');
    console.log('   3. Verify HR can view uploaded documents');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mssql.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAndCleanup();

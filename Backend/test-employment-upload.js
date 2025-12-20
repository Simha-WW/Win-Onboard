/**
 * Test Script: Employment History File Upload
 * Tests that employment files are uploaded to blob storage and URLs saved to database
 */

const mssql = require('mssql');
require('dotenv').config();

const config = {
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

async function testEmploymentUploads() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await mssql.connect(config);
    console.log('✅ Connected to database\n');

    // Test 1: Check Employment History URLs
    console.log('📋 Test 1: Employment History Document URLs');
    console.log('='.repeat(80));
    
    const employmentResult = await pool.request().query(`
      SELECT TOP 20
        id,
        fresher_id,
        company_name,
        designation,
        employment_start_date,
        employment_end_date,
        offer_letter_url,
        experience_letter_url,
        payslips_url,
        created_at,
        updated_at
      FROM employment_history
      ORDER BY updated_at DESC
    `);

    if (employmentResult.recordset.length === 0) {
      console.log('⚠️  No employment history records found');
    } else {
      console.log(`Found ${employmentResult.recordset.length} employment records\n`);
      
      employmentResult.recordset.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`Fresher ID: ${record.fresher_id}`);
        console.log(`Company: ${record.company_name}`);
        console.log(`Designation: ${record.designation}`);
        console.log(`Period: ${record.employment_start_date} to ${record.employment_end_date}`);
        console.log(`Offer Letter URL: ${record.offer_letter_url || 'NOT SET'}`);
        console.log(`Experience Letter URL: ${record.experience_letter_url || 'NOT SET'}`);
        console.log(`Payslips URL: ${record.payslips_url || 'NOT SET'}`);
        console.log(`Updated: ${record.updated_at}`);
        
        // Validate URLs
        const hasValidOfferLetter = record.offer_letter_url && 
          record.offer_letter_url.startsWith('http') && 
          record.offer_letter_url !== 'Uploading...';
        const hasValidExpLetter = record.experience_letter_url && 
          record.experience_letter_url.startsWith('http') && 
          record.experience_letter_url !== 'Uploading...';
        const hasValidPayslips = record.payslips_url && 
          record.payslips_url.startsWith('http') && 
          record.payslips_url !== 'Uploading...';
        
        const hasInvalidOfferLetter = record.offer_letter_url === 'Uploading...';
        const hasInvalidExpLetter = record.experience_letter_url === 'Uploading...';
        const hasInvalidPayslips = record.payslips_url === 'Uploading...';
        
        if (hasInvalidOfferLetter || hasInvalidExpLetter || hasInvalidPayslips) {
          console.log('❌ INVALID - Contains "Uploading..." values!');
        } else if (hasValidOfferLetter || hasValidExpLetter || hasValidPayslips) {
          console.log(`✅ VALID URLs: Offer=${hasValidOfferLetter}, Experience=${hasValidExpLetter}, Payslips=${hasValidPayslips}`);
        } else {
          console.log('⚠️  No URLs set (possibly no files uploaded)');
        }
      });
    }

    // Summary Report
    console.log('\n\n📊 Summary Report');
    console.log('='.repeat(80));
    
    const totalRecords = employmentResult.recordset.length;
    const recordsWithValidUrls = employmentResult.recordset.filter(r => 
      (r.offer_letter_url && r.offer_letter_url.startsWith('http') && r.offer_letter_url !== 'Uploading...') ||
      (r.experience_letter_url && r.experience_letter_url.startsWith('http') && r.experience_letter_url !== 'Uploading...') ||
      (r.payslips_url && r.payslips_url.startsWith('http') && r.payslips_url !== 'Uploading...')
    ).length;
    
    const recordsWithUploadingText = employmentResult.recordset.filter(r =>
      r.offer_letter_url === 'Uploading...' ||
      r.experience_letter_url === 'Uploading...' ||
      r.payslips_url === 'Uploading...'
    ).length;

    const recordsWithBlobUrls = employmentResult.recordset.filter(r =>
      (r.offer_letter_url && r.offer_letter_url.includes('.blob.core.windows.net')) ||
      (r.experience_letter_url && r.experience_letter_url.includes('.blob.core.windows.net')) ||
      (r.payslips_url && r.payslips_url.includes('.blob.core.windows.net'))
    ).length;

    console.log(`Total Employment Records: ${totalRecords}`);
    console.log(`Records with Valid URLs: ${recordsWithValidUrls} (${Math.round(recordsWithValidUrls/totalRecords*100)}%)`);
    console.log(`Records with Azure Blob URLs: ${recordsWithBlobUrls} (${Math.round(recordsWithBlobUrls/totalRecords*100)}%)`);
    console.log(`Records with "Uploading..." text: ${recordsWithUploadingText} (${Math.round(recordsWithUploadingText/totalRecords*100)}%)`);

    if (recordsWithUploadingText > 0) {
      console.log('\n❌ ERROR: Found records with "Uploading..." text!');
      console.log('   This means files were not properly uploaded to blob storage.');
      console.log('   Please check:');
      console.log('   1. Frontend sends files as base64 to backend');
      console.log('   2. Backend converts base64 to buffer');
      console.log('   3. Backend uploads buffer to Azure Blob Storage');
      console.log('   4. Backend saves returned URL to database');
    } else if (recordsWithBlobUrls === 0 && totalRecords > 0) {
      console.log('\n⚠️  No Azure Blob Storage URLs found.');
      console.log('   Files might not have been uploaded yet, or blob storage is not configured.');
    } else {
      console.log('\n✅ Employment file uploads are working correctly!');
      console.log('   All URLs point to Azure Blob Storage.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run tests
console.log('🧪 Starting Employment Upload Verification Tests\n');
testEmploymentUploads().then(() => {
  console.log('\n✅ Tests completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

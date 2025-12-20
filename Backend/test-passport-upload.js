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

async function testPassportUpload() {
  try {
    console.log('🛂 Testing Passport/Visa Upload Functionality\n');
    console.log('=' .repeat(60));
    
    const pool = await mssql.connect(config);
    
    // Query passport_visa table
    const result = await pool.request().query(`
      SELECT 
        id,
        fresher_id,
        passport_number,
        passport_copy_url,
        has_visa,
        visa_document_url,
        created_at,
        updated_at
      FROM passport_visa
      ORDER BY updated_at DESC
    `);
    
    console.log(`\n📊 Total Records: ${result.recordset.length}\n`);
    
    if (result.recordset.length === 0) {
      console.log('⚠️  No passport/visa records found in database');
      return;
    }
    
    let validPassportUrls = 0;
    let validVisaUrls = 0;
    let uploadingPassportUrls = 0;
    let uploadingVisaUrls = 0;
    let blobPassportUrls = 0;
    let blobVisaUrls = 0;
    
    result.recordset.forEach((record, index) => {
      console.log(`\n--- Record ${index + 1} ---`);
      console.log(`Fresher ID: ${record.fresher_id}`);
      console.log(`Passport Number: ${record.passport_number || 'N/A'}`);
      console.log(`Passport Copy URL: ${record.passport_copy_url || 'N/A'}`);
      console.log(`Has Visa: ${record.has_visa ? 'Yes' : 'No'}`);
      console.log(`Visa Document URL: ${record.visa_document_url || 'N/A'}`);
      console.log(`Updated At: ${record.updated_at}`);
      
      // Check passport copy URL
      if (record.passport_copy_url) {
        if (record.passport_copy_url === 'Uploading...') {
          uploadingPassportUrls++;
          console.log('❌ Passport URL is literal "Uploading..." string');
        } else if (record.passport_copy_url.startsWith('http')) {
          validPassportUrls++;
          if (record.passport_copy_url.includes('.blob.core.windows.net')) {
            blobPassportUrls++;
            console.log('✅ Valid Azure Blob Storage passport URL');
          } else {
            console.log('⚠️  Valid HTTP URL but not Azure Blob');
          }
        } else {
          console.log('⚠️  Invalid passport URL format');
        }
      }
      
      // Check visa document URL
      if (record.has_visa && record.visa_document_url) {
        if (record.visa_document_url === 'Uploading...') {
          uploadingVisaUrls++;
          console.log('❌ Visa URL is literal "Uploading..." string');
        } else if (record.visa_document_url.startsWith('http')) {
          validVisaUrls++;
          if (record.visa_document_url.includes('.blob.core.windows.net')) {
            blobVisaUrls++;
            console.log('✅ Valid Azure Blob Storage visa URL');
          } else {
            console.log('⚠️  Valid HTTP URL but not Azure Blob');
          }
        } else {
          console.log('⚠️  Invalid visa URL format');
        }
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📈 SUMMARY:');
    console.log('─'.repeat(60));
    console.log(`Total Records: ${result.recordset.length}`);
    console.log(`\n📄 Passport Copy URLs:`);
    console.log(`  Valid URLs: ${validPassportUrls}`);
    console.log(`  Azure Blob URLs: ${blobPassportUrls}`);
    console.log(`  "Uploading..." strings: ${uploadingPassportUrls}`);
    console.log(`\n📄 Visa Document URLs:`);
    console.log(`  Valid URLs: ${validVisaUrls}`);
    console.log(`  Azure Blob URLs: ${blobVisaUrls}`);
    console.log(`  "Uploading..." strings: ${uploadingVisaUrls}`);
    
    const totalUploading = uploadingPassportUrls + uploadingVisaUrls;
    if (totalUploading > 0) {
      console.log(`\n❌ FAIL: ${totalUploading} URLs are literal "Uploading..." strings!`);
      console.log('This indicates files were not actually uploaded to blob storage.');
    } else {
      console.log('\n✅ SUCCESS: No "Uploading..." strings found!');
    }
    
    const totalValid = validPassportUrls + validVisaUrls;
    const totalBlob = blobPassportUrls + blobVisaUrls;
    const totalWithUrls = result.recordset.filter(r => r.passport_copy_url || r.visa_document_url).length;
    
    if (totalWithUrls > 0) {
      const validPercentage = ((totalValid / totalWithUrls) * 100).toFixed(1);
      const blobPercentage = ((totalBlob / totalWithUrls) * 100).toFixed(1);
      console.log(`\n📊 Valid URLs: ${validPercentage}%`);
      console.log(`📊 Azure Blob URLs: ${blobPercentage}%`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testPassportUpload();

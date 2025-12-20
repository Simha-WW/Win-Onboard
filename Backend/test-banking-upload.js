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

async function testBankingUpload() {
  try {
    console.log('🏦 Testing Bank/PF/NPS Upload Functionality\n');
    console.log('=' .repeat(60));
    
    const pool = await mssql.connect(config);
    
    // Query bank_pf_nps table
    const result = await pool.request().query(`
      SELECT 
        id,
        fresher_id,
        bank_name,
        bank_account_number,
        ifsc_code,
        cancelled_cheque_url,
        uan_pf_number,
        pran_nps_number,
        created_at,
        updated_at
      FROM bank_pf_nps
      ORDER BY updated_at DESC
    `);
    
    console.log(`\n📊 Total Records: ${result.recordset.length}\n`);
    
    if (result.recordset.length === 0) {
      console.log('⚠️  No bank/PF/NPS records found in database');
      return;
    }
    
    let validUrls = 0;
    let uploadingUrls = 0;
    let blobUrls = 0;
    let totalWithUrls = 0;
    
    result.recordset.forEach((record, index) => {
      console.log(`\n--- Record ${index + 1} ---`);
      console.log(`Fresher ID: ${record.fresher_id}`);
      console.log(`Bank Name: ${record.bank_name || 'N/A'}`);
      console.log(`Account Number: ${record.bank_account_number || 'N/A'}`);
      console.log(`IFSC Code: ${record.ifsc_code || 'N/A'}`);
      console.log(`Cancelled Cheque URL: ${record.cancelled_cheque_url || 'N/A'}`);
      console.log(`PF UAN: ${record.uan_pf_number || 'N/A'}`);
      console.log(`PRAN: ${record.pran_nps_number || 'N/A'}`);
      console.log(`Updated At: ${record.updated_at}`);
      
      // Check cancelled cheque URL
      if (record.cancelled_cheque_url) {
        totalWithUrls++;
        if (record.cancelled_cheque_url === 'Uploading...') {
          uploadingUrls++;
          console.log('❌ URL is literal "Uploading..." string');
        } else if (record.cancelled_cheque_url.startsWith('http')) {
          validUrls++;
          if (record.cancelled_cheque_url.includes('.blob.core.windows.net')) {
            blobUrls++;
            console.log('✅ Valid Azure Blob Storage URL');
          } else {
            console.log('⚠️  Valid HTTP URL but not Azure Blob');
          }
        } else {
          console.log('⚠️  Invalid URL format');
        }
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📈 SUMMARY:');
    console.log('─'.repeat(60));
    console.log(`Total Records: ${result.recordset.length}`);
    console.log(`Records with Cancelled Cheque URL: ${totalWithUrls}`);
    console.log(`Valid URLs: ${validUrls}`);
    console.log(`Azure Blob URLs: ${blobUrls}`);
    console.log(`"Uploading..." strings: ${uploadingUrls}`);
    
    if (uploadingUrls > 0) {
      console.log(`\n❌ FAIL: ${uploadingUrls} URLs are literal "Uploading..." strings!`);
      console.log('This indicates files were not actually uploaded to blob storage.');
    } else {
      console.log('\n✅ SUCCESS: No "Uploading..." strings found!');
    }
    
    if (totalWithUrls > 0) {
      const validPercentage = ((validUrls / totalWithUrls) * 100).toFixed(1);
      const blobPercentage = ((blobUrls / totalWithUrls) * 100).toFixed(1);
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

testBankingUpload();

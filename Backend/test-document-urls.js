/**
 * Test Script: Verify Document URLs in Database
 * Tests that document URLs are properly saved and accessible
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

async function testDocumentUrls() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await mssql.connect(config);
    console.log('✅ Connected to database\n');

    // Test 1: Check Employment History URLs
    console.log('📋 Test 1: Employment History Document URLs');
    console.log('='.repeat(60));
    const employmentResult = await pool.request().query(`
      SELECT TOP 10
        id,
        fresher_id,
        company_name,
        designation,
        offer_letter_url,
        experience_letter_url,
        payslips_url,
        created_at
      FROM employment_history
      ORDER BY created_at DESC
    `);

    if (employmentResult.recordset.length === 0) {
      console.log('⚠️  No employment history records found');
    } else {
      employmentResult.recordset.forEach(record => {
        console.log(`\nFresher ID: ${record.fresher_id}`);
        console.log(`Company: ${record.company_name}`);
        console.log(`Offer Letter URL: ${record.offer_letter_url || 'NOT SET'}`);
        console.log(`Experience Letter URL: ${record.experience_letter_url || 'NOT SET'}`);
        console.log(`Payslips URL: ${record.payslips_url || 'NOT SET'}`);
        
        // Validate URLs
        const hasValidOfferLetter = record.offer_letter_url && record.offer_letter_url.startsWith('http');
        const hasValidExpLetter = record.experience_letter_url && record.experience_letter_url.startsWith('http');
        const hasValidPayslips = record.payslips_url && record.payslips_url.startsWith('http');
        
        console.log(`✅ Valid URLs: Offer=${hasValidOfferLetter}, Experience=${hasValidExpLetter}, Payslips=${hasValidPayslips}`);
      });
    }

    // Test 2: Check Passport & Visa URLs
    console.log('\n\n📋 Test 2: Passport & Visa Document URLs');
    console.log('='.repeat(60));
    const passportResult = await pool.request().query(`
      SELECT TOP 10
        id,
        fresher_id,
        has_passport,
        passport_number,
        passport_copy_url,
        has_visa,
        visa_type,
        visa_document_url,
        created_at
      FROM passport_visa
      ORDER BY created_at DESC
    `);

    if (passportResult.recordset.length === 0) {
      console.log('⚠️  No passport/visa records found');
    } else {
      passportResult.recordset.forEach(record => {
        console.log(`\nFresher ID: ${record.fresher_id}`);
        console.log(`Has Passport: ${record.has_passport}`);
        console.log(`Passport Copy URL: ${record.passport_copy_url || 'NOT SET'}`);
        console.log(`Has Visa: ${record.has_visa}`);
        console.log(`Visa Document URL: ${record.visa_document_url || 'NOT SET'}`);
        
        // Validate URLs
        const hasValidPassport = record.passport_copy_url && record.passport_copy_url.startsWith('http');
        const hasValidVisa = record.visa_document_url && record.visa_document_url.startsWith('http');
        
        console.log(`✅ Valid URLs: Passport=${hasValidPassport}, Visa=${hasValidVisa}`);
      });
    }

    // Test 3: Check Bank/PF/NPS URLs
    console.log('\n\n📋 Test 3: Bank/PF/NPS Document URLs');
    console.log('='.repeat(60));
    const bankingResult = await pool.request().query(`
      SELECT TOP 10
        id,
        fresher_id,
        bank_account_number,
        bank_name,
        cancelled_cheque_url,
        uan_pf_number,
        pran_nps_number,
        created_at
      FROM bank_pf_nps
      ORDER BY created_at DESC
    `);

    if (bankingResult.recordset.length === 0) {
      console.log('⚠️  No bank/PF/NPS records found');
    } else {
      bankingResult.recordset.forEach(record => {
        console.log(`\nFresher ID: ${record.fresher_id}`);
        console.log(`Bank: ${record.bank_name}`);
        console.log(`Cancelled Cheque URL: ${record.cancelled_cheque_url || 'NOT SET'}`);
        console.log(`UAN/PF: ${record.uan_pf_number || 'N/A'}`);
        console.log(`PRAN/NPS: ${record.pran_nps_number || 'N/A'}`);
        
        // Validate URL
        const hasValidCheque = record.cancelled_cheque_url && record.cancelled_cheque_url.startsWith('http');
        
        console.log(`✅ Valid URL: Cancelled Cheque=${hasValidCheque}`);
      });
    }

    // Summary Report
    console.log('\n\n📊 Summary Report');
    console.log('='.repeat(60));
    
    const totalEmployment = employmentResult.recordset.length;
    const validEmploymentUrls = employmentResult.recordset.filter(r => 
      (r.offer_letter_url && r.offer_letter_url.startsWith('http')) ||
      (r.experience_letter_url && r.experience_letter_url.startsWith('http')) ||
      (r.payslips_url && r.payslips_url.startsWith('http'))
    ).length;

    const totalPassport = passportResult.recordset.length;
    const validPassportUrls = passportResult.recordset.filter(r => 
      (r.passport_copy_url && r.passport_copy_url.startsWith('http')) ||
      (r.visa_document_url && r.visa_document_url.startsWith('http'))
    ).length;

    const totalBanking = bankingResult.recordset.length;
    const validBankingUrls = bankingResult.recordset.filter(r => 
      r.cancelled_cheque_url && r.cancelled_cheque_url.startsWith('http')
    ).length;

    console.log(`Employment Records: ${totalEmployment} total, ${validEmploymentUrls} with valid URLs`);
    console.log(`Passport/Visa Records: ${totalPassport} total, ${validPassportUrls} with valid URLs`);
    console.log(`Banking Records: ${totalBanking} total, ${validBankingUrls} with valid URLs`);

    if (totalEmployment + totalPassport + totalBanking === 0) {
      console.log('\n⚠️  No records found in any table. Please upload documents first.');
    } else if (validEmploymentUrls + validPassportUrls + validBankingUrls === 0) {
      console.log('\n❌ No valid document URLs found! Documents are being saved but URLs are not.');
      console.log('   This indicates the upload process is not working correctly.');
    } else {
      console.log('\n✅ Document URLs are being saved correctly!');
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
console.log('🧪 Starting Document URL Verification Tests\n');
testDocumentUrls().then(() => {
  console.log('\n✅ Tests completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

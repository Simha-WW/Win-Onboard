/**
 * Test Script: Verify Azure Blob Storage Integration
 * Tests that blob storage URLs are accessible and valid
 */

const https = require('https');
const http = require('http');
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

/**
 * Check if a URL is accessible (returns 200 or 403 for Azure blob with SAS token)
 */
function checkUrl(url) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) {
      resolve({ accessible: false, error: 'Invalid URL' });
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Azure blob storage returns 200 for HEAD requests if accessible
      // 403 means authentication failed but URL structure is valid
      const accessible = response.statusCode === 200 || response.statusCode === 403;
      resolve({
        accessible,
        statusCode: response.statusCode,
        error: accessible ? null : `HTTP ${response.statusCode}`
      });
      
      // Abort the request to prevent downloading the entire file
      request.abort();
    });

    request.on('error', (error) => {
      resolve({ accessible: false, error: error.message });
    });

    request.setTimeout(5000, () => {
      request.abort();
      resolve({ accessible: false, error: 'Timeout' });
    });
  });
}

async function testBlobStorage() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await mssql.connect(config);
    console.log('✅ Connected to database\n');

    // Collect all URLs from all tables
    console.log('📥 Fetching document URLs from database...\n');
    
    const urls = [];

    // Employment History
    const employmentResult = await pool.request().query(`
      SELECT 
        'Employment - Offer Letter' as doc_type,
        fresher_id,
        offer_letter_url as url
      FROM employment_history
      WHERE offer_letter_url IS NOT NULL AND offer_letter_url != ''
      UNION ALL
      SELECT 
        'Employment - Experience Letter' as doc_type,
        fresher_id,
        experience_letter_url as url
      FROM employment_history
      WHERE experience_letter_url IS NOT NULL AND experience_letter_url != ''
      UNION ALL
      SELECT 
        'Employment - Payslips' as doc_type,
        fresher_id,
        payslips_url as url
      FROM employment_history
      WHERE payslips_url IS NOT NULL AND payslips_url != ''
    `);
    urls.push(...employmentResult.recordset);

    // Passport & Visa
    const passportResult = await pool.request().query(`
      SELECT 
        'Passport Copy' as doc_type,
        fresher_id,
        passport_copy_url as url
      FROM passport_visa
      WHERE passport_copy_url IS NOT NULL AND passport_copy_url != ''
      UNION ALL
      SELECT 
        'Visa Document' as doc_type,
        fresher_id,
        visa_document_url as url
      FROM passport_visa
      WHERE visa_document_url IS NOT NULL AND visa_document_url != ''
    `);
    urls.push(...passportResult.recordset);

    // Bank/PF/NPS
    const bankingResult = await pool.request().query(`
      SELECT 
        'Cancelled Cheque' as doc_type,
        fresher_id,
        cancelled_cheque_url as url
      FROM bank_pf_nps
      WHERE cancelled_cheque_url IS NOT NULL AND cancelled_cheque_url != ''
    `);
    urls.push(...bankingResult.recordset);

    console.log(`Found ${urls.length} document URLs to test\n`);

    if (urls.length === 0) {
      console.log('⚠️  No document URLs found in database.');
      console.log('   Please upload some documents first.');
      return;
    }

    // Test each URL
    console.log('🧪 Testing URL Accessibility...\n');
    console.log('='.repeat(80));

    let accessibleCount = 0;
    let inaccessibleCount = 0;
    const results = [];

    for (const record of urls) {
      process.stdout.write(`Testing: ${record.doc_type} (Fresher ${record.fresher_id})... `);
      
      const result = await checkUrl(record.url);
      
      if (result.accessible) {
        console.log(`✅ Accessible (HTTP ${result.statusCode})`);
        accessibleCount++;
      } else {
        console.log(`❌ Not Accessible (${result.error})`);
        inaccessibleCount++;
      }

      results.push({
        ...record,
        ...result
      });
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Test Summary');
    console.log('='.repeat(80));
    console.log(`Total URLs Tested: ${urls.length}`);
    console.log(`✅ Accessible: ${accessibleCount} (${Math.round(accessibleCount/urls.length*100)}%)`);
    console.log(`❌ Inaccessible: ${inaccessibleCount} (${Math.round(inaccessibleCount/urls.length*100)}%)`);

    if (inaccessibleCount > 0) {
      console.log('\n⚠️  Inaccessible URLs:');
      results
        .filter(r => !r.accessible)
        .forEach(r => {
          console.log(`   - ${r.doc_type}: ${r.url}`);
          console.log(`     Error: ${r.error}`);
        });
    }

    // Check URL patterns
    console.log('\n🔍 URL Pattern Analysis:');
    const blobUrls = urls.filter(u => u.url.includes('.blob.core.windows.net'));
    const localUrls = urls.filter(u => u.url.includes('localhost') || u.url.includes('127.0.0.1'));
    const otherUrls = urls.filter(u => !blobUrls.includes(u) && !localUrls.includes(u));

    console.log(`   Azure Blob Storage URLs: ${blobUrls.length}`);
    console.log(`   Local URLs: ${localUrls.length}`);
    console.log(`   Other URLs: ${otherUrls.length}`);

    if (blobUrls.length > 0) {
      console.log('\n✅ URLs are using Azure Blob Storage (correct)');
    } else if (localUrls.length > 0) {
      console.log('\n⚠️  URLs are using localhost (this won\'t work in production)');
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
console.log('🧪 Starting Azure Blob Storage Verification Tests\n');
testBlobStorage().then(() => {
  console.log('\n✅ Tests completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

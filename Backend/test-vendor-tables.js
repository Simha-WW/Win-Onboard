/**
 * Simple Vendor Verification Test
 * Tests the vendor verification endpoints directly with a hardcoded token
 */

const mssql = require('mssql');

const config = {
  user: process.env.DB_USER || 'admin-winbuild',
  password: process.env.DB_PASSWORD || 'Admin@12345',
  server: process.env.DB_SERVER || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'db-winbuild',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function testVendorVerificationTables() {
  console.log('🔍 Testing Vendor Verification Tables\n');
  
  try {
    const pool = await mssql.connect(config);
    
    // Test 1: Check if vendor_verified table exists
    console.log('1. Checking vendor_verified table...');
    const verifiedResult = await pool.request().query(`
      SELECT TOP 5 * FROM vendor_verified
    `);
    console.log(`   ✅ Found ${verifiedResult.recordset.length} verified records`);
    if (verifiedResult.recordset.length > 0) {
      console.log('   Sample:', verifiedResult.recordset[0]);
    }
    
    // Test 2: Check if vendor_rejected table exists
    console.log('\n2. Checking vendor_rejected table...');
    const rejectedResult = await pool.request().query(`
      SELECT TOP 5 * FROM vendor_rejected
    `);
    console.log(`   ✅ Found ${rejectedResult.recordset.length} rejected records`);
    if (rejectedResult.recordset.length > 0) {
      console.log('   Sample:', rejectedResult.recordset[0]);
    }
    
    // Test 3: Check BGV submissions with vendor status
    console.log('\n3. Checking BGV submissions with vendor status...');
    const submissionsResult = await pool.request().query(`
      SELECT TOP 5
        bs.id as submission_id,
        bs.fresher_id,
        f.first_name,
        f.last_name,
        f.email,
        CASE WHEN EXISTS (SELECT 1 FROM it_tasks WHERE fresher_id = f.id) THEN 1 ELSE 0 END as sent_to_it,
        CASE WHEN EXISTS (SELECT 1 FROM vendor_verified WHERE fresher_id = f.id) THEN 1 ELSE 0 END as vendor_verified,
        CASE WHEN EXISTS (SELECT 1 FROM vendor_rejected WHERE fresher_id = f.id) THEN 1 ELSE 0 END as vendor_rejected
      FROM bgv_submissions bs
      INNER JOIN freshers f ON bs.fresher_id = f.id
      WHERE bs.submission_status = 'submitted'
      ORDER BY bs.submitted_at DESC
    `);
    
    console.log(`   ✅ Found ${submissionsResult.recordset.length} submissions\n`);
    submissionsResult.recordset.forEach((sub, idx) => {
      console.log(`   ${idx + 1}. ${sub.first_name} ${sub.last_name} (ID: ${sub.fresher_id})`);
      console.log(`      Sent to IT: ${sub.sent_to_it === 1 ? 'Yes' : 'No'}`);
      console.log(`      Vendor Verified: ${sub.vendor_verified === 1 ? 'Yes' : 'No'}`);
      console.log(`      Vendor Rejected: ${sub.vendor_rejected === 1 ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Test 4: Check if there are any candidates ready for verification
    console.log('4. Checking candidates ready for vendor verification...');
    const readyResult = await pool.request().query(`
      SELECT 
        f.id,
        f.first_name,
        f.last_name,
        f.email
      FROM freshers f
      WHERE EXISTS (SELECT 1 FROM it_tasks WHERE fresher_id = f.id)
        AND NOT EXISTS (SELECT 1 FROM vendor_verified WHERE fresher_id = f.id)
        AND NOT EXISTS (SELECT 1 FROM vendor_rejected WHERE fresher_id = f.id)
    `);
    
    console.log(`   ✅ Found ${readyResult.recordset.length} candidates ready for verification\n`);
    if (readyResult.recordset.length > 0) {
      console.log('   These candidates can be verified/rejected:');
      readyResult.recordset.forEach((candidate, idx) => {
        console.log(`   ${idx + 1}. ${candidate.first_name} ${candidate.last_name} (ID: ${candidate.id}) - ${candidate.email}`);
      });
    } else {
      console.log('   ℹ️  No candidates pending verification');
    }
    
    await pool.close();
    console.log('\n✨ Test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testVendorVerificationTables();

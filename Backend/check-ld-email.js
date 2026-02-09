/**
 * Check L&D email in database
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkLDEmail() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected to database\n');

    const email = 'saitharakreddyv59@gmail.com';
    console.log(`Checking for L&D email: ${email}\n`);

    // Check learning_dept table
    console.log('=== Checking learning_dept table ===');
    const ldResult = await sql.query`
      SELECT * FROM dbo.learning_dept WHERE email = ${email}
    `;
    
    if (ldResult.recordset.length > 0) {
      console.log('✅ Found in learning_dept:');
      console.log(ldResult.recordset[0]);
    } else {
      console.log('❌ NOT found in learning_dept');
    }
    console.log('');

    // Check all L&D records
    console.log('=== All records in learning_dept ===');
    const allLD = await sql.query`SELECT email, first_name, last_name, role, is_active FROM dbo.learning_dept`;
    console.log(`Total records: ${allLD.recordset.length}`);
    allLD.recordset.forEach(record => {
      console.log(`- ${record.email} | ${record.first_name} ${record.last_name} | ${record.role} | Active: ${record.is_active}`);
    });
    console.log('');

    // Test the query that will be used
    console.log('=== Testing Query with CONCAT ===');
    const testResult = await sql.query`
      SELECT 
        id,
        email,
        CONCAT(first_name, ' ', last_name) as name,
        'LD' as department,
        'learning_admin' as role,
        is_active
      FROM dbo.learning_dept 
      WHERE email = ${email} AND is_active = 1
    `;
    
    if (testResult.recordset.length > 0) {
      console.log('✅ FOUND:', testResult.recordset[0]);
    } else {
      console.log('❌ NOT FOUND');
    }

    await sql.close();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLDEmail();

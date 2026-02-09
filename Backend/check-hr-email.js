/**
 * Check if HR email exists in database
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

async function checkHREmail() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected to database\n');

    const email = 'pulipatisimha@gmail.com';
    console.log(`Checking for email: ${email}\n`);

    // Check hr_normal_login table
    console.log('=== Checking hr_normal_login table ===');
    const hrResult = await sql.query`
      SELECT * FROM dbo.hr_normal_login WHERE email = ${email}
    `;
    
    if (hrResult.recordset.length > 0) {
      console.log('✅ Found in hr_normal_login:');
      console.log(hrResult.recordset[0]);
    } else {
      console.log('❌ NOT found in hr_normal_login');
    }
    console.log('');

    // Check all records in hr_normal_login
    console.log('=== All records in hr_normal_login ===');
    const allHR = await sql.query`SELECT email, full_name, role, is_active FROM dbo.hr_normal_login`;
    console.log(`Total records: ${allHR.recordset.length}`);
    allHR.recordset.forEach(record => {
      console.log(`- ${record.email} | ${record.full_name} | ${record.role} | Active: ${record.is_active}`);
    });
    console.log('');

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

    // Check it_users table
    console.log('=== Checking it_users table ===');
    try {
      const itResult = await sql.query`
        SELECT * FROM dbo.it_users WHERE email = ${email}
      `;
      
      if (itResult.recordset.length > 0) {
        console.log('✅ Found in it_users:');
        console.log(itResult.recordset[0]);
      } else {
        console.log('❌ NOT found in it_users');
      }
    } catch (err) {
      console.log('⚠️ it_users table does not exist or error:', err.message);
    }

    await sql.close();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkHREmail();

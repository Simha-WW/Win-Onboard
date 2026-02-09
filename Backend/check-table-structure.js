/**
 * Check actual table structure for all admin tables
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

async function checkTableStructure() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected to database\n');

    // Check hr_normal_login table structure
    console.log('=== HR_NORMAL_LOGIN TABLE STRUCTURE ===');
    const hrColumns = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'hr_normal_login'
      ORDER BY ORDINAL_POSITION
    `;
    console.log('Columns:');
    hrColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    // Check learning_dept table structure
    console.log('=== LEARNING_DEPT TABLE STRUCTURE ===');
    try {
      const ldColumns = await sql.query`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'learning_dept'
        ORDER BY ORDINAL_POSITION
      `;
      console.log('Columns:');
      ldColumns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (err) {
      console.log('⚠️ learning_dept table does not exist');
    }
    console.log('');

    // Check it_users table structure
    console.log('=== IT_USERS TABLE STRUCTURE ===');
    try {
      const itColumns = await sql.query`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'it_users'
        ORDER BY ORDINAL_POSITION
      `;
      console.log('Columns:');
      itColumns.recordset.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (err) {
      console.log('⚠️ it_users table does not exist');
    }
    console.log('');

    // Test the actual query that will be used
    console.log('=== TESTING ACTUAL QUERY ===');
    const email = 'pulipatisimha@gmail.com';
    const testResult = await sql.query`
      SELECT 
        id,
        email,
        display_name as name,
        'HR' as department,
        role,
        is_active
      FROM dbo.hr_normal_login 
      WHERE email = ${email} AND is_active = 1
    `;
    
    console.log(`Query for ${email}:`);
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

checkTableStructure();

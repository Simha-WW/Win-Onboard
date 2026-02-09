/**
 * Test script for Google OAuth Admin Authentication
 * This script helps verify that the Google OAuth setup is working correctly
 */

const sql = require('mssql');

const config = {
  server: process.env.SERVER_NAME || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USERNAME || 'sqladmin',
  password: process.env.DB_PASSWORD || 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkAdminTables() {
  console.log('\n🔍 Checking Admin Tables for Google OAuth...\n');
  
  try {
    const pool = await sql.connect(config);
    
    // Check HR table
    console.log('📊 HR Normal Login Table:');
    const hrResult = await pool.request().query(`
      SELECT id, email, full_name, role, is_active 
      FROM dbo.hr_normal_login
      ORDER BY id
    `);
    
    if (hrResult.recordset.length > 0) {
      console.log('✅ HR Users found:');
      hrResult.recordset.forEach(user => {
        console.log(`  - ${user.email} (${user.full_name}) - Role: ${user.role} - Active: ${user.is_active}`);
      });
    } else {
      console.log('⚠️ No HR users found');
    }
    
    console.log('\n📊 Learning Department Table:');
    const ldResult = await pool.request().query(`
      SELECT id, email, name, is_active 
      FROM dbo.learning_dept
      ORDER BY id
    `);
    
    if (ldResult.recordset.length > 0) {
      console.log('✅ L&D Users found:');
      ldResult.recordset.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Active: ${user.is_active}`);
      });
    } else {
      console.log('⚠️ No L&D users found');
    }
    
    console.log('\n📊 IT Users Table:');
    const itResult = await pool.request().query(`
      SELECT id, email, name, is_active 
      FROM dbo.it_users
      ORDER BY id
    `);
    
    if (itResult.recordset.length > 0) {
      console.log('✅ IT Users found:');
      itResult.recordset.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Active: ${user.is_active}`);
      });
    } else {
      console.log('⚠️ No IT users found');
    }
    
    console.log('\n✅ Admin tables check completed!\n');
    console.log('📝 To test Google OAuth login:');
    console.log('   1. Go to http://localhost:5173');
    console.log('   2. Click "Admin login"');
    console.log('   3. Click "Sign in with Google" button');
    console.log('   4. Use one of the emails listed above');
    console.log('   5. You should be redirected to the appropriate portal (HR/IT/LD)\n');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error checking admin tables:', error);
  }
}

// Run the check
checkAdminTables();

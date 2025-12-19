const sql = require('mssql');
const bcrypt = require('bcrypt');
const axios = require('axios');

const config = {
  server: 'sql-server-hackathon.database.windows.net',
  database: 'hackathon',
  user: 'sqladmin',
  password: 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function checkUserAndTestLogin() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);
    
    // Check if user exists
    console.log('\n📋 Checking user: varshini.muppavarapu');
    const result = await pool.request()
      .input('username', sql.NVarChar, 'varshini.muppavarapu')
      .query(`
        SELECT 
          id, 
          username, 
          password_hash, 
          password,
          first_name, 
          last_name, 
          email, 
          status,
          designation,
          department
        FROM freshers 
        WHERE username = @username
      `);
    
    if (result.recordset.length === 0) {
      console.log('❌ User not found in database!');
      await sql.close();
      return;
    }
    
    const user = result.recordset[0];
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Name:', user.first_name, user.last_name);
    console.log('   Status:', user.status);
    console.log('   Department:', user.department);
    console.log('   Designation:', user.designation);
    console.log('   Has password_hash:', !!user.password_hash);
    console.log('   Has plain password:', !!user.password);
    
    // Test password
    const testPassword = 'do64hA';
    console.log('\n🔐 Testing password:', testPassword);
    
    let isValid = false;
    if (user.password_hash) {
      isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('   Bcrypt comparison:', isValid ? '✅ MATCH' : '❌ NO MATCH');
    }
    
    if (!isValid && user.password) {
      isValid = testPassword === user.password;
      console.log('   Plain text comparison:', isValid ? '✅ MATCH' : '❌ NO MATCH');
    }
    
    await sql.close();
    
    if (!isValid) {
      console.log('\n❌ Password does not match! Cannot proceed with API test.');
      return;
    }
    
    // Test login API
    console.log('\n🌐 Testing login API at http://localhost:3000/api/auth/fresher');
    try {
      const response = await axios.post('http://localhost:3000/api/auth/fresher', {
        username: 'varshini.muppavarapu',
        password: testPassword
      });
      
      console.log('✅ Login successful!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (apiError) {
      console.log('❌ Login API failed:');
      if (apiError.response) {
        console.log('   Status:', apiError.response.status);
        console.log('   Error:', apiError.response.data);
      } else {
        console.log('   Error:', apiError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.close();
  }
}

checkUserAndTestLogin();

require('dotenv').config();
const sql = require('mssql');
const bcrypt = require('bcrypt');

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function setupHRPassword() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    // Get existing HR user
    const hrUser = await sql.query`
      SELECT id, email, first_name, last_name, role 
      FROM hr_users 
      WHERE email = 'pulipatisimha@gmail.com'
    `;
    
    if (hrUser.recordset.length === 0) {
      console.log('❌ HR user not found with email pulipatisimha@gmail.com');
      await sql.close();
      return;
    }
    
    const user = hrUser.recordset[0];
    console.log('Found HR user:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.first_name} ${user.last_name}`);
    console.log(`  Role: ${user.role}\n`);
    
    // Set password to "admin123" 
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('Setting password for HR user...');
    await sql.query`
      UPDATE hr_users 
      SET hashed_password = ${hashedPassword}
      WHERE id = ${user.id}
    `;
    
    console.log('✅ Password set successfully!');
    console.log('\n=== HR LOGIN CREDENTIALS ===');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log('=============================\n');
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.close();
    process.exit(1);
  }
}

setupHRPassword();

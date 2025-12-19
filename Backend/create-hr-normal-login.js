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

async function createHRNormalLoginTable() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    // Step 1: Drop existing table if it exists
    console.log('Step 1: Checking and dropping existing hr_normal_login table...');
    try {
      await sql.query`
        IF OBJECT_ID('dbo.hr_normal_login', 'U') IS NOT NULL
        DROP TABLE dbo.hr_normal_login
      `;
      console.log('✅ Dropped existing hr_normal_login table\n');
    } catch (error) {
      console.log('⚠️  No existing table to drop\n');
    }
    
    // Step 2: Create new hr_normal_login table
    console.log('Step 2: Creating new hr_normal_login table...');
    await sql.query`
      CREATE TABLE dbo.hr_normal_login (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) UNIQUE NOT NULL,
        hashed_password NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100) NULL,
        last_name NVARCHAR(100) NULL,
        display_name NVARCHAR(255) NULL,
        role NVARCHAR(50) DEFAULT 'hr' NOT NULL,
        department NVARCHAR(100) NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
      )
    `;
    console.log('✅ Created new hr_normal_login table\n');
    
    // Step 3: Create indexes
    console.log('Step 3: Creating indexes...');
    await sql.query`CREATE INDEX IX_hr_normal_login_email ON dbo.hr_normal_login(email)`;
    await sql.query`CREATE INDEX IX_hr_normal_login_is_active ON dbo.hr_normal_login(is_active)`;
    console.log('✅ Indexes created\n');
    
    // Step 4: Hash the password
    console.log('Step 4: Hashing password...');
    const plainPassword = 'admin@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    console.log('✅ Password hashed\n');
    
    // Step 5: Insert HR user
    console.log('Step 5: Inserting HR user...');
    await sql.query`
      INSERT INTO dbo.hr_normal_login (
        email, 
        hashed_password, 
        first_name, 
        last_name, 
        display_name, 
        role, 
        department, 
        is_active
      )
      VALUES (
        'pulipatisimha@gmail.com',
        ${hashedPassword},
        'Pulipati',
        'Simha',
        'Pulipati Simha',
        'lead_hr',
        'Human Resources',
        1
      )
    `;
    console.log('✅ HR user inserted\n');
    
    // Step 6: Verify the data
    console.log('Step 6: Verifying inserted data...');
    const result = await sql.query`
      SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        department,
        is_active,
        LEN(hashed_password) as password_length,
        created_at
      FROM dbo.hr_normal_login
    `;
    
    console.log('=== HR_NORMAL_LOGIN TABLE DATA ===');
    result.recordset.forEach(user => {
      console.log(`\n  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Department: ${user.department}`);
      console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`  Password Hash Length: ${user.password_length} characters`);
      console.log(`  Created: ${user.created_at}`);
    });
    
    // Step 7: Test password verification
    console.log('\n\nStep 7: Testing password verification...');
    const verifyResult = await sql.query`
      SELECT hashed_password FROM dbo.hr_normal_login WHERE email = 'pulipatisimha@gmail.com'
    `;
    
    const storedHash = verifyResult.recordset[0].hashed_password;
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    
    if (isMatch) {
      console.log('✅ Password verification successful!');
      console.log('   Password "admin@123" matches the stored hash');
    } else {
      console.log('❌ Password verification failed!');
    }
    
    console.log('\n\n=== SETUP COMPLETE ===');
    console.log('\n📋 HR Login Credentials:');
    console.log('   Email: pulipatisimha@gmail.com');
    console.log('   Password: admin@123');
    console.log('\n✅ You can now login to the HR portal with these credentials!\n');
    
    await sql.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await sql.close();
    process.exit(1);
  }
}

createHRNormalLoginTable();

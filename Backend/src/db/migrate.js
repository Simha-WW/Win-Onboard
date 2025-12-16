/**
 * Database Migration Script
 * Creates HR and Freshers tables in the hackathon database
 */

// Load environment variables first
require('dotenv').config();

const sql = require('mssql');

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function migrate() {
  try {
    console.log('🔌 Connecting to MSSQL database...');
    const pool = await sql.connect(config);
    console.log('✅ Connected to database');

    // Create HR table
    console.log('📋 Creating HR table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='hr' AND xtype='U')
      CREATE TABLE hr (
        id INT IDENTITY(1,1) PRIMARY KEY,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        username NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) DEFAULT 'hr_executive',
        department NVARCHAR(100),
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    console.log('✅ HR table created/verified');

    // Create Freshers table  
    console.log('📋 Creating Freshers table...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='freshers' AND xtype='U')
      CREATE TABLE freshers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        date_of_birth DATE,
        phone_number NVARCHAR(20),
        joining_date DATE,
        designation NVARCHAR(100),
        username NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        created_by NVARCHAR(255),
        status NVARCHAR(20) DEFAULT 'pending',
        manager_email NVARCHAR(255),
        department NVARCHAR(100)
      )
    `);
    console.log('✅ Freshers table created/verified');

    // Insert test HR user
    console.log('👤 Creating test HR user...');
    
    // Check if HR user already exists
    const existingHR = await pool.request()
      .input('email', sql.NVarChar, 'vijayasimhatest@gmail.com')
      .query('SELECT id FROM hr WHERE email = @email');

    if (existingHR.recordset.length === 0) {
      // Hash the default password (you should change this)
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 12);

      await pool.request()
        .input('firstName', sql.NVarChar, 'Vijaya')
        .input('lastName', sql.NVarChar, 'Simha')
        .input('email', sql.NVarChar, 'vijayasimhatest@gmail.com')
        .input('username', sql.NVarChar, 'vijaya.simha')
        .input('passwordHash', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, 'hr_admin')
        .input('department', sql.NVarChar, 'Human Resources')
        .query(`
          INSERT INTO hr (first_name, last_name, email, username, password_hash, role, department)
          VALUES (@firstName, @lastName, @email, @username, @passwordHash, @role, @department)
        `);
      
      console.log('✅ Test HR user created');
      console.log('📧 Email: vijayasimhatest@gmail.com');
      console.log('🔑 Password: admin123 (please change this in production!)');
    } else {
      console.log('✅ HR user already exists');
    }

    await pool.close();
    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
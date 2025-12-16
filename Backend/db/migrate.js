/**
 * Database Migration Script
 * Creates HR and Freshers tables in the hackathon database
 * Run this script to set up the required database schema
 */

const sql = require('mssql');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Database configuration
const config = {
  server: process.env.SERVER_NAME || 'sql-server-hackathon.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USERNAME || 'sqladmin',
  password: process.env.DB_PASSWORD || 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function runMigration() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected to hackathon database');

    // Read and execute HR table schema
    console.log('📋 Creating HR users table...');
    const hrSchema = fs.readFileSync(path.join(__dirname, 'schema', 'hr_table.sql'), 'utf8');
    await pool.request().query(hrSchema);
    console.log('✅ HR users table created');

    // Read and execute Freshers table schema
    console.log('📋 Creating Freshers table...');
    const freshersSchema = fs.readFileSync(path.join(__dirname, 'schema', 'freshers_table.sql'), 'utf8');
    await pool.request().query(freshersSchema);
    console.log('✅ Freshers table created');

    // Create proper password hash for initial HR user
    console.log('🔐 Setting up initial HR user with encrypted password...');
    const saltRounds = 12;
    const initialPassword = 'TempHR123!'; // Change this password after first login
    const passwordHash = await bcrypt.hash(initialPassword, saltRounds);

    // Update the initial HR user with proper password hash
    const updateHRQuery = `
      UPDATE hr_users 
      SET password_hash = @passwordHash
      WHERE email = 'vijayasimhatest@gmail.com'
    `;
    
    await pool.request()
      .input('passwordHash', sql.NVarChar, passwordHash)
      .query(updateHRQuery);

    console.log('✅ Initial HR user password encrypted and updated');
    console.log('📧 HR Email: vijayasimhatest@gmail.com');
    console.log('🔑 Temporary Password: ' + initialPassword);
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    // Display summary
    console.log('\n📊 Database Migration Summary:');
    console.log('✅ hr_users table: Created with 1 admin user');
    console.log('✅ freshers table: Created and ready for new users');
    console.log('✅ Indexes and triggers: Set up for performance');
    console.log('✅ Foreign key constraints: HR to Freshers relationship established');
    
    // Test the tables
    const hrCount = await pool.request().query('SELECT COUNT(*) as count FROM hr_users');
    const freshersCount = await pool.request().query('SELECT COUNT(*) as count FROM freshers');
    
    console.log(`\n📈 Current Records:`);
    console.log(`   HR Users: ${hrCount.recordset[0].count}`);
    console.log(`   Freshers: ${freshersCount.recordset[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  
  runMigration()
    .then(() => {
      console.log('\n🎉 Database migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
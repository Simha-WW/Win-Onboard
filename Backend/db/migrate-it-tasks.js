/**
 * IT Tasks Table Migration Script
 * Creates the IT tasks table for tracking onboarding progress
 */

const sql = require('mssql');
const path = require('path');
const fs = require('fs');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database configuration
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

console.log('📝 Database Config:', {
  server: config.server,
  database: config.database,
  user: config.user
});

async function runItTasksMigration() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected to hackathon database');

    // Read and execute IT tasks table schema
    console.log('📋 Creating IT tasks table...');
    const itTasksSchema = fs.readFileSync(path.join(__dirname, 'schema', 'it_tasks_table.sql'), 'utf8');
    
    // For MSSQL, we need to split by GO statements and execute separately
    const statements = itTasksSchema
      .split(/\bGO\b/gi)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.request().query(statement);
      }
    }
    
    console.log('✅ IT tasks table created');

    // Check if table was created successfully
    const tableCheck = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'it_tasks'
    `);

    if (tableCheck.recordset[0].count > 0) {
      console.log('✅ IT tasks table verified');
      
      // Get current count
      const itTasksCount = await pool.request().query('SELECT COUNT(*) as count FROM it_tasks');
      console.log(`📈 Current IT Tasks: ${itTasksCount.recordset[0].count}`);
    } else {
      throw new Error('IT tasks table was not created');
    }

    // Create a dummy IT task for testing if there are freshers in the database
    const fresherCheck = await pool.request().query('SELECT TOP 1 id, first_name, last_name, email, designation FROM freshers');
    
    if (fresherCheck.recordset.length > 0) {
      const fresher = fresherCheck.recordset[0];
      console.log(`\n🧪 Creating dummy IT task for fresher: ${fresher.name}`);
      
      // Check if IT task already exists for this fresher
      const existingTask = await pool.request()
        .input('fresherId', sql.Int, fresher.id)
        .query('SELECT id FROM it_tasks WHERE fresher_id = @fresherId');
      
      if (existingTask.recordset.length === 0) {
        await pool.request()
          .input('fresherId', sql.Int, fresher.id)
          .query(`
            INSERT INTO it_tasks (
              fresher_id,
              sent_to_it_date,
              work_email_generated,
              laptop_allocated,
              software_installed,
              access_cards_issued,
              training_scheduled,
              hardware_accessories,
              vpn_setup,
              network_access_granted,
              domain_account_created,
              security_tools_configured
            )
            VALUES (
              @fresherId,
              GETDATE(),
              1, 0, 1, 0, 0, 1, 0, 0, 0, 0
            )
          `);
        
        console.log('✅ Dummy IT task created');
        console.log(`   Fresher: ${fresher.first_name} ${fresher.last_name} (${fresher.email})`);
        console.log(`   Designation: ${fresher.designation || 'N/A'}`);
        console.log(`   Tasks: 3/10 completed (30%)`);
      } else {
        console.log('ℹ️  IT task already exists for this fresher');
      }
    } else {
      console.log('⚠️  No freshers found in database. Create a fresher first to see dummy data.');
    }

    console.log('\n📊 IT Tasks Migration Summary:');
    console.log('✅ it_tasks table: Created with proper schema');
    console.log('✅ Indexes: Set up for performance');
    console.log('✅ Foreign key: Links to freshers table');
    console.log('✅ Triggers: Auto-update timestamps configured');

  } catch (error) {
    console.error('❌ IT Tasks migration failed:', error);
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
  runItTasksMigration()
    .then(() => {
      console.log('\n🎉 IT Tasks table migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 IT Tasks migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runItTasksMigration };

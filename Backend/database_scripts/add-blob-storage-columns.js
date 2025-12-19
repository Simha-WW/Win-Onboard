/**
 * Migration Script: Add Blob Storage Support to BGV Demographics Table
 * Adds blob_name columns for Azure Blob Storage integration
 * Run this script to upgrade existing BGV tables
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function addBlobStorageColumns() {
  let pool;
  
  try {
    console.log('📡 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Database connected');

    console.log('\n🔧 Adding Blob Storage columns to bgv_demographics table...\n');

    // Check if columns already exist
    const checkColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'bgv_demographics' 
      AND COLUMN_NAME IN ('aadhaar_blob_name', 'pan_blob_name', 'resume_blob_name')
    `);

    if (checkColumns.recordset.length > 0) {
      console.log('⚠️  Blob storage columns already exist. Skipping migration.');
      return;
    }

    // Add blob name columns
    const alterStatements = [
      {
        name: 'aadhaar_blob_name',
        sql: `ALTER TABLE bgv_demographics ADD aadhaar_blob_name NVARCHAR(500) NULL;`
      },
      {
        name: 'pan_blob_name',
        sql: `ALTER TABLE bgv_demographics ADD pan_blob_name NVARCHAR(500) NULL;`
      },
      {
        name: 'resume_blob_name',
        sql: `ALTER TABLE bgv_demographics ADD resume_blob_name NVARCHAR(500) NULL;`
      }
    ];

    for (const statement of alterStatements) {
      try {
        console.log(`📝 Adding column: ${statement.name}...`);
        await pool.request().query(statement.sql);
        console.log(`✅ Column ${statement.name} added successfully`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Column ${statement.name} already exists`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Blob storage columns migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Configure Azure Storage connection string in .env file');
    console.log('2. Set AZURE_STORAGE_CONNECTION_STRING environment variable');
    console.log('3. Set AZURE_STORAGE_CONTAINER_NAME (default: bgv-documents)');
    console.log('4. Restart the application');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n📡 Database connection closed');
    }
  }
}

// Run migration
addBlobStorageColumns()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });

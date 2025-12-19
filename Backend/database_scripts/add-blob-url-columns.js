/**
 * Migration Script: Add Blob URL Columns for Frontend Direct Upload
 * Adds file URL columns for documents uploaded directly from frontend to Azure Blob
 * Run this script to add URL storage columns
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
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

async function addBlobUrlColumns() {
  let pool;
  
  try {
    console.log('📡 Connecting to database...');
    console.log('   Server:', config.server);
    console.log('   Database:', config.database);
    console.log('   User:', config.user);
    
    pool = await sql.connect(config);
    console.log('✅ Database connected');

    console.log('\n🔧 Adding Blob URL columns to bgv_demographics table...\n');

    // Check if columns already exist
    const checkColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'bgv_demographics' 
      AND COLUMN_NAME IN ('aadhaar_doc_file_url', 'pan_file_url', 'resume_file_url')
    `);

    if (checkColumns.recordset.length > 0) {
      console.log('⚠️  Blob URL columns already exist. Skipping migration.');
      console.log('   Existing columns:', checkColumns.recordset.map(r => r.COLUMN_NAME).join(', '));
      return;
    }

    // Add URL columns for documents
    const alterStatements = [
      {
        name: 'aadhaar_doc_file_url',
        sql: `ALTER TABLE bgv_demographics ADD aadhaar_doc_file_url NVARCHAR(1000) NULL;`,
        description: 'Aadhaar document blob URL'
      },
      {
        name: 'pan_file_url',
        sql: `ALTER TABLE bgv_demographics ADD pan_file_url NVARCHAR(1000) NULL;`,
        description: 'PAN card document blob URL'
      },
      {
        name: 'resume_file_url',
        sql: `ALTER TABLE bgv_demographics ADD resume_file_url NVARCHAR(1000) NULL;`,
        description: 'Resume document blob URL'
      }
    ];

    for (const statement of alterStatements) {
      try {
        console.log(`📝 Adding column: ${statement.name} (${statement.description})...`);
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

    console.log('\n✅ Blob URL columns migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('   ✓ aadhaar_doc_file_url - Stores Aadhaar document Azure Blob URL');
    console.log('   ✓ pan_file_url - Stores PAN card document Azure Blob URL');
    console.log('   ✓ resume_file_url - Stores resume document Azure Blob URL');
    console.log('\nNext steps:');
    console.log('1. Frontend will upload files directly to Azure Blob Storage');
    console.log('2. Frontend will receive blob URLs from Azure');
    console.log('3. Frontend will submit URLs to backend API');
    console.log('4. Backend will save URLs in these new columns');
    console.log('5. Old VARBINARY columns can be deprecated');

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
addBlobUrlColumns()
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });

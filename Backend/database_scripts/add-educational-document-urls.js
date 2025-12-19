/**
 * Migration Script: Add document URL columns to educational_details
 * Adds document_urls column for storing blob URLs
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
  }
};

async function addEducationalDocumentUrlColumn() {
  let pool;
  
  try {
    console.log('📡 Connecting to database...');
    console.log('   Server:', config.server);
    console.log('   Database:', config.database);
    
    pool = await sql.connect(config);
    console.log('✅ Database connected\n');

    console.log('🔧 Adding document_urls column to educational_details table...\n');

    // Check if column already exists
    const checkColumn = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'educational_details' 
      AND COLUMN_NAME = 'document_urls'
    `);

    if (checkColumn.recordset.length > 0) {
      console.log('⚠️  document_urls column already exists. Skipping migration.');
      return;
    }

    // Add document_urls column
    console.log('📝 Adding column: document_urls (NVARCHAR(MAX))...');
    await pool.request().query(`
      ALTER TABLE educational_details 
      ADD document_urls NVARCHAR(MAX) NULL
    `);
    
    console.log('✅ Column document_urls added successfully\n');

    console.log('✅ Educational document URL column migration completed!');
    console.log('\n📋 Migration Summary:');
    console.log('   ✓ document_urls - Stores JSON array of blob URLs');
    console.log('\nStructure:');
    console.log('   [');
    console.log('     {');
    console.log('       "fileName": "certificate.pdf",');
    console.log('       "fileUrl": "https://...blob.core.windows.net/...",');
    console.log('       "fileType": "application/pdf",');
    console.log('       "fileSize": 12345');
    console.log('     }');
    console.log('   ]');

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

addEducationalDocumentUrlColumn()
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });

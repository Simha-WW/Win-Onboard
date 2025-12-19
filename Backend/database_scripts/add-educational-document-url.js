/**
 * Add document_url column to educational_details table
 * This replaces the document_urls (array) with document_url (single URL string)
 */

require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function addDocumentUrlColumn() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);
    
    console.log('✅ Connected successfully\n');
    
    // Check if document_url column already exists
    console.log('🔍 Checking if document_url column exists...');
    const checkColumn = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details'
      AND COLUMN_NAME = 'document_url'
    `);
    
    if (checkColumn.recordset.length > 0) {
      console.log('ℹ️  Column document_url already exists\n');
    } else {
      console.log('➕ Adding document_url column...');
      await pool.request().query(`
        ALTER TABLE educational_details
        ADD document_url NVARCHAR(1000) NULL
      `);
      console.log('✅ Column document_url added successfully\n');
    }
    
    // Show current table structure
    console.log('📋 Current educational_details table structure:');
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.table(columns.recordset);
    
    await sql.close();
    console.log('\n✅ Migration complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDocumentUrlColumn();

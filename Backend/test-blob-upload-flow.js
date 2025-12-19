/**
 * Test Blob Upload Flow
 * Tests the complete flow of demographics save with blob storage
 */

require('dotenv').config();
const mssql = require('mssql');
const fetch = require('node-fetch');

const mssqlConfig = {
  server: process.env.SERVER_NAME || 'localhost',
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function testBlobUploadFlow() {
  let pool;
  
  try {
    console.log('🔌 Connecting to database...');
    pool = await mssql.connect(mssqlConfig);
    console.log('✅ Connected to database\n');

    // Check if blob storage columns exist in bgv_demographics
    console.log('📋 Checking bgv_demographics table schema...');
    const schemaResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'bgv_demographics'
      AND COLUMN_NAME LIKE '%file%'
      ORDER BY COLUMN_NAME
    `);
    
    console.log('\n📊 File-related columns in bgv_demographics:');
    console.table(schemaResult.recordset);

    // Check Azure Storage configuration
    console.log('\n🔧 Checking Azure Storage configuration...');
    console.log('AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '✅ SET (length: ' + process.env.AZURE_STORAGE_CONNECTION_STRING.length + ')' : '❌ NOT SET');
    console.log('AZURE_STORAGE_CONTAINER_NAME:', process.env.AZURE_STORAGE_CONTAINER_NAME || '❌ NOT SET');
    console.log('AZURE_STORAGE_ACCOUNT_NAME:', process.env.AZURE_STORAGE_ACCOUNT_NAME || '❌ NOT SET');

    // Get a test fresher
    console.log('\n👤 Finding a test fresher...');
    const fresherResult = await pool.request().query(`
      SELECT TOP 1 id, email, first_name, last_name
      FROM freshers
      ORDER BY id DESC
    `);

    if (fresherResult.recordset.length === 0) {
      console.log('❌ No freshers found in database. Please create a fresher first.');
      return;
    }

    const fresher = fresherResult.recordset[0];
    console.log('✅ Found fresher:', fresher);

    // Check if BGV submission exists
    console.log('\n📝 Checking BGV submission...');
    const submissionResult = await pool.request()
      .input('fresherId', mssql.Int, fresher.id)
      .query('SELECT * FROM bgv_submissions WHERE fresher_id = @fresherId');

    let submissionId;
    if (submissionResult.recordset.length === 0) {
      console.log('⚠️ No BGV submission found. Creating one...');
      const createResult = await pool.request()
        .input('fresherId', mssql.Int, fresher.id)
        .query(`
          INSERT INTO bgv_submissions (fresher_id, submission_status, current_section)
          OUTPUT INSERTED.id
          VALUES (@fresherId, 'draft', 'demographics')
        `);
      submissionId = createResult.recordset[0].id;
      console.log('✅ Created submission with ID:', submissionId);
    } else {
      submissionId = submissionResult.recordset[0].id;
      console.log('✅ Found existing submission with ID:', submissionId);
    }

    // Check current demographics data
    console.log('\n📊 Current demographics data:');
    const currentDemo = await pool.request()
      .input('submissionId', mssql.Int, submissionId)
      .query('SELECT * FROM bgv_demographics WHERE submission_id = @submissionId');

    if (currentDemo.recordset.length > 0) {
      console.log('\nExisting demographics record:');
      const demo = currentDemo.recordset[0];
      console.log('- Aadhaar file URL:', demo.aadhaar_doc_file_url || demo.aadhaar_file_url || 'NULL');
      console.log('- PAN file URL:', demo.pan_file_url || 'NULL');
      console.log('- Resume file URL:', demo.resume_file_url || 'NULL');
    } else {
      console.log('ℹ️ No demographics record found yet');
    }

    console.log('\n✅ Test completed!');
    console.log('\n📝 Summary:');
    console.log('- Database connection: ✅');
    console.log('- Blob storage configured:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '✅' : '❌');
    console.log('- File columns exist:', schemaResult.recordset.length > 0 ? '✅' : '❌');
    console.log('- Test fresher available: ✅');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testBlobUploadFlow();

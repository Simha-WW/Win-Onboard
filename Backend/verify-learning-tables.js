/**
 * Verify Learning Tables Structure
 */

const sql = require('mssql');

// Database configuration
const config = {
  server: process.env.SERVER_NAME || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
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

// Use Windows Authentication if no username provided
if (process.env.DB_USERNAME) {
  config.user = process.env.DB_USERNAME;
  config.password = process.env.DB_PASSWORD;
} else {
  // Windows Authentication
  config.options.trustedConnection = true;
}

async function verifyTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected to database:', config.database);

    // Check if tables exist
    const tablesCheck = await sql.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME IN ('user_learning_assignments', 'user_learning_progress')
      ORDER BY TABLE_NAME
    `);

    console.log('\n📋 Tables found:', tablesCheck.recordset.length);
    tablesCheck.recordset.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });

    if (tablesCheck.recordset.length === 0) {
      console.log('\n❌ Tables do not exist! Need to create them.');
      return;
    }

    // Check user_learning_assignments columns
    console.log('\n🔍 Checking user_learning_assignments columns...');
    const assignmentsColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'user_learning_assignments'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Columns in user_learning_assignments:');
    assignmentsColumns.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check user_learning_progress columns
    console.log('\n🔍 Checking user_learning_progress columns...');
    const progressColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'user_learning_progress'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Columns in user_learning_progress:');
    progressColumns.recordset.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Count rows
    console.log('\n📊 Checking row counts...');
    const assignmentsCount = await sql.query('SELECT COUNT(*) as count FROM user_learning_assignments');
    const progressCount = await sql.query('SELECT COUNT(*) as count FROM user_learning_progress');
    console.log(`   - user_learning_assignments: ${assignmentsCount.recordset[0].count} rows`);
    console.log(`   - user_learning_progress: ${progressCount.recordset[0].count} rows`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sql.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run verification
verifyTables()
  .then(() => {
    console.log('\n✨ Verification completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Verification failed:', error.message);
    process.exit(1);
  });

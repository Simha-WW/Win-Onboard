/**
 * Check Learning Tables Structure
 */

const sql = require('mssql');

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

if (process.env.DB_USERNAME) {
  config.user = process.env.DB_USERNAME;
  config.password = process.env.DB_PASSWORD;
} else {
  config.options.trustedConnection = true;
}

async function checkTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected');

    // Check all learning tables
    const tables = ['da_learnings', 'app_dev_learnings', 'hr_learnings', 'other_dept_learnings'];

    for (const table of tables) {
      console.log(`\n📋 Checking ${table}...`);
      
      // Get columns
      const columns = await sql.query`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = ${table}
        ORDER BY ORDINAL_POSITION
      `;

      if (columns.recordset.length === 0) {
        console.log(`   ❌ Table ${table} not found`);
        continue;
      }

      console.log(`   Columns:`);
      columns.recordset.forEach(col => {
        console.log(`      - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
      });

      // Get sample data
      const data = await sql.query(`SELECT TOP 3 * FROM ${table}`);
      console.log(`   Sample data: ${data.recordset.length} rows`);
      if (data.recordset.length > 0) {
        console.log('   First row:', data.recordset[0]);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sql.close();
    console.log('\n🔌 Closed');
  }
}

checkTables()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });

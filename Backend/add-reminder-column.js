const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: process.env.SERVER_NAME || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USERNAME || 'sqladmin',
  password: process.env.DB_PASSWORD || 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    requestTimeout: 60000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  }
};

async function addReminderColumn() {
  let pool;
  try {
    console.log('🔗 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!\n');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'add-reminder-column.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the script
    console.log('⚙️ Adding last_reminder_sent column...');
    const result = await pool.request().query(sqlScript);
    console.log('✅ Column added successfully!');
    if (result.recordset && result.recordset.length > 0) {
      console.log('Result:', result.recordset);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.precedingErrors) {
      error.precedingErrors.forEach((err, idx) => {
        console.error(`Preceding Error ${idx + 1}:`, err.message);
      });
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

addReminderColumn();

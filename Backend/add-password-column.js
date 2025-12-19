require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.SERVER_NAME || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  user: process.env.DB_USERNAME || 'sqladmin',
  password: process.env.DB_PASSWORD || 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

console.log('Using server:', config.server);

async function addPasswordColumn() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    console.log('Adding hashed_password column to hr_users table...');
    
    // Check if column already exists
    const checkColumn = await sql.query`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'hr_users' AND COLUMN_NAME = 'hashed_password'
    `;
    
    if (checkColumn.recordset.length > 0) {
      console.log('⚠️  Column hashed_password already exists');
    } else {
      // Add the column
      await sql.query`
        ALTER TABLE hr_users 
        ADD hashed_password NVARCHAR(255) NULL
      `;
      console.log('✅ Successfully added hashed_password column');
    }
    
    // Verify the change
    console.log('\n=== Updated HR_USERS TABLE STRUCTURE ===');
    const columns = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'hr_users' 
      ORDER BY ORDINAL_POSITION
    `;
    
    columns.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}`);
    });
    
    await sql.close();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.close();
    process.exit(1);
  }
}

addPasswordColumn();

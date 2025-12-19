const sql = require('mssql');

const config = {
  server: 'sql-server-winbuild.database.windows.net',
  database: 'hackathon',
  user: 'sqladmin',
  password: 'admin@123',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function checkHRTable() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    // Check table structure
    console.log('=== HR_USERS TABLE STRUCTURE ===');
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
    
    // Check existing HR users
    console.log('\n=== EXISTING HR USERS ===');
    const users = await sql.query`SELECT id, email, first_name, last_name, role, microsoft_id FROM hr_users`;
    console.log(`Found ${users.recordset.length} HR user(s):\n`);
    users.recordset.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Microsoft ID: ${user.microsoft_id || 'Not set'}`);
      console.log('');
    });
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.close();
  }
}

checkHRTable();

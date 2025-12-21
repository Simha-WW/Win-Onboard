const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkColumns() {
  try {
    await sql.connect(config);
    console.log('Connected to database');
    
    const result = await sql.query`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_learning_assignments'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log('\nCurrent columns in user_learning_assignments:');
    result.recordset.forEach(row => {
      console.log('  -', row.COLUMN_NAME);
    });
    
    await sql.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkColumns();

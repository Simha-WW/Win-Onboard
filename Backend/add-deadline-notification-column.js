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

async function addDeadlineNotificationColumn() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database');
    
    // Check if column exists
    const checkColumn = await sql.query`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_learning_assignments' 
      AND COLUMN_NAME = 'deadline_notification_sent'
    `;
    
    if (checkColumn.recordset.length > 0) {
      console.log('⚠️  Column deadline_notification_sent already exists');
    } else {
      // Add the column
      await sql.query`
        ALTER TABLE user_learning_assignments
        ADD deadline_notification_sent DATETIME NULL
      `;
      console.log('✅ Added deadline_notification_sent column');
    }
    
    // Verify
    const verify = await sql.query`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_learning_assignments'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log('\n📋 All columns in user_learning_assignments:');
    verify.recordset.forEach(row => {
      console.log('  -', row.COLUMN_NAME);
    });
    
    await sql.close();
    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

addDeadlineNotificationColumn();

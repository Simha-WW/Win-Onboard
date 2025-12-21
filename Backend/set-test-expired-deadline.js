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

async function setTestExpiredDeadline() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    // Get fresher 226's current deadline
    const current = await sql.query`
      SELECT 
        fresher_id,
        deadline,
        duration_to_complete_days,
        deadline_notification_sent
      FROM user_learning_assignments
      WHERE fresher_id = 226
    `;
    
    if (current.recordset.length === 0) {
      console.log('❌ Fresher 226 not found');
      await sql.close();
      return;
    }
    
    console.log('📋 Current state for Fresher 226:');
    console.log('   Deadline:', new Date(current.recordset[0].deadline).toLocaleString());
    console.log('   Duration:', current.recordset[0].duration_to_complete_days, 'days');
    console.log('   Notification sent:', current.recordset[0].deadline_notification_sent || 'Not yet');
    
    // Set deadline to 1 day ago for testing
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await sql.query`
      UPDATE user_learning_assignments
      SET deadline = ${yesterday},
          deadline_notification_sent = NULL
      WHERE fresher_id = 226
    `;
    
    console.log('\n✅ Updated deadline to:', yesterday.toLocaleString());
    console.log('   (1 day ago - expired for testing)');
    console.log('   Reset notification_sent to NULL');
    
    // Verify
    const verify = await sql.query`
      SELECT 
        fresher_id,
        deadline,
        DATEDIFF(DAY, deadline, GETDATE()) as days_overdue,
        deadline_notification_sent
      FROM user_learning_assignments
      WHERE fresher_id = 226
    `;
    
    console.log('\n📊 Verified state:');
    console.log('   Deadline:', new Date(verify.recordset[0].deadline).toLocaleString());
    console.log('   Days overdue:', verify.recordset[0].days_overdue);
    console.log('   Notification sent:', verify.recordset[0].deadline_notification_sent || 'Not yet (ready for test)');
    
    console.log('\n✅ Ready to test! Run: npm run dev');
    console.log('   Then check the console for deadline expiry notifications');
    console.log('   Or manually trigger with CHECK_DEADLINES_ON_STARTUP=true in .env');
    
    await sql.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

setTestExpiredDeadline();

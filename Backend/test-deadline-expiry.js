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

async function testDeadlineExpiry() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    // Check for expired deadlines
    const result = await sql.query`
      SELECT 
        ula.fresher_id,
        f.first_name + ' ' + f.last_name as fresher_name,
        f.email as fresher_email,
        ula.department,
        ula.deadline,
        ula.duration_to_complete_days,
        SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count,
        COUNT(ulp.id) as total_count,
        CASE 
          WHEN COUNT(ulp.id) > 0 
          THEN ROUND((CAST(SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ulp.id)) * 100, 0)
          ELSE 0 
        END as completion_percentage,
        ula.deadline_notification_sent,
        DATEDIFF(DAY, ula.deadline, GETDATE()) as days_overdue
      FROM user_learning_assignments ula
      INNER JOIN freshers f ON ula.fresher_id = f.id
      LEFT JOIN user_learning_progress ulp ON ula.fresher_id = ulp.fresher_id
      WHERE 
        ula.is_active = 1
        AND ula.deadline IS NOT NULL
      GROUP BY 
        ula.fresher_id,
        f.first_name,
        f.last_name,
        f.email,
        ula.department,
        ula.deadline,
        ula.duration_to_complete_days,
        ula.deadline_notification_sent
      ORDER BY ula.deadline ASC
    `;

    console.log('📊 Learning Deadline Status Report\n');
    console.log('=' .repeat(80));
    
    if (result.recordset.length === 0) {
      console.log('No learning assignments with deadlines found.');
      await sql.close();
      return;
    }

    let expiredCount = 0;
    let activeCount = 0;
    let notifiedCount = 0;

    result.recordset.forEach(assignment => {
      const isExpired = assignment.days_overdue > 0;
      const hasBeenNotified = assignment.deadline_notification_sent !== null;
      
      if (isExpired) {
        expiredCount++;
        if (hasBeenNotified) notifiedCount++;
      } else {
        activeCount++;
      }

      console.log(`\n${isExpired ? '🔴 EXPIRED' : '🟢 ACTIVE'} - ${assignment.fresher_name}`);
      console.log(`   Email: ${assignment.fresher_email}`);
      console.log(`   Department: ${assignment.department}`);
      console.log(`   Deadline: ${new Date(assignment.deadline).toLocaleDateString()}`);
      console.log(`   Duration: ${assignment.duration_to_complete_days} days`);
      console.log(`   Progress: ${assignment.completion_percentage}% (${assignment.completed_count}/${assignment.total_count})`);
      
      if (isExpired) {
        console.log(`   Days Overdue: ${assignment.days_overdue}`);
        console.log(`   Notification Sent: ${hasBeenNotified ? '✅ Yes (' + new Date(assignment.deadline_notification_sent).toLocaleString() + ')' : '❌ No (pending)'}`);
      } else {
        const daysRemaining = Math.abs(assignment.days_overdue);
        console.log(`   Days Remaining: ${daysRemaining}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📈 Summary:');
    console.log(`   Total Assignments: ${result.recordset.length}`);
    console.log(`   Active (Not Expired): ${activeCount}`);
    console.log(`   Expired: ${expiredCount}`);
    console.log(`   Notifications Sent: ${notifiedCount}`);
    console.log(`   Pending Notifications: ${expiredCount - notifiedCount}`);

    await sql.close();
    console.log('\n✅ Test completed');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testDeadlineExpiry();

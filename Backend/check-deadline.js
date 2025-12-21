const sql = require('mssql');

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

async function checkDeadline() {
  let pool;
  try {
    console.log('🔗 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!\n');

    // Check current state
    console.log('📊 Current state for fresher 226:');
    const current = await pool.request().query(`
      SELECT 
        ula.fresher_id,
        ula.duration_to_complete_days,
        ula.deadline,
        DATEDIFF(DAY, GETDATE(), ula.deadline) as days_remaining,
        COUNT(ulp.id) as total_items,
        SUM(ulp.duration_minutes) as total_minutes,
        SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count
      FROM user_learning_assignments ula
      LEFT JOIN user_learning_progress ulp ON ula.fresher_id = ulp.fresher_id
      WHERE ula.fresher_id = 226
      GROUP BY ula.fresher_id, ula.duration_to_complete_days, ula.deadline
    `);

    console.log(current.recordset[0]);

    // Get all learning items
    console.log('\n📋 All learning items:');
    const items = await pool.request().query(`
      SELECT 
        id,
        learning_id,
        learning_title,
        duration_minutes,
        is_completed
      FROM user_learning_progress
      WHERE fresher_id = 226
      ORDER BY id
    `);

    items.recordset.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.learning_title} - ${item.duration_minutes || 0} mins ${item.is_completed ? '✅' : '⏳'}`);
    });

    const totalMinutes = items.recordset.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
    const baseDays = Math.ceil(totalMinutes / 60); // Each hour = 1 day
    console.log(`\n  Total duration: ${totalMinutes} minutes (${baseDays} base days)`);
    console.log(`  Should be: ${baseDays + 2} days total (including 2 extra days)`);

    // Recalculate and update deadline
    const shouldBeDays = baseDays + 2;
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + shouldBeDays);

    console.log('\n🔄 Updating deadline based on total duration...');
    await pool.request()
      .input('fresherId', sql.Int, 226)
      .input('durationDays', sql.Int, shouldBeDays)
      .input('deadline', sql.DateTime, newDeadline)
      .query(`
        UPDATE user_learning_assignments
        SET duration_to_complete_days = @durationDays,
            deadline = @deadline
        WHERE fresher_id = @fresherId
      `);

    console.log(`✅ Updated deadline to: ${newDeadline.toISOString()}`);
    console.log(`   Duration: ${shouldBeDays} days`);
    console.log(`   Days remaining from now: ${shouldBeDays}`);

    // Verify
    const verify = await pool.request().query(`
      SELECT 
        duration_to_complete_days,
        deadline,
        DATEDIFF(DAY, GETDATE(), deadline) as days_remaining
      FROM user_learning_assignments
      WHERE fresher_id = 226
    `);

    console.log('\n✅ Final verification:', verify.recordset[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkDeadline();

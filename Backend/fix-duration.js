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

async function updateDurations() {
  let pool;
  try {
    console.log('🔗 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!\n');

    // First, let's update the newly added item with correct duration
    console.log('📝 Looking for items that should have durations...');
    
    // Update the specific items you added
    console.log('\n🔄 Updating "ADF test 2" with 1446 minutes...');
    const updateResult = await pool.request()
      .input('fresherId', sql.Int, 226)
      .input('title', sql.NVarChar, 'ADF test 2')
      .input('duration', sql.Int, 1446)
      .query(`
        UPDATE user_learning_progress
        SET duration_minutes = @duration
        WHERE fresher_id = @fresherId 
        AND learning_title = @title
      `);

    console.log(`✅ Updated ${updateResult.rowsAffected[0]} row(s)`);

    // Now recalculate total and update deadline
    const totalResult = await pool.request().query(`
      SELECT SUM(duration_minutes) as total_minutes
      FROM user_learning_progress
      WHERE fresher_id = 226
    `);

    const totalMinutes = totalResult.recordset[0].total_minutes || 0;
    const baseDays = Math.ceil(totalMinutes / 60); // Each hour = 1 day
    const totalDays = baseDays + 2; // Add 2 extra days
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + totalDays);

    console.log(`\n📊 Recalculated totals:`);
    console.log(`   Total minutes: ${totalMinutes}`);
    console.log(`   Base days: ${baseDays}`);
    console.log(`   Total days (with 2 extra): ${totalDays}`);
    console.log(`   New deadline: ${newDeadline.toISOString()}`);

    await pool.request()
      .input('fresherId', sql.Int, 226)
      .input('durationDays', sql.Int, totalDays)
      .input('deadline', sql.DateTime, newDeadline)
      .query(`
        UPDATE user_learning_assignments
        SET duration_to_complete_days = @durationDays,
            deadline = @deadline
        WHERE fresher_id = @fresherId
      `);

    console.log('✅ Deadline updated successfully!');

    // Verify
    const verify = await pool.request().query(`
      SELECT 
        ula.duration_to_complete_days,
        ula.deadline,
        DATEDIFF(DAY, GETDATE(), ula.deadline) as days_remaining
      FROM user_learning_assignments ula
      WHERE ula.fresher_id = 226
    `);

    console.log('\n✅ Final state:', verify.recordset[0]);

    // Show all items with durations
    console.log('\n📋 All learning items:');
    const items = await pool.request().query(`
      SELECT learning_title, duration_minutes, is_completed
      FROM user_learning_progress
      WHERE fresher_id = 226
      ORDER BY id
    `);

    items.recordset.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.learning_title}: ${item.duration_minutes || 0} mins ${item.is_completed ? '✅' : '⏳'}`);
    });

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

updateDurations();

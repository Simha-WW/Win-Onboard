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

async function updateExistingAssignments() {
  let pool;
  try {
    console.log('🔗 Connecting to database...');
    pool = await sql.connect(config);
    console.log('✅ Connected successfully!\n');

    // Check current assignments
    console.log('📋 Checking existing assignments...');
    const checkResult = await pool.request().query(`
      SELECT 
        ula.fresher_id,
        ula.duration_to_complete_days,
        ula.deadline,
        COUNT(ulp.id) as total_learnings,
        SUM(ulp.duration_minutes) as total_minutes
      FROM user_learning_assignments ula
      LEFT JOIN user_learning_progress ulp ON ula.fresher_id = ulp.fresher_id
      GROUP BY ula.fresher_id, ula.duration_to_complete_days, ula.deadline
    `);

    console.log('Current assignments:', checkResult.recordset);

    // Update assignments that don't have deadline
    for (const assignment of checkResult.recordset) {
      if (!assignment.deadline || !assignment.duration_to_complete_days) {
        console.log(`\n🔄 Updating fresher ${assignment.fresher_id}...`);
        
        const totalMinutes = assignment.total_minutes || 0;
        const durationInDays = Math.ceil(totalMinutes / 60) + 2; // Each hour = 1 day + 2 extra
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + durationInDays);

        await pool.request()
          .input('fresherId', sql.Int, assignment.fresher_id)
          .input('durationDays', sql.Int, durationInDays)
          .input('deadline', sql.DateTime, deadline)
          .query(`
            UPDATE user_learning_assignments
            SET duration_to_complete_days = @durationDays,
                deadline = @deadline
            WHERE fresher_id = @fresherId
          `);

        console.log(`✅ Updated fresher ${assignment.fresher_id}:`);
        console.log(`   Total minutes: ${totalMinutes}`);
        console.log(`   Duration days: ${durationInDays}`);
        console.log(`   Deadline: ${deadline.toISOString()}`);
      } else {
        console.log(`\n✓ Fresher ${assignment.fresher_id} already has deadline set`);
      }
    }

    // Verify the updates
    console.log('\n\n📊 Final verification:');
    const verifyResult = await pool.request().query(`
      SELECT 
        f.id,
        f.first_name,
        f.last_name,
        ula.duration_to_complete_days,
        ula.deadline,
        DATEDIFF(DAY, GETDATE(), ula.deadline) as days_remaining
      FROM freshers f
      INNER JOIN user_learning_assignments ula ON f.id = ula.fresher_id
    `);

    console.log('Updated assignments:');
    verifyResult.recordset.forEach(row => {
      console.log(`  ${row.first_name} ${row.last_name} (ID: ${row.id}):`);
      console.log(`    Duration: ${row.duration_to_complete_days} days`);
      console.log(`    Deadline: ${row.deadline}`);
      console.log(`    Days remaining: ${row.days_remaining}`);
    });

    console.log('\n✅ All assignments updated successfully!');

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

updateExistingAssignments();

/**
 * Find the correct fresher_id for Pulipati Simha
 */

const sql = require('mssql');

const config = {
  server: process.env.SERVER_NAME || 'sql-server-winbuild.database.windows.net',
  database: process.env.DB_NAME || 'hackathon',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

if (process.env.DB_USERNAME) {
  config.user = process.env.DB_USERNAME;
  config.password = process.env.DB_PASSWORD;
} else {
  config.options.trustedConnection = true;
}

async function findUser() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected');

    // Find Pulipati Simha
    console.log('\n🔍 Searching for Pulipati Simha...');
    const user = await sql.query`
      SELECT id, first_name, last_name, email, designation, department
      FROM freshers
      WHERE first_name LIKE '%Pulipati%' OR last_name LIKE '%Simha%'
    `;

    if (user.recordset.length === 0) {
      console.log('❌ User not found');
      
      // Show all D&A users
      console.log('\n📋 All D&A department users:');
      const daUsers = await sql.query`
        SELECT id, first_name, last_name, email, designation, department
        FROM freshers
        WHERE department = 'D&A'
      `;
      daUsers.recordset.forEach(u => {
        console.log(`   - ID ${u.id}: ${u.first_name} ${u.last_name} (${u.email})`);
      });
    } else {
      console.log('Found user(s):');
      user.recordset.forEach(u => {
        console.log(`   - ID ${u.id}: ${u.first_name} ${u.last_name}`);
        console.log(`     Email: ${u.email}`);
        console.log(`     Designation: ${u.designation}`);
        console.log(`     Department: ${u.department}`);
      });

      // Check assignment for this user
      const userId = user.recordset[0].id;
      console.log(`\n🔍 Checking assignments for ID ${userId}...`);
      const assignment = await sql.query`
        SELECT * FROM user_learning_assignments WHERE fresher_id = ${userId}
      `;

      if (assignment.recordset.length === 0) {
        console.log('❌ No assignment found');
      } else {
        console.log('Assignment:', assignment.recordset[0]);
        
        // Check progress
        const progress = await sql.query`
          SELECT * FROM user_learning_progress WHERE fresher_id = ${userId}
        `;
        console.log(`Progress records: ${progress.recordset.length}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sql.close();
    console.log('\n🔌 Closed');
  }
}

findUser()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });

/**
 * Check and Fix Learning Assignment
 * Verifies da_learnings table and fixes the learning assignment for the user
 */

const sql = require('mssql');

// Database configuration
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

// Use Windows Authentication if no username provided
if (process.env.DB_USERNAME) {
  config.user = process.env.DB_USERNAME;
  config.password = process.env.DB_PASSWORD;
} else {
  config.options.trustedConnection = true;
}

async function checkAndFix() {
  try {
    console.log('🔄 Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected to database');

    // 1. Check da_learnings table
    console.log('\n📋 Checking da_learnings table...');
    const daLearnings = await sql.query(`
      SELECT id, learning_title, learning_link, description, duration_minutes
      FROM da_learnings
      ORDER BY id
    `);

    console.log(`Found ${daLearnings.recordset.length} items in da_learnings table:`);
    daLearnings.recordset.forEach(item => {
      console.log(`   - ID ${item.id}: ${item.learning_title}`);
    });

    if (daLearnings.recordset.length === 0) {
      console.log('\n❌ No learning items found in da_learnings table!');
      console.log('You need to add learning content to this table first.');
      return;
    }

    // 2. Check the user's assignment
    console.log('\n🔍 Checking user learning assignment...');
    const assignment = await sql.query(`
      SELECT * FROM user_learning_assignments WHERE fresher_id = 226
    `);

    if (assignment.recordset.length === 0) {
      console.log('❌ No assignment found for fresher_id 226');
      return;
    }

    console.log('Assignment found:', assignment.recordset[0]);

    // 3. Check existing progress records
    console.log('\n📊 Checking existing progress records...');
    const existingProgress = await sql.query(`
      SELECT * FROM user_learning_progress WHERE fresher_id = 226
    `);

    console.log(`Found ${existingProgress.recordset.length} existing progress records`);

    // 4. If no progress records, create them
    if (existingProgress.recordset.length === 0 && daLearnings.recordset.length > 0) {
      console.log('\n🔧 Creating progress records from da_learnings...');
      
      for (const learning of daLearnings.recordset) {
        await sql.query`
          INSERT INTO user_learning_progress (
            fresher_id, learning_id, learning_table, learning_title, learning_link
          )
          VALUES (
            226, ${learning.id}, 'da_learnings', ${learning.learning_title}, ${learning.learning_link}
          )
        `;
        console.log(`   ✅ Created progress record for: ${learning.learning_title}`);
      }

      console.log(`\n✅ Created ${daLearnings.recordset.length} progress records!`);
    } else if (existingProgress.recordset.length > 0) {
      console.log('✅ Progress records already exist');
    }

    // 5. Verify final state
    console.log('\n✨ Verifying final state...');
    const finalProgress = await sql.query(`
      SELECT * FROM user_learning_progress WHERE fresher_id = 226
    `);
    console.log(`Total progress records: ${finalProgress.recordset.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await sql.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run
checkAndFix()
  .then(() => {
    console.log('\n✨ Check and fix completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  });

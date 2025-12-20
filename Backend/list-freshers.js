/**
 * Helper script to list available freshers for testing
 */

const sql = require('mssql');
require('dotenv').config();

async function listFreshers() {
  let pool;
  
  try {
    const config = {
      server: process.env.SERVER_NAME,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    };

    pool = await sql.connect(config);
    console.log('Connected to database\n');

    // Get all freshers
    const result = await pool.request().query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        designation,
        department
      FROM freshers
      ORDER BY id DESC
    `);

    console.log('Available Freshers:');
    console.log('='.repeat(80));
    console.table(result.recordset);

    // Check if they already have IT tasks
    console.log('\nIT Task Status:');
    console.log('='.repeat(80));
    const itTasks = await pool.request().query(`
      SELECT 
        f.id as fresher_id,
        f.first_name,
        f.last_name,
        CASE WHEN it.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_it_task
      FROM freshers f
      LEFT JOIN it_tasks it ON f.id = it.fresher_id
      ORDER BY f.id DESC
    `);
    console.table(itTasks.recordset);

    console.log('\nFreshers without IT tasks (can be used for testing):');
    const availableForTest = itTasks.recordset.filter(f => f.has_it_task === 'No');
    if (availableForTest.length > 0) {
      console.table(availableForTest.map(f => ({
        'Fresher ID': f.fresher_id,
        'Name': `${f.first_name} ${f.last_name}`
      })));
    } else {
      console.log('❌ No freshers available for testing (all have IT tasks already)');
    }

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      console.log('\nDatabase connection closed');
    }
  }
}

listFreshers();

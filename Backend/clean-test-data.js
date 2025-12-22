/**
 * Clean Test Data - Remove IT/Learning records for fresher
 */

require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function cleanTestData() {
  const fresherId = process.argv[2] ? parseInt(process.argv[2]) : null;
  
  if (!fresherId) {
    console.log('❌ Please provide fresher_id as argument');
    console.log('💡 Usage: node clean-test-data.js <fresher_id>');
    console.log('');
    console.log('Example: node clean-test-data.js 226');
    return;
  }

  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    console.log(`🧹 Cleaning test data for Fresher ID: ${fresherId}\n`);
    
    // Delete from user_learning_progress
    const progressResult = await sql.query`
      DELETE FROM user_learning_progress WHERE fresher_id = ${fresherId}
    `;
    console.log(`✅ Deleted ${progressResult.rowsAffected[0]} records from user_learning_progress`);
    
    // Delete from user_learning_assignments
    const assignmentResult = await sql.query`
      DELETE FROM user_learning_assignments WHERE fresher_id = ${fresherId}
    `;
    console.log(`✅ Deleted ${assignmentResult.rowsAffected[0]} records from user_learning_assignments`);
    
    // Delete from it_tasks
    const itTaskResult = await sql.query`
      DELETE FROM it_tasks WHERE fresher_id = ${fresherId}
    `;
    console.log(`✅ Deleted ${itTaskResult.rowsAffected[0]} records from it_tasks`);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ CLEANUP COMPLETED');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Now you can test email notifications:');
    console.log(`   node test-email-direct.js ${fresherId}`);
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanTestData();

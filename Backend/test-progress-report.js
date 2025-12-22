/**
 * Test Progress Report Service
 * Tests 30/60/90 day progress reports
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

async function testProgressReport() {
  const fresherId = process.argv[2] ? parseInt(process.argv[2]) : null;
  const testDay = process.argv[3] ? parseInt(process.argv[3]) : 30; // Default to 30 days
  
  if (!fresherId) {
    console.log('❌ Please provide fresher_id as argument');
    console.log('💡 Usage: node test-progress-report.js <fresher_id> [test_day]');
    console.log('   test_day: 30, 60, or 90 (default: 30)');
    console.log('');
    console.log('Example: node test-progress-report.js 226 30');
    return;
  }

  if (![30, 60, 90].includes(testDay)) {
    console.log('❌ test_day must be 30, 60, or 90');
    return;
  }

  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    console.log(`🧪 Setting up ${testDay}-day progress report test for Fresher ID: ${fresherId}\n`);
    
    // Update assigned_at date to be exactly X days ago
    const result = await sql.query`
      UPDATE user_learning_assignments
      SET assigned_at = DATEADD(DAY, -${testDay}, GETDATE())
      WHERE fresher_id = ${fresherId}
    `;
    
    if (result.rowsAffected[0] === 0) {
      console.log('❌ No learning assignment found for this fresher');
      await sql.close();
      return;
    }
    
    console.log(`✅ Updated assigned_at date to ${testDay} days ago`);
    console.log('');
    console.log('📊 Testing progress report...');
    console.log('');
    
    // Initialize database first
    const { initializeDatabases } = require('./dist/config/database');
    await initializeDatabases();
    console.log('✅ Database initialized\n');
    
    // Import and run the progress report service
    const { ProgressReportService } = require('./dist/services/progress-report.service');
    await ProgressReportService.sendProgressReports();
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(60));
    console.log('');
    console.log('📧 Check the following inboxes for emails:');
    console.log('   1. User\'s email (fresher)');
    console.log('   2. L&D team members');
    console.log('');
    console.log('💡 To reset the date:');
    console.log(`   UPDATE user_learning_assignments SET assigned_at = GETDATE() WHERE fresher_id = ${fresherId}`);
    
    await sql.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProgressReport();

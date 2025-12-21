/**
 * Test script to manually trigger learning reminder emails
 * Run this to test the reminder functionality without waiting for the scheduled job
 */

const dotenv = require('dotenv');
dotenv.config();

async function testReminders() {
  console.log('🧪 Testing Learning Reminder Service...\n');
  
  try {
    // Import database and service
    const { initializeDatabases } = require('./src/config/database');
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    await initializeDatabases();
    console.log('✅ Database connected\n');
    
    // Import and run the service
    const { LearningReminderService } = require('./src/services/learning-reminder.service');
    
    console.log('📧 Triggering reminder emails...\n');
    await LearningReminderService.sendReminders();
    
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testReminders();

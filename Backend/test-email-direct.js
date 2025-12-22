/**
 * Test Email Notifications - Direct Test with Fresher ID
 * Tests all emails sent when HR clicks "Send to Admin"
 */

const API_URL = 'http://localhost:3000/api';

async function testEmailNotificationsDirect() {
  console.log('='.repeat(60));
  console.log('🧪 Testing Email Notifications - Send to IT Flow');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Get HR auth token
    console.log('📝 Step 1: Authenticating as HR...');
    const loginResponse = await fetch(`${API_URL}/auth/hr/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pulipatisimha@gmail.com',
        password: 'admin@123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`HR login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ HR authenticated successfully\n');

    // Step 2: Manually specify the fresher ID
    // You need to provide the correct fresher_id from your database
    console.log('📝 Step 2: Using fresher email: vijayasimha8878@gmail.com');
    console.log('⚠️  Please provide the fresher_id for this email from your database\n');
    
    // Get fresher_id from command line argument or default to 1
    const fresherId = process.argv[2] ? parseInt(process.argv[2]) : null;
    
    if (!fresherId) {
      console.log('❌ Please provide fresher_id as argument');
      console.log('💡 Usage: node test-email-direct.js <fresher_id>');
      console.log('');
      console.log('To find the fresher_id, run this SQL query:');
      console.log('   SELECT id, first_name, last_name, email FROM freshers WHERE email = \'vijayasimha8878@gmail.com\'');
      return;
    }

    console.log(`📝 Step 3: Testing with Fresher ID: ${fresherId}\n`);

    // Step 3: Check if already sent to IT
    console.log('📝 Step 4: Checking if already sent to IT...');
    const itTasksResponse = await fetch(`${API_URL}/it/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (itTasksResponse.ok) {
      const itTasksData = await itTasksResponse.json();
      const existingTask = itTasksData.data?.find(task => task.fresher_id === fresherId);
      
      if (existingTask) {
        console.log(`⚠️ Fresher ${fresherId} already sent to IT (Task ID: ${existingTask.id})`);
        console.log('❌ Cannot test email notifications - fresher already processed');
        console.log('\n💡 To test again, delete the existing records:');
        console.log(`   DELETE FROM it_tasks WHERE fresher_id = ${fresherId};`);
        console.log(`   DELETE FROM user_learning_assignments WHERE fresher_id = ${fresherId};`);
        console.log(`   DELETE FROM user_learning_progress WHERE fresher_id = ${fresherId};`);
        return;
      }
    }
    console.log('✅ Fresher not yet sent to IT\n');

    // Step 4: Send to IT (this will trigger all emails)
    console.log('📝 Step 5: Sending to IT and L&D...');
    console.log('📧 This will trigger 3 emails:');
    console.log('   1. IT Team - Equipment notification');
    console.log('   2. L&D Team - Training assignment');
    console.log('   3. Fresher (vijayasimha8878@gmail.com) - Learning plan assignment');
    console.log('');

    const sendToItResponse = await fetch(`${API_URL}/it/send-to-it`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fresherId: fresherId
      })
    });

    const sendToItData = await sendToItResponse.json();

    if (!sendToItResponse.ok) {
      console.log('❌ Failed to send to IT');
      console.log('Response:', JSON.stringify(sendToItData, null, 2));
      return;
    }

    console.log('✅ Successfully sent to IT!\n');
    console.log('📊 Result:', JSON.stringify(sendToItData, null, 2));
    console.log('');
    
    console.log('='.repeat(60));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log('📧 Check the following inboxes for emails:');
    console.log(`   1. IT Team members (configured in it_users table)`);
    console.log(`   2. L&D Team members (configured in learning_dept table)`);
    console.log(`   3. Fresher: vijayasimha8878@gmail.com ⭐`);
    console.log('');
    console.log('💡 Note: If emails are not received, check:');
    console.log('   - Email service configuration in Backend/.env');
    console.log('   - SMTP settings (EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD)');
    console.log('   - Spam/junk folders');
    console.log('   - Backend console logs for email sending errors');

  } catch (error) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }
  }
}

// Run the test
console.log('');
testEmailNotificationsDirect();

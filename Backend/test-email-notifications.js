/**
 * Test Email Notifications - Send to IT Flow
 * Tests all emails sent when HR clicks "Send to Admin"
 */

const API_URL = 'http://localhost:3000/api';

async function testEmailNotifications() {
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

    // Step 2: Get list of freshers to find a test candidate
    console.log('📝 Step 2: Fetching freshers list...');
    const freshersResponse = await fetch(`${API_URL}/hr/freshers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!freshersResponse.ok) {
      throw new Error(`Failed to fetch freshers: ${freshersResponse.status}`);
    }

    const freshersData = await freshersResponse.json();
    console.log('Debug - freshersData:', JSON.stringify(freshersData, null, 2).substring(0, 500));
    
    const freshers = freshersData.data?.freshers || freshersData.data || freshersData || [];
    console.log(`✅ Found ${freshers.length} freshers\n`);

    if (freshers.length === 0) {
      throw new Error('No freshers found in the system. The user vijayasimha8878@gmail.com should exist in DB but not returned by API.');
    }

    // Find a suitable test fresher (preferably one with email vijayasimha8878@gmail.com)
    let testFresher = freshers.find(f => f.email === 'vijayasimha8878@gmail.com');
    
    if (!testFresher) {
      console.log('⚠️ Test user vijayasimha8878@gmail.com not found');
      console.log('📝 Available freshers:');
      freshers.slice(0, 5).forEach(f => {
        console.log(`   - ID: ${f.id}, Name: ${f.first_name} ${f.last_name}, Email: ${f.email}`);
      });
      
      // Use the first available fresher
      testFresher = freshers[0];
      console.log(`\n⚠️ Using fresher ID ${testFresher.id} instead: ${testFresher.email}\n`);
    } else {
      console.log(`✅ Found test user: ${testFresher.first_name} ${testFresher.last_name} (ID: ${testFresher.id})\n`);
    }

    // Step 3: Check if already sent to IT
    console.log('📝 Step 3: Checking IT tasks...');
    const itTasksResponse = await fetch(`${API_URL}/it/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (itTasksResponse.ok) {
      const itTasksData = await itTasksResponse.json();
      const existingTask = itTasksData.data.find(task => task.fresher_id === testFresher.id);
      
      if (existingTask) {
        console.log(`⚠️ Fresher ${testFresher.id} already sent to IT (Task ID: ${existingTask.id})`);
        console.log('❌ Cannot test email notifications - fresher already processed');
        console.log('\n💡 To test again, you need to:');
        console.log('   1. Delete the IT task record from it_tasks table');
        console.log('   2. Delete learning assignments from user_learning_assignments');
        console.log('   3. Delete learning progress from user_learning_progress');
        console.log(`   SQL: DELETE FROM it_tasks WHERE fresher_id = ${testFresher.id}`);
        return;
      }
    }
    console.log('✅ Fresher not yet sent to IT\n');

    // Step 4: Send to IT (this will trigger all emails)
    console.log('📝 Step 4: Sending to IT and L&D...');
    console.log('📧 This will trigger 3 emails:');
    console.log('   1. IT Team - Equipment notification');
    console.log('   2. L&D Team - Training assignment');
    console.log('   3. Fresher - Learning plan assignment');
    console.log('');

    const sendToItResponse = await fetch(`${API_URL}/it/send-to-it`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fresherId: testFresher.id
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
    console.log(`   3. Fresher: ${testFresher.email}`);
    console.log('');
    console.log('💡 Note: If emails are not received, check:');
    console.log('   - Email service configuration in .env');
    console.log('   - SMTP settings');
    console.log('   - Spam/junk folders');
    console.log('   - Backend logs for email sending errors');

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
testEmailNotifications();

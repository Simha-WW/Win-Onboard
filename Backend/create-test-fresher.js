/**
 * Create Test Fresher for Email Testing
 */

const API_URL = 'http://localhost:3000/api';

async function createTestFresher() {
  console.log('='.repeat(60));
  console.log('🆕 Creating Test Fresher');
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

    // Step 2: Create test fresher
    console.log('📝 Step 2: Creating test fresher...');
    const createResponse = await fetch(`${API_URL}/hr/create-fresher`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: 'Vijaya',
        lastName: 'Simha',
        email: 'vijayasimha8878@gmail.com',
        phoneNumber: '9876543210',
        designation: 'Software Developer',
        department: 'App Dev',
        joiningDate: new Date().toISOString().split('T')[0],
        employeeId: `EMP${Date.now()}`,
        dateOfBirth: '1995-01-01'
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.log('❌ Failed to create fresher');
      console.log('Response:', JSON.stringify(errorData, null, 2));
      return;
    }

    const createData = await createResponse.json();
    console.log('✅ Test fresher created successfully!\n');
    console.log('📊 Fresher Details:');
    console.log(JSON.stringify(createData, null, 2));
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ READY FOR EMAIL TESTING');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 Now run: node test-email-notifications.js');

  } catch (error) {
    console.error('');
    console.error('❌ FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
  }
}

createTestFresher();

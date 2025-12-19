const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test credentials
const username = 'pulipatisimha@gmail.com'; // HR user
const password = 'do64hA';

async function testBGVDataRetrieval() {
  try {
    console.log('🔐 Logging in as HR user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/microsoft`, {
      email: username,
      password
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test fetching BGV data for fresher ID 4 (varshini.muppavarapu)
    const fresherId = 4;
    console.log(`\n📄 Fetching BGV data for fresher ${fresherId}...`);
    
    const bgvResponse = await axios.get(`${API_BASE_URL}/bgv/hr/verification/${fresherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n✅ BGV Data Response:');
    console.log(JSON.stringify(bgvResponse.data, null, 2));

    // Check what data we got
    const data = bgvResponse.data.data;
    console.log('\n📊 Data Summary:');
    console.log(`- Fresher Info: ${data.fresher ? '✅' : '❌'}`);
    console.log(`- Demographics: ${data.demographics ? '✅' : '❌'}`);
    console.log(`- Personal: ${data.personal ? '✅' : '❌'}`);
    console.log(`- Education: ${data.education && data.education.length > 0 ? `✅ (${data.education.length} records)` : '❌'}`);
    console.log(`- Submission: ${data.submission ? '✅' : '❌'}`);

    if (data.education && data.education.length > 0) {
      console.log('\n📚 Education Details:');
      data.education.forEach((edu, index) => {
        console.log(`  ${index + 1}. ${edu.qualification} - ${edu.university_institution}`);
        if (edu.documents) {
          try {
            const docs = JSON.parse(edu.documents);
            console.log(`     Documents: ${docs.length} file(s)`);
          } catch {
            console.log('     Documents: Parse error');
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

testBGVDataRetrieval();

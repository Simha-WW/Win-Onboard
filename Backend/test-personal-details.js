const fetch = require('node-fetch');

// Test data
const testPersonalData = {
  marital_status: 'Single',
  number_of_children: null,
  father_name: 'Test Father',
  father_dob: '1960-01-01',
  father_deceased: false,
  mother_name: 'Test Mother',
  mother_dob: '1965-01-01',
  mother_deceased: false,
  emergency_contacts: [
    {
      contact_person_name: 'Emergency Contact Person',
      mobile: '9999999999',
      relationship: 'Sibling'
    }
  ]
};

async function testPersonalDetails() {
  try {
    console.log('🧪 Testing Personal Details Save Functionality');
    console.log('📊 Test Data:', JSON.stringify(testPersonalData, null, 2));
    
    // Make API call to save personal details
    const response = await fetch('http://localhost:3000/api/bgv/personal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-for-user-1'
      },
      body: JSON.stringify(testPersonalData)
    });
    
    const result = await response.json();
    console.log('📋 API Response:', result);
    
    if (response.ok && result.success) {
      console.log('✅ Personal details saved successfully!');
      
      // Now test retrieval
      console.log('\n🔍 Testing data retrieval...');
      const getResponse = await fetch('http://localhost:3000/api/bgv/personal', {
        headers: {
          'Authorization': 'Bearer test-token-for-user-1'
        }
      });
      
      const retrievedData = await getResponse.json();
      console.log('📋 Retrieved Data:', JSON.stringify(retrievedData, null, 2));
      
      if (getResponse.ok) {
        console.log('✅ Data retrieval successful!');
        
        // Verify emergency contact
        if (retrievedData.emergency_contacts && retrievedData.emergency_contacts.length > 0) {
          const contact = retrievedData.emergency_contacts[0];
          if (contact.contact_person_name === testPersonalData.emergency_contacts[0].contact_person_name) {
            console.log('✅ Emergency contact data matches!');
          } else {
            console.log('❌ Emergency contact data mismatch!');
          }
        } else {
          console.log('❌ No emergency contacts found in retrieved data!');
        }
      } else {
        console.log('❌ Data retrieval failed:', retrievedData);
      }
      
    } else {
      console.log('❌ Personal details save failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPersonalDetails();
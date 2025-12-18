/**
 * Test script to verify emergency contacts saving functionality
 */

const testPersonalData = {
  marital_status: "Single",
  number_of_children: null,
  father_name: "Test Father",
  father_dob: "1970-01-01",
  father_deceased: false,
  mother_name: "Test Mother", 
  mother_dob: "1975-01-01",
  mother_deceased: false,
  emergency_contacts: [
    {
      contact_person_name: "Emergency Contact 1",
      mobile: "1234567890",
      relationship: "Sibling"
    },
    {
      contact_person_name: "Emergency Contact 2", 
      mobile: "0987654321",
      relationship: "Friend"
    }
  ]
};

async function testEmergencyContactsSave() {
  try {
    console.log('🧪 Testing Emergency Contacts Save Functionality');
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
      
      if (retrievedData && retrievedData.emergency_contacts) {
        console.log('✅ Emergency contacts retrieved successfully!');
        console.log('📊 Number of emergency contacts:', retrievedData.emergency_contacts.length);
        
        retrievedData.emergency_contacts.forEach((contact, index) => {
          console.log(`📞 Contact ${index + 1}:`, contact);
        });
      } else {
        console.log('❌ No emergency contacts found in retrieved data');
      }
    } else {
      console.log('❌ Failed to save personal details:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testEmergencyContactsSave();
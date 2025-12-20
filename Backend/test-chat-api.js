#!/usr/bin/env node

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/features/ai-agent';

async function testChat() {
  console.log('🧪 Testing AI Agent Chat...\n');

  try {
    // Test 1: Health Check
    console.log('📍 Test 1: Health Check');
    const healthRes = await axios.get(`${API_URL}/health`);
    console.log('Status:', healthRes.status);
    console.log('Response:', JSON.stringify(healthRes.data, null, 2));
    console.log('✅ Health check passed\n');

    // Test 2: Send Message
    console.log('📍 Test 2: Send Chat Message');
    const chatRes = await axios.post(`${API_URL}/chat`, {
      message: 'Hello, how can you help me with the onboarding process?',
      userId: 'test-user-1'
    });
    console.log('Status:', chatRes.status);
    console.log('Response:', JSON.stringify(chatRes.data, null, 2));
    
    if (chatRes.data.success) {
      console.log('✅ Chat message successful\n');

      // Test 3: Follow-up Message
      console.log('📍 Test 3: Follow-up Message (same thread)');
      const followUpRes = await axios.post(`${API_URL}/chat`, {
        message: 'Can you tell me about the IT department?',
        userId: 'test-user-1'
      });
      console.log('Status:', followUpRes.status);
      console.log('Response:', JSON.stringify(followUpRes.data, null, 2));
      console.log('✅ Follow-up message successful\n');
    }

    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    if (err.response?.data) {
      console.error('Response:', err.response.data);
    }
    process.exit(1);
  }
}

testChat();

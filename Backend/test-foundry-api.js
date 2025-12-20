const axios = require('axios');

// Load env vars
require('dotenv').config();

const endpoint = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT;
const apiKey = process.env.AZURE_FOUNDRY_API_KEY;
const agentId = 'asst_LfrmJixgihcM4gRdBqqEkvY0';

console.log('🔧 Testing Azure Foundry API...\n');
console.log('Endpoint:', endpoint);
console.log('API Key:', apiKey ? '✅ Set' : '❌ Missing');
console.log('Agent ID:', agentId);

const headers = {
  'Content-Type': 'application/json',
  'api-key': apiKey,
};

async function testAPI() {
  try {
    // Step 1: Create thread
    console.log('\n📍 Step 1: Creating thread...');
    const threadUrl = `${endpoint}/threads`;
    console.log('URL:', threadUrl);
    
    const threadRes = await axios.post(threadUrl, {}, { 
      headers, 
      timeout: 30000,
      validateStatus: () => true // Accept any status
    });
    
    console.log('Status:', threadRes.status);
    console.log('Response:', JSON.stringify(threadRes.data, null, 2));
    
    if (threadRes.status !== 201 && threadRes.status !== 200) {
      console.log('❌ Failed to create thread');
      process.exit(1);
    }
    
    const threadId = threadRes.data?.id || threadRes.data?.thread_id;
    console.log('✅ Thread created:', threadId);
    
    // Step 2: Add message
    console.log('\n📍 Step 2: Adding message...');
    const msgUrl = `${endpoint}/threads/${threadId}/messages`;
    const msgRes = await axios.post(msgUrl, 
      {
        role: 'user',
        content: 'Hello, how are you?'
      },
      { 
        headers,
        timeout: 30000,
        validateStatus: () => true
      }
    );
    
    console.log('Status:', msgRes.status);
    console.log('Response:', JSON.stringify(msgRes.data, null, 2));
    
    if (msgRes.status !== 201 && msgRes.status !== 200) {
      console.log('❌ Failed to add message');
      process.exit(1);
    }
    
    console.log('✅ Message added');
    
    // Step 3: Run agent
    console.log('\n📍 Step 3: Running agent...');
    const runUrl = `${endpoint}/threads/${threadId}/runs`;
    const runRes = await axios.post(runUrl,
      {
        assistant_id: agentId
      },
      { 
        headers,
        timeout: 30000,
        validateStatus: () => true
      }
    );
    
    console.log('Status:', runRes.status);
    console.log('Response:', JSON.stringify(runRes.data, null, 2));
    
    if (runRes.status !== 201 && runRes.status !== 200) {
      console.log('❌ Failed to run agent');
      process.exit(1);
    }
    
    const runId = runRes.data?.id || runRes.data?.run_id;
    console.log('✅ Agent run started:', runId);
    
    // Step 4: Get messages
    console.log('\n📍 Step 4: Getting messages...');
    const msgsUrl = `${endpoint}/threads/${threadId}/messages`;
    const msgsRes = await axios.get(msgsUrl,
      { 
        headers,
        timeout: 30000,
        validateStatus: () => true
      }
    );
    
    console.log('Status:', msgsRes.status);
    console.log('Response:', JSON.stringify(msgsRes.data, null, 2));
    
    console.log('\n✅ All API checks passed!');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.response?.data) {
      console.error('Response:', err.response.data);
    }
    process.exit(1);
  }
}

testAPI();

#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testApiKey() {
  console.log('🧪 API Key Testing Tool\n');

  try {
    // Step 1: Create a new API key
    console.log('1️⃣ Creating a new API key...');
    const createResponse = await axios.post(`${BASE_URL}/api/auth/keys`, {
      name: 'Test API Key',
      role: 'Admin'
    });

    const apiKey = createResponse.data.key;
    console.log(`✅ API Key created: ${apiKey}\n`);

    // Step 2: Test the API key by listing all keys
    console.log('2️⃣ Testing API key by listing all keys...');
    const listResponse = await axios.get(`${BASE_URL}/api/auth/keys`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    console.log(`✅ API Key works! Found ${listResponse.data.length} keys\n`);

    // Step 3: Test health endpoint
    console.log('3️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log(`✅ Health check: ${healthResponse.data.status}\n`);

    // Step 4: Test invalid API key
    console.log('4️⃣ Testing invalid API key...');
    try {
      await axios.get(`${BASE_URL}/api/auth/keys`, {
        headers: {
          'Authorization': 'Bearer invalid_key'
        }
      });
      console.log('❌ Invalid key test failed - should have been rejected');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid key correctly rejected\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed!');
    console.log(`\n📋 Your working API key: ${apiKey}`);
    console.log('\n💡 Usage example:');
    console.log(`curl -H "Authorization: Bearer ${apiKey}" ${BASE_URL}/api/auth/keys`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your server is running on port 3001');
      console.log('Run: npm run dev (in the server directory)');
    }
  }
}

// Run if called directly
if (require.main === module) {
  testApiKey();
}

module.exports = { testApiKey };
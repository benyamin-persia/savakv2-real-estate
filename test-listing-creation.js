const axios = require('axios');

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

async function testListingCreation() {
  try {
    console.log('🧪 Testing listing creation...\n');

    // Step 1: Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('/api/health');
    console.log('✅ Server is running:', healthResponse.data);

    // Step 2: Test categories endpoint
    console.log('\n2. Testing categories endpoint...');
    const categoriesResponse = await axios.get('/api/listings/categories/all');
    console.log('✅ Categories:', categoriesResponse.data.data);

    // Step 3: Test listings endpoint
    console.log('\n3. Testing listings endpoint...');
    const listingsResponse = await axios.get('/api/listings');
    console.log('✅ Current listings count:', listingsResponse.data.data.length);

    // Step 4: Test authentication (this will fail without login, but that's expected)
    console.log('\n4. Testing authentication...');
    try {
      const authResponse = await axios.get('/api/auth/me');
      console.log('✅ User is authenticated:', authResponse.data.user);
    } catch (error) {
      console.log('ℹ️  User is not authenticated (expected if not logged in)');
    }

    // Step 5: Test database connection
    console.log('\n5. Testing database connection...');
    const dbResponse = await axios.get('/api/mongoose-test');
    console.log('✅ Database connection:', dbResponse.data);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 To test listing creation:');
    console.log('1. Start the backend: npm run dev (in backend folder)');
    console.log('2. Start the frontend: npm start (in frontend folder)');
    console.log('3. Login to the application');
    console.log('4. Navigate to /create to create a listing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testListingCreation(); 
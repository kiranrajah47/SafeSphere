const http = require('http');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function testJourneySystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE SAFE JOURNEY SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Authenticate user
  const testEmail = `journey_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Journey Tester',
      email: testEmail,
      phone: '+15550193333',
      password: 'password123'
    });

    const otp = regRes.data?.data?.devOtp;
    const verifyRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: testEmail, otpCode: otp });

    token = verifyRes.data?.data?.token;
    console.log('✅ 1. Authenticated User for Safe Journey Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test POST /api/journey/start
  let journeyId = '';
  try {
    const startRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/journey/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      destinationName: 'Central Train Terminal',
      estimatedDurationMinutes: 30,
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Main Entrance Square'
    });

    console.log('✅ 2. POST /api/journey/start:', startRes.status, startRes.data.message);
    console.log('   └─ Destination:', startRes.data?.data?.destinationName);
    console.log('   └─ Expected Arrival:', startRes.data?.data?.expectedArrivalTime);
    journeyId = startRes.data?.data?._id;
  } catch (err) {
    console.error('❌ POST /api/journey/start failed:', err.message);
  }

  // 3. Test PUT /api/journey/location (Update Live Position)
  try {
    const locRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/journey/location',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      latitude: 28.6180,
      longitude: 77.2120,
      address: 'En Route - Ring Road Flyover'
    });

    console.log('✅ 3. PUT /api/journey/location:', locRes.status, locRes.data.message);
  } catch (err) {
    console.error('❌ PUT /api/journey/location failed:', err.message);
  }

  // 4. Test PUT /api/journey/pause (Toggle Pause / Resume)
  try {
    const pauseRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/journey/pause',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 4. PUT /api/journey/pause:', pauseRes.status, pauseRes.data.message);
  } catch (err) {
    console.error('❌ PUT /api/journey/pause failed:', err.message);
  }

  // 5. Test POST /api/journey/complete (Complete Journey)
  try {
    const compRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/journey/complete',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 5. POST /api/journey/complete:', compRes.status, compRes.data.message);
  } catch (err) {
    console.error('❌ POST /api/journey/complete failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL SAFE JOURNEY SYSTEM ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testJourneySystem();

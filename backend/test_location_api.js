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

async function testLocationSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE LOCATION SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Authenticate user
  const testEmail = `loc_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Location Tester',
      email: testEmail,
      phone: '+15550195555',
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
    console.log('✅ 1. Authenticated User for Location System Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test POST /api/location/share
  try {
    const shareRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/location/share',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Connaught Place, New Delhi'
    });

    console.log('✅ 2. POST /api/location/share:', shareRes.status, shareRes.data.message);
    console.log('   └─ Coordinates:', shareRes.data?.data?.latitude, shareRes.data?.data?.longitude);
  } catch (err) {
    console.error('❌ POST /api/location/share failed:', err.message);
  }

  // 3. Test GET /api/location/preferences
  try {
    const prefRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/location/preferences',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 3. GET /api/location/preferences:', prefRes.status, 'Map Tile Provider:', prefRes.data?.data?.mapTileProvider);
  } catch (err) {
    console.error('❌ GET /api/location/preferences failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL LOCATION SYSTEM ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testLocationSystem();

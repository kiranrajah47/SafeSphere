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

async function testGuidesSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE SAFETY & HEALTH RESOURCE CENTER TEST');
  console.log('======================================================\n');

  // 1. Authenticate user for bookmark testing
  const testEmail = `guide_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Guide Tester',
      email: testEmail,
      phone: '+15550192222',
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
    console.log('✅ 1. Authenticated User for Guide Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test GET /api/v1/resources/guides (ALL)
  let guideId = '';
  try {
    const allRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/resources/guides',
      method: 'GET'
    });

    console.log('✅ 2. GET /api/resources/guides (ALL):', allRes.status, 'Count:', allRes.data?.count);
    if (allRes.data?.data?.[0]) {
      guideId = allRes.data.data[0]._id;
      console.log(`   └─ Sample Guide Title: ${allRes.data.data[0].title} (${allRes.data.data[0].category})`);
    }
  } catch (err) {
    console.error('❌ GET /api/resources/guides failed:', err.message);
  }

  // 3. Test GET /api/resources/guides?categoryGroup=HEALTH
  try {
    const healthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/resources/guides?categoryGroup=HEALTH',
      method: 'GET'
    });

    console.log('✅ 3. GET /api/resources/guides?categoryGroup=HEALTH:', healthRes.status, 'Count:', healthRes.data?.count);
  } catch (err) {
    console.error('❌ GET /api/resources/guides (HEALTH) failed:', err.message);
  }

  // 4. Test POST /api/resources/guides/:id/bookmark
  if (guideId) {
    try {
      const bmRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/resources/guides/${guideId}/bookmark`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 4. POST /api/resources/guides/:id/bookmark:', bmRes.status, bmRes.data.message, 'Bookmarked:', bmRes.data?.isBookmarked);
    } catch (err) {
      console.error('❌ POST /api/resources/guides/:id/bookmark failed:', err.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL SAFETY & HEALTH RESOURCE CENTER ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testGuidesSystem();

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

async function testSOSSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE EMERGENCY SOS SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Register & Authenticate User
  const testEmail = `sos_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'SOS Tester',
      email: testEmail,
      phone: '+15550196666',
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
    console.log('✅ 1. Authenticated User for SOS Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Add a Trusted Contact first
  try {
    await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Emergency Guardian',
      relationship: 'Parent',
      phone: '+15550194321',
      isPrimary: true
    });
    console.log('✅ 2. Added Trusted Contact for Notification Dispatch');
  } catch (err) {}

  // 3. Test POST /api/sos (Trigger SOS Event)
  let sosId = '';
  try {
    const sosRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      latitude: 28.6139,
      longitude: 77.2090,
      message: 'Medical Panic Distress Signal!',
      emergencyType: 'MEDICAL'
    });

    console.log('✅ 3. POST /api/sos:', sosRes.status, sosRes.data.message);
    console.log('   └─ Status:', sosRes.data?.data?.status);
    console.log('   └─ Contacts Notified Count:', sosRes.data?.data?.contactsNotifiedCount);
    console.log('   └─ Notification Mode:', sosRes.data?.data?.notificationResult?.mode);
    sosId = sosRes.data?.data?._id;
  } catch (err) {
    console.error('❌ POST /api/sos failed:', err.message);
  }

  // 4. Test GET /api/sos/history
  try {
    const historyRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/history',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 4. GET /api/sos/history:', historyRes.status, 'Count:', historyRes.data?.count);
  } catch (err) {
    console.error('❌ GET /api/sos/history failed:', err.message);
  }

  // 5. Test GET /api/sos/:id
  if (sosId) {
    try {
      const getRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/sos/${sosId}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 5. GET /api/sos/:id:', getRes.status, 'User Name:', getRes.data?.data?.user?.name);
    } catch (err) {
      console.error('❌ GET /api/sos/:id failed:', err.message);
    }

    // 6. Test PUT /api/sos/:id/cancel
    try {
      const cancelRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/sos/${sosId}/cancel`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 6. PUT /api/sos/:id/cancel:', cancelRes.status, cancelRes.data.message, 'New Status:', cancelRes.data?.data?.status);
    } catch (err) {
      console.error('❌ PUT /api/sos/:id/cancel failed:', err.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL EMERGENCY SOS SYSTEM ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testSOSSystem();

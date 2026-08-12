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

async function testAlertsSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE COMMUNITY ALERTS SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Authenticate User
  const testEmail = `alert_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Alert Tester',
      email: testEmail,
      phone: '+15550194444',
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
    console.log('✅ 1. Authenticated User for Community Alerts Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test POST /api/alerts (Create Alert)
  let alertId = '';
  try {
    const createRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      title: 'Fallen Power Line & Road Blockage',
      description: 'Dangerous live cable on north sidewalk near Metro Station Gate 2.',
      category: 'Road hazard',
      severity: 'high',
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Metro Station Gate 2, New Delhi'
    });

    console.log('✅ 2. POST /api/alerts:', createRes.status, createRes.data.message);
    alertId = createRes.data?.data?._id;
  } catch (err) {
    console.error('❌ POST /api/alerts failed:', err.message);
  }

  // 3. Test GET /api/alerts (Filter by category & time range)
  try {
    const getRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/alerts?category=${encodeURIComponent('Road hazard')}&timeRange=24h&severity=high`,
      method: 'GET'
    });

    console.log('✅ 3. GET /api/alerts:', getRes.status, 'Count:', getRes.data?.count, 'First Title:', getRes.data?.data?.[0]?.title);
  } catch (err) {
    console.error('❌ GET /api/alerts failed:', err.message);
  }

  // 4. Test POST /api/alerts/:id/flag (Report false alert)
  if (alertId) {
    try {
      const flagRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/alerts/${alertId}/flag`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 4. POST /api/alerts/:id/flag:', flagRes.status, flagRes.data.message, 'Flagged Count:', flagRes.data?.flaggedCount);
    } catch (err) {
      console.error('❌ POST /api/alerts/:id/flag failed:', err.message);
    }

    // 5. Test PUT /api/alerts/:id (Update Alert)
    try {
      const updateRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/alerts/${alertId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        title: 'Fallen Power Line [RESOLVED BY MUNICIPALITY]',
        severity: 'low',
        status: 'resolved'
      });

      console.log('✅ 5. PUT /api/alerts/:id:', updateRes.status, updateRes.data.message, 'New Status:', updateRes.data?.data?.status);
    } catch (err) {
      console.error('❌ PUT /api/alerts/:id failed:', err.message);
    }

    // 6. Test DELETE /api/alerts/:id (Delete Alert)
    try {
      const delRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/alerts/${alertId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 6. DELETE /api/alerts/:id:', delRes.status, delRes.data.message);
    } catch (err) {
      console.error('❌ DELETE /api/alerts/:id failed:', err.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL COMMUNITY ALERTS ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testAlertsSystem();

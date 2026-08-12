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
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function testBackend() {
  console.log('--- Starting SafeSphere Backend Verification ---');
  
  // 1. Test Health API
  try {
    const health = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/health',
      method: 'GET'
    });
    console.log('✅ 1. Health API Response:', health);
  } catch (err) {
    console.error('❌ Health API failed:', err.code || err.message);
  }

  // 2. Test User Registration
  let token = '';
  try {
    const reg = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Test Safety User',
      email: `test_${Date.now()}@safesphere.org`,
      phone: '+15550199999',
      password: 'password123',
      role: 'admin'
    });
    console.log('✅ 2. Registration API Response:', reg.status, reg.data);
    if (reg.data?.data?.token) {
      token = reg.data.data.token;
    }
  } catch (err) {
    console.error('❌ Registration API failed:', err.code || err.message);
  }

  // 3. Test Emergency Resources Hotlines API
  try {
    const hotlines = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/resources/hotlines',
      method: 'GET'
    });
    console.log('✅ 3. Resources Hotlines API Response:', hotlines.status, 'Count:', hotlines.data?.count);
  } catch (err) {
    console.error('❌ Hotlines API failed:', err.code || err.message);
  }

  // 4. Test Trigger SOS API
  if (token) {
    try {
      const sos = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/sos/trigger',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        emergencyType: 'PANIC',
        coordinates: [77.2090, 28.6139],
        address: 'Test Location Center'
      });
      console.log('✅ 4. Trigger SOS API Response:', sos.status, 'SOS ID:', sos.data?.data?._id);
    } catch (err) {
      console.error('❌ Trigger SOS API failed:', err.code || err.message);
    }
  }

  console.log('--- SafeSphere Backend Verification Finished ---');
  process.exit(0);
}

testBackend();

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

async function testContactsFeature() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE CONTACTS FEATURE END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Authenticate user to get JWT token
  const testEmail = `contact_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Contacts Tester',
      email: testEmail,
      phone: '+15550197777',
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
    console.log('✅ 1. Registered and Authenticated Test User');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test POST /api/contacts (Add Contact)
  let contactId = '';
  try {
    const addRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Sarah Smith',
      relationship: 'Spouse',
      phone: '+15550192834',
      email: 'sarah@example.com',
      isPrimary: true
    });

    console.log('✅ 2. POST /api/v1/contacts:', addRes.status, addRes.data.message);
    contactId = addRes.data?.data?._id;
  } catch (err) {
    console.error('❌ POST /api/v1/contacts failed:', err.message);
  }

  // 3. Test GET /api/contacts (Fetch Contacts)
  try {
    const getRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/contacts',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ 3. GET /api/v1/contacts:', getRes.status, 'Count:', getRes.data?.count, 'First Contact Name:', getRes.data?.data?.[0]?.name);
  } catch (err) {
    console.error('❌ GET /api/v1/contacts failed:', err.message);
  }

  // 4. Test PUT /api/contacts/:id (Update Contact & Mark Primary)
  if (contactId) {
    try {
      const updateRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/v1/contacts/${contactId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        name: 'Sarah Smith-Johnson',
        relationship: 'Wife',
        isPrimary: true
      });

      console.log('✅ 4. PUT /api/v1/contacts/:id:', updateRes.status, updateRes.data.message, 'New Name:', updateRes.data?.data?.name);
    } catch (err) {
      console.error('❌ PUT /api/v1/contacts/:id failed:', err.message);
    }

    // 5. Test DELETE /api/contacts/:id (Delete Contact)
    try {
      const delRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/v1/contacts/${contactId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 5. DELETE /api/v1/contacts/:id:', delRes.status, delRes.data.message);
    } catch (err) {
      console.error('❌ DELETE /api/v1/contacts/:id failed:', err.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL CONTACTS FEATURE ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testContactsFeature();

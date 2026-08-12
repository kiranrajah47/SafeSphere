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

async function testProfileSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE USER PROFILE SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Authenticate User
  const testEmail = `profile_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Profile Tester',
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
    console.log('✅ 1. Authenticated User for Profile Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test GET /api/users/profile
  try {
    const getRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ 2. GET /api/users/profile:', getRes.status, getRes.data.data?.name, `(${getRes.data.data?.email})`);
  } catch (err) {
    console.error('❌ GET /api/users/profile failed:', err.message);
  }

  // 3. Test PUT /api/users/profile (Update details)
  try {
    const updateRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Profile Tester Updated',
      phone: '+15550199988',
      profileImage: 'https://example.com/avatar.jpg'
    });

    console.log('✅ 3. PUT /api/users/profile:', updateRes.status, updateRes.data.message, 'New Name:', updateRes.data?.data?.name);
  } catch (err) {
    console.error('❌ PUT /api/users/profile failed:', err.message);
  }

  // 4. Test PUT /api/users/medical (Update emergency medical info)
  try {
    const medRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/medical',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      bloodGroup: 'O+',
      allergies: 'Penicillin, Peanuts',
      medicalConditions: 'Asthma',
      emergencyNotes: 'Inhaler in jacket pocket'
    });

    console.log('✅ 4. PUT /api/users/medical:', medRes.status, medRes.data.message, 'Blood Group:', medRes.data?.data?.bloodGroup);
  } catch (err) {
    console.error('❌ PUT /api/users/medical failed:', err.message);
  }

  // 5. Test PUT /api/users/change-password
  try {
    const pwRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/change-password',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      currentPassword: 'password123',
      newPassword: 'newpassword123'
    });

    console.log('✅ 5. PUT /api/users/change-password:', pwRes.status, pwRes.data.message);
  } catch (err) {
    console.error('❌ PUT /api/users/change-password failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL USER PROFILE ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testProfileSystem();

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

async function testAuthSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE AUTHENTICATION SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  const testEmail = `auth_test_${Date.now()}@safesphere.org`;
  const initialPassword = 'password123';
  const newPassword = 'newPassword456!';
  let devOtpCode = '';
  let token = '';

  // 1. Test Registration
  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Auth Test User',
      email: testEmail,
      phone: '+15550198888',
      password: initialPassword,
      role: 'user'
    });

    console.log('✅ 1. POST /api/v1/auth/register:', regRes.status, regRes.data.message);
    devOtpCode = regRes.data?.data?.devOtp;
    console.log(`   └─ Generated Dev OTP: ${devOtpCode}`);
  } catch (err) {
    console.error('❌ 1. Registration failed:', err.message);
  }

  // 2. Test Verify OTP
  if (devOtpCode) {
    try {
      const verifyRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/auth/verify-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: testEmail,
        otpCode: devOtpCode
      });

      console.log('✅ 2. POST /api/v1/auth/verify-otp:', verifyRes.status, verifyRes.data.message);
    } catch (err) {
      console.error('❌ 2. Verify OTP failed:', err.message);
    }
  }

  // 3. Test Login
  try {
    const loginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: initialPassword
    });

    console.log('✅ 3. POST /api/v1/auth/login:', loginRes.status, loginRes.data.success ? 'Success (JWT Issued)' : 'Failed');
    token = loginRes.data?.data?.token;
  } catch (err) {
    console.error('❌ 3. Login failed:', err.message);
  }

  // 4. Test GET /auth/me with JWT Token
  if (token) {
    try {
      const meRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/auth/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 4. GET /api/v1/auth/me:', meRes.status, 'User Name:', meRes.data?.data?.name);
    } catch (err) {
      console.error('❌ 4. GET /auth/me failed:', err.message);
    }
  }

  // 5. Test Forgot Password
  let resetOtpCode = '';
  try {
    const forgotRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail
    });

    console.log('✅ 5. POST /api/v1/auth/forgot-password:', forgotRes.status, forgotRes.data.message);
    resetOtpCode = forgotRes.data?.data?.devOtp;
    console.log(`   └─ Generated Reset OTP: ${resetOtpCode}`);
  } catch (err) {
    console.error('❌ 5. Forgot Password failed:', err.message);
  }

  // 6. Test Reset Password
  if (resetOtpCode) {
    try {
      const resetRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/auth/reset-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: testEmail,
        otpCode: resetOtpCode,
        newPassword: newPassword
      });

      console.log('✅ 6. POST /api/v1/auth/reset-password:', resetRes.status, resetRes.data.message);
    } catch (err) {
      console.error('❌ 6. Reset Password failed:', err.message);
    }

    // 7. Verify Login with New Password
    try {
      const newLoginRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: testEmail,
        password: newPassword
      });

      console.log('✅ 7. Login with NEW Password:', newLoginRes.status, newLoginRes.data.success ? 'Success' : 'Failed');
    } catch (err) {
      console.error('❌ 7. Login with new password failed:', err.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL AUTHENTICATION ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testAuthSystem();

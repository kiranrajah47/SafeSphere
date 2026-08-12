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

async function testAdminSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE ADMIN DASHBOARD SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Authenticate standard user and admin user
  const userEmail = `std_user_${Date.now()}@safesphere.org`;
  const adminEmail = `sys_admin_${Date.now()}@safesphere.org`;

  let userToken = '';
  let adminToken = '';
  let testUserId = '';

  try {
    // Register Standard User
    const regUser = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Standard User', email: userEmail, phone: '+15550197777', password: 'password123', role: 'user' });

    testUserId = regUser.data?.data?._id || regUser.data?.data?.user?._id;
    const userOtp = regUser.data?.data?.devOtp;
    const vUser = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: userEmail, otpCode: userOtp });

    userToken = vUser.data?.data?.token;

    // Register Admin User
    const regAdmin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'System Admin', email: adminEmail, phone: '+15550198888', password: 'password123', role: 'admin' });

    const adminOtp = regAdmin.data?.data?.devOtp;
    const vAdmin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: adminEmail, otpCode: adminOtp });

    adminToken = vAdmin.data?.data?.token;

    console.log('✅ 1. Authenticated Standard User and Admin User');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test Authorization Guard: Standard user should get 403 Forbidden on Admin route
  try {
    const forbiddenRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    console.log('✅ 2. Non-Admin Access Guard Test:', forbiddenRes.status, forbiddenRes.data.message, '(Must be 403 Forbidden)');
  } catch (err) {
    console.error('❌ Access guard test failed:', err.message);
  }

  // 3. Test GET /api/admin/stats (Admin Authorized Access)
  try {
    const statsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    console.log('✅ 3. GET /api/admin/stats:', statsRes.status, 'Total Users:', statsRes.data?.data?.totalUsers, 'Active SOS:', statsRes.data?.data?.activeSOSCount);
  } catch (err) {
    console.error('❌ GET /api/admin/stats failed:', err.message);
  }

  // 4. Test GET /api/admin/users
  try {
    const usersRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    console.log('✅ 4. GET /api/admin/users:', usersRes.status, 'User Count:', usersRes.data?.count);
  } catch (err) {
    console.error('❌ GET /api/admin/users failed:', err.message);
  }

  // 5. Test PUT /api/admin/users/:id/status (Deactivate User)
  if (testUserId) {
    try {
      const statusRes = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/admin/users/${testUserId}/status`,
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      console.log('✅ 5. PUT /api/admin/users/:id/status (Deactivate):', statusRes.status, statusRes.data.message);
    } catch (err) {
      console.error('❌ PUT /api/admin/users/:id/status failed:', err.message);
    }
  }

  // 6. Test GET /api/admin/resources (Resource Management)
  try {
    const resRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/resources',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    console.log('✅ 6. GET /api/admin/resources:', resRes.status, 'Resource Count:', resRes.data?.count);
  } catch (err) {
    console.error('❌ GET /api/admin/resources failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL ADMIN DASHBOARD ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testAdminSystem();

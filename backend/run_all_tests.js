const http = require('http');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

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

async function runMasterBackendTestSuite() {
  console.log('\n================================================================');
  console.log('🧪 SAFESPHERE COMPLETE BACKEND MASTER TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failCount++;
    }
  }

  // Generate unique test credentials
  const timestamp = Date.now();
  const userEmail = `user_test_${timestamp}@safesphere.org`;
  const adminEmail = `admin_test_${timestamp}@safesphere.org`;
  const password = 'Password123!';

  let userToken = '';
  let userId = '';
  let adminToken = '';
  let contactId = '';
  let sosId = '';
  let incidentId = '';
  let alertId = '';
  let journeyId = '';

  // ------------------------------------------------------------------
  // 1. REGISTRATION, OTP, LOGIN & AUTHENTICATION
  // ------------------------------------------------------------------
  console.log('--- 1. Authentication & OTP Verification ---');

  // Test: Registration
  const regRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Standard User', email: userEmail, phone: '+15550191111', password, role: 'user' });

  assert(regRes.status === 201 && regRes.data.success, 'User Registration (POST /api/v1/auth/register)');
  const devOtp = regRes.data?.data?.devOtp;

  // Test: Duplicate Registration Edge Case
  const dupRegRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Duplicate User', email: userEmail, phone: '+15550191111', password, role: 'user' });

  assert(dupRegRes.status === 400, 'Duplicate Email Registration Rejection (Edge Case)');

  // Test: OTP Verification
  const otpRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/verify-otp', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: userEmail, otpCode: devOtp });

  assert(otpRes.status === 200 && otpRes.data.success, 'OTP Verification (POST /api/v1/auth/verify-otp)');
  userToken = otpRes.data?.data?.token;
  userId = otpRes.data?.data?._id;

  // Test: Login
  const loginRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: userEmail, password });

  assert(loginRes.status === 200 && loginRes.data.data?.token, 'Login & JWT Issuance (POST /api/v1/auth/login)');

  // Test: Invalid Password Login
  const badLoginRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: userEmail, password: 'WrongPassword!' });

  assert(badLoginRes.status === 401, 'Invalid Password Login Rejection (Edge Case)');

  // Test: Admin Account Setup
  const adminReg = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Admin Officer', email: adminEmail, phone: '+15550192222', password, role: 'admin' });

  const adminOtp = adminReg.data?.data?.devOtp;
  const adminOtpRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/verify-otp', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: adminEmail, otpCode: adminOtp });

  adminToken = adminOtpRes.data?.data?.token;
  assert(Boolean(adminToken), 'Admin Account Creation & Verification');

  // Test: Invalid / Expired JWT Edge Case
  const invalidJwtRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/auth/me', method: 'GET',
    headers: { 'Authorization': 'Bearer invalid_malformed_jwt_token' }
  });

  assert(invalidJwtRes.status === 401, 'Insecure / Malformed JWT Token Rejection (Edge Case)');

  // ------------------------------------------------------------------
  // 2. TRUSTED EMERGENCY CONTACTS
  // ------------------------------------------------------------------
  console.log('\n--- 2. Trusted Emergency Contacts ---');

  // Test: Add Contact
  const addContactRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/contacts', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, { name: 'Sarah Smith', relationship: 'Spouse', phone: '+15550193333', isPrimary: true });

  assert(addContactRes.status === 201 && addContactRes.data.data?._id, 'Add Contact (POST /api/v1/contacts)');
  contactId = addContactRes.data?.data?._id;

  // Test: Get Contacts
  const getContactsRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/contacts', method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  assert(getContactsRes.status === 200 && getContactsRes.data.data.length > 0, 'Fetch Contacts (GET /api/v1/contacts)');

  // ------------------------------------------------------------------
  // 3. EMERGENCY SOS SYSTEM
  // ------------------------------------------------------------------
  console.log('\n--- 3. Emergency SOS Dispatch & Resolution ---');

  // Test: Trigger SOS
  const sosRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/sos', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, { emergencyType: 'PANIC', latitude: 28.6139, longitude: 77.2090, address: 'Test Location' });

  assert(sosRes.status === 201 && sosRes.data.data?._id, 'Trigger Emergency SOS (POST /api/v1/sos)');
  sosId = sosRes.data?.data?._id;

  // Test: Get Active SOS
  const activeSosRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/sos/active', method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  assert(activeSosRes.status === 200 && activeSosRes.data.data?._id === sosId, 'Fetch Active SOS (GET /api/v1/sos/active)');

  // Test: Resolve SOS
  const resolveSosRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/sos/resolve', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, { sosId });

  assert(resolveSosRes.status === 200 && resolveSosRes.data.success, 'Resolve SOS (POST /api/v1/sos/resolve)');

  // ------------------------------------------------------------------
  // 4. INCIDENT REPORTING & ADMIN MODERATION
  // ------------------------------------------------------------------
  console.log('\n--- 4. Incident Reporting & Admin Authorization ---');

  // Test: Submit Report (Status: pending)
  const reportRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/incidents', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, {
    title: 'Broken Street Light on Main St',
    incidentType: 'Road hazard',
    category: 'Road hazard',
    description: 'Dark alleyway near station due to non-functioning streetlight.',
    latitude: 28.6145, longitude: 77.2095, address: 'Main Street'
  });

  assert(reportRes.status === 201 && reportRes.data.data?.status === 'pending', 'Submit Incident Report (POST /api/v1/incidents)');
  incidentId = reportRes.data?.data?._id;

  // Test: Regular User Admin Action Rejection (RBAC IDOR Check)
  const unauthAdminRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: `/api/v1/incidents/${incidentId}/status`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, { status: 'verified' });

  assert(unauthAdminRes.status === 403, 'Admin Action RBAC Protection (Regular User Rejected 403)');

  // Test: Admin Verifying Incident
  const adminVerifyRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: `/api/v1/incidents/${incidentId}/status`, method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  }, { status: 'verified', adminNotes: 'Verified by safety officer' });

  assert(adminVerifyRes.status === 200 && adminVerifyRes.data.data?.status === 'verified', 'Admin Verify Incident (PUT /api/v1/incidents/:id/status)');

  // ------------------------------------------------------------------
  // 5. COMMUNITY SAFETY ALERTS
  // ------------------------------------------------------------------
  console.log('\n--- 5. Community Safety Alerts & Filtering ---');

  // Test: Create Alert
  const alertRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/alerts', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, {
    title: 'Flooded Underpass Warning',
    description: 'Heavy water logging under railway bridge.',
    category: 'Road hazard', severity: 'high',
    latitude: 28.6139, longitude: 77.2090
  });

  assert(alertRes.status === 201 && alertRes.data.data?._id, 'Create Community Alert (POST /api/v1/alerts)');
  alertId = alertRes.data?.data?._id;

  // Test: Fetch Alerts with Nearby Filter
  const getAlertsRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/alerts?lat=28.6139&lng=77.2090&radiusKm=50', method: 'GET'
  });

  assert(getAlertsRes.status === 200 && getAlertsRes.data.data.length > 0, 'Fetch Alerts with Filters (GET /api/v1/alerts)');

  // ------------------------------------------------------------------
  // 6. SAFE JOURNEY MODE
  // ------------------------------------------------------------------
  console.log('\n--- 6. Safe Journey Mode ---');

  // Test: Start Journey
  const journeyRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/journey/start', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  }, {
    destinationName: 'Central Train Station',
    expectedDurationMinutes: 20,
    trustedContactId: contactId,
    latitude: 28.6139, longitude: 77.2090
  });

  assert((journeyRes.status === 201 || journeyRes.status === 200) && journeyRes.data.data?._id, `Start Safe Journey (POST /api/v1/journey/start) [Status: ${journeyRes.status}, Msg: ${journeyRes.data?.message || 'Error'}]`);
  journeyId = journeyRes.data?.data?._id;

  // Test: Complete Journey
  const completeJourneyRes = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/journey/complete', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
  });

  assert((completeJourneyRes.status === 200 || completeJourneyRes.status === 201) && completeJourneyRes.data.success, `Complete Safe Journey (POST /api/v1/journey/complete) [Status: ${completeJourneyRes.status}, Msg: ${completeJourneyRes.data?.message || 'Error'}]`);

  // ------------------------------------------------------------------
  // 7. NOTIFICATIONS & PREFERENCES
  // ------------------------------------------------------------------
  console.log('\n--- 7. Notifications & Delivery Preferences ---');

  // Test: Notification Preferences GET & PUT
  const prefGet = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/notifications/preferences', method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  assert(prefGet.status === 200 && prefGet.data.data?.notificationPreferences, 'Fetch Notification Preferences (GET /api/v1/notifications/preferences)');

  const notifFeed = await makeRequest({
    hostname: '127.0.0.1', port: 5000, path: '/api/v1/notifications', method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  assert(notifFeed.status === 200 && Array.isArray(notifFeed.data.data), 'Fetch In-App Notifications Feed (GET /api/v1/notifications)');

  // ------------------------------------------------------------------
  // TEST SUMMARY RESULTS
  // ------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🎉 BACKEND MASTER SUITE FINISHED`);
  console.log(`   Passed: ${passCount} | Failed: ${failCount} | Total: ${passCount + failCount}`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterBackendTestSuite();

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

async function testNotificationSystemAPI() {
  console.log('\n======================================================');
  console.log('🔔 SAFESPHERE NOTIFICATION SYSTEM & PREFERENCES TEST');
  console.log('======================================================\n');

  // Connect to DB for direct service test
  await connectDB();

  // 1. Authenticate user
  const email = `notif_test_${Date.now()}@safesphere.org`;
  let token = '';
  let userId = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Notif User', email, phone: '+15550198888', password: 'password123', role: 'user' });

    const otpCode = regRes.data?.data?.devOtp;
    const vRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, otpCode });

    token = vRes.data?.data?.token;
    userId = vRes.data?.data?._id;
    console.log('✅ 1. Authenticated User token acquired.');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test Preferences GET & PUT
  try {
    const getPrefs = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/notifications/preferences',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getPrefs.status === 200 && getPrefs.data.success) {
      console.log('✅ 2a. GET /api/v1/notifications/preferences -> Passed');
    }

    const getLocationPrefs = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/location/preferences',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (getLocationPrefs.status === 200 && getLocationPrefs.data.success) {
      console.log('✅ 2b. GET /api/v1/location/preferences -> Passed');
    }

    const updatePrefs = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/notifications/preferences',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      inApp: true,
      sms: true,
      email: true,
      sosAlerts: true,
      communityAlerts: true
    });

    if (updatePrefs.status === 200 && updatePrefs.data.success) {
      console.log('✅ 2c. PUT /api/v1/notifications/preferences -> Passed');
    }
  } catch (e) {
    console.error('❌ Preferences API test error:', e.message);
  }

  // 3. Test Notification Abstraction Dispatches via Service
  const { dispatchNotification } = require('./services/notificationService');
  try {
    const res1 = await dispatchNotification({
      recipientUserId: userId,
      type: 'sos_created',
      title: '🚨 Test SOS Triggered',
      message: 'SOS distress signal active.'
    });

    const res2 = await dispatchNotification({
      recipientUserId: userId,
      type: 'nearby_alert',
      title: '⚠️ Test Nearby Hazard',
      message: 'New hazard reported nearby.'
    });

    const res3 = await dispatchNotification({
      recipientUserId: userId,
      type: 'incident_verified',
      title: '🛡️ Report Verified',
      message: 'Your incident report is verified.'
    });

    console.log(`✅ 3. Dispatched notifications across channels: [ ${res1.deliveredChannels.join(', ')} ]`);
  } catch (e) {
    console.error('❌ Service dispatch error:', e.message);
  }

  // 4. Test In-App Notification Feed Retrieval & Read All
  try {
    const listRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/notifications',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (listRes.status === 200 && listRes.data.success) {
      console.log(`✅ 4a. GET /api/v1/notifications -> Passed (Unread: ${listRes.data.unreadCount}, Count: ${listRes.data.data.length})`);
    }

    const readAllRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/notifications/read-all',
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (readAllRes.status === 200 && readAllRes.data.success) {
      console.log('✅ 4b. PUT /api/v1/notifications/read-all -> Passed');
    }
  } catch (e) {
    console.error('❌ Notification feed test error:', e.message);
  }

  console.log('\n======================================================');
  console.log('🎉 NOTIFICATION SYSTEM & PREFERENCES VERIFICATION COMPLETED');
  console.log('======================================================\n');
  process.exit(0);
}

testNotificationSystemAPI();

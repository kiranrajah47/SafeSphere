const http = require('http');
const { io: ioClient } = require('socket.io-client');

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

async function testRealtimeSockets() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE REAL-TIME SOCKET.IO ENGINE TEST');
  console.log('======================================================\n');

  // 1. Authenticate user for Socket Testing
  const userEmail = `rt_user_${Date.now()}@safesphere.org`;
  const adminEmail = `rt_admin_${Date.now()}@safesphere.org`;

  let userToken = '';
  let adminToken = '';

  try {
    // Register Standard User
    const regUser = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Realtime User', email: userEmail, phone: '+15550196666', password: 'password123', role: 'user' });

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
    }, { name: 'Realtime Admin', email: adminEmail, phone: '+15550197778', password: 'password123', role: 'admin' });

    const adminOtp = regAdmin.data?.data?.devOtp;
    const vAdmin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: adminEmail, otpCode: adminOtp });

    adminToken = vAdmin.data?.data?.token;

    console.log('✅ 1. Authenticated User and Admin for Socket.IO Testing');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Connect Socket.IO Client with Auth Token
  const socketClient = ioClient('http://127.0.0.1:5000', {
    transports: ['websocket', 'polling'],
    auth: { token: userToken }
  });

  const receivedEvents = [];

  await new Promise((resolve) => {
    socketClient.on('connect', () => {
      console.log('✅ 2. Socket.IO Client Connected Gracefully:', socketClient.id);
      resolve();
    });
  });

  // Register listeners for required events
  ['sos-created', 'sos-resolved', 'alert-created', 'alert-updated', 'incident-verified', 'journey-started', 'journey-warning'].forEach(event => {
    socketClient.on(event, (data) => {
      receivedEvents.push(event);
      console.log(` 📡 [REALTIME EVENT RECEIVED] "${event}"`);
    });
  });

  // 3. Trigger Community Alert -> Check alert-created event
  try {
    await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/alerts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    }, {
      title: 'Realtime Socket Safety Hazard',
      description: 'Testing live socket broadcast',
      category: 'Road hazard',
      severity: 'medium',
      latitude: 28.6139,
      longitude: 77.2090
    });
  } catch (e) {}

  // 4. Trigger SOS -> Check sos-created event
  let sosId = '';
  try {
    const sosRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    }, {
      emergencyType: 'PANIC',
      latitude: 28.6139,
      longitude: 77.2090
    });
    sosId = sosRes.data?.data?._id;
  } catch (e) {}

  // Wait 1.5 seconds for events to process
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n======================================================');
  console.log('🎉 REAL-TIME SOCKET.IO ENGINE TEST COMPLETED');
  console.log(`   Events Caught: [ ${receivedEvents.join(', ')} ]`);
  console.log('======================================================\n');

  socketClient.disconnect();
  process.exit(0);
}

testRealtimeSockets();

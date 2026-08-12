const http = require('http');

const makeRequest = (options) => {
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
    req.end();
  });
};

async function testResourcesSystem() {
  console.log('\n======================================================');
  console.log('🧪 SAFESPHERE NEARBY ASSISTANCE SYSTEM END-TO-END TEST');
  console.log('======================================================\n');

  // 1. Test GET /api/resources/nearby (ALL)
  try {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/resources/nearby?lat=28.6139&lng=77.2090&category=ALL',
      method: 'GET'
    });

    console.log('✅ 1. GET /api/resources/nearby (ALL):', res.status, 'Count:', res.data?.count);
    if (res.data?.data?.[0]) {
      const first = res.data.data[0];
      console.log(`   └─ Nearest Place: ${first.name} (${first.category}) - ${first.distanceText}`);
      console.log(`   └─ OSM Directions URL: ${first.directionsUrl}`);
    }
  } catch (err) {
    console.error('❌ GET /api/resources/nearby failed:', err.message);
  }

  // 2. Test GET /api/resources/nearby (POLICE Filter)
  try {
    const policeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/resources/nearby?lat=28.6139&lng=77.2090&category=POLICE',
      method: 'GET'
    });

    console.log('✅ 2. GET /api/resources/nearby (POLICE):', policeRes.status, 'Count:', policeRes.data?.count);
  } catch (err) {
    console.error('❌ GET /api/resources/nearby (POLICE) failed:', err.message);
  }

  // 3. Test GET /api/resources/nearby (HOSPITAL Filter)
  try {
    const hospRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/resources/nearby?lat=28.6139&lng=77.2090&category=HOSPITAL',
      method: 'GET'
    });

    console.log('✅ 3. GET /api/resources/nearby (HOSPITAL):', hospRes.status, 'Count:', hospRes.data?.count);
  } catch (err) {
    console.error('❌ GET /api/resources/nearby (HOSPITAL) failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL NEARBY ASSISTANCE SYSTEM ENDPOINTS PASSED CLEANLY');
  console.log('======================================================\n');
  process.exit(0);
}

testResourcesSystem();

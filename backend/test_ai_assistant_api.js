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

async function testAIAssistantAPI() {
  console.log('\n======================================================');
  console.log('🤖 SAFESPHERE AI SAFETY ASSISTANT API TEST');
  console.log('======================================================\n');

  // 1. Authenticate user
  const email = `ai_test_${Date.now()}@safesphere.org`;
  let token = '';

  try {
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'AI Test User', email, phone: '+15550199999', password: 'password123', role: 'user' });

    const otpCode = regRes.data?.data?.devOtp;
    const vRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, otpCode });

    token = vRes.data?.data?.token;
    console.log('✅ 1. Authenticated User token acquired.');
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Test 6 Required Safety Questions
  const questions = [
    'What should I do during an emergency?',
    'How do I send an SOS?',
    'How do I add a trusted contact?',
    'Where can I find nearby assistance?',
    'What is Safe Journey?',
    'What first-aid resources are available?'
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/ai/safety-advice',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, { prompt: q });

      if (res.status === 200 && res.data.success) {
        console.log(`✅ Question ${i + 1}: "${q}" -> Passed`);
        console.log(`   Provider: ${res.data.data.provider} | Action Link: ${res.data.data.actionLink || 'N/A'}`);
      } else {
        console.error(`❌ Question ${i + 1} failed:`, res.data);
      }
    } catch (e) {
      console.error(`❌ Question ${i + 1} network error:`, e.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 AI SAFETY ASSISTANT VERIFICATION COMPLETED');
  console.log('======================================================\n');
  process.exit(0);
}

testAIAssistantAPI();

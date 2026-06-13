const http = require('http');

const PORT = process.env.PORT || 5005;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make HTTP Requests
const request = (method, path, body, token = null) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(data);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting API Integration Tests...');
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';
  let token = null;
  let testUrlId = null;
  let shortCode = null;

  try {
    // 1. Test Signup
    console.log('\n--- 1. Testing Signup ---');
    const signupRes = await request('POST', '/api/auth/signup', {
      name: 'Test Engineer',
      email: testEmail,
      password: testPassword
    });
    
    if (signupRes.statusCode === 201 && signupRes.body.success) {
      console.log('✅ Signup Successful');
      console.log(`User: ${signupRes.body.user.email}`);
    } else {
      throw new Error(`Signup failed with status ${signupRes.statusCode}: ${JSON.stringify(signupRes.body)}`);
    }

    // 2. Test Login
    console.log('\n--- 2. Testing Login ---');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword
    });

    if (loginRes.statusCode === 200 && loginRes.body.success) {
      console.log('✅ Login Successful');
      token = loginRes.body.token;
    } else {
      throw new Error(`Login failed with status ${loginRes.statusCode}: ${JSON.stringify(loginRes.body)}`);
    }

    // 3. Test Me
    console.log('\n--- 3. Testing Get Current User (/me) ---');
    const meRes = await request('GET', '/api/auth/me', null, token);
    if (meRes.statusCode === 200 && meRes.body.success) {
      console.log(`✅ Get Me Successful. Logged in as: ${meRes.body.user.name}`);
    } else {
      throw new Error(`Get Me failed: ${JSON.stringify(meRes.body)}`);
    }

    // 4. Test Shorten Link
    console.log('\n--- 4. Testing Shorten URL ---');
    const targetUrl = 'https://news.ycombinator.com';
    const shortenRes = await request('POST', '/api/shorten', {
      longUrl: targetUrl
    }, token);

    if (shortenRes.statusCode === 201 && shortenRes.body.success) {
      console.log('✅ URL Shortening Successful');
      testUrlId = shortenRes.body.data._id;
      shortCode = shortenRes.body.data.shortCode;
      console.log(`Generated short code: ${shortCode}`);
    } else {
      throw new Error(`URL Shortening failed: ${JSON.stringify(shortenRes.body)}`);
    }

    // 5. Test Custom Alias Shorten
    console.log('\n--- 5. Testing Custom Alias URL Shortening ---');
    const customAlias = `alias-${Date.now().toString().slice(-4)}`;
    const customRes = await request('POST', '/api/shorten', {
      longUrl: 'https://github.com',
      customAlias: customAlias
    }, token);

    if (customRes.statusCode === 201 && customRes.body.success) {
      console.log(`✅ Custom Alias Shortening Successful. Code/Alias: ${customRes.body.data.shortCode}`);
    } else {
      throw new Error(`Custom Alias Shortening failed: ${JSON.stringify(customRes.body)}`);
    }

    // 6. Test Fetch All User Links
    console.log('\n--- 6. Testing Fetch User URLs ---');
    const urlsRes = await request('GET', '/api/urls', null, token);
    if (urlsRes.statusCode === 200 && urlsRes.body.success) {
      console.log(`✅ Get Links Successful. Total links retrieved: ${urlsRes.body.count}`);
    } else {
      throw new Error(`Get User URLs failed: ${JSON.stringify(urlsRes.body)}`);
    }

    // 7. Test Get Analytics
    console.log('\n--- 7. Testing Get URL Analytics ---');
    const analyticsRes = await request('GET', `/api/urls/${testUrlId}/analytics`, null, token);
    if (analyticsRes.statusCode === 200 && analyticsRes.body.success) {
      console.log(`✅ Get Analytics Successful. Total clicks reported: ${analyticsRes.body.data.totalClicks}`);
    } else {
      throw new Error(`Get Analytics failed: ${JSON.stringify(analyticsRes.body)}`);
    }

    // 8. Test Delete Link
    console.log('\n--- 8. Testing Delete URL ---');
    const deleteRes = await request('DELETE', `/api/urls/${testUrlId}`, null, token);
    if (deleteRes.statusCode === 200 && deleteRes.body.success) {
      console.log('✅ URL Deletion Successful');
    } else {
      throw new Error(`URL Deletion failed: ${JSON.stringify(deleteRes.body)}`);
    }

    console.log('\n🎉 All backend API endpoints validated successfully!');
  } catch (err) {
    console.error('\n❌ Test execution failed with error:', err.message);
    process.exit(1);
  }
};

runTests();

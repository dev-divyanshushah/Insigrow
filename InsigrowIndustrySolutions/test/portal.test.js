/**
 * Automated End-to-End Test Suite for Insigrow Industry Solutions Portal
 */

const assert = require('assert');
const http = require('http');
const app = require('../server/server');
const { db } = require('../server/db');

const PORT = 5055;
let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Automated Test Suite ---');
  server = app.listen(PORT);

  try {
    // Test 1: Health Check
    console.log('[Test 1] Health check endpoint...');
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'ok');
    console.log('✓ Health check passed');

    // Test 2: User Registration Validation - Password mismatch
    console.log('[Test 2] Registration validation (password mismatch)...');
    const badReg = await request('POST', '/api/auth/register', {
      fullName: 'Vikram Malhotra',
      companyName: 'Apex Foods Ltd',
      email: 'vikram.test@apexfoods.com',
      phoneNumber: '+91 9876543210',
      password: 'password123',
      confirmPassword: 'differentPassword'
    });
    assert.strictEqual(badReg.status, 400);
    assert.ok(badReg.body.message.includes('match'));
    console.log('✓ Password mismatch check passed');

    // Test 3: Valid Registration
    console.log('[Test 3] User registration...');
    const testEmail = `enterprise_${Date.now()}@insigrow-demo.com`;
    const regRes = await request('POST', '/api/auth/register', {
      fullName: 'Rahul Sharma',
      companyName: 'Sharma & Associates CA',
      email: testEmail,
      phoneNumber: '+91 9988776655',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    });
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regRes.body.success, true);
    assert.strictEqual(regRes.body.user.email, testEmail);
    console.log('✓ Registration passed');

    // Test 4: Duplicate Registration Prevention
    console.log('[Test 4] Duplicate registration rejection...');
    const dupRes = await request('POST', '/api/auth/register', {
      fullName: 'Rahul Sharma',
      companyName: 'Duplicate Company',
      email: testEmail,
      phoneNumber: '+91 9988776655',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    });
    assert.strictEqual(dupRes.status, 409);
    console.log('✓ Duplicate registration prevention passed');

    // Test 5: Login with Wrong Password
    console.log('[Test 5] Login wrong password rejection...');
    const badLogin = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'wrong_password'
    });
    assert.strictEqual(badLogin.status, 401);
    console.log('✓ Wrong password rejection passed');

    // Test 6: Successful Login & JWT issuance
    console.log('[Test 6] Successful login & session...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'SecurePassword123!',
      rememberMe: true
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    assert.ok(loginRes.body.token);
    const authToken = loginRes.body.token;
    console.log('✓ Login passed, token received');

    // Test 7: Protected Route /api/auth/me
    console.log('[Test 7] Protected session verification (/api/auth/me)...');
    const meRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${authToken}`
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.user.email, testEmail);
    assert.ok(meRes.body.trials.fmcg);
    assert.strictEqual(meRes.body.trials.fmcg.status, 'not_started');
    assert.strictEqual(meRes.body.trials.fmcg.isTrialActive, false);
    console.log('✓ Session verification passed');

    // Test 8: Check Industry Features Before Trial Activation (Locked)
    console.log('[Test 8] Industry features before trial (trial features locked)...');
    const indBeforeRes = await request('GET', '/api/industry/fmcg', null, {
      Authorization: `Bearer ${authToken}`
    });
    assert.strictEqual(indBeforeRes.status, 200);
    const trialFeatsBefore = indBeforeRes.body.data.features.filter(f => f.isTrialFeature);
    assert.ok(trialFeatsBefore.length > 0);
    assert.strictEqual(trialFeatsBefore[0].isLocked, true);
    assert.strictEqual(trialFeatsBefore[0].premiumData, null);
    console.log('✓ Locked trial features enforcement passed');

    // Test 9: Independent 15-Day Free Trial Activation for FMCG
    console.log('[Test 9] Activate 15-Day Free Trial for FMCG...');
    const activateFmcg = await request('POST', '/api/trials/activate', {
      industry: 'fmcg'
    }, {
      Authorization: `Bearer ${authToken}`
    });
    assert.strictEqual(activateFmcg.status, 200);
    assert.strictEqual(activateFmcg.body.success, true);
    assert.strictEqual(activateFmcg.body.trial.industry, 'fmcg');
    assert.strictEqual(activateFmcg.body.trial.status, 'active');
    assert.strictEqual(activateFmcg.body.trial.isTrialActive, true);
    assert.strictEqual(activateFmcg.body.trial.daysRemaining, 14); // or 15 depending on hour
    assert.strictEqual(activateFmcg.body.trial.totalDurationDays, 15);
    console.log(`✓ FMCG 15-Day Trial active! Remaining: ${activateFmcg.body.trial.daysRemaining} days, ${activateFmcg.body.trial.hoursRemaining} hours`);

    // Test 10: Verify Industry Independence - CA trial must still be 'not_started'
    console.log('[Test 10] Verify Trial Independence (CA must remain not_started)...');
    const caCheck = await request('GET', '/api/industry/ca', null, {
      Authorization: `Bearer ${authToken}`
    });
    assert.strictEqual(caCheck.status, 200);
    assert.strictEqual(caCheck.body.data.trialState.status, 'not_started');
    assert.strictEqual(caCheck.body.data.trialState.isTrialActive, false);
    const caTrialFeats = caCheck.body.data.features.filter(f => f.isTrialFeature);
    assert.strictEqual(caTrialFeats[0].isLocked, true);
    console.log('✓ Trial independence verified: CA is not started while FMCG is active');

    // Test 11: Verify FMCG Industry Features are now UNLOCKED
    console.log('[Test 11] Verify FMCG trial features are now UNLOCKED...');
    const indAfterRes = await request('GET', '/api/industry/fmcg', null, {
      Authorization: `Bearer ${authToken}`
    });
    assert.strictEqual(indAfterRes.status, 200);
    assert.strictEqual(indAfterRes.body.data.trialState.isTrialActive, true);
    const trialFeatsAfter = indAfterRes.body.data.features.filter(f => f.isTrialFeature);
    assert.strictEqual(trialFeatsAfter[0].isLocked, false);
    assert.ok(trialFeatsAfter[0].premiumData);
    assert.ok(trialFeatsAfter[0].premiumData.forecastAccuracy);
    console.log('✓ Premium data successfully unlocked with active trial!');

    // Test 12: Independent 15-Day Free Trial Activation for Manufacturing
    console.log('[Test 12] Activate second independent trial (Manufacturing)...');
    const actMfg = await request('POST', '/api/trials/activate', {
      industry: 'manufacturing'
    }, {
      Authorization: `Bearer ${authToken}`
    });
    assert.strictEqual(actMfg.status, 200);
    assert.strictEqual(actMfg.body.trial.isTrialActive, true);
    console.log('✓ Multi-trial independence verified: Manufacturing activated independently');

    // Test 13: Static Files Serving
    console.log('[Test 13] Verify static web asset serving...');
    const htmlRes = await request('GET', '/');
    assert.strictEqual(htmlRes.status, 200);
    assert.ok(htmlRes.raw.includes('Insigrow'));

    const cssRes = await request('GET', '/css/styles.css');
    assert.strictEqual(cssRes.status, 200);
    assert.ok(cssRes.raw.includes('--color-primary'));

    const jsRes = await request('GET', '/js/app.js');
    assert.strictEqual(jsRes.status, 200);
    console.log('✓ Static web files served properly');

    console.log('\n🎉 ALL 13 TEST SUITES PASSED FLAWLESSLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();


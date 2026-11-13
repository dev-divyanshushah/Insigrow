/**
 * In-Process Route Handler Test Suite
 */

const assert = require('assert');
const authRoutes = require('../server/routes/authRoutes');
const trialRoutes = require('../server/routes/trialRoutes');
const industryRoutes = require('../server/routes/industryRoutes');
const { db } = require('../server/db');

function createReqRes(method, path, body = {}, user = null, cookies = {}) {
  const req = {
    method,
    url: path,
    path,
    body,
    params: {},
    query: {},
    headers: {},
    cookies,
    user
  };

  const res = {
    statusCode: 200,
    headers: {},
    cookies: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    cookie(name, val, opts) {
      this.cookies[name] = { val, opts };
      return this;
    },
    clearCookie(name) {
      delete this.cookies[name];
      return this;
    }
  };

  return { req, res };
}

// Simple router runner helper
function runRoute(router, req, res) {
  return new Promise((resolve, reject) => {
    router(req, res, (err) => {
      if (err) return reject(err);
      resolve(res);
    });
    // If res.json was called synchronously
    if (res.body !== null) {
      resolve(res);
    }
  });
}

async function testRoutes() {
  console.log('--- Testing API Route Handlers ---');

  // Test 1: Register Route with missing fields
  console.log('[Route Test 1] POST /api/auth/register with empty body...');
  const { req: r1, res: s1 } = createReqRes('POST', '/register', {});
  await runRoute(authRoutes, r1, s1);
  assert.strictEqual(s1.statusCode, 400);
  assert.strictEqual(s1.body.success, false);
  console.log('✓ Validation rejection passed');

  // Test 2: Register Route with valid data
  console.log('[Route Test 2] POST /api/auth/register valid user...');
  const email = `test_exec_${Date.now()}@enterprisegrowth.com`;
  const { req: r2, res: s2 } = createReqRes('POST', '/register', {
    fullName: 'Ananya Roy',
    companyName: 'Roy Logistics Ltd',
    email,
    phoneNumber: '+91 98300 54321',
    password: 'Password999',
    confirmPassword: 'Password999'
  });
  await runRoute(authRoutes, r2, s2);
  assert.strictEqual(s2.statusCode, 201);
  assert.strictEqual(s2.body.success, true);
  console.log('✓ Register handler passed');

  // Test 3: Login Route with correct credentials
  console.log('[Route Test 3] POST /api/auth/login...');
  const { req: r3, res: s3 } = createReqRes('POST', '/login', {
    email,
    password: 'Password999',
    rememberMe: true
  });
  await runRoute(authRoutes, r3, s3);
  assert.strictEqual(s3.statusCode, 200);
  assert.strictEqual(s3.body.success, true);
  assert.ok(s3.body.token);
  assert.ok(s3.cookies.insigrow_token);
  const loggedInUser = s3.body.user;
  console.log('✓ Login handler and cookie generation passed');

  // Test 4: Forgot Password Route
  console.log('[Route Test 4] POST /api/auth/forgot-password...');
  const { req: r4, res: s4 } = createReqRes('POST', '/forgot-password', { email });
  await runRoute(authRoutes, r4, s4);
  assert.strictEqual(s4.statusCode, 200);
  assert.strictEqual(s4.body.success, true);
  console.log('✓ Forgot password handler passed');

  // Test 5: Trial Activation Route
  console.log('[Route Test 5] POST /api/trials/activate for Manufacturing...');
  const { req: r5, res: s5 } = createReqRes('POST', '/activate', { industry: 'manufacturing' }, loggedInUser);
  r5.headers.authorization = `Bearer ${s3.body.token}`;
  await runRoute(trialRoutes, r5, s5);
  assert.strictEqual(s5.statusCode, 200);
  assert.strictEqual(s5.body.trial.industry, 'manufacturing');
  assert.strictEqual(s5.body.trial.isTrialActive, true);
  console.log('✓ Trial activation route handler passed');

  // Test 6: Industry Gating Route - Manufacturing (Trial Active -> Unlocked)
  console.log('[Route Test 6] GET /api/industry/manufacturing (Unlocked)...');
  const { req: r6, res: s6 } = createReqRes('GET', '/manufacturing', {}, loggedInUser);
  r6.headers.authorization = `Bearer ${s3.body.token}`;
  r6.params = { industry: 'manufacturing' };
  await runRoute(industryRoutes, r6, s6);
  assert.strictEqual(s6.statusCode, 200);
  assert.strictEqual(s6.body.data.trialState.isTrialActive, true);
  const mfgTrialFeats = s6.body.data.features.filter(f => f.isTrialFeature);
  assert.strictEqual(mfgTrialFeats[0].isLocked, false);
  assert.ok(mfgTrialFeats[0].premiumData);
  console.log('✓ Unlocked industry features verified');

  // Test 7: Industry Gating Route - CA (Trial Not Active -> Locked)
  console.log('[Route Test 7] GET /api/industry/ca (Locked)...');
  const { req: r7, res: s7 } = createReqRes('GET', '/ca', {}, loggedInUser);
  r7.headers.authorization = `Bearer ${s3.body.token}`;
  r7.params = { industry: 'ca' };
  await runRoute(industryRoutes, r7, s7);
  assert.strictEqual(s7.statusCode, 200);
  assert.strictEqual(s7.body.data.trialState.isTrialActive, false);
  const caTrialFeats = s7.body.data.features.filter(f => f.isTrialFeature);
  assert.strictEqual(caTrialFeats[0].isLocked, true);
  assert.strictEqual(caTrialFeats[0].premiumData, null);
  console.log('✓ Locked industry features verified');

  console.log('\n🎉 ALL ROUTE TESTS PASSED WITH 100% ACCURACY! 🎉\n');
}

testRoutes().catch(err => {
  console.error('Route test error:', err);
  process.exit(1);
});

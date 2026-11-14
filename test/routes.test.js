/**
 * In-Process Route Handler Test Suite
 */

const assert = require('assert');
const authRoutes = require('../server/routes/authRoutes');
const trialRoutes = require('../server/routes/trialRoutes');
const industryRoutes = require('../server/routes/industryRoutes');
const { db } = require('../server/db');
const { generateToken } = require('../server/auth');

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
    _resolve: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      if (typeof this._resolve === 'function') {
        this._resolve(this);
      }
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
    if (res.body !== null) return resolve(res);
    res._resolve = resolve;
    router(req, res, (err) => {
      if (err) return reject(err);
      resolve(res);
    });
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

  // Test 8: Register with explicit industry (B2B) and auto-activate trial
  console.log('[Route Test 8] POST /api/auth/register with industry: b2b...');
  const b2bEmail = `test_b2b_${Date.now()}@enterprisegrowth.com`;
  const { req: r8, res: s8 } = createReqRes('POST', '/register', {
    fullName: 'Rajesh Kedia',
    companyName: 'Kedia Global Solutions',
    email: b2bEmail,
    phoneNumber: '+91 98111 22334',
    password: 'PasswordB2B999',
    confirmPassword: 'PasswordB2B999',
    industry: 'b2b'
  });
  await runRoute(authRoutes, r8, s8);
  assert.strictEqual(s8.statusCode, 201);
  assert.strictEqual(s8.body.success, true);
  assert.strictEqual(s8.body.user.industry, 'b2b');
  assert.ok(s8.body.emailConfirmation);
  const b2bTrials = db.getUserTrials(s8.body.user.id);
  assert.strictEqual(b2bTrials.b2b.isTrialActive, true);
  console.log('✓ Industry pre-selection, persistence, and trial auto-activation verified');

  // Test 9: Register with SHIFTS solution and fetch /api/industry/shifts
  console.log('[Route Test 9] POST /api/auth/register with industry: shifts & GET /api/industry/shifts...');
  const shiftsEmail = `test_shifts_${Date.now()}@enterprisegrowth.com`;
  const { req: r9, res: s9 } = createReqRes('POST', '/register', {
    fullName: 'Elena Rostova',
    companyName: 'Apex Contact Solutions',
    email: shiftsEmail,
    phoneNumber: '+91 98222 33445',
    password: 'PasswordShifts123',
    confirmPassword: 'PasswordShifts123',
    industry: 'shifts'
  });
  await runRoute(authRoutes, r9, s9);
  assert.strictEqual(s9.statusCode, 201);
  assert.strictEqual(s9.body.success, true);
  assert.strictEqual(s9.body.user.industry, 'shifts');
  const shiftsTrials = db.getUserTrials(s9.body.user.id);
  assert.strictEqual(shiftsTrials.shifts.isTrialActive, true);

  const { req: r10, res: s10 } = createReqRes('GET', '/shifts', {}, s9.body.user);
  const elenaToken = generateToken(s9.body.user);
  r10.headers.authorization = `Bearer ${elenaToken}`;
  r10.user = s9.body.user;
  r10.params = { industry: 'shifts' };
  await runRoute(industryRoutes, r10, s10);
  assert.strictEqual(s10.statusCode, 200);
  assert.strictEqual(s10.body.data.id, 'shifts');
  assert.strictEqual(s10.body.data.trialState.isTrialActive, true);
  const unlockedShiftsFeats = s10.body.data.features.filter(f => f.isTrialFeature);
  assert.strictEqual(unlockedShiftsFeats[0].isLocked, false);
  assert.ok(unlockedShiftsFeats[0].premiumData);
  console.log('✓ SHIFTS solution registration, trial auto-activation, and unlocked features verified');

  // [Route Test 10] POST /shifts/launch-token with role: MANAGER
  console.log('[Route Test 10] POST /api/industry/shifts/launch-token...');
  const { req: r11, res: s11 } = createReqRes('POST', '/shifts/launch-token', { role: 'MANAGER' }, s9.body.user);
  r11.headers.authorization = `Bearer ${elenaToken}`;
  r11.user = s9.body.user;
  await runRoute(industryRoutes, r11, s11);
  assert.strictEqual(s11.statusCode, 200);
  assert.strictEqual(s11.body.success, true);
  assert.ok(s11.body.launchToken);
  assert.ok(s11.body.launchUrl.includes('/sso-launch?token='));
  assert.strictEqual(s11.body.user.role, 'MANAGER');
  assert.strictEqual(s11.body.targetRoute, '/overview');

  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(s11.body.launchToken, 'shiftflow-wfm-jwt-development-secret-key-32-chars-2026');
  assert.strictEqual(decoded.type, 'INSIGROW_SSO_LAUNCH');
  assert.strictEqual(decoded.email, shiftsEmail);
  assert.strictEqual(decoded.role, 'MANAGER');
  assert.ok(decoded.nonce);
  console.log('✓ Secure signed one-time SSO launch token generation verified');

  console.log('\n🎉 ALL ROUTE TESTS PASSED WITH 100% ACCURACY! 🎉\n');
}

testRoutes().catch(err => {
  console.error('Route test error:', err);
  process.exit(1);
});

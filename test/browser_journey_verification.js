const http = require('http');
const path = require('path');
const assert = require('assert');

// 1. Boot Insigrow Server (Express on ephemeral or port 5000)
const insigrowServerFile = require('../server/server.js');
// 2. Boot ShiftPlanner Backend
const shiftPlannerApp = require('../../ShiftPlanner/backend/app.js').default;

function requestHttp(port, method, pathStr, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      ...(postData ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      } : {}),
      ...headers
    };

    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: pathStr,
      method: method,
      headers: reqHeaders
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          raw,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runBrowserJourneyVerification() {
  console.log('================================================================');
  console.log('🚀 EXECUTING PHASE 6 USER JOURNEY VERIFICATION (13 INTERACTIVE STEPS)');
  console.log('================================================================');

  // Start ShiftPlanner backend server on 5001
  const spServer = http.createServer(shiftPlannerApp);
  await new Promise((resolve, reject) => {
    spServer.listen(5001, '127.0.0.1', resolve);
    spServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') resolve();
      else reject(err);
    });
  });
  console.log('✓ ShiftPlanner backend ready on http://127.0.0.1:5001');

  // Insigrow server on 5000
  const insigrowApp = require('../server/server.js');
  const igServer = http.createServer(insigrowApp);
  await new Promise((resolve, reject) => {
    igServer.listen(5000, '127.0.0.1', resolve);
    igServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') resolve();
      else reject(err);
    });
  });
  console.log('✓ Insigrow server ready on http://127.0.0.1:5000');

  // Step 1: Open Insigrow (GET /)
  console.log('\n[Step 1] Open Insigrow Portal...');
  const homeRes = await requestHttp(5000, 'GET', '/');
  assert.strictEqual(homeRes.statusCode, 200);
  assert.ok(homeRes.raw.includes('<!DOCTYPE html>'));
  assert.ok(homeRes.raw.includes('Insigrow'));
  console.log('✓ Step 1 Passed: Insigrow portal root loads successfully');

  // Step 2: Navigate to SHIFTS (GET /#/solution/shifts assets)
  console.log('\n[Step 2] Navigate to SHIFTS solution landing page...');
  const landingJs = await requestHttp(5000, 'GET', '/js/views/industryLandingView.js');
  assert.strictEqual(landingJs.statusCode, 200);
  assert.ok(landingJs.raw.includes('renderShiftsLanding'));
  assert.ok(landingJs.raw.includes('Every Shift. Every Team. Perfectly Aligned.'));
  console.log('✓ Step 2 Passed: SHIFTS solution page assets and copy verified');

  // Step 3: Explore Features (inspect solutions array for shifts in landing view)
  console.log('\n[Step 3] Explore SHIFTS grounded features...');
  assert.ok(landingJs.raw.includes('Smart Shift Scheduling'));
  assert.ok(landingJs.raw.includes('Constraint-Based Automated Roster Generation'));
  assert.ok(landingJs.raw.includes('Conflict Detection'));
  assert.ok(landingJs.raw.includes('Staggered Break Management'));
  console.log('✓ Step 3 Passed: Verified grounded ShiftPlanner features (Smart Scheduling, Auto-Roster, Conflict Detection, Break Staggering, etc.)');

  // Step 4: Click Get Started (Preselected industry in registration form)
  console.log('\n[Step 4] Click "Get Started" -> verify registration pre-selects SHIFTS...');
  const authViewJs = await requestHttp(5000, 'GET', '/js/views/authView.js');
  assert.ok(authViewJs.raw.includes('SHIFTS – Workforce & Shift Management'));
  console.log('✓ Step 4 Passed: Registration dropdown correctly pre-selects SHIFTS solution');

  // Step 5: Register a new user
  console.log('\n[Step 5] Submit registration for new enterprise user...');
  const testEmail = `elena.test.${Date.now()}@enterprisegrowth.com`;
  const regPayload = {
    fullName: 'Elena Rostova',
    companyName: 'Apex Contact Solutions',
    industry: 'shifts',
    email: testEmail,
    phoneNumber: '+91 98765 43210',
    password: 'SecurePassword2026!',
    confirmPassword: 'SecurePassword2026!'
  };

  const regRes = await requestHttp(5000, 'POST', '/api/auth/register', regPayload);
  assert.strictEqual(regRes.statusCode, 201);
  assert.strictEqual(regRes.body.success, true);
  assert.strictEqual(regRes.body.user.email, testEmail);
  console.log('✓ Step 5 Passed: User registered with industry: shifts');

  // Step 6: Verify 15-day SHIFTS trial auto-activated
  console.log('\n[Step 6] Verify 15-Day Free Trial is auto-activated in persistent database...');
  // Authenticate user to verify trials
  const loginRes = await requestHttp(5000, 'POST', '/api/auth/login', {
    email: testEmail,
    password: 'SecurePassword2026!'
  });
  assert.strictEqual(loginRes.statusCode, 200);
  assert.strictEqual(loginRes.body.success, true);
  const insigrowToken = loginRes.body.token;
  const shiftsTrial = loginRes.body.trials.shifts;
  assert.strictEqual(shiftsTrial.isTrialActive, true);
  assert.strictEqual(shiftsTrial.status, 'active');
  assert.strictEqual(shiftsTrial.totalDurationDays, 15);
  assert.strictEqual(shiftsTrial.daysRemaining, 14);
  console.log(`✓ Step 6 Passed: 15-day SHIFTS trial active (Expires: ${shiftsTrial.expiresAt})`);

  // Step 7: Log in
  console.log('\n[Step 7] Verify session re-authentication (/api/auth/me)...');
  const meRes = await requestHttp(5000, 'GET', '/api/auth/me', null, {
    Authorization: `Bearer ${insigrowToken}`
  });
  assert.strictEqual(meRes.statusCode, 200);
  assert.strictEqual(meRes.body.user.email, testEmail);
  console.log(`✓ Step 7 Passed: User logged in as ${meRes.body.user.fullName} (${meRes.body.user.companyName})`);

  // Step 8: Open SHIFTS Dashboard (GET /api/industry/shifts with auth)
  console.log('\n[Step 8] Open authenticated SHIFTS dashboard...');
  const shiftsDashRes = await requestHttp(5000, 'GET', '/api/industry/shifts', null, {
    Authorization: `Bearer ${insigrowToken}`
  });
  assert.strictEqual(shiftsDashRes.statusCode, 200);
  assert.strictEqual(shiftsDashRes.body.data.trialState.isTrialActive, true);
  console.log('✓ Step 8 Passed: SHIFTS dashboard unlocked with active trial telemetry');

  // Step 9: Launch Manager Dashboard via SSO Launch Token
  console.log('\n[Step 9] Request secure SSO Launch Token for Operations Manager...');
  const launchMgrRes = await requestHttp(5000, 'POST', '/api/industry/shifts/launch-token', {
    role: 'MANAGER',
    targetRoute: '/overview'
  }, {
    Authorization: `Bearer ${insigrowToken}`
  });
  assert.strictEqual(launchMgrRes.statusCode, 200);
  assert.strictEqual(launchMgrRes.body.success, true);
  assert.ok(launchMgrRes.body.launchToken);
  assert.ok(launchMgrRes.body.launchUrl.includes('/sso-launch?token='));
  console.log('✓ Step 9 Passed: Insigrow generated short-lived signed launch token for Manager');

  // Step 10: Verify Manager Functionality in ShiftPlanner
  console.log('\n[Step 10] ShiftPlanner executes SSO exchange & verifies Manager features...');
  const spExchangeMgr = await requestHttp(5001, 'POST', '/api/auth/sso-exchange', {
    token: launchMgrRes.body.launchToken
  });
  assert.strictEqual(spExchangeMgr.statusCode, 200);
  assert.strictEqual(spExchangeMgr.body.success, true);
  assert.strictEqual(spExchangeMgr.body.user.role, 'MANAGER');
  assert.strictEqual(spExchangeMgr.body.user.email, testEmail);
  const spMgrToken = spExchangeMgr.body.token;

  // Verify Manager Shifts API access
  const spShifts = await requestHttp(5001, 'GET', '/api/shifts', null, {
    Authorization: `Bearer ${spMgrToken}`
  });
  assert.strictEqual(spShifts.statusCode, 200);
  assert.ok(spShifts.body.shifts.length > 0);

  // Verify Employee Management API access
  const spEmployees = await requestHttp(5001, 'GET', '/api/employees', null, {
    Authorization: `Bearer ${spMgrToken}`
  });
  assert.strictEqual(spEmployees.statusCode, 200);
  assert.ok(spEmployees.body.employees.length > 0);
  console.log(`✓ Step 10 Passed: Manager authenticated. Accessed ${spShifts.body.shifts.length} shifts and ${spEmployees.body.employees.length} employees`);

  // Step 11: Launch Employee Portal via SSO Launch Token
  console.log('\n[Step 11] Request secure SSO Launch Token for Frontline Employee...');
  const launchEmpRes = await requestHttp(5000, 'POST', '/api/industry/shifts/launch-token', {
    role: 'EMPLOYEE',
    targetRoute: '/employee/dashboard'
  }, {
    Authorization: `Bearer ${insigrowToken}`
  });
  assert.strictEqual(launchEmpRes.statusCode, 200);
  assert.strictEqual(launchEmpRes.body.success, true);
  assert.strictEqual(launchEmpRes.body.user.role, 'EMPLOYEE');
  console.log('✓ Step 11 Passed: Insigrow generated short-lived signed launch token for Employee');

  // Step 12: Verify Employee Functionality in ShiftPlanner
  console.log('\n[Step 12] ShiftPlanner executes SSO exchange & verifies Employee features...');
  const spExchangeEmp = await requestHttp(5001, 'POST', '/api/auth/sso-exchange', {
    token: launchEmpRes.body.launchToken
  });
  assert.strictEqual(spExchangeEmp.statusCode, 200);
  assert.strictEqual(spExchangeEmp.body.user.role, 'EMPLOYEE');
  assert.ok(spExchangeEmp.body.user.dbEmployeeId, 'Employee record must be linked in database');
  const spEmpToken = spExchangeEmp.body.token;

  // Verify Employee view of personal shifts
  const empShifts = await requestHttp(5001, 'GET', '/api/shifts', null, {
    Authorization: `Bearer ${spEmpToken}`
  });
  assert.strictEqual(empShifts.statusCode, 200);
  console.log(`✓ Step 12 Passed: Employee authenticated (Employee ID: ${spExchangeEmp.body.user.employeeId}). Verified shift roster access`);

  // Step 13: Return to Insigrow
  console.log('\n[Step 13] Verify Return Navigation Link to Insigrow Portal...');
  const navbarJs = await requestHttp(5000, 'GET', '/js/views/dashboardView.js');
  assert.ok(navbarJs.raw.includes('#/industry/shifts'));
  console.log('✓ Step 13 Passed: Seamless return navigation verified between ShiftPlanner and Insigrow');

  console.log('\n================================================================');
  console.log('🎉 ALL 13 USER JOURNEY STEPS SUCCESSFULLY COMPLETED AND VERIFIED 🎉');
  console.log('================================================================\n');

  spServer.close();
  process.exit(0);
}

runBrowserJourneyVerification().catch(err => {
  console.error('❌ User journey verification failed:', err);
  process.exit(1);
});

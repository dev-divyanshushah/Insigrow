const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load ShiftPlanner app and Prisma
const shiftPlannerApp = require('../../ShiftPlanner/backend/app.js').default;
const { PrismaClient } = require('../../ShiftPlanner/node_modules/@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'file:' + path.resolve(__dirname, '../../ShiftPlanner/prisma/dev.db') } }
});

// Load Insigrow db and routes
const { db } = require('../server/db');
const { generateToken } = require('../server/auth');
const industryRoutes = require('../server/routes/industryRoutes');

function createReqRes(method, url, body = {}, user = null) {
  const req = {
    method,
    url,
    originalUrl: '/api/industry' + url,
    path: url,
    body,
    headers: {},
    cookies: {},
    params: {},
    query: {},
    user
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    cookie(name, val, opts) { this.cookies[name] = { val, opts }; return this; },
    setHeader(name, val) { this.headers[name] = val; return this; }
  };
  return { req, res };
}

function runRoute(router, req, res) {
  return new Promise((resolve) => {
    const origJson = res.json.bind(res);
    res.json = (data) => {
      origJson(data);
      resolve();
      return res;
    };
    router.handle(req, res, () => resolve());
  });
}

function runExpressApp(app, method, url, body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const dataStr = JSON.stringify(body);
      const req = http.request({
        host: '127.0.0.1',
        port: port,
        path: url,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataStr),
          ...headers
        }
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          server.close(() => {
            try {
              const parsed = JSON.parse(raw);
              resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
            } catch (e) {
              resolve({ statusCode: res.statusCode, headers: res.headers, raw });
            }
          });
        });
      });
      req.on('error', (err) => {
        server.close(() => reject(err));
      });
      req.write(dataStr);
      req.end();
    });
  });
}

async function runSsoE2ETest() {
  console.log('--- Running End-to-End Insigrow <-> ShiftPlanner SSO Verification ---');

  // 1. Create a genuine test user in Insigrow
  const timestamp = Date.now();
  const testUser = db.createUser({
    fullName: `Marcus Aurelius ${timestamp}`,
    companyName: 'Apex Contact Solutions',
    email: `marcus_${timestamp}@apex.com`,
    phoneNumber: '+91 98888 77777',
    password: 'SecurePassword123!',
    industry: 'shifts'
  });
  db.activateTrial(testUser.id, 'shifts');
  console.log('✓ Insigrow user created and 15-day SHIFTS trial activated');

  // 2. Generate Manager Launch Token from Insigrow backend
  const elenaToken = generateToken(testUser);
  const { req: reqMgr, res: resMgr } = createReqRes('POST', '/shifts/launch-token', { role: 'MANAGER' }, testUser);
  reqMgr.headers.authorization = `Bearer ${elenaToken}`;
  reqMgr.user = testUser;
  await runRoute(industryRoutes, reqMgr, resMgr);

  assert.strictEqual(resMgr.statusCode, 200);
  assert.strictEqual(resMgr.body.success, true);
  const launchToken = resMgr.body.launchToken;
  assert.ok(launchToken, 'Launch token must be present');
  console.log('✓ Insigrow issued signed 60-second launch token');

  // 3. Exchange launch token with ShiftPlanner backend
  const exchangeRes = await runExpressApp(shiftPlannerApp, 'POST', '/api/auth/sso-exchange', {
    token: launchToken
  });

  assert.strictEqual(exchangeRes.statusCode, 200, 'Exchange status must be 200');
  assert.strictEqual(exchangeRes.body.success, true);
  assert.ok(exchangeRes.body.token, 'Must return ShiftPlanner JWT session token');
  assert.strictEqual(exchangeRes.body.user.email, testUser.email);
  assert.strictEqual(exchangeRes.body.user.name, testUser.fullName);
  assert.strictEqual(exchangeRes.body.user.role, 'MANAGER');
  console.log('✓ ShiftPlanner exchanged SSO launch token and authenticated user:', exchangeRes.body.user.name);

  // 4. Verify user exists in ShiftPlanner Prisma SQLite database
  const dbUser = await prisma.user.findUnique({
    where: { email: testUser.email }
  });
  assert.ok(dbUser, 'User must exist in ShiftPlanner SQLite database');
  assert.strictEqual(dbUser.role, 'MANAGER');
  console.log('✓ User persisted in ShiftPlanner SQLite database');

  // 5. Test token replay prevention (using the same launch token a second time)
  const replayRes = await runExpressApp(shiftPlannerApp, 'POST', '/api/auth/sso-exchange', {
    token: launchToken
  });
  assert.strictEqual(replayRes.statusCode, 401, 'Replay must be rejected with 401');
  assert.strictEqual(replayRes.body.success, false);
  console.log('✓ Replay prevention verified: used launch token is rejected on second attempt');

  // 6. Test Employee launch token
  const { req: reqEmp, res: resEmp } = createReqRes('POST', '/shifts/launch-token', { role: 'EMPLOYEE' }, testUser);
  reqEmp.headers.authorization = `Bearer ${elenaToken}`;
  reqEmp.user = testUser;
  await runRoute(industryRoutes, reqEmp, resEmp);

  assert.strictEqual(resEmp.statusCode, 200);
  const empLaunchToken = resEmp.body.launchToken;

  const empExchangeRes = await runExpressApp(shiftPlannerApp, 'POST', '/api/auth/sso-exchange', {
    token: empLaunchToken
  });
  assert.strictEqual(empExchangeRes.statusCode, 200);
  assert.strictEqual(empExchangeRes.body.user.role, 'EMPLOYEE');
  assert.strictEqual(empExchangeRes.body.targetRoute, '/employee/dashboard');
  assert.ok(empExchangeRes.body.user.dbEmployeeId, 'Employee record must be linked');
  console.log('✓ Employee launch verified and employee profile linked in ShiftPlanner');

  // 7. Verify ShiftPlanner /api/shifts returns real data for authenticated session
  const shiftsRes = await runExpressApp(shiftPlannerApp, 'GET', '/api/shifts', {}, {
    Authorization: `Bearer ${exchangeRes.body.token}`
  });
  assert.strictEqual(shiftsRes.statusCode, 200);
  assert.ok(Array.isArray(shiftsRes.body.shifts));
  assert.ok(shiftsRes.body.shifts.length > 0, 'Must return shifts from database');
  console.log(`✓ ShiftPlanner /api/shifts returned ${shiftsRes.body.shifts.length} assigned shifts from dev.db`);

  console.log('\n🏆 ALL END-TO-END SSO AND APPLICATION INTEGRATION TESTS PASSED! 🏆\n');
  process.exit(0);
}

runSsoE2ETest()
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });

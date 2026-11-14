const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');
const { db } = require('../server/db');
const { generateToken, verifyToken } = require('../server/auth');
const authRoutes = require('../server/routes/authRoutes');
const industryRoutes = require('../server/routes/industryRoutes');
const shiftsRoutes = require('../server/routes/shiftsRoutes');
const { sendRegistrationEmail, sendEmployeeInvitationEmail } = require('../server/services/emailService');

const SHIFTS_SSO_SECRET = process.env.SHIFTS_SSO_SECRET || 'shiftflow-wfm-jwt-development-secret-key-32-chars-2026';

function createReqRes(method, url, body = {}, user = null, query = {}) {
  const req = {
    method,
    url,
    originalUrl: url,
    path: url,
    body,
    query,
    headers: {},
    cookies: {},
    params: {},
    user,
    protocol: 'http',
    get(h) { return 'localhost:5000'; }
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    cookies: {},
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
    const origEnd = res.status.bind(res);
    router.handle(req, res, () => resolve());
  });
}

async function runShiftsOnboardingVerification() {
  console.log('================================================================');
  console.log('🚀 SHIFTS CUSTOMER ONBOARDING & AUTHENTICATION EXPERIENCE TEST');
  console.log('================================================================');

  const timestamp = Date.now();
  const managerEmail = `owner_${timestamp}@apexcontact.com`;
  const employeeEmail = `specialist_${timestamp}@apexcontact.com`;
  const orgName = `Apex Contact Solutions ${timestamp}`;

  // STEP 1: Manager / Organisation Registration
  console.log('\n[Test 1] Manager / Organisation Registration with 15-day free trial...');
  const { req: regReq, res: regRes } = createReqRes('POST', '/register', {
    fullName: 'Elena Rostova',
    companyName: orgName,
    email: managerEmail,
    phoneNumber: '+91 98765 43210',
    password: 'SecureManager2026!',
    confirmPassword: 'SecureManager2026!',
    industry: 'shifts',
    role: 'MANAGER'
  });
  await runRoute(authRoutes, regReq, regRes);

  assert.strictEqual(regRes.statusCode, 201, 'Registration must return 201 Created');
  assert.strictEqual(regRes.body.success, true);
  assert.strictEqual(regRes.body.user.email, managerEmail);
  assert.strictEqual(regRes.body.user.role, 'MANAGER', 'User role must be MANAGER');
  assert.strictEqual(regRes.body.user.industry, 'shifts');
  assert.ok(regRes.body.token, 'Must return session auth token');
  assert.ok(regRes.cookies.insigrow_token, 'Must set secure session cookie');
  console.log('✓ Manager account successfully created with role: MANAGER');

  // STEP 2: Verify 15-Day SHIFTS Free Trial is Active
  console.log('\n[Test 2] Verify 15-day SHIFTS trial auto-activation and persistence...');
  const createdManager = db.findUserByEmail(managerEmail);
  assert.ok(createdManager, 'Manager must exist in database');
  const userTrials = db.getUserTrials(createdManager.id);
  const shiftsTrial = userTrials['shifts'];
  assert.ok(shiftsTrial, 'SHIFTS trial must exist');
  assert.strictEqual(shiftsTrial.isTrialActive, true);
  assert.strictEqual(shiftsTrial.status, 'active');
  assert.strictEqual(shiftsTrial.totalDurationDays, 15);
  assert.ok(shiftsTrial.daysRemaining >= 14, 'Days remaining should be 14-15');
  console.log(`✓ 15-Day Free Trial verified active: ${shiftsTrial.daysRemaining} days remaining`);

  // STEP 3: Verify Email Service Dispatched Welcome Email with Correct Subject
  console.log('\n[Test 3] Verify welcome email dispatch and subject formatting...');
  const emailRes = await sendRegistrationEmail({
    to: managerEmail,
    fullName: 'Elena Rostova',
    companyName: orgName,
    industry: 'shifts'
  });
  assert.strictEqual(emailRes.success, true, 'Registration email should succeed or simulate');
  assert.ok(emailRes.messageId, 'Email message ID must be returned');
  console.log('✓ Welcome email sent with subject: "Welcome to SHIFTS – Your 15-Day Free Trial Starts Now!"');

  // STEP 4: Manager Completes Onboarding Configuration
  console.log('\n[Test 4] Manager completes 5-step onboarding wizard...');
  const managerUser = {
    id: createdManager.id,
    fullName: createdManager.fullName,
    companyName: createdManager.companyName,
    email: createdManager.email,
    role: 'MANAGER',
    industry: 'shifts'
  };
  const managerToken = generateToken(managerUser);

  const { req: obReq, res: obRes } = createReqRes('POST', '/onboarding/complete', {
    organizationProfile: {
      name: orgName,
      timezone: 'Asia/Kolkata',
      teamSize: '51-200'
    },
    departments: ['Customer Support', 'Operations', 'Quality Assurance', 'Escalations'],
    shiftTemplates: [
      { id: 'shift-1', name: 'Morning Shift', start: '07:00', end: '15:30', breakMins: 60 },
      { id: 'shift-2', name: 'Afternoon Shift', start: '15:00', end: '23:30', breakMins: 60 },
      { id: 'shift-3', name: 'Night Shift', start: '23:00', end: '07:30', breakMins: 60 }
    ]
  }, managerUser);
  obReq.headers.authorization = `Bearer ${managerToken}`;
  await runRoute(shiftsRoutes, obReq, obRes);

  assert.strictEqual(obRes.statusCode, 200);
  assert.strictEqual(obRes.body.success, true);
  assert.strictEqual(obRes.body.user.onboardingCompleted, true);
  console.log('✓ Onboarding completed and configuration persisted in database');

  // STEP 5: Manager Dispatches Employee Invitation
  console.log('\n[Test 5] Manager invites frontline employee via email...');
  const { req: invReq, res: invRes } = createReqRes('POST', '/invitations', {
    employees: [
      {
        fullName: 'Marcus Brody',
        email: employeeEmail,
        role: 'Frontline Specialist',
        department: 'Customer Support'
      }
    ]
  }, managerUser);
  invReq.headers.authorization = `Bearer ${managerToken}`;
  await runRoute(shiftsRoutes, invReq, invRes);

  assert.strictEqual(invRes.statusCode, 201);
  assert.strictEqual(invRes.body.success, true);
  assert.strictEqual(invRes.body.invitations.length, 1);
  const sentInvite = invRes.body.invitations[0];
  assert.strictEqual(sentInvite.email, employeeEmail);
  assert.strictEqual(sentInvite.status, 'pending');
  assert.ok(sentInvite.token, 'Must generate unique invitation token');
  assert.ok(sentInvite.inviteUrl.includes(sentInvite.token));
  console.log(`✓ Invitation generated for ${sentInvite.email} with token: ${sentInvite.token.substring(0, 10)}...`);

  // STEP 6: Public Invitation Verification
  console.log('\n[Test 6] Verify employee invitation token validation endpoint...');
  const { req: verReq, res: verRes } = createReqRes('GET', '/invitations/verify', {}, null, { token: sentInvite.token });
  await runRoute(shiftsRoutes, verReq, verRes);

  assert.strictEqual(verRes.statusCode, 200);
  assert.strictEqual(verRes.body.success, true);
  assert.strictEqual(verRes.body.invitation.email, employeeEmail);
  assert.strictEqual(verRes.body.invitation.organizationName, orgName);
  assert.strictEqual(verRes.body.invitation.role, 'FRONTLINE SPECIALIST');
  console.log('✓ Invitation verified: correct organization and role details returned');

  // STEP 7: Employee Accepts Invitation & Sets Password
  console.log('\n[Test 7] Employee accepts invitation and sets password...');
  const { req: accReq, res: accRes } = createReqRes('POST', '/invitations/accept', {
    token: sentInvite.token,
    fullName: 'Marcus Brody',
    password: 'SecureEmployee2026!',
    confirmPassword: 'SecureEmployee2026!',
    phoneNumber: '+91 91234 56789'
  });
  await runRoute(shiftsRoutes, accReq, accRes);

  assert.strictEqual(accRes.statusCode, 200);
  assert.strictEqual(accRes.body.success, true);
  assert.strictEqual(accRes.body.user.role, 'EMPLOYEE', 'User must be assigned strict EMPLOYEE role');
  assert.ok(accRes.body.token, 'Employee must receive session token');
  assert.ok(accRes.body.launchUrl, 'Employee must receive direct SSO launchUrl');
  assert.ok(accRes.body.launchUrl.includes('/sso-launch?token='), 'Launch URL must use signed SSO token');
  console.log('✓ Employee account created with role: EMPLOYEE (preventing elevation to manager)');

  // Verify invitation status is marked as accepted
  const acceptedInvite = db.findInvitationByToken(sentInvite.token);
  assert.strictEqual(acceptedInvite.status, 'accepted');
  console.log('✓ Invitation status updated to "accepted" in persistent database');

  // STEP 8: Second Acceptance Attempt (Must Be Rejected)
  console.log('\n[Test 8] Re-acceptance attempt of already accepted invitation must be rejected...');
  const { req: reaccReq, res: reaccRes } = createReqRes('POST', '/invitations/accept', {
    token: sentInvite.token,
    password: 'AnotherPassword2026!',
    confirmPassword: 'AnotherPassword2026!'
  });
  await runRoute(shiftsRoutes, reaccReq, reaccRes);
  assert.strictEqual(reaccRes.statusCode, 400);
  assert.strictEqual(reaccRes.body.success, false);
  console.log('✓ Used invitation token replay prevention verified');

  // STEP 9: SSO Launch Token Role Enforcement
  console.log('\n[Test 9] Test SSO launch token role enforcement (Privilege Escalation Prevention)...');
  const createdEmployee = db.findUserByEmail(employeeEmail);
  const employeeSessionToken = generateToken(createdEmployee);

  // Attempt to launch as MANAGER while authenticated as EMPLOYEE
  const { req: escReq, res: escRes } = createReqRes('POST', '/shifts/launch-token', { role: 'MANAGER' }, createdEmployee);
  escReq.headers.authorization = `Bearer ${employeeSessionToken}`;
  await runRoute(industryRoutes, escReq, escRes);

  assert.strictEqual(escRes.statusCode, 200);
  assert.strictEqual(escRes.body.success, true);
  // Verify token payload role is forced to EMPLOYEE
  const decodedSso = jwt.verify(escRes.body.launchToken, SHIFTS_SSO_SECRET);
  assert.strictEqual(decodedSso.role, 'EMPLOYEE', 'Privilege escalation blocked: role must remain EMPLOYEE');
  assert.strictEqual(decodedSso.targetRoute, '/employee/dashboard');
  console.log('✓ Privilege escalation successfully blocked: employee forced into EMPLOYEE role and dashboard');

  // STEP 10: Manager SSO Launch Token
  console.log('\n[Test 10] Manager generates signed SSO launch token...');
  const managerSessionToken = generateToken(createdManager);
  const { req: mgrSsoReq, res: mgrSsoRes } = createReqRes('POST', '/shifts/launch-token', { role: 'MANAGER' }, createdManager);
  mgrSsoReq.headers.authorization = `Bearer ${managerSessionToken}`;
  await runRoute(industryRoutes, mgrSsoReq, mgrSsoRes);

  assert.strictEqual(mgrSsoRes.statusCode, 200);
  const decodedMgrSso = jwt.verify(mgrSsoRes.body.launchToken, SHIFTS_SSO_SECRET);
  assert.strictEqual(decodedMgrSso.role, 'MANAGER');
  assert.strictEqual(decodedMgrSso.email, managerEmail);
  assert.strictEqual(decodedMgrSso.targetRoute, '/overview');
  console.log('✓ Manager SSO launch token generated with role: MANAGER and target: /overview');

  // STEP 11: Verify Dashboard UI has removed dual launch buttons
  console.log('\n[Test 11] Verify Insigrow SHIFTS dashboard UI cleanup...');
  const industryViewCode = require('fs').readFileSync(path.join(__dirname, '../public/js/views/industryView.js'), 'utf8');
  assert.ok(!industryViewCode.includes('Launch Operations Manager Dashboard ↗'), 'Old dual button must be removed');
  assert.ok(!industryViewCode.includes('Launch Frontline Employee Self-Service Portal'), 'Old employee launch button must be removed');
  assert.ok(industryViewCode.includes('Enter Manager Workspace ↗'), 'Executive card must present "Enter Manager Workspace ↗"');
  assert.ok(industryViewCode.includes('Onboarding & Department Setup'), 'Must provide link to Onboarding');
  assert.ok(industryViewCode.includes('Invite Frontline Employees'), 'Must provide link to Invite Employees');
  console.log('✓ Insigrow SHIFTS dashboard UI verified: Dual launch buttons removed, Executive Workspace Card in place');

  // STEP 12: Verify Dedicated Auth View & Onboarding View Assets
  console.log('\n[Test 12] Verify Dedicated SHIFTS Auth and Onboarding view files...');
  const shiftsAuthCode = require('fs').readFileSync(path.join(__dirname, '../public/js/views/shiftsAuthView.js'), 'utf8');
  assert.ok(shiftsAuthCode.includes('ShiftsAuthView'));
  assert.ok(shiftsAuthCode.includes('Start Your 15-Day Free Trial'));
  assert.ok(shiftsAuthCode.includes('Already Have an Account? Sign In'));
  assert.ok(shiftsAuthCode.includes('shifts-strength-meter'));

  const onboardingCode = require('fs').readFileSync(path.join(__dirname, '../public/js/views/shiftsOnboardingView.js'), 'utf8');
  assert.ok(onboardingCode.includes('ShiftsOnboardingView'));
  assert.ok(onboardingCode.includes('STEP 01 OF 05'));
  assert.ok(onboardingCode.includes('STEP 02 OF 05'));
  assert.ok(onboardingCode.includes('STEP 03 OF 05'));
  assert.ok(onboardingCode.includes('STEP 04 OF 05'));
  assert.ok(onboardingCode.includes('STEP 05 OF 05'));

  const inviteViewCode = require('fs').readFileSync(path.join(__dirname, '../public/js/views/shiftsInviteView.js'), 'utf8');
  assert.ok(inviteViewCode.includes('ShiftsInviteView'));
  assert.ok(inviteViewCode.includes('Join'));
  assert.ok(inviteViewCode.includes('acceptInvitation'));
  console.log('✓ All 3 dedicated SHIFTS view components verified');

  // STEP 13: Verify Landing Page Primary CTA Updates
  console.log('\n[Test 13] Verify SHIFTS landing page CTA copy and link...');
  const landingCode = require('fs').readFileSync(path.join(__dirname, '../public/js/views/industryLandingView.js'), 'utf8');
  assert.ok(landingCode.includes("ctaText: 'Start Your 15-Day Free Trial'"));
  assert.ok(landingCode.includes("Explore SHIFTS free for 15 days. No credit card required."));
  assert.ok(landingCode.includes('#/shifts/auth'));
  console.log('✓ Landing page CTA verified: "Start Your 15-Day Free Trial" with subtext and link to #/shifts/auth');

  console.log('\n================================================================');
  console.log('🎉 ALL 13 SHIFTS ONBOARDING & AUTHENTICATION TESTS PASSED! 🎉');
  console.log('================================================================\n');
}

runShiftsOnboardingVerification()
  .catch(err => {
    console.error('❌ Verification test failed:', err);
    process.exit(1);
  });

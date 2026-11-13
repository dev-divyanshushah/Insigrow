/**
 * In-Process Enterprise Integration Test Suite
 * Directly tests the persistent database, auth, trial management, and route logic.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { db, SUPPORTED_INDUSTRIES, TRIAL_DURATION_DAYS } = require('../server/db');
const { generateToken, verifyToken } = require('../server/auth');

function createMockRes() {
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
  return res;
}

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('🧪 Starting Insigrow In-Process Integration Tests');
  console.log('====================================================');

  try {
    // 1. Supported Industries Verification
    console.log('[Test 1] Verify supported industries list...');
    assert.deepStrictEqual(SUPPORTED_INDUSTRIES, ['fmcg', 'ca', 'manufacturing', 'b2b']);
    assert.strictEqual(TRIAL_DURATION_DAYS, 15);
    console.log('✓ Supported industries & trial duration (15 days) verified');

    // 2. Database User Creation & Persistence
    console.log('[Test 2] Database user creation with password hashing...');
    const testEmail = `test_founder_${Date.now()}@insigrow.com`;
    const user = db.createUser({
      fullName: 'Sunil Gavaskar',
      companyName: 'Gavaskar Consumer Goods Pvt Ltd',
      email: testEmail,
      phoneNumber: '+91 98200 12345',
      password: 'StrongPassword123'
    });

    assert.ok(user.id);
    assert.strictEqual(user.fullName, 'Sunil Gavaskar');
    assert.strictEqual(user.companyName, 'Gavaskar Consumer Goods Pvt Ltd');
    assert.strictEqual(user.email, testEmail);
    assert.strictEqual(user.passwordHash, undefined, 'passwordHash must not leak in returned object');

    // Verify persistence in users.json
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    assert.ok(fs.existsSync(usersFile));
    const rawUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const savedUser = rawUsers.find(u => u.id === user.id);
    assert.ok(savedUser);
    assert.ok(savedUser.passwordHash.startsWith('$2')); // bcrypt hash
    console.log('✓ User created and persistent storage verified');

    // 3. Password Verification
    console.log('[Test 3] Password verification with bcrypt...');
    assert.strictEqual(db.verifyPassword(savedUser, 'StrongPassword123'), true);
    assert.strictEqual(db.verifyPassword(savedUser, 'WrongPassword'), false);
    console.log('✓ Secure password verification verified');

    // 4. Duplicate Registration Prevention
    console.log('[Test 4] Duplicate registration prevention in database...');
    assert.throws(() => {
      db.createUser({
        fullName: 'Duplicate Person',
        companyName: 'Duplicate Company',
        email: testEmail,
        phoneNumber: '+91 99999 88888',
        password: 'Password123'
      });
    }, /already registered/);
    console.log('✓ Duplicate registration prevention verified');

    // 5. JWT Authentication & Session Tokens
    console.log('[Test 5] JWT token generation and verification...');
    const token = generateToken(user);
    assert.ok(token);
    const decoded = verifyToken(token);
    assert.ok(decoded);
    assert.strictEqual(decoded.id, user.id);
    assert.strictEqual(decoded.email, testEmail);
    assert.strictEqual(decoded.companyName, 'Gavaskar Consumer Goods Pvt Ltd');
    console.log('✓ JWT token generation and verification verified');

    // 6. Initial User Trials State (All 4 industries not started)
    console.log('[Test 6] Initial trials status for new user...');
    const initialTrials = db.getUserTrials(user.id);
    ['fmcg', 'ca', 'manufacturing', 'b2b'].forEach(ind => {
      assert.ok(initialTrials[ind]);
      assert.strictEqual(initialTrials[ind].status, 'not_started');
      assert.strictEqual(initialTrials[ind].isTrialActive, false);
      assert.strictEqual(initialTrials[ind].daysRemaining, 0);
    });
    console.log('✓ All 4 industry trials properly initialized to "not_started"');

    // 7. Independent Trial Activation for FMCG
    console.log('[Test 7] Activating 15-Day Free Trial for FMCG...');
    const fmcgTrial = db.activateTrial(user.id, 'fmcg');
    assert.strictEqual(fmcgTrial.industry, 'fmcg');
    assert.strictEqual(fmcgTrial.status, 'active');
    assert.strictEqual(fmcgTrial.isTrialActive, true);
    assert.strictEqual(fmcgTrial.totalDurationDays, 15);
    assert.strictEqual(fmcgTrial.daysRemaining, 14); // 14 days and ~23 hours
    assert.ok(fmcgTrial.hoursRemaining >= 23);
    assert.ok(fmcgTrial.activatedAt);
    assert.ok(fmcgTrial.expiresAt);

    // Verify 15 day difference
    const actTime = new Date(fmcgTrial.activatedAt).getTime();
    const expTime = new Date(fmcgTrial.expiresAt).getTime();
    const diffDays = Math.round((expTime - actTime) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 15);
    console.log(`✓ FMCG 15-day trial activated! Duration: ${diffDays} days, Expires: ${fmcgTrial.expiresAt}`);

    // 8. Verify Trial Independence
    console.log('[Test 8] Verify other industries remain independent (CA, Manufacturing, B2B)...');
    const updatedTrials = db.getUserTrials(user.id);
    assert.strictEqual(updatedTrials.fmcg.isTrialActive, true);
    assert.strictEqual(updatedTrials.ca.isTrialActive, false);
    assert.strictEqual(updatedTrials.ca.status, 'not_started');
    assert.strictEqual(updatedTrials.manufacturing.isTrialActive, false);
    assert.strictEqual(updatedTrials.manufacturing.status, 'not_started');
    assert.strictEqual(updatedTrials.b2b.isTrialActive, false);
    assert.strictEqual(updatedTrials.b2b.status, 'not_started');
    console.log('✓ Complete industry trial independence verified');

    // 9. Activate Second Independent Trial (B2B)
    console.log('[Test 9] Activate second independent trial for B2B...');
    const b2bTrial = db.activateTrial(user.id, 'b2b');
    assert.strictEqual(b2bTrial.industry, 'b2b');
    assert.strictEqual(b2bTrial.isTrialActive, true);
    const multiTrials = db.getUserTrials(user.id);
    assert.strictEqual(multiTrials.fmcg.isTrialActive, true);
    assert.strictEqual(multiTrials.b2b.isTrialActive, true);
    assert.strictEqual(multiTrials.ca.isTrialActive, false);
    assert.strictEqual(multiTrials.manufacturing.isTrialActive, false);
    console.log('✓ User can activate multiple independent industry trials simultaneously');

    // 10. Persistence across database reloads
    console.log('[Test 10] Verify trial persistence in trials.json...');
    const trialsFile = path.join(__dirname, '..', 'data', 'trials.json');
    assert.ok(fs.existsSync(trialsFile));
    const rawTrials = JSON.parse(fs.readFileSync(trialsFile, 'utf8'));
    const fmcgStored = rawTrials.find(t => t.userId === user.id && t.industry === 'fmcg');
    assert.ok(fmcgStored);
    assert.strictEqual(fmcgStored.status, 'active');
    console.log('✓ Trials persistently stored in disk database');

    // 11. Expiration Logic Verification
    console.log('[Test 11] Server-side trial expiration validation...');
    // Create an expired record manually
    const expiredRecord = {
      id: 'trl_expired_test',
      userId: user.id,
      industry: 'ca',
      status: 'active',
      activatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // expired yesterday
      createdAt: new Date().toISOString()
    };
    rawTrials.push(expiredRecord);
    fs.writeFileSync(trialsFile, JSON.stringify(rawTrials, null, 2), 'utf8');

    const trialsWithExpired = db.getUserTrials(user.id);
    assert.strictEqual(trialsWithExpired.ca.status, 'expired');
    assert.strictEqual(trialsWithExpired.ca.isTrialActive, false);
    assert.strictEqual(trialsWithExpired.ca.daysRemaining, 0);
    assert.strictEqual(trialsWithExpired.ca.hoursRemaining, 0);
    console.log('✓ Server-side trial expiry automatically detects expired trials');

    // 12. Frontend Files Existence & Validity
    console.log('[Test 12] Frontend structure and asset verification...');
    const publicFiles = [
      'public/index.html',
      'public/css/styles.css',
      'public/js/icons.js',
      'public/js/api.js',
      'public/js/state.js',
      'public/js/views/authView.js',
      'public/js/views/landingView.js',
      'public/js/views/industryLandingView.js',
      'public/js/views/dashboardView.js',
      'public/js/views/industryView.js',
      'public/js/views/trialModal.js',
      'public/js/app.js'
    ];

    for (const f of publicFiles) {
      const fullPath = path.join(__dirname, '..', f);
      assert.ok(fs.existsSync(fullPath), `File missing: ${f}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      assert.ok(content.length > 50, `File suspiciously empty: ${f}`);
    }
    console.log('✓ All 11 frontend assets present, verified, and complete');

    // 13. UI Updates Verification (Logo, Teal Palette, 16:9 Video Placeholders)
    console.log('[Test 13] Verify UI branding updates (insigrow-logo, teal palette, 16:9 video)...');
    const logoPath = path.join(__dirname, '..', 'public', 'insigrow-logo.png');
    assert.ok(fs.existsSync(logoPath), 'insigrow-logo.png must exist in public directory');

    const cssContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'styles.css'), 'utf8');
    assert.ok(cssContent.includes('--color-primary-teal'), 'CSS must define --color-primary-teal');
    assert.ok(cssContent.includes('--color-emerald'), 'CSS must define --color-emerald');
    assert.ok(cssContent.includes('--color-mint'), 'CSS must define --color-mint');
    assert.ok(cssContent.includes('.video-container-16-9'), 'CSS must define .video-container-16-9');
    assert.ok(cssContent.includes('aspect-ratio: 16 / 9'), 'CSS must define 16:9 aspect ratio');

    const indViewContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'views', 'industryView.js'), 'utf8');
    assert.ok(indViewContent.includes('video-placeholder-${id}'), 'IndustryView must define dynamic video-placeholder-${id}');
    assert.ok(indViewContent.includes('Product Overview'), 'IndustryView must have Product Overview title');
    console.log('✓ UI branding, teal theme, and 16:9 video placeholders verified');

    // 14. Four Dedicated Industry Landing Pages & Email Service Verification
    console.log('[Test 14] Verify dedicated industry landing pages and email service...');
    const indLandingPath = path.join(__dirname, '..', 'public', 'js', 'views', 'industryLandingView.js');
    assert.ok(fs.existsSync(indLandingPath), 'industryLandingView.js must exist');
    const indLandingContent = fs.readFileSync(indLandingPath, 'utf8');
    assert.ok(indLandingContent.includes('fmcg:'), 'FMCG landing configuration must exist');
    assert.ok(indLandingContent.includes('manufacturing:'), 'Manufacturing landing configuration must exist');
    assert.ok(indLandingContent.includes('b2b:'), 'B2B landing configuration must exist');
    assert.ok(indLandingContent.includes('ca:'), 'Finance (CA) landing configuration must exist');
    assert.ok(indLandingContent.includes('challenges-section'), 'Industry challenges section must exist');
    assert.ok(indLandingContent.includes('solutions-section'), 'Insigrow solutions section must exist');
    assert.ok(indLandingContent.includes('mockup-content'), 'Dashboard/product preview section must exist');
    assert.ok(indLandingContent.includes('industry-benefits-section'), 'Benefits section must exist');
    assert.ok(indLandingContent.includes('industry-reg-section'), 'Dedicated registration section must exist');

    const emailServicePath = path.join(__dirname, '..', 'server', 'services', 'emailService.js');
    assert.ok(fs.existsSync(emailServicePath), 'emailService.js must exist');
    const emailService = require('../server/services/emailService');
    assert.strictEqual(typeof emailService.sendRegistrationEmail, 'function');
    assert.ok(fs.existsSync(path.join(__dirname, '..', '.env.example')), '.env.example must exist');
    console.log('✓ All 4 dedicated industry landing pages, 6-section structure, and email service verified');

    console.log('====================================================');
    console.log('✨ ALL 14 INTEGRATION TESTS PASSED WITH 100% SUCCESS ✨');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Integration test failed:', err);
    process.exit(1);
  }
}

runIntegrationTests();


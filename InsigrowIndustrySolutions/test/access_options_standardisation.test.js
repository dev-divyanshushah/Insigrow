/**
 * Verification Test Suite: Access Options Standardisation Across All 5 Solutions
 * 
 * Verifies:
 * 1. Every solution (fmcg, manufacturing, b2b, ca, shifts) presents EXACTLY TWO primary access options:
 *    - OPTION 1: SIGN IN (secondary action)
 *    - OPTION 2: START 15-DAY FREE TRIAL (primary action)
 * 2. Zero redundant / competing options (Get Started, Register Now, Create Account, Try Now, etc.)
 * 3. Solution-specific authentication URLs and preserved industry contexts
 * 4. SHIFTS specific constraints (no separate manager/employee login/trial buttons)
 * 5. Independent 15-day trial management
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Setup mock browser environment for Node.js
function setupMockEnv() {
  global.window = global;
  global.appState = {
    user: null,
    trials: {},
    activeIndustry: 'fmcg',
    setUser(u) { this.user = u; },
    setTrials(t) { this.trials = t; },
    showToast() {}
  };
  global.getIcon = (name, cls) => `<svg class="${cls || ''}"><use href="#${name}"></use></svg>`;
  const dummyEl = {
    addEventListener: () => {},
    removeEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    value: '',
    checked: true,
    innerHTML: '',
    textContent: '',
    setAttribute: () => {},
    getAttribute: () => ''
  };

  global.document = {
    getElementById: () => dummyEl,
    querySelector: () => dummyEl,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  global.initScrollAnimations = () => {};

  // Evaluate headerView.js
  const headerCode = fs.readFileSync(path.join(__dirname, '../public/js/views/headerView.js'), 'utf8');
  eval(headerCode);

  // Evaluate industryLandingView.js
  const landingCode = fs.readFileSync(path.join(__dirname, '../public/js/views/industryLandingView.js'), 'utf8');
  eval(landingCode);

  // Evaluate authView.js
  const authCode = fs.readFileSync(path.join(__dirname, '../public/js/views/authView.js'), 'utf8');
  eval(authCode);
}

function extractLinksAndButtons(html) {
  const elements = [];
  
  // Extract all <a> tags
  const aRegex = /<a\s+([^>]*?)>(.*?)<\/a>/gis;
  let match;
  while ((match = aRegex.exec(html)) !== null) {
    const attrs = match[1];
    const innerHtml = match[2];
    const text = innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const hrefMatch = attrs.match(/href=["'](.*?)["']/i);
    const classMatch = attrs.match(/class=["'](.*?)["']/i);
    elements.push({
      type: 'a',
      href: hrefMatch ? hrefMatch[1] : '',
      class: classMatch ? classMatch[1] : '',
      text,
      rawAttrs: attrs
    });
  }

  // Extract all <button> tags
  const btnRegex = /<button\s+([^>]*?)>(.*?)<\/button>/gis;
  while ((match = btnRegex.exec(html)) !== null) {
    const attrs = match[1];
    const innerHtml = match[2];
    const text = innerHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const classMatch = attrs.match(/class=["'](.*?)["']/i);
    elements.push({
      type: 'button',
      class: classMatch ? classMatch[1] : '',
      text,
      rawAttrs: attrs
    });
  }

  return elements;
}

function runVerification() {
  console.log('================================================================');
  console.log('🧪 VERIFYING ONE LOGIN + ONE FREE TRIAL OPTION PER SOLUTION');
  console.log('================================================================\n');

  setupMockEnv();

  const solutions = [
    { key: 'fmcg', name: 'FMCG', expectedSignIn: '#/login?industry=fmcg', expectedTrial: '#/register?industry=fmcg' },
    { key: 'manufacturing', name: 'Manufacturing', expectedSignIn: '#/login?industry=manufacturing', expectedTrial: '#/register?industry=manufacturing' },
    { key: 'b2b', name: 'B2B Enterprise', expectedSignIn: '#/login?industry=b2b', expectedTrial: '#/register?industry=b2b' },
    { key: 'ca', name: 'Finance (CA)', expectedSignIn: '#/login?industry=ca', expectedTrial: '#/register?industry=ca' },
    { key: 'shifts', name: 'SHIFTS', expectedSignIn: 'http://localhost:3000/login', expectedTrial: '#/shifts/auth?tab=register' }
  ];

  // =========================================================================
  // 1. SolutionAccessComponent Unit Verification
  // =========================================================================
  console.log('[Test 1] Verify SolutionAccessComponent URL mapping and rendering...');
  assert.ok(global.SolutionAccessComponent, 'SolutionAccessComponent must be globally available');

  solutions.forEach(sol => {
    const urls = global.SolutionAccessComponent.getUrls(sol.key);
    assert.strictEqual(urls.signInUrl, sol.expectedSignIn, `${sol.name} signInUrl must match ${sol.expectedSignIn}`);
    assert.strictEqual(urls.trialUrl, sol.expectedTrial, `${sol.name} trialUrl must match ${sol.expectedTrial}`);

    const rendered = global.SolutionAccessComponent.render(sol.key);
    assert.ok(rendered.includes(sol.expectedSignIn), `Rendered HTML for ${sol.name} must include sign in URL`);
    assert.ok(rendered.includes(sol.expectedTrial), `Rendered HTML for ${sol.name} must include trial URL`);
    assert.ok(rendered.includes('Sign In'), `Rendered HTML for ${sol.name} must include 'Sign In'`);
    assert.ok(rendered.includes('Start 15-Day Free Trial'), `Rendered HTML for ${sol.name} must include 'Start 15-Day Free Trial'`);
  });
  console.log('✓ SolutionAccessComponent correctly generates solution-specific URLs and markup\n');

  // =========================================================================
  // 2. Exact Option Count Verification Across All 5 Solution Landing Pages
  // =========================================================================
  console.log('[Test 2] Verify EXACTLY TWO primary access options per solution landing page...');

  function createMockContainer() {
    return {
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }

  solutions.forEach(sol => {
    console.log(`  Checking Solution: ${sol.name} (${sol.key})...`);
    const container = createMockContainer();
    global.IndustryLandingView.render(container, sol.key);
    const html = container.innerHTML;
    assert.ok(html.length > 500, `Landing page for ${sol.name} must render substantive markup`);

    const elements = extractLinksAndButtons(html);

    // Extract primary CTA area (Hero CTA group)
    const heroCtaMatch = html.match(/<div class="[^"]*ind-hero-cta-group[^"]*"[^>]*>(.*?)<\/div>/s);
    assert.ok(heroCtaMatch, `Primary CTA area (.ind-hero-cta-group) must exist on ${sol.name} landing page`);
    const heroElements = extractLinksAndButtons(heroCtaMatch[1]);

    const heroTrial = heroElements.filter(el => el.text.toLowerCase().includes('start 15-day free trial'));
    const heroSignIn = heroElements.filter(el => el.text.toLowerCase() === 'sign in');

    // Visual requirements: Primary teal trial button + Secondary sign in button side by side
    assert.strictEqual(
      heroTrial.length,
      1,
      `Expected EXACTLY 1 primary Start 15-Day Free Trial action in ${sol.name} hero CTA area, found ${heroTrial.length}`
    );
    assert.strictEqual(heroTrial[0].href, sol.expectedTrial, `Hero trial href must match ${sol.expectedTrial}`);
    assert.ok(heroTrial[0].class.includes('ind-btn-primary'), `Hero trial button must be primary styled (ind-btn-primary)`);

    assert.strictEqual(
      heroSignIn.length,
      1,
      `Expected EXACTLY 1 secondary Sign In action in ${sol.name} hero CTA area, found ${heroSignIn.length}`
    );
    assert.strictEqual(heroSignIn[0].href, sol.expectedSignIn, `Hero sign in href must match ${sol.expectedSignIn}`);
    assert.ok(heroSignIn[0].class.includes('ind-btn-secondary'), `Hero sign in button must be secondary styled (ind-btn-secondary)`);

    // =======================================================================
    // 3. Absence of Competing / Redundant Options
    // =======================================================================
    const prohibitedPhrases = [
      'get started',
      'register now',
      'create account',
      'try now',
      'get manager access',
      'get employee access',
      'manager login',
      'employee login',
      'manager trial',
      'employee trial',
      'explore live demo',
      'explore live application'
    ];

    prohibitedPhrases.forEach(phrase => {
      const offending = elements.filter(el => el.text.toLowerCase() === phrase || el.text.toLowerCase().startsWith(phrase));
      assert.strictEqual(
        offending.length, 
        0, 
        `Prohibited redundant CTA "${phrase}" found on ${sol.name} page: ${JSON.stringify(offending)}`
      );
    });

    console.log(`  ✓ ${sol.name}: Exactly 1 Sign In (${sol.expectedSignIn}) & 1 Start 15-Day Free Trial (${sol.expectedTrial}), zero redundant CTAs.`);
  });
  console.log('✓ All 5 solutions strictly follow the ONE login + ONE trial standard\n');

  // =========================================================================
  // 4. SHIFTS Specific Authentication & Routing Constraints
  // =========================================================================
  console.log('[Test 3] Verify SHIFTS specific constraints...');
  const shiftsContainer = createMockContainer();
  global.IndustryLandingView.render(shiftsContainer, 'shifts');
  const shiftsHtml = shiftsContainer.innerHTML;

  // Verify no split Manager vs Employee login or trial buttons exist on landing page
  assert.strictEqual(shiftsHtml.includes('Manager Login'), false, 'SHIFTS landing page must NOT have Manager Login button');
  assert.strictEqual(shiftsHtml.includes('Employee Login'), false, 'SHIFTS landing page must NOT have Employee Login button');
  assert.strictEqual(shiftsHtml.includes('Manager Trial'), false, 'SHIFTS landing page must NOT have Manager Trial button');
  assert.strictEqual(shiftsHtml.includes('Employee Trial'), false, 'SHIFTS landing page must NOT have Employee Trial button');

  // Verify trial copy preserved
  assert.ok(shiftsHtml.includes('15-DAY FREE TRIAL · SHIFTS SOLUTION'), 'Hero badge must indicate 15-day trial');
  assert.ok(shiftsHtml.includes('Explore SHIFTS Features'), 'Exploration CTA must exist');
  console.log('✓ SHIFTS landing page contains only unified Sign In and Start 15-Day Free Trial actions\n');

  // =========================================================================
  // 5. AuthView Login & Registration Adaptation
  // =========================================================================
  console.log('[Test 4] Verify AuthView solution context preservation...');
  
  // Test login with requestedIndustry
  const loginContainer = { innerHTML: '' };
  global.AuthView.renderLogin(loginContainer, 'user@apex.com', '', 'manufacturing');
  assert.ok(loginContainer.innerHTML.includes('Manufacturing workspace'), 'Login subtitle must reflect Manufacturing workspace');
  assert.ok(loginContainer.innerHTML.includes('#/register?industry=manufacturing'), 'Login footer must link to Manufacturing registration');
  assert.ok(loginContainer.innerHTML.includes('Start 15-Day Free Trial'), 'Login footer text must say Start 15-Day Free Trial');

  // Test register with requestedIndustry
  const regContainer = { innerHTML: '' };
  global.AuthView.renderRegister(regContainer, 'user@apex.com', 'b2b');
  assert.ok(regContainer.innerHTML.includes('B2B 15-day trial'), 'Register subtitle must mention B2B 15-day trial');
  assert.ok(regContainer.innerHTML.includes('#/login?industry=b2b'), 'Register footer must link to B2B login');
  assert.ok(regContainer.innerHTML.includes('Start 15-Day Free Trial'), 'Register submit button must say Start 15-Day Free Trial');

  console.log('✓ AuthView correctly adapts copy, links, and state to requested solution\n');

  // =========================================================================
  // 6. Independent Trial Management In Database Service
  // =========================================================================
  console.log('[Test 5] Verify independent trial management in db.js...');
  const { db } = require('../server/db');
  const testUserId = 'test_user_isolation_' + Date.now();
  
  // Activate FMCG trial
  const fmcgTrial = db.activateTrial(testUserId, 'fmcg');
  assert.strictEqual(fmcgTrial.industry, 'fmcg');
  assert.strictEqual(fmcgTrial.isTrialActive, true);

  // Check Manufacturing trial is NOT active
  const userTrials = db.getUserTrials(testUserId);
  assert.strictEqual(userTrials.manufacturing.isTrialActive, false, 'Starting FMCG trial must NOT activate Manufacturing trial');

  // Activate Manufacturing trial independently
  const mfgActive = db.activateTrial(testUserId, 'manufacturing');
  assert.strictEqual(mfgActive.isTrialActive, true);

  // Check SHIFTS trial is NOT active
  const updatedTrials = db.getUserTrials(testUserId);
  assert.strictEqual(updatedTrials.shifts.isTrialActive, false, 'Starting FMCG and Manufacturing trials must NOT activate SHIFTS trial');

  console.log('✓ Independent trial management verified: trials remain strictly decoupled across solutions\n');

  console.log('================================================================');
  console.log('🎉 ALL ACCESS OPTIONS STANDARDISATION TESTS PASSED (100%)! 🎉');
  console.log('================================================================\n');
}

runVerification();

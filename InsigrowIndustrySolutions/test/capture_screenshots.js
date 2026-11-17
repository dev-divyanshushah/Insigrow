const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Divyanshu Shah\\.gemini\\antigravity\\brain\\3635cabe-39c1-4f3c-bacd-7e812bc4f5bd';
const LOCAL_SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

[LOCAL_SCREENSHOTS_DIR, ARTIFACT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    return buffer;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('--- Starting Express Server ---');
  require('../server/server.js');
  await new Promise(r => setTimeout(r, 1200));

  console.log('--- Launching Headless Chrome ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,920',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const targets = await httpGet('http://127.0.0.1:9222/json');
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found');

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('Connected to CDP');

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  const solutions = [
    { key: 'fmcg', name: 'FMCG', filename: 'fmcg_solution.png', expectedSignIn: '#/login?industry=fmcg', expectedTrial: '#/register?industry=fmcg' },
    { key: 'manufacturing', name: 'Manufacturing', filename: 'manufacturing_solution.png', expectedSignIn: '#/login?industry=manufacturing', expectedTrial: '#/register?industry=manufacturing' },
    { key: 'b2b', name: 'B2B Enterprise', filename: 'b2b_solution.png', expectedSignIn: '#/login?industry=b2b', expectedTrial: '#/register?industry=b2b' },
    { key: 'ca', name: 'Finance', filename: 'finance_solution.png', expectedSignIn: '#/login?industry=ca', expectedTrial: '#/register?industry=ca' },
    { key: 'shifts', name: 'SHIFTS', filename: 'shifts_solution.png', expectedSignIn: '#/shifts/auth?tab=login', expectedTrial: '#/shifts/auth?tab=register' }
  ];

  console.log('\n--- Capturing Screenshots of All 5 Solutions ---');

  for (const sol of solutions) {
    const url = `http://localhost:5000/#/solution/${sol.key}`;
    console.log(`\nNavigating to ${sol.name} (${url})...`);
    await cdp.send('Page.navigate', { url });

    // Wait for view to render and hero buttons to appear
    let rendered = false;
    for (let i = 0; i < 30; i++) {
      const exists = await cdp.eval(`!!document.querySelector('.ind-hero-cta-group a')`);
      if (exists) {
        rendered = true;
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    if (!rendered) throw new Error(`Timeout waiting for ${sol.name} landing page to render`);
    await new Promise(r => setTimeout(r, 500)); // allow CSS transitions to settle

    // Inspect buttons in the Hero CTA group
    const buttonData = await cdp.eval(`
      (() => {
        const heroGroup = document.querySelector('.ind-hero-cta-group');
        if (!heroGroup) return null;
        const links = Array.from(heroGroup.querySelectorAll('a')).map(a => ({
          text: a.innerText.trim(),
          href: a.getAttribute('href'),
          className: a.className,
          isPrimary: a.classList.contains('ind-btn-primary'),
          isSecondary: a.classList.contains('ind-btn-secondary')
        }));
        return links;
      })()
    `);

    console.log(`  Hero Buttons for ${sol.name}:`, JSON.stringify(buttonData, null, 2));

    const trialBtn = buttonData.find(b => b.text.includes('Start 15-Day Free Trial'));
    const signInBtn = buttonData.find(b => b.text === 'Sign In');

    if (!trialBtn) throw new Error(`Missing "Start 15-Day Free Trial" button on ${sol.name}`);
    if (!signInBtn) throw new Error(`Missing "Sign In" button on ${sol.name}`);
    if (!trialBtn.isPrimary) throw new Error(`Trial button on ${sol.name} must be primary styled`);
    if (!signInBtn.isSecondary) throw new Error(`Sign In button on ${sol.name} must be secondary styled`);
    if (trialBtn.href !== sol.expectedTrial) throw new Error(`Trial href mismatch: got ${trialBtn.href}, expected ${sol.expectedTrial}`);
    if (signInBtn.href !== sol.expectedSignIn) throw new Error(`Sign In href mismatch: got ${signInBtn.href}, expected ${sol.expectedSignIn}`);

    // Capture screenshot
    const localPath = path.join(LOCAL_SCREENSHOTS_DIR, sol.filename);
    const artifactPath = path.join(ARTIFACT_DIR, sol.filename);

    const buffer = await cdp.captureScreenshot(localPath);
    fs.writeFileSync(artifactPath, buffer);
    console.log(`  ✓ Screenshot saved: ${localPath}`);
    console.log(`  ✓ Artifact copied: ${artifactPath}`);
  }

  // Verification of Click Flows
  console.log('\n--- Verifying Interactive Navigation Flows ---');

  // Flow A: Click FMCG "Sign In"
  console.log('Testing Click: FMCG "Sign In" -> #/login?industry=fmcg');
  await cdp.send('Page.navigate', { url: 'http://localhost:5000/#/solution/fmcg' });
  await new Promise(r => setTimeout(r, 600));
  await cdp.eval(`document.querySelector('.ind-hero-cta-group .hero-btn-signin').click()`);
  await new Promise(r => setTimeout(r, 600));
  const loginUrl = await cdp.eval(`window.location.hash`);
  const loginSub = await cdp.eval(`document.querySelector('.auth-subtitle')?.innerText`);
  console.log('  Hash:', loginUrl, '| Subtitle:', loginSub);
  if (!loginUrl.includes('#/login?industry=fmcg')) throw new Error('Sign In failed to preserve FMCG context');

  // Flow B: Click FMCG "Start 15-Day Free Trial"
  console.log('Testing Click: FMCG "Start 15-Day Free Trial" -> #/register?industry=fmcg');
  await cdp.send('Page.navigate', { url: 'http://localhost:5000/#/solution/fmcg' });
  await new Promise(r => setTimeout(r, 600));
  await cdp.eval(`document.querySelector('.ind-hero-cta-group .hero-btn-trial').click()`);
  await new Promise(r => setTimeout(r, 600));
  const regUrl = await cdp.eval(`window.location.hash`);
  const regSelect = await cdp.eval(`document.getElementById('reg-industry')?.value`);
  console.log('  Hash:', regUrl, '| Preselected Industry:', regSelect);
  if (!regUrl.includes('#/register?industry=fmcg') || regSelect !== 'fmcg') {
    throw new Error('Registration failed to preselect FMCG');
  }

  // Flow C: Click SHIFTS "Sign In"
  console.log('Testing Click: SHIFTS "Sign In" -> #/shifts/auth?tab=login');
  await cdp.send('Page.navigate', { url: 'http://localhost:5000/#/solution/shifts' });
  await new Promise(r => setTimeout(r, 600));
  await cdp.eval(`document.querySelector('.ind-hero-cta-group .hero-btn-signin').click()`);
  await new Promise(r => setTimeout(r, 600));
  const shiftsLoginHash = await cdp.eval(`window.location.hash`);
  const shiftsLoginActive = await cdp.eval(`document.getElementById('tab-btn-login')?.classList.contains('active')`);
  console.log('  Hash:', shiftsLoginHash, '| Login Tab Active:', shiftsLoginActive);
  if (!shiftsLoginHash.includes('tab=login') || !shiftsLoginActive) {
    throw new Error('SHIFTS Sign In failed to open login tab');
  }

  // Flow D: Click SHIFTS "Start 15-Day Free Trial"
  console.log('Testing Click: SHIFTS "Start 15-Day Free Trial" -> #/shifts/auth?tab=register');
  await cdp.send('Page.navigate', { url: 'http://localhost:5000/#/solution/shifts' });
  await new Promise(r => setTimeout(r, 600));
  await cdp.eval(`document.querySelector('.ind-hero-cta-group .hero-btn-trial').click()`);
  await new Promise(r => setTimeout(r, 600));
  const shiftsRegHash = await cdp.eval(`window.location.hash`);
  const shiftsRegActive = await cdp.eval(`document.getElementById('tab-btn-register')?.classList.contains('active')`);
  console.log('  Hash:', shiftsRegHash, '| Register Tab Active:', shiftsRegActive);
  if (!shiftsRegActive) {
    throw new Error('SHIFTS Free Trial failed to open register tab');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL FIVE SOLUTION SCREENSHOTS & INTERACTIVE FLOWS VERIFIED! 🎉');
  console.log('================================================================\n');

  cdp.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});

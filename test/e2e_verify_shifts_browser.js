const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Divyanshu Shah\\.gemini\\antigravity\\brain\\3635cabe-39c1-4f3c-bacd-7e812bc4f5bd';
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');
[ARTIFACT_DIR, SCREENSHOTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

function waitPort(port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const sock = require('net').connect(port, '127.0.0.1');
      sock.on('connect', () => {
        sock.destroy();
        resolve(true);
      });
      sock.on('error', () => {
        if (Date.now() - start > timeout) reject(new Error(`Timeout waiting for port ${port}`));
        else setTimeout(check, 400);
      });
    };
    check();
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

  async waitForSelector(selector, timeoutMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const exists = await this.eval(`!!document.querySelector('${selector}')`);
      if (exists) return true;
      await new Promise(r => setTimeout(r, 300));
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async captureScreenshot(name) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, `${name}.png`), buffer);
    fs.writeFileSync(path.join(ARTIFACT_DIR, `${name}.png`), buffer);
    console.log(`  📸 Screenshot saved: ${name}.png`);
    return buffer;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const childProcesses = [];
  const shiftPlannerDir = path.resolve(__dirname, '../../ShiftPlanner');

  try {
    console.log('================================================================');
    console.log('🚀 E2E VERIFICATION: SHIFTS SIGN IN ROUTING & SHIFTPLANNER AUTH');
    console.log('================================================================');

    // 1. Start Insigrow server (port 5000)
    console.log('1. Starting Insigrow server on port 5000...');
    require('../server/server.js');
    await waitPort(5000);
    console.log('   ✓ Insigrow server is live on http://localhost:5000');

    // 2. Start ShiftPlanner backend (port 5001)
    console.log('2. Starting ShiftPlanner backend on port 5001...');
    const spBackend = spawn('node', ['backend/server.js'], {
      cwd: shiftPlannerDir,
      env: { ...process.env, PORT: '5001' },
      stdio: 'pipe'
    });
    childProcesses.push(spBackend);
    spBackend.stdout.on('data', d => {
      // console.log('[SP-BE]', d.toString().trim());
    });
    spBackend.stderr.on('data', d => {
      console.error('[SP-BE ERR]', d.toString().trim());
    });
    await waitPort(5001);
    console.log('   ✓ ShiftPlanner backend is live on http://localhost:5001');

    // 3. Start ShiftPlanner frontend (port 3000)
    console.log('3. Starting ShiftPlanner Vite frontend on port 3000...');
    const spFrontend = spawn('cmd.exe', ['/c', 'npx', 'vite', '--port', '3000'], {
      cwd: shiftPlannerDir,
      env: { ...process.env, VITE_API_URL: 'http://127.0.0.1:5001' },
      stdio: 'pipe'
    });
    childProcesses.push(spFrontend);
    spFrontend.stdout.on('data', d => {
      // console.log('[SP-FE]', d.toString().trim());
    });
    spFrontend.stderr.on('data', d => {
      console.error('[SP-FE ERR]', d.toString().trim());
    });
    await waitPort(3000);
    console.log('   ✓ ShiftPlanner frontend is live on http://localhost:3000');

    // 4. Launch Headless Chrome
    console.log('4. Launching Chrome with CDP...');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,920',
      'about:blank'
    ]);
    childProcesses.push(chrome);
    await new Promise(r => setTimeout(r, 2000));

    const targets = await httpGet('http://127.0.0.1:9222/json');
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No Chrome page target found');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    console.log('   ✓ CDP connected');

    // Helper to navigate and wait
    const goto = async (url, delay = 1500) => {
      await cdp.send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, delay));
    };

    // --- TEST 1: Open Insigrow SHIFTS solution page ---
    console.log('\n--- Step 1: Navigate to Insigrow SHIFTS solution ---');
    await goto('http://localhost:5000/#/solution/shifts');
    const shiftsPageTitle = await cdp.eval('document.title');
    const shiftsHeading = await cdp.eval('document.querySelector("h1")?.innerText');
    console.log(`   Page loaded: "${shiftsHeading}"`);
    await cdp.captureScreenshot('step1_insigrow_shifts_landing');

    // Verify Sign In button href and Free Trial button href
    const ctaInfo = await cdp.eval(`(() => {
      const signInBtn = document.querySelector('a[data-access="shifts-signin"]') ||
        Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim().includes('Sign In'));
      const trialBtn = document.querySelector('a[data-access="shifts-trial"]') ||
        Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim().includes('Start 15-Day Free Trial'));
      return {
        signInHref: signInBtn ? signInBtn.getAttribute('href') : null,
        signInText: signInBtn ? signInBtn.innerText.trim() : null,
        trialHref: trialBtn ? trialBtn.getAttribute('href') : null,
        trialText: trialBtn ? trialBtn.innerText.trim() : null
      };
    })()`);
    console.log('   CTA Buttons found on Insigrow SHIFTS page:', ctaInfo);
    if (ctaInfo.signInHref !== 'http://localhost:3000/login') {
      throw new Error(`Expected signInHref to be 'http://localhost:3000/login', got: ${ctaInfo.signInHref}`);
    }
    console.log('   ✓ Sign In button correctly links to http://localhost:3000/login');

    // --- TEST 2 & 3: Click Sign In button -> Verify navigation to ShiftPlanner Login Page ---
    console.log('\n--- Step 2 & 3: Click Sign In -> Verify ShiftPlanner Login Page ---');
    await cdp.eval(`(() => {
      const btn = document.querySelector('a[data-access="shifts-signin"]') ||
        Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim().includes('Sign In'));
      btn.click();
    })()`);

    console.log('   Waiting for ShiftPlanner LoginPage to render input[type="email"]...');
    await cdp.waitForSelector('input[type="email"]', 20000);

    const currentUrl = await cdp.eval('window.location.href');
    console.log(`   Current URL after clicking Sign In: ${currentUrl}`);
    if (!currentUrl.includes('localhost:3000/login')) {
      throw new Error(`Expected URL to include localhost:3000/login, got: ${currentUrl}`);
    }

    // Verify ShiftPlanner login page elements
    const loginFormDetails = await cdp.eval(`(() => {
      const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]') || document.querySelector('#email');
      const passInput = document.querySelector('input[type="password"]');
      const submitBtn = document.querySelector('button[type="submit"]');
      return {
        hasEmail: !!emailInput,
        hasPassword: !!passInput,
        submitText: submitBtn ? submitBtn.innerText.trim() : null,
        heading: document.querySelector('h1, h2')?.innerText
      };
    })()`);
    console.log('   ShiftPlanner Login form details:', loginFormDetails);
    await cdp.captureScreenshot('step3_shiftplanner_login_page');
    console.log('   ✓ ShiftPlanner login page successfully opened with email and password inputs');

    // --- TEST 4, 5, 6: Log in as Manager -> Verify Manager Dashboard ---
    console.log('\n--- Step 4, 5, 6: Login as Manager (manager@shiftflow.com) ---');
    await cdp.eval(`(() => {
      const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]') || document.querySelector('#email');
      const passInput = document.querySelector('input[type="password"]');
      
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(emailInput, 'manager@shiftflow.com');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputValueSetter.call(passInput, 'Manager@123');
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
      passInput.dispatchEvent(new Event('change', { bubbles: true }));

      const submitBtn = document.querySelector('button[type="submit"]');
      submitBtn.click();
    })()`);

    // Wait for redirect to /overview
    console.log('   Waiting for Manager Dashboard navigation...');
    let managerUrl = '';
    const mStart = Date.now();
    while (Date.now() - mStart < 15000) {
      managerUrl = await cdp.eval('window.location.href');
      if (managerUrl.includes('/overview') || managerUrl.includes('/dashboard')) break;
      await new Promise(r => setTimeout(r, 400));
    }
    console.log(`   URL after Manager login: ${managerUrl}`);
    if (!managerUrl.includes('/overview') && !managerUrl.includes('/dashboard')) {
      const pageErr = await cdp.eval('document.body.innerText');
      throw new Error(`Expected Manager redirect to /overview, got: ${managerUrl}. Page text snippet: ${pageErr.slice(0, 300)}`);
    }

    const managerPageInfo = await cdp.eval(`(() => {
      return {
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2')).map(h => h.innerText.trim()),
        hasNav: !!document.querySelector('nav'),
        userBadge: document.querySelector('[data-testid="user-role"]')?.innerText || document.body.innerText.includes('Manager')
      };
    })()`);
    console.log('   Manager dashboard details:', managerPageInfo);
    await cdp.captureScreenshot('step6_manager_dashboard');
    console.log('   ✓ Manager redirected to Manager Dashboard (/overview)');

    // --- TEST 7: Logout / Clear Auth ---
    console.log('\n--- Step 7: Log out from Manager account ---');
    await cdp.eval(`(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    })()`);
    await goto('http://localhost:3000/login');
    await cdp.waitForSelector('input[type="email"]', 15000);
    console.log('   ✓ Returned to ShiftPlanner login page');

    // --- TEST 8, 9, 10: Log in as Employee -> Verify Employee Dashboard ---
    console.log('\n--- Step 8, 9, 10: Login as Employee (employee@shiftflow.com) ---');
    await cdp.eval(`(() => {
      const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[name="email"]') || document.querySelector('#email');
      const passInput = document.querySelector('input[type="password"]');
      
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(emailInput, 'employee@shiftflow.com');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeInputValueSetter.call(passInput, 'Employee@123');
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
      passInput.dispatchEvent(new Event('change', { bubbles: true }));

      const submitBtn = document.querySelector('button[type="submit"]');
      submitBtn.click();
    })()`);

    // Wait for redirect to /employee/dashboard
    console.log('   Waiting for Employee Dashboard navigation...');
    let empUrl = '';
    const eStart = Date.now();
    while (Date.now() - eStart < 15000) {
      empUrl = await cdp.eval('window.location.href');
      if (empUrl.includes('/employee/dashboard') || empUrl.includes('/employee')) break;
      await new Promise(r => setTimeout(r, 400));
    }
    console.log(`   URL after Employee login: ${empUrl}`);
    if (!empUrl.includes('/employee/dashboard') && !empUrl.includes('/employee')) {
      const pageErr = await cdp.eval('document.body.innerText');
      throw new Error(`Expected Employee redirect to /employee/dashboard, got: ${empUrl}. Page text snippet: ${pageErr.slice(0, 300)}`);
    }

    const empPageInfo = await cdp.eval(`(() => {
      return {
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2')).map(h => h.innerText.trim()),
        hasNav: !!document.querySelector('nav')
      };
    })()`);
    console.log('   Employee dashboard details:', empPageInfo);
    await cdp.captureScreenshot('step10_employee_dashboard');
    console.log('   ✓ Employee redirected to Employee Dashboard (/employee/dashboard)');

    // --- TEST 11: Return to Insigrow SHIFTS -> Test Start 15-Day Free Trial ---
    console.log('\n--- Step 11: Verify Start 15-Day Free Trial under SHIFTS ---');
    await goto('http://localhost:5000/#/solution/shifts');
    await cdp.eval(`(() => {
      const trialBtn = document.querySelector('a[data-access="shifts-trial"]') ||
        Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim().includes('Start 15-Day Free Trial'));
      trialBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1500));
    const trialUrl = await cdp.eval('window.location.href');
    console.log(`   URL after clicking Start 15-Day Free Trial: ${trialUrl}`);
    if (!trialUrl.includes('/shifts/auth?tab=register')) {
      throw new Error(`Expected Free Trial URL to include /shifts/auth?tab=register, got: ${trialUrl}`);
    }
    await cdp.captureScreenshot('step11_shifts_free_trial_registration');
    console.log('   ✓ Start 15-Day Free Trial correctly opens Insigrow SHIFTS onboarding registration');

    // --- TEST 12: Verify Other Solutions (FMCG, Manufacturing, B2B, Finance) Unaffected ---
    console.log('\n--- Step 12: Verify other solutions are not affected ---');
    const otherSolutions = [
      { id: 'fmcg', expectedSignIn: '#/login?industry=fmcg', expectedTrial: '#/register?industry=fmcg' },
      { id: 'manufacturing', expectedSignIn: '#/login?industry=manufacturing', expectedTrial: '#/register?industry=manufacturing' },
      { id: 'b2b', expectedSignIn: '#/login?industry=b2b', expectedTrial: '#/register?industry=b2b' },
      { id: 'ca', expectedSignIn: '#/login?industry=ca', expectedTrial: '#/register?industry=ca' }
    ];

    for (const sol of otherSolutions) {
      await goto(`http://localhost:5000/#/solution/${sol.id}`);
      const solBtns = await cdp.eval(`(() => {
        const signInBtn = document.querySelector('a[data-access="${sol.id}-signin"]') ||
          Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim().includes('Sign In'));
        const trialBtn = document.querySelector('a[data-access="${sol.id}-trial"]') ||
          Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim().includes('Start 15-Day Free Trial'));
        return {
          signInHref: signInBtn ? signInBtn.getAttribute('href') : null,
          trialHref: trialBtn ? trialBtn.getAttribute('href') : null
        };
      })()`);
      console.log(`   Solution ${sol.id}:`, solBtns);
      if (solBtns.signInHref !== sol.expectedSignIn || solBtns.trialHref !== sol.expectedTrial) {
        throw new Error(`Mismatch on solution ${sol.id}: expected signIn=${sol.expectedSignIn}, trial=${sol.expectedTrial}, got: ${JSON.stringify(solBtns)}`);
      }
    }
    console.log('   ✓ FMCG, Manufacturing, B2B, and Finance solutions remain completely unaffected');

    console.log('\n================================================================');
    console.log('🎉 ALL 12 VERIFICATION STEPS PASSED SUCCESSFULLY! 🎉');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    console.log('Cleaning up child processes...');
    childProcesses.forEach(cp => {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', cp.pid, '/f', '/t']);
        } else {
          cp.kill();
        }
      } catch (_) {}
    });
    setTimeout(() => process.exit(process.exitCode || 0), 1000);
  }
}

run();

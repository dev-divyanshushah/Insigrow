/**
 * Insigrow Industry Portal - Dedicated SHIFTS Authentication View
 * Implements Manager / Organisation Registration with 15-day free trial,
 * password strength feedback, terms acceptance, and role-based login.
 */

const ShiftsAuthView = {
  render(container, initialTab = 'register', prefilledEmail = '') {
    container.innerHTML = `
      <div class="shifts-auth-page">
        <!-- Minimal Branded Header -->
        <header class="shifts-auth-header">
          <a href="#/solution/shifts" class="shifts-auth-back-link">
            ${window.getIcon ? window.getIcon('chevronLeft', 'icon-xs') : '←'} Back to SHIFTS Overview
          </a>
          <a class="shifts-auth-brand" href="#/landing">
            <img src="/insigrow-mark.png" alt="Insigrow Logo" />
            <span>INSIGROW</span>
          </a>
          <div class="shifts-auth-trial-pill">
            <span class="pulse-dot"></span> 15-Day Free Trial
          </div>
        </header>

        <!-- Main Auth Container -->
        <div class="shifts-auth-container">
          <!-- Left Column: Value Proposition & Assurance -->
          <div class="shifts-auth-left">
            <div class="shifts-auth-badge">
              <span class="badge-dot"></span>
              <span>WORKFORCE & SHIFT MANAGEMENT</span>
            </div>

            <h1 class="shifts-auth-headline">
              Your Workforce,<br>
              <em>Working in Perfect Sync.</em>
            </h1>
            <p class="shifts-auth-tagline">
              "Every Shift. Every Team. Perfectly Aligned."
            </p>
            <p class="shifts-auth-desc">
              Take complete control of your operations with intelligent shift scheduling,
              seamless employee coordination, and real-time workforce insights.
            </p>

            <div class="shifts-value-points">
              <div class="value-point-item">
                <div class="value-icon">${window.getIcon ? window.getIcon('sparkles', 'icon-sm') : '✨'}</div>
                <div>
                  <strong>Intelligent Constraint Rostering</strong>
                  <span>Automated solver generates weekly schedules in seconds without spreadsheet chaos.</span>
                </div>
              </div>

              <div class="value-point-item">
                <div class="value-icon">${window.getIcon ? window.getIcon('shieldCheck', 'icon-sm') : '🛡️'}</div>
                <div>
                  <strong>100% Conflict-Free Scheduling</strong>
                  <span>Real-time clash detection enforces mandatory 11-hour rest periods and 40-hr limits.</span>
                </div>
              </div>

              <div class="value-point-item">
                <div class="value-icon">${window.getIcon ? window.getIcon('users', 'icon-sm') : '👥'}</div>
                <div>
                  <strong>Frontline Employee Self-Service</strong>
                  <span>Empower staff with dedicated access to personal shifts, availability, and peer trades.</span>
                </div>
              </div>

              <div class="value-point-item">
                <div class="value-icon">${window.getIcon ? window.getIcon('activity', 'icon-sm') : '📊'}</div>
                <div>
                  <strong>Operational Workforce Telemetry</strong>
                  <span>Erlang-C staffing curves, staggered breaks, and automated overtime governance.</span>
                </div>
              </div>
            </div>

            <div class="shifts-auth-trust-box">
              <div class="trust-badge-row">
                <span class="trust-check">✓</span>
                <span>15-day complimentary trial with zero upfront payment</span>
              </div>
              <div class="trust-badge-row">
                <span class="trust-check">✓</span>
                <span>No credit card required to register</span>
              </div>
              <div class="trust-badge-row">
                <span class="trust-check">✓</span>
                <span>Instant manager workspace & onboarding access</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Tabbed Card -->
          <div class="shifts-auth-right">
            <div class="shifts-auth-card">
              <!-- Tab Navigation -->
              <div class="shifts-tabs-bar" role="tablist">
                <button type="button" class="shifts-tab-btn ${initialTab === 'register' ? 'active' : ''}" id="tab-btn-register" role="tab">
                  Create Your Account
                </button>
                <button type="button" class="shifts-tab-btn ${initialTab === 'login' ? 'active' : ''}" id="tab-btn-login" role="tab">
                  Already Have an Account? Sign In
                </button>
              </div>

              <!-- Error & Notification Banner -->
              <div id="shifts-auth-alert" class="shifts-alert-banner" style="display: none;"></div>

              <!-- ======================================================== -->
              <!-- VIEW A: MANAGER / ORGANISATION REGISTRATION FORM -->
              <!-- ======================================================== -->
              <div id="shifts-view-register" class="shifts-tab-content ${initialTab === 'register' ? 'active' : ''}">
                <div class="shifts-form-intro">
                  <div class="shifts-form-kicker">ORGANISATION ONBOARDING & SETUP</div>
                  <h2 class="shifts-form-title">Start Your 15-Day Free Trial</h2>
                  <p class="shifts-form-sub">Explore SHIFTS free for 15 days. No credit card required.</p>
                </div>

                <form id="shifts-register-form" novalidate>
                  <!-- Full Name & Work Email -->
                  <div class="shifts-form-row">
                    <div class="shifts-form-group">
                      <label for="shifts-reg-name">Full Name <span class="required-star">*</span></label>
                      <input 
                        type="text" 
                        id="shifts-reg-name" 
                        class="shifts-input" 
                        placeholder="e.g. Elena Rostova" 
                        required 
                        autocomplete="name"
                      />
                      <span class="field-error" id="err-reg-name"></span>
                    </div>

                    <div class="shifts-form-group">
                      <label for="shifts-reg-email">Work Email <span class="required-star">*</span></label>
                      <input 
                        type="email" 
                        id="shifts-reg-email" 
                        class="shifts-input" 
                        placeholder="elena@apexsolutions.com" 
                        value="${prefilledEmail}"
                        required 
                        autocomplete="email"
                      />
                      <span class="field-error" id="err-reg-email"></span>
                    </div>
                  </div>

                  <!-- Organisation Name & Contact Phone -->
                  <div class="shifts-form-row">
                    <div class="shifts-form-group">
                      <label for="shifts-reg-org">Organisation Name <span class="required-star">*</span></label>
                      <input 
                        type="text" 
                        id="shifts-reg-org" 
                        class="shifts-input" 
                        placeholder="e.g. Apex Contact Solutions" 
                        required 
                        autocomplete="organization"
                      />
                      <span class="field-error" id="err-reg-org"></span>
                    </div>

                    <div class="shifts-form-group">
                      <label for="shifts-reg-phone">Contact Number <span class="required-star">*</span></label>
                      <input 
                        type="tel" 
                        id="shifts-reg-phone" 
                        class="shifts-input" 
                        placeholder="+91 98765 43210" 
                        required 
                        autocomplete="tel"
                      />
                      <span class="field-error" id="err-reg-phone"></span>
                    </div>
                  </div>

                  <!-- Password with Visibility Toggle & Strength Feedback -->
                  <div class="shifts-form-group">
                    <div class="label-with-addon">
                      <label for="shifts-reg-password">Password <span class="required-star">*</span></label>
                      <span class="label-subnote">Minimum 8 characters</span>
                    </div>
                    <div class="shifts-password-wrap">
                      <input 
                        type="password" 
                        id="shifts-reg-password" 
                        class="shifts-input" 
                        placeholder="Create a strong password" 
                        required 
                        autocomplete="new-password"
                      />
                      <button type="button" class="pwd-toggle-btn" id="btn-toggle-reg-pwd" title="Show/hide password" aria-label="Toggle password visibility">
                        <span class="eye-icon">👁️</span>
                      </button>
                    </div>

                    <!-- Interactive Password Strength Meter -->
                    <div class="shifts-strength-meter" id="shifts-strength-meter">
                      <div class="strength-bars">
                        <span class="bar bar-1"></span>
                        <span class="bar bar-2"></span>
                        <span class="bar bar-3"></span>
                        <span class="bar bar-4"></span>
                      </div>
                      <span class="strength-label" id="strength-label">Enter password</span>
                    </div>
                    <span class="field-error" id="err-reg-pwd"></span>
                  </div>

                  <!-- Confirm Password -->
                  <div class="shifts-form-group">
                    <label for="shifts-reg-confirm-pwd">Confirm Password <span class="required-star">*</span></label>
                    <div class="shifts-password-wrap">
                      <input 
                        type="password" 
                        id="shifts-reg-confirm-pwd" 
                        class="shifts-input" 
                        placeholder="Re-enter your password" 
                        required 
                        autocomplete="new-password"
                      />
                      <button type="button" class="pwd-toggle-btn" id="btn-toggle-reg-cpwd" title="Show/hide password" aria-label="Toggle confirm password visibility">
                        <span class="eye-icon">👁️</span>
                      </button>
                    </div>
                    <span class="field-error" id="err-reg-cpwd"></span>
                  </div>

                  <!-- Terms & Privacy Acceptance -->
                  <div class="shifts-terms-checkbox">
                    <label class="custom-checkbox">
                      <input type="checkbox" id="shifts-reg-terms" required />
                      <span class="checkbox-box"></span>
                      <span class="terms-text">
                        I agree to the <a href="javascript:void(0)" class="terms-link">Terms of Service</a> and 
                        <a href="javascript:void(0)" class="terms-link">Privacy Policy</a>, and consent to receiving account onboarding notices.
                      </span>
                    </label>
                    <span class="field-error" id="err-reg-terms"></span>
                  </div>

                  <!-- Submit Button -->
                  <button type="submit" class="shifts-submit-btn" id="btn-submit-register">
                    <span class="btn-text">Start 15-Day Free Trial & Proceed to Onboarding →</span>
                    <span class="btn-spinner" style="display: none;"></span>
                  </button>

                  <div class="shifts-form-footnote">
                    <span>Selected Solution: <strong>SHIFTS · Workforce & Shift Management</strong></span>
                  </div>
                </form>
              </div>

              <!-- ======================================================== -->
              <!-- VIEW B: SECURE ROLE-BASED LOGIN FORM -->
              <!-- ======================================================== -->
              <div id="shifts-view-login" class="shifts-tab-content ${initialTab === 'login' ? 'active' : ''}">
                <div class="shifts-form-intro">
                  <div class="shifts-form-kicker">SECURE AUTHENTICATION</div>
                  <h2 class="shifts-form-title">Welcome Back</h2>
                  <p class="shifts-form-sub">Sign in to your organization manager workspace or employee portal.</p>
                </div>

                <form id="shifts-login-form" novalidate>
                  <div class="shifts-form-group">
                    <label for="shifts-login-email">Work / Corporate Email <span class="required-star">*</span></label>
                    <input 
                      type="email" 
                      id="shifts-login-email" 
                      class="shifts-input" 
                      placeholder="name@company.com" 
                      value="${prefilledEmail}"
                      required 
                      autocomplete="email"
                    />
                    <span class="field-error" id="err-login-email"></span>
                  </div>

                  <div class="shifts-form-group">
                    <div class="label-with-addon">
                      <label for="shifts-login-password">Password <span class="required-star">*</span></label>
                      <a href="#/forgot-password" class="forgot-link">Forgot password?</a>
                    </div>
                    <div class="shifts-password-wrap">
                      <input 
                        type="password" 
                        id="shifts-login-password" 
                        class="shifts-input" 
                        placeholder="Enter your password" 
                        required 
                        autocomplete="current-password"
                      />
                      <button type="button" class="pwd-toggle-btn" id="btn-toggle-login-pwd" title="Show/hide password" aria-label="Toggle password visibility">
                        <span class="eye-icon">👁️</span>
                      </button>
                    </div>
                    <span class="field-error" id="err-login-pwd"></span>
                  </div>

                  <div class="shifts-remember-row">
                    <label class="custom-checkbox">
                      <input type="checkbox" id="shifts-login-remember" checked />
                      <span class="checkbox-box"></span>
                      <span class="remember-text">Remember this workstation for 30 days</span>
                    </label>
                  </div>

                  <button type="submit" class="shifts-submit-btn" id="btn-submit-login">
                    <span class="btn-text">Sign In to SHIFTS →</span>
                    <span class="btn-spinner" style="display: none;"></span>
                  </button>

                  <div class="shifts-role-notes">
                    <div class="role-note-card">
                      <strong>Organization Owners / Managers:</strong>
                      <span>Direct access to shift calendars, constraint scheduling, and team rosters.</span>
                    </div>
                    <div class="role-note-card">
                      <strong>Frontline Employees:</strong>
                      <span>Direct access to published shifts, shift trade requests, and availability.</span>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    const tabRegister = container.querySelector('#tab-btn-register');
    const tabLogin = container.querySelector('#tab-btn-login');
    const viewRegister = container.querySelector('#shifts-view-register');
    const viewLogin = container.querySelector('#shifts-view-login');
    const alertBox = container.querySelector('#shifts-auth-alert');

    const showAlert = (message, type = 'error') => {
      alertBox.className = `shifts-alert-banner ${type}`;
      alertBox.innerHTML = `
        <span class="alert-icon">${type === 'success' ? '✓' : '⚠️'}</span>
        <span>${message}</span>
      `;
      alertBox.style.display = 'flex';
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const hideAlert = () => {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    };

    // Tab Switcher
    const switchTab = (tab) => {
      hideAlert();
      if (tab === 'register') {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        viewRegister.classList.add('active');
        viewLogin.classList.remove('active');
      } else {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        viewLogin.classList.add('active');
        viewRegister.classList.remove('active');
      }
    };

    tabRegister.addEventListener('click', () => switchTab('register'));
    tabLogin.addEventListener('click', () => switchTab('login'));

    // Password Visibility Toggles
    const setupToggle = (btnId, inputId) => {
      const btn = container.querySelector(btnId);
      const input = container.querySelector(inputId);
      if (btn && input) {
        btn.addEventListener('click', () => {
          const isPwd = input.type === 'password';
          input.type = isPwd ? 'text' : 'password';
          btn.innerHTML = `<span class="eye-icon">${isPwd ? '🙈' : '👁️'}</span>`;
        });
      }
    };

    setupToggle('#btn-toggle-reg-pwd', '#shifts-reg-password');
    setupToggle('#btn-toggle-reg-cpwd', '#shifts-reg-confirm-pwd');
    setupToggle('#btn-toggle-login-pwd', '#shifts-login-password');

    // Interactive Password Strength Meter
    const regPwdInput = container.querySelector('#shifts-reg-password');
    const strengthMeter = container.querySelector('#shifts-strength-meter');
    const strengthLabel = container.querySelector('#strength-label');

    const evaluateStrength = (pwd) => {
      if (!pwd) return { score: 0, text: 'Enter password', cls: '' };
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;

      if (pwd.length < 8) {
        return { score: 1, text: 'Too short (min 8 chars)', cls: 'weak' };
      }
      if (score <= 1) return { score: 1, text: 'Weak', cls: 'weak' };
      if (score === 2) return { score: 2, text: 'Fair', cls: 'fair' };
      if (score === 3) return { score: 3, text: 'Good', cls: 'good' };
      return { score: 4, text: 'Strong (Great password!)', cls: 'strong' };
    };

    if (regPwdInput && strengthMeter && strengthLabel) {
      regPwdInput.addEventListener('input', () => {
        const val = regPwdInput.value;
        const res = evaluateStrength(val);
        strengthMeter.className = `shifts-strength-meter ${res.cls}`;
        strengthLabel.textContent = res.text;
      });
    }

    // REGISTRATION FORM SUBMISSION
    const regForm = container.querySelector('#shifts-register-form');
    const btnReg = container.querySelector('#btn-submit-register');

    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullName = (container.querySelector('#shifts-reg-name').value || '').trim();
      const email = (container.querySelector('#shifts-reg-email').value || '').trim().toLowerCase();
      const companyName = (container.querySelector('#shifts-reg-org').value || '').trim();
      const phoneNumber = (container.querySelector('#shifts-reg-phone').value || '').trim();
      const password = container.querySelector('#shifts-reg-password').value || '';
      const confirmPassword = container.querySelector('#shifts-reg-confirm-pwd').value || '';
      const termsAccepted = container.querySelector('#shifts-reg-terms').checked;

      // Reset field errors
      container.querySelectorAll('.field-error').forEach(el => el.textContent = '');

      let hasError = false;
      if (!fullName) {
        container.querySelector('#err-reg-name').textContent = 'Full name is required.';
        hasError = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        container.querySelector('#err-reg-email').textContent = 'Valid work email is required.';
        hasError = true;
      }
      if (!companyName) {
        container.querySelector('#err-reg-org').textContent = 'Organisation name is required.';
        hasError = true;
      }
      if (!phoneNumber || phoneNumber.replace(/\s+/g, '').length < 8) {
        container.querySelector('#err-reg-phone').textContent = 'Valid contact number is required.';
        hasError = true;
      }
      if (!password) {
        container.querySelector('#err-reg-pwd').textContent = 'Password is required.';
        hasError = true;
      } else if (password.length < 8) {
        container.querySelector('#err-reg-pwd').textContent = 'Password must be at least 8 characters long.';
        hasError = true;
      }
      if (password !== confirmPassword) {
        container.querySelector('#err-reg-cpwd').textContent = 'Passwords do not match.';
        hasError = true;
      }
      if (!termsAccepted) {
        container.querySelector('#err-reg-terms').textContent = 'You must accept the Terms of Service to continue.';
        hasError = true;
      }

      if (hasError) return;

      // Submit Registration
      btnReg.disabled = true;
      btnReg.querySelector('.btn-text').textContent = 'Creating Manager Account & Activating Trial...';
      btnReg.querySelector('.btn-spinner').style.display = 'inline-block';

      try {
        const payload = {
          fullName,
          companyName,
          email,
          phoneNumber,
          password,
          confirmPassword,
          industry: 'shifts',
          role: 'MANAGER'
        };

        const res = await window.api.register(payload);

        if (res && res.success) {
          showAlert('Account created! Your 15-day SHIFTS trial is active. Redirecting to onboarding...', 'success');
          
          if (res.token) {
            window.api.setToken(res.token, true);
          }
          if (res.user) {
            window.appState.setUser(res.user);
          }

          if (typeof window.triggerConfetti === 'function') {
            window.triggerConfetti();
          }

          // Redirect to 5-Step Organisation Onboarding Wizard
          setTimeout(() => {
            window.location.hash = '#/shifts/onboarding';
          }, 1000);
        } else {
          throw new Error(res.message || 'Registration failed.');
        }
      } catch (err) {
        const msg = err.data && err.data.message ? err.data.message : err.message || 'Registration failed. Please try again.';
        showAlert(msg, 'error');
      } finally {
        btnReg.disabled = false;
        btnReg.querySelector('.btn-text').textContent = 'Start 15-Day Free Trial & Proceed to Onboarding →';
        btnReg.querySelector('.btn-spinner').style.display = 'none';
      }
    });

    // LOGIN FORM SUBMISSION
    const loginForm = container.querySelector('#shifts-login-form');
    const btnLogin = container.querySelector('#btn-submit-login');

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = (container.querySelector('#shifts-login-email').value || '').trim().toLowerCase();
      const password = container.querySelector('#shifts-login-password').value || '';
      const rememberMe = container.querySelector('#shifts-login-remember').checked;

      container.querySelectorAll('.field-error').forEach(el => el.textContent = '');

      let hasError = false;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        container.querySelector('#err-login-email').textContent = 'Valid email is required.';
        hasError = true;
      }
      if (!password) {
        container.querySelector('#err-login-pwd').textContent = 'Password is required.';
        hasError = true;
      }

      if (hasError) return;

      btnLogin.disabled = true;
      btnLogin.querySelector('.btn-text').textContent = 'Authenticating...';
      btnLogin.querySelector('.btn-spinner').style.display = 'inline-block';

      try {
        const res = await window.api.login({ email, password, rememberMe });
        if (res && res.success) {
          window.appState.setUser(res.user);
          if (res.trials) window.appState.setTrials(res.trials);

          showAlert(`Welcome back, ${res.user.fullName}! Launching workspace...`, 'success');

          // Role-based redirection:
          if (res.user.role === 'EMPLOYEE') {
            // Frontline employee: Launch Employee Dashboard via SSO
            try {
              const ssoRes = await window.api.getShiftsLaunchToken('EMPLOYEE', '/employee/dashboard');
              if (ssoRes && ssoRes.launchUrl) {
                window.location.href = ssoRes.launchUrl;
                return;
              }
            } catch (_) {}
            window.location.hash = '#/industry/shifts';
          } else {
            // Manager: Check onboarding status
            if (res.user.onboardingCompleted === false) {
              window.location.hash = '#/shifts/onboarding';
            } else {
              window.location.hash = '#/industry/shifts';
            }
          }
        } else {
          throw new Error(res.message || 'Login failed.');
        }
      } catch (err) {
        const msg = err.data && err.data.message ? err.data.message : err.message || 'Invalid email or password.';
        showAlert(msg, 'error');
      } finally {
        btnLogin.disabled = false;
        btnLogin.querySelector('.btn-text').textContent = 'Sign In to SHIFTS →';
        btnLogin.querySelector('.btn-spinner').style.display = 'none';
      }
    });
  }
};

window.ShiftsAuthView = ShiftsAuthView;

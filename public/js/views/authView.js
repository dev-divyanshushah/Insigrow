/**
 * Insigrow Industry Portal - Authentication Views
 * Handles Registration, Login, Form Validation, and Forgot Password Modal
 */

const AuthView = {
  // Show / Hide Password Helper
  setupPasswordToggle(wrapperId, inputId) {
    const btn = document.querySelector(`#${wrapperId} .toggle-password-btn`);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = window.getIcon(isPass ? 'eyeOff' : 'eye', 'icon-sm');
    });
  },

  /**
   * Render Registration Form
   */
  renderRegister(container, prefilledEmail = '', requestedIndustry = '') {
    this.requestedIndustry = requestedIndustry;
    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-brand-badge">
              <img src="/insigrow-mark.png" alt="Insigrow Logo" class="auth-logo-img" onerror="this.style.display='none'" />
              <div class="brand-text" style="text-align: left;">
                <span class="brand-name">Insigrow <span class="brand-badge">PORTAL</span></span>
                <span class="brand-sub">Industry Solutions Portal</span>
              </div>
            </div>
            <h1 class="auth-title">Create Business Account</h1>
            <p class="auth-subtitle">${requestedIndustry ? `Create your account to start your ${requestedIndustry === 'ca' ? 'Finance' : (requestedIndustry === 'shifts' ? 'SHIFTS' : requestedIndustry.toUpperCase())} 15-day trial.` : 'Register your organization to access Insigrow industry solutions.'}</p>
          </div>

          <div id="register-alert-container"></div>

          <form id="register-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="reg-fullname">Full Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon">${window.getIcon('user')}</span>
                <input type="text" id="reg-fullname" class="input-field" placeholder="e.g. Vikram Malhotra" required />
              </div>
              <div class="form-error-text" id="err-fullname"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-company">Company / Organization Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon">${window.getIcon('building')}</span>
                <input type="text" id="reg-company" class="input-field" placeholder="e.g. Apex Consumer Goods Ltd" required />
              </div>
              <div class="form-error-text" id="err-company"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-industry">Industry Solution <span class="req">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon">${window.getIcon('layers')}</span>
                <select id="reg-industry" class="input-field" required>
                  <option value="fmcg" ${requestedIndustry === 'fmcg' || !requestedIndustry ? 'selected' : ''}>FMCG – Consumer Goods</option>
                  <option value="manufacturing" ${requestedIndustry === 'manufacturing' ? 'selected' : ''}>Manufacturing – Production & Operations</option>
                  <option value="b2b" ${requestedIndustry === 'b2b' ? 'selected' : ''}>B2B Enterprise – Business Solutions</option>
                  <option value="ca" ${requestedIndustry === 'ca' || requestedIndustry === 'finance' ? 'selected' : ''}>Finance – CA & Advisory</option>
                  <option value="shifts" ${requestedIndustry === 'shifts' ? 'selected' : ''}>SHIFTS – Workforce & Shift Management</option>
                </select>
              </div>
              <div class="form-error-text" id="err-industry"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Business Email <span class="req">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon">${window.getIcon('mail')}</span>
                <input type="email" id="reg-email" class="input-field" placeholder="vikram@apexconsumer.com" value="${prefilledEmail}" required />
              </div>
              <div class="form-error-text" id="err-email"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-phone">Phone Number <span class="req">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon">${window.getIcon('phone')}</span>
                <input type="tel" id="reg-phone" class="input-field" placeholder="+91 98765 43210" required />
              </div>
              <div class="form-error-text" id="err-phone"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password (Min. 6 characters) <span class="req">*</span></label>
              <div class="input-wrapper" id="pw-wrap-reg">
                <span class="input-icon">${window.getIcon('lock')}</span>
                <input type="password" id="reg-password" class="input-field" placeholder="••••••••" required />
                <button type="button" class="input-field-btn toggle-password-btn" title="Toggle password visibility">
                  ${window.getIcon('eye', 'icon-sm')}
                </button>
              </div>
              <div class="form-error-text" id="err-password"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm-password">Confirm Password <span class="req">*</span></label>
              <div class="input-wrapper" id="pw-wrap-confirm">
                <span class="input-icon">${window.getIcon('shieldCheck')}</span>
                <input type="password" id="reg-confirm-password" class="input-field" placeholder="••••••••" required />
                <button type="button" class="input-field-btn toggle-password-btn" title="Toggle password visibility">
                  ${window.getIcon('eye', 'icon-sm')}
                </button>
              </div>
              <div class="form-error-text" id="err-confirm-password"></div>
            </div>

            <button type="submit" id="btn-submit-register" class="btn-primary auth-submit-btn">
              <span>Start 15-Day Free Trial</span>
            </button>
          </form>

          <div class="auth-footer-link">
            Already have an account? <a href="${this.requestedIndustry ? `#/login?industry=${this.requestedIndustry}` : '#/login'}" id="link-to-login">Sign In</a>
          </div>

          <div class="auth-powered-by">
            <span>Powered by</span>
            <img src="/ei8-logo.png" alt="Ei8" class="auth-powered-logo" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
    `;

    this.setupPasswordToggle('pw-wrap-reg', 'reg-password');
    this.setupPasswordToggle('pw-wrap-confirm', 'reg-confirm-password');

    // Register Form Handler
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegisterSubmit();
    });
  },

  async handleRegisterSubmit() {
    const fullNameEl = document.getElementById('reg-fullname');
    const companyEl = document.getElementById('reg-company');
    const industryEl = document.getElementById('reg-industry');
    const emailEl = document.getElementById('reg-email');
    const phoneEl = document.getElementById('reg-phone');
    const passEl = document.getElementById('reg-password');
    const confirmEl = document.getElementById('reg-confirm-password');
    const btnSubmit = document.getElementById('btn-submit-register');
    const alertBox = document.getElementById('register-alert-container');

    // Reset error messages
    document.querySelectorAll('.form-error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));
    alertBox.innerHTML = '';

    const fullName = fullNameEl.value.trim();
    const companyName = companyEl.value.trim();
    const selectedIndustry = industryEl ? industryEl.value : (this.requestedIndustry || 'fmcg');
    const email = emailEl.value.trim();
    const phoneNumber = phoneEl.value.trim();
    const password = passEl.value;
    const confirmPassword = confirmEl.value;

    let hasErrors = false;

    if (!fullName) {
      document.getElementById('err-fullname').textContent = 'Full name is required.';
      fullNameEl.classList.add('error');
      hasErrors = true;
    }

    if (!companyName) {
      document.getElementById('err-company').textContent = 'Company name is required.';
      companyEl.classList.add('error');
      hasErrors = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById('err-email').textContent = 'Business email is required.';
      emailEl.classList.add('error');
      hasErrors = true;
    } else if (!emailRegex.test(email)) {
      document.getElementById('err-email').textContent = 'Please enter a valid business email address.';
      emailEl.classList.add('error');
      hasErrors = true;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!phoneNumber) {
      document.getElementById('err-phone').textContent = 'Phone number is required.';
      phoneEl.classList.add('error');
      hasErrors = true;
    } else if (cleanPhone.length < 10) {
      document.getElementById('err-phone').textContent = 'Please enter a valid phone number (min 10 digits).';
      phoneEl.classList.add('error');
      hasErrors = true;
    }

    if (!password) {
      document.getElementById('err-password').textContent = 'Password is required.';
      passEl.classList.add('error');
      hasErrors = true;
    } else if (password.length < 6) {
      document.getElementById('err-password').textContent = 'Password must be at least 6 characters.';
      passEl.classList.add('error');
      hasErrors = true;
    }

    if (!confirmPassword) {
      document.getElementById('err-confirm-password').textContent = 'Please confirm your password.';
      confirmEl.classList.add('error');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      document.getElementById('err-confirm-password').textContent = 'Passwords do not match.';
      confirmEl.classList.add('error');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Loading state
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="spinner"></span> <span>Registering Account...</span>`;

    try {
      const regRes = await window.api.register({
        fullName,
        companyName,
        email,
        phoneNumber,
        password,
        confirmPassword,
        industry: selectedIndustry
      });

      // Sign in immediately and activate the selected solution trial.
      const session = await window.api.login({ email, password, rememberMe: true });
      window.appState.setUser(session.user);
      window.appState.setTrials(session.trials);
      
      const targetIndustry = selectedIndustry || this.requestedIndustry || 'fmcg';
      if (!session.trials || !session.trials[targetIndustry] || !session.trials[targetIndustry].isTrialActive) {
        const trial = await window.api.activateTrial(targetIndustry);
        window.appState.setTrials(trial.trials);
      }
      
      const emailNotice = regRes.emailConfirmation && regRes.emailConfirmation.sent ? ' Confirmation email dispatched.' : '';
      alertBox.innerHTML = `<div class="alert-banner success">${window.getIcon('checkCircle', 'icon')} <div><strong>Your workspace is ready.</strong><p>Your 15-day trial is active.${emailNotice} Opening your solution…</p></div></div>`;
      window.appState.showToast('Your 15-day trial is ready! Welcome to Insigrow.', 'success');
      setTimeout(() => {
        window.location.hash = targetIndustry ? `#/industry/${targetIndustry}` : '#/dashboard';
      }, 450);

    } catch (err) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Register Account</span>`;

      const msg = err.data && err.data.message ? err.data.message : err.message || 'Registration failed.';
      alertBox.innerHTML = `
        <div class="alert-banner error">
          ${window.getIcon('alertTriangle', 'icon')}
          <div>${msg}</div>
        </div>
      `;
    }
  },

  /**
   * Render Login Form
   */
  renderLogin(container, prefilledEmail = '', successNotice = '', requestedIndustry = '') {
    this.requestedIndustry = requestedIndustry;
    const industryLabels = { fmcg: 'FMCG', manufacturing: 'Manufacturing', b2b: 'B2B Enterprise', ca: 'Finance', finance: 'Finance', shifts: 'SHIFTS' };
    const targetLabel = industryLabels[requestedIndustry] || '';

    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-brand-badge">
              <img src="/insigrow-mark.png" alt="Insigrow Logo" class="auth-logo-img" onerror="this.style.display='none'" />
              <div class="brand-text" style="text-align: left;">
                <span class="brand-name">Insigrow <span class="brand-badge">PORTAL</span></span>
                <span class="brand-sub">Industry Solutions Portal</span>
              </div>
            </div>
            <h1 class="auth-title">Sign In to Solutions Portal</h1>
            <p class="auth-subtitle">${targetLabel ? `Sign in to access your ${targetLabel} workspace.` : 'Access FMCG, Manufacturing, B2B, Finance, and SHIFTS Dashboards'}</p>
          </div>

          <div id="login-alert-container">
            ${successNotice ? `
              <div class="alert-banner success">
                ${window.getIcon('checkCircle', 'icon')}
                <div>${successNotice}</div>
              </div>
            ` : ''}
          </div>

          <form id="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="login-email">Registered Business Email <span class="req">*</span></label>
              <div class="input-wrapper">
                <span class="input-icon">${window.getIcon('mail')}</span>
                <input type="email" id="login-email" class="input-field" placeholder="name@company.com" value="${prefilledEmail}" required />
              </div>
              <div class="form-error-text" id="err-login-email"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password <span class="req">*</span></label>
              <div class="input-wrapper" id="pw-wrap-login">
                <span class="input-icon">${window.getIcon('lock')}</span>
                <input type="password" id="login-password" class="input-field" placeholder="••••••••" required />
                <button type="button" class="input-field-btn toggle-password-btn" title="Toggle password visibility">
                  ${window.getIcon('eye', 'icon-sm')}
                </button>
              </div>
              <div class="form-error-text" id="err-login-password"></div>
            </div>

            <div class="form-options-row">
              <label class="checkbox-label">
                <input type="checkbox" id="login-remember" checked />
                <span>Remember Me</span>
              </label>
              <a href="#" id="link-forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" id="btn-submit-login" class="btn-primary auth-submit-btn">
              <span>Sign In</span>
            </button>
          </form>

          <div class="auth-footer-link">
            Don't have an account yet? <a href="${requestedIndustry ? `#/register?industry=${requestedIndustry}` : '#/register'}" id="link-to-register">Start 15-Day Free Trial</a>
          </div>

          <div class="auth-powered-by">
            <span>Powered by</span>
            <img src="/ei8-logo.png" alt="Ei8" class="auth-powered-logo" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>
    `;

    this.setupPasswordToggle('pw-wrap-login', 'login-password');

    // Login Form Handler
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLoginSubmit();
    });

    // Forgot Password Link Handler
    const forgotLink = document.getElementById('link-forgot-password');
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openForgotPasswordModal();
    });
  },

  async handleLoginSubmit() {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    const rememberEl = document.getElementById('login-remember');
    const btnSubmit = document.getElementById('btn-submit-login');
    const alertBox = document.getElementById('login-alert-container');

    document.querySelectorAll('.form-error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('error'));
    alertBox.innerHTML = '';

    const email = emailEl.value.trim();
    const password = passEl.value;
    const rememberMe = rememberEl.checked;

    let hasErrors = false;

    if (!email) {
      document.getElementById('err-login-email').textContent = 'Please enter your registered email.';
      emailEl.classList.add('error');
      hasErrors = true;
    }
    if (!password) {
      document.getElementById('err-login-password').textContent = 'Please enter your password.';
      passEl.classList.add('error');
      hasErrors = true;
    }

    if (hasErrors) return;

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="spinner"></span> <span>Authenticating...</span>`;

    try {
      const res = await window.api.login({ email, password, rememberMe });
      window.appState.setUser(res.user);
      window.appState.setTrials(res.trials);
      window.appState.showToast(`Welcome back, ${res.user.fullName}!`, 'success');

      // Navigate to requested industry, user's industry or dashboard
      let targetInd = this.requestedIndustry || ((res.user && res.user.industry) ? res.user.industry.toLowerCase().trim() : '');
      if (targetInd === 'finance') targetInd = 'ca';
      if (['fmcg', 'ca', 'manufacturing', 'b2b', 'shifts'].includes(targetInd)) {
        window.location.hash = `#/industry/${targetInd}`;
      } else {
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Sign In</span>`;

      const msg = err.data && err.data.message ? err.data.message : err.message || 'Login failed.';
      alertBox.innerHTML = `
        <div class="alert-banner error">
          ${window.getIcon('alertTriangle', 'icon')}
          <div>${msg}</div>
        </div>
      `;
    }
  },

  openForgotPasswordModal() {
    let modal = document.getElementById('modal-forgot-password');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'modal-forgot-password';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">
            ${window.getIcon('lock', 'icon')}
            <span>Reset Account Password</span>
          </div>
          <button class="modal-close-btn" id="btn-close-forgot">
            ${window.getIcon('x')}
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 16px;">
            Enter your registered business email address. We will verify your account and provide reset instructions.
          </p>
          <div id="forgot-alert-box"></div>
          <div class="form-group">
            <label class="form-label" for="forgot-email">Registered Email</label>
            <div class="input-wrapper">
              <span class="input-icon">${window.getIcon('mail')}</span>
              <input type="email" id="forgot-email" class="input-field" placeholder="name@company.com" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="btn-cancel-forgot">Cancel</button>
          <button class="btn-primary" id="btn-send-reset">Send Instructions</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#btn-close-forgot').addEventListener('click', close);
    modal.querySelector('#btn-cancel-forgot').addEventListener('click', close);

    modal.querySelector('#btn-send-reset').addEventListener('click', async () => {
      const emailInput = modal.querySelector('#forgot-email');
      const email = emailInput.value.trim();
      const alertEl = modal.querySelector('#forgot-alert-box');

      if (!email) {
        alertEl.innerHTML = `<div class="alert-banner error">${window.getIcon('alertTriangle', 'icon')} Please enter your email.</div>`;
        return;
      }

      try {
        const res = await window.api.forgotPassword(email);
        alertEl.innerHTML = `<div class="alert-banner success">${window.getIcon('checkCircle', 'icon')} ${res.message}</div>`;
        setTimeout(close, 2500);
      } catch (err) {
        alertEl.innerHTML = `<div class="alert-banner error">${window.getIcon('alertTriangle', 'icon')} Failed to process reset request.</div>`;
      }
    });
  }
};

window.AuthView = AuthView;


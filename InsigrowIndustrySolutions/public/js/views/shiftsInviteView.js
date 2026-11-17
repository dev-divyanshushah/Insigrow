/**
 * Insigrow Industry Portal - Dedicated Employee Invitation Acceptance View
 * Securely verifies invitation tokens, sets employee password, provisions EMPLOYEE role,
 * and launches directly into the ShiftPlanner Employee Self-Service Dashboard.
 */

const ShiftsInviteView = {
  async render(container, token) {
    if (!token) {
      this.renderError(container, 'No invitation token was provided. Please verify the link in your invitation email.');
      return;
    }

    // Loading State
    container.innerHTML = `
      <div class="shifts-invite-page">
        <div class="shifts-invite-card text-center" style="padding: 48px 24px;">
          <div class="spinner spinner-dark" style="margin: 0 auto 16px;"></div>
          <h3 style="color: #14243B;">Verifying your invitation...</h3>
          <p style="color: #5A7184; font-size: 14px;">Connecting to Insigrow SHIFTS verification service.</p>
        </div>
      </div>
    `;

    try {
      const res = await window.api.verifyInvitation(token);
      if (res && res.success && res.invitation) {
        this.renderForm(container, res.invitation, token);
      } else {
        throw new Error(res.message || 'Invitation verification failed.');
      }
    } catch (err) {
      const isAlready = err.data && err.data.alreadyAccepted;
      const isExpired = err.data && err.data.expired;
      let msg = err.data && err.data.message ? err.data.message : err.message || 'Invalid invitation token.';
      this.renderError(container, msg, isAlready, isExpired);
    }
  },

  renderError(container, message, isAlreadyAccepted = false, isExpired = false) {
    container.innerHTML = `
      <div class="shifts-invite-page">
        <header class="shifts-auth-header">
          <a class="shifts-auth-brand" href="#/landing">
            <img src="/insigrow-mark.png" alt="Insigrow Logo" />
            <span>INSIGROW · SHIFTS</span>
          </a>
        </header>

        <div class="shifts-invite-container">
          <div class="shifts-invite-card error-card text-center">
            <div class="invite-error-icon">
              ${isAlreadyAccepted ? '✓' : '⚠️'}
            </div>
            <h2>${isAlreadyAccepted ? 'Invitation Already Accepted' : isExpired ? 'Invitation Expired' : 'Invalid Invitation Link'}</h2>
            <p class="invite-error-msg">${message}</p>

            <div class="invite-error-actions">
              ${isAlreadyAccepted ? `
                <a href="#/shifts/auth?tab=login" class="shifts-submit-btn">
                  Sign In to Employee Portal →
                </a>
              ` : `
                <a href="#/solution/shifts" class="btn-secondary">
                  Go to SHIFTS Overview
                </a>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderForm(container, invite, token) {
    container.innerHTML = `
      <div class="shifts-invite-page">
        <header class="shifts-auth-header">
          <a class="shifts-auth-brand" href="#/landing">
            <img src="/insigrow-mark.png" alt="Insigrow Logo" />
            <span>INSIGROW · SHIFTS</span>
          </a>
          <div class="shifts-auth-trial-pill">
            Employee Portal Invitation
          </div>
        </header>

        <div class="shifts-invite-container">
          <div class="shifts-invite-card">
            <div class="invite-header-badge">
              <span class="pulse-dot"></span> TEAM INVITATION
            </div>

            <h1 class="invite-card-title">Join ${invite.organizationName} on SHIFTS</h1>
            <p class="invite-card-sub">
              You've been invited by your operations team to activate your frontline employee account and view your published schedules.
            </p>

            <!-- Invitation Meta Summary Box -->
            <div class="invite-details-box">
              <div class="invite-detail-item">
                <span class="detail-label">Organisation</span>
                <strong class="detail-val">${invite.organizationName}</strong>
              </div>
              <div class="invite-detail-item">
                <span class="detail-label">Department</span>
                <strong class="detail-val">${invite.department || 'Operations'}</strong>
              </div>
              <div class="invite-detail-item">
                <span class="detail-label">Assigned Role</span>
                <strong class="detail-val">${invite.role || 'Frontline Specialist'}</strong>
              </div>
              <div class="invite-detail-item">
                <span class="detail-label">Corporate Email</span>
                <strong class="detail-val">${invite.email}</strong>
              </div>
            </div>

            <!-- Error Banner -->
            <div id="shifts-invite-alert" class="shifts-alert-banner" style="display: none;"></div>

            <!-- Set Password Form -->
            <form id="shifts-accept-invite-form" novalidate>
              <div class="shifts-form-group">
                <label for="inv-acc-name">Full Name <span class="required-star">*</span></label>
                <input 
                  type="text" 
                  id="inv-acc-name" 
                  class="shifts-input" 
                  value="${invite.fullName || ''}" 
                  placeholder="Your full name"
                  required 
                />
                <span class="field-error" id="err-acc-name"></span>
              </div>

              <div class="shifts-form-group">
                <div class="label-with-addon">
                  <label for="inv-acc-password">Create Password <span class="required-star">*</span></label>
                  <span class="label-subnote">Minimum 8 characters</span>
                </div>
                <div class="shifts-password-wrap">
                  <input 
                    type="password" 
                    id="inv-acc-password" 
                    class="shifts-input" 
                    placeholder="Create a secure password" 
                    required 
                    autocomplete="new-password"
                  />
                  <button type="button" class="pwd-toggle-btn" id="btn-toggle-inv-pwd" title="Show/hide password" aria-label="Toggle password visibility">
                    <span class="eye-icon">👁️</span>
                  </button>
                </div>

                <div class="shifts-strength-meter" id="inv-strength-meter">
                  <div class="strength-bars">
                    <span class="bar bar-1"></span>
                    <span class="bar bar-2"></span>
                    <span class="bar bar-3"></span>
                    <span class="bar bar-4"></span>
                  </div>
                  <span class="strength-label" id="inv-strength-label">Enter password</span>
                </div>
                <span class="field-error" id="err-acc-pwd"></span>
              </div>

              <div class="shifts-form-group">
                <label for="inv-acc-cpwd">Confirm Password <span class="required-star">*</span></label>
                <div class="shifts-password-wrap">
                  <input 
                    type="password" 
                    id="inv-acc-cpwd" 
                    class="shifts-input" 
                    placeholder="Re-enter password" 
                    required 
                    autocomplete="new-password"
                  />
                  <button type="button" class="pwd-toggle-btn" id="btn-toggle-inv-cpwd" title="Show/hide password" aria-label="Toggle confirm password visibility">
                    <span class="eye-icon">👁️</span>
                  </button>
                </div>
                <span class="field-error" id="err-acc-cpwd"></span>
              </div>

              <div class="shifts-terms-checkbox">
                <label class="custom-checkbox">
                  <input type="checkbox" id="inv-acc-terms" checked required />
                  <span class="checkbox-box"></span>
                  <span class="terms-text">
                    I accept the Insigrow SHIFTS Terms of Service and Privacy Policy.
                  </span>
                </label>
                <span class="field-error" id="err-acc-terms"></span>
              </div>

              <button type="submit" class="shifts-submit-btn" id="btn-submit-accept-invite">
                <span class="btn-text">Accept Invitation & Enter Employee Portal →</span>
                <span class="btn-spinner" style="display: none;"></span>
              </button>
            </form>

            <div class="invite-footer-notes">
              <span>Have an existing account? <a href="#/shifts/auth?tab=login">Sign in</a></span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindFormEvents(container, invite, token);
  },

  bindFormEvents(container, invite, token) {
    const alertBox = container.querySelector('#shifts-invite-alert');
    const showAlert = (message, type = 'error') => {
      alertBox.className = `shifts-alert-banner ${type}`;
      alertBox.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'} ${message}</span>`;
      alertBox.style.display = 'flex';
    };
    const hideAlert = () => alertBox.style.display = 'none';

    // Visibility toggles
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

    setupToggle('#btn-toggle-inv-pwd', '#inv-acc-password');
    setupToggle('#btn-toggle-inv-cpwd', '#inv-acc-cpwd');

    // Strength meter
    const pwdInput = container.querySelector('#inv-acc-password');
    const meter = container.querySelector('#inv-strength-meter');
    const label = container.querySelector('#inv-strength-label');

    pwdInput.addEventListener('input', () => {
      const val = pwdInput.value;
      if (!val) {
        meter.className = 'shifts-strength-meter';
        label.textContent = 'Enter password';
        return;
      }
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (val.length < 8) {
        meter.className = 'shifts-strength-meter weak';
        label.textContent = 'Too short (min 8 chars)';
      } else if (score <= 1) {
        meter.className = 'shifts-strength-meter weak';
        label.textContent = 'Weak';
      } else if (score === 2) {
        meter.className = 'shifts-strength-meter fair';
        label.textContent = 'Fair';
      } else if (score === 3) {
        meter.className = 'shifts-strength-meter good';
        label.textContent = 'Good';
      } else {
        meter.className = 'shifts-strength-meter strong';
        label.textContent = 'Strong (Great password!)';
      }
    });

    // Form submission
    const form = container.querySelector('#shifts-accept-invite-form');
    const submitBtn = container.querySelector('#btn-submit-accept-invite');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullName = (container.querySelector('#inv-acc-name').value || '').trim();
      const password = container.querySelector('#inv-acc-password').value || '';
      const confirmPassword = container.querySelector('#inv-acc-cpwd').value || '';
      const terms = container.querySelector('#inv-acc-terms').checked;

      container.querySelectorAll('.field-error').forEach(el => el.textContent = '');

      let hasError = false;
      if (!fullName) {
        container.querySelector('#err-acc-name').textContent = 'Full name is required.';
        hasError = true;
      }
      if (!password) {
        container.querySelector('#err-acc-pwd').textContent = 'Password is required.';
        hasError = true;
      } else if (password.length < 8) {
        container.querySelector('#err-acc-pwd').textContent = 'Password must be at least 8 characters long.';
        hasError = true;
      }
      if (password !== confirmPassword) {
        container.querySelector('#err-acc-cpwd').textContent = 'Passwords do not match.';
        hasError = true;
      }
      if (!terms) {
        container.querySelector('#err-acc-terms').textContent = 'Please accept the Terms to continue.';
        hasError = true;
      }

      if (hasError) return;

      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Activating Employee Account...';
      submitBtn.querySelector('.btn-spinner').style.display = 'inline-block';

      try {
        const res = await window.api.acceptInvitation({
          token,
          password,
          confirmPassword,
          fullName
        });

        if (res && res.success) {
          showAlert('Account activated! Launching ShiftPlanner Employee Portal...', 'success');
          if (res.user) {
            window.appState.setUser(res.user);
          }
          if (typeof window.triggerConfetti === 'function') {
            window.triggerConfetti();
          }

          // Launch directly into ShiftPlanner Employee Dashboard via SSO
          setTimeout(() => {
            if (res.launchUrl) {
              window.location.href = res.launchUrl;
            } else {
              window.location.hash = '#/industry/shifts';
            }
          }, 1200);
        } else {
          throw new Error(res.message || 'Failed to accept invitation.');
        }
      } catch (err) {
        const msg = err.data && err.data.message ? err.data.message : err.message || 'Failed to accept invitation.';
        showAlert(msg, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Accept Invitation & Enter Employee Portal →';
        submitBtn.querySelector('.btn-spinner').style.display = 'none';
      }
    });
  }
};

window.ShiftsInviteView = ShiftsInviteView;

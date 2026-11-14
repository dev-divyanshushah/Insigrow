/**
 * Insigrow Industry Portal - 5-Step Organisation Onboarding Wizard
 * Guides the organisation owner / manager through setup:
 * Step 1: Welcome & Organisation Profile
 * Step 2: Configure Departments & Teams
 * Step 3: Configure Shift Rotations & Templates
 * Step 4: Invite Frontline Employees (Email Invitations)
 * Step 5: Ready to Launch / Enter Manager Workspace
 */

const ShiftsOnboardingView = {
  render(container) {
    const user = window.appState && window.appState.user ? window.appState.user : {
      fullName: 'Operations Manager',
      companyName: 'Apex Contact Solutions',
      email: 'manager@apexsolutions.com'
    };

    container.innerHTML = `
      <div class="shifts-onboarding-page">
        <!-- Top Navigation Bar -->
        <header class="onboarding-topbar">
          <div class="onboarding-brand-wrap">
            <a class="onboarding-brand" href="#/solution/shifts">
              <img src="/insigrow-mark.png" alt="Insigrow Logo" />
              <span>INSIGROW · SHIFTS</span>
            </a>
            <span class="onboarding-badge">Organisation Onboarding</span>
          </div>

          <div class="onboarding-user-info">
            <span class="org-name-pill">${user.companyName || 'Enterprise'}</span>
            <span class="user-name-text">${user.fullName}</span>
            <a href="#/industry/shifts" class="skip-onboarding-link" id="link-skip-onboarding">
              Skip to Dashboard →
            </a>
          </div>
        </header>

        <!-- Main Wizard Container -->
        <div class="onboarding-main-container">
          <!-- 5-Step Progress Stepper -->
          <div class="onboarding-stepper" role="progressbar" aria-label="Onboarding Progress">
            <div class="stepper-step active" data-step="1">
              <div class="step-circle">1</div>
              <span class="step-label">Organisation</span>
            </div>
            <div class="stepper-line"></div>

            <div class="stepper-step" data-step="2">
              <div class="step-circle">2</div>
              <span class="step-label">Departments</span>
            </div>
            <div class="stepper-line"></div>

            <div class="stepper-step" data-step="3">
              <div class="step-circle">3</div>
              <span class="step-label">Shift Rotations</span>
            </div>
            <div class="stepper-line"></div>

            <div class="stepper-step" data-step="4">
              <div class="step-circle">4</div>
              <span class="step-label">Invite Employees</span>
            </div>
            <div class="stepper-line"></div>

            <div class="stepper-step" data-step="5">
              <div class="step-circle">5</div>
              <span class="step-label">Launch</span>
            </div>
          </div>

          <!-- Wizard Content Area -->
          <div class="onboarding-card">
            <!-- Alert Banner -->
            <div id="onboarding-alert" class="shifts-alert-banner" style="display: none;"></div>

            <!-- ======================================================== -->
            <!-- STEP 1: WELCOME & ORGANISATION PROFILE -->
            <!-- ======================================================== -->
            <div class="onboarding-step-view active" id="step-view-1">
              <div class="step-header">
                <div class="step-kicker">STEP 01 OF 05</div>
                <h2>Welcome to SHIFTS! Let's set up your organisation.</h2>
                <p>Confirm your organisation details and operational preferences to customize your shift scheduling workspace.</p>
              </div>

              <div class="onboarding-form-grid">
                <div class="shifts-form-group">
                  <label for="ob-org-name">Organisation / Company Name <span class="required-star">*</span></label>
                  <input type="text" id="ob-org-name" class="shifts-input" value="${user.companyName || 'Apex Contact Solutions'}" required />
                  <span class="field-hint">Your business name as it will appear across schedules and employee portals.</span>
                </div>

                <div class="shifts-form-group">
                  <label for="ob-manager-name">Account Owner & Primary Manager</label>
                  <input type="text" id="ob-manager-name" class="shifts-input" value="${user.fullName}" readonly />
                  <span class="field-hint">Account owner credentials used for administrative scheduling authority.</span>
                </div>

                <div class="shifts-form-group">
                  <label for="ob-timezone">Operating Timezone</label>
                  <select id="ob-timezone" class="shifts-select">
                    <option value="Asia/Kolkata" selected>Asia/Kolkata (IST · GMT+5:30)</option>
                    <option value="UTC">UTC (GMT+0:00)</option>
                    <option value="America/New_York">America/New_York (EST · GMT-5:00)</option>
                    <option value="Europe/London">Europe/London (BST · GMT+1:00)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT · GMT+8:00)</option>
                  </select>
                  <span class="field-hint">All shift rosters and break schedules will align with this timezone.</span>
                </div>

                <div class="shifts-form-group">
                  <label for="ob-team-size">Estimated Workforce Size</label>
                  <select id="ob-team-size" class="shifts-select">
                    <option value="10-50">10 – 50 Frontline Staff</option>
                    <option value="51-200" selected>51 – 200 Frontline Staff</option>
                    <option value="201-500">201 – 500 Enterprise Specialists</option>
                    <option value="500+">500+ Multi-Site Operations</option>
                  </select>
                </div>
              </div>

              <div class="step-actions-footer">
                <div></div>
                <button type="button" class="shifts-submit-btn step-next-btn" id="btn-step-1-next">
                  <span>Continue to Departments →</span>
                </button>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- STEP 2: CONFIGURE DEPARTMENTS & TEAMS -->
            <!-- ======================================================== -->
            <div class="onboarding-step-view" id="step-view-2">
              <div class="step-header">
                <div class="step-kicker">STEP 02 OF 05</div>
                <h2>Configure Departments & Operational Teams</h2>
                <p>Departments allow you to organize shift schedules, assign managers, and prevent cross-team scheduling clashes.</p>
              </div>

              <div class="dept-manager-section">
                <div class="add-dept-box">
                  <input type="text" id="input-new-dept" class="shifts-input" placeholder="e.g. Warehouse Dispatch, Escalations, Retail Floor" />
                  <button type="button" class="btn-primary" id="btn-add-dept">
                    <span>+ Add Department</span>
                  </button>
                </div>

                <div class="dept-chips-wrapper" id="dept-chips-list">
                  <!-- Rendered dynamically -->
                </div>
                <span class="field-hint">Click the '×' on any department chip to remove it. You can always add more later.</span>
              </div>

              <div class="step-actions-footer">
                <button type="button" class="btn-secondary step-back-btn" data-target="1">
                  <span>← Back</span>
                </button>
                <button type="button" class="shifts-submit-btn step-next-btn" id="btn-step-2-next">
                  <span>Continue to Shift Rotations →</span>
                </button>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- STEP 3: CONFIGURE SHIFT ROTATIONS & TEMPLATES -->
            <!-- ======================================================== -->
            <div class="onboarding-step-view" id="step-view-3">
              <div class="step-header">
                <div class="step-kicker">STEP 03 OF 05</div>
                <h2>Define Shift Rotations & Operating Hours</h2>
                <p>Customize your recurring shift schedules. Our automated constraint solver will use these hours to balance rosters.</p>
              </div>

              <div class="shifts-templates-list" id="shifts-templates-container">
                <!-- Rendered dynamically -->
              </div>

              <div class="add-shift-box-trigger">
                <button type="button" class="btn-secondary" id="btn-add-shift-template">
                  <span>+ Add Custom Shift Template</span>
                </button>
              </div>

              <div class="rest-rule-box">
                <div class="rest-rule-icon">🛡️</div>
                <div class="rest-rule-text">
                  <strong>Statutory 11-Hour Mandatory Rest Enforcement</strong>
                  <span>SHIFTS automatically warns managers if an employee is assigned to a shift with less than 11 hours rest from their previous shift.</span>
                </div>
              </div>

              <div class="step-actions-footer">
                <button type="button" class="btn-secondary step-back-btn" data-target="2">
                  <span>← Back</span>
                </button>
                <button type="button" class="shifts-submit-btn step-next-btn" id="btn-step-3-next">
                  <span>Continue to Team Invitations →</span>
                </button>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- STEP 4: INVITE TEAM MEMBERS / EMPLOYEES -->
            <!-- ======================================================== -->
            <div class="onboarding-step-view" id="step-view-4">
              <div class="step-header">
                <div class="step-kicker">STEP 04 OF 05</div>
                <h2>Invite Your Team to SHIFTS</h2>
                <p>Send secure invitation emails to your frontline staff. They will receive a link to set their password and view their schedules.</p>
              </div>

              <div class="invite-rows-container" id="invite-rows-list">
                <!-- 2 Initial Rows -->
              </div>

              <div class="add-row-action-bar">
                <button type="button" class="btn-secondary" id="btn-add-invite-row">
                  <span>+ Add Another Team Member</span>
                </button>
                <span class="field-hint">You can also invite more staff later from the manager dashboard.</span>
              </div>

              <div class="invite-status-table-wrap" id="invite-results-box" style="display: none;">
                <h4>Sent Invitations Summary:</h4>
                <div id="invite-results-content"></div>
              </div>

              <div class="step-actions-footer">
                <button type="button" class="btn-secondary step-back-btn" data-target="3">
                  <span>← Back</span>
                </button>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <button type="button" class="btn-plain" id="btn-skip-invites">
                    Skip for now
                  </button>
                  <button type="button" class="shifts-submit-btn" id="btn-send-invitations">
                    <span class="btn-text">Send Invitations & Continue →</span>
                    <span class="btn-spinner" style="display: none;"></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- STEP 5: READY TO LAUNCH / ENTER MANAGER WORKSPACE -->
            <!-- ======================================================== -->
            <div class="onboarding-step-view" id="step-view-5">
              <div class="step-header text-center">
                <div class="step-kicker">STEP 05 OF 05</div>
                <div class="success-celebrate-badge">🎉 Ready to Launch!</div>
                <h2>Your Workforce Management Workspace is Configured!</h2>
                <p>Your organisation profile, departments, shift templates, and team invitations are ready. Step inside your Manager Dashboard.</p>
              </div>

              <!-- Setup Summary Card -->
              <div class="onboarding-summary-card">
                <div class="summary-item">
                  <div class="summary-label">Organisation</div>
                  <div class="summary-value" id="sum-org-name">${user.companyName}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Configured Departments</div>
                  <div class="summary-value" id="sum-dept-count">4 Departments</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Active Shift Templates</div>
                  <div class="summary-value" id="sum-shift-count">3 Shifts (Morning, Aft, Night)</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Trial Status</div>
                  <div class="summary-value highlight-green">✓ 15-Day Free Trial Active</div>
                </div>
              </div>

              <!-- Executive Manager Workspace Launchpad -->
              <div class="launch-hero-box">
                <div class="launch-hero-header">
                  <span class="live-dot"></span>
                  <strong>ShiftFlow WFM Engine Ready</strong>
                </div>
                <p>Launch directly into the full ShiftPlanner application to generate weekly schedules, run constraint auto-scheduling, and stagger breaks.</p>
                <button type="button" class="shifts-launch-primary-btn" id="btn-launch-manager-workspace">
                  <span class="launch-icon">${window.getIcon ? window.getIcon('activity', 'icon-md') : '🚀'}</span>
                  <div class="launch-text-wrap">
                    <strong class="launch-main-title">Enter Manager Workspace ↗</strong>
                    <span class="launch-sub-title">Launch ShiftPlanner with genuine administrator credentials via Single-Sign-On</span>
                  </div>
                </button>
              </div>

              <div class="step-actions-footer justify-center" style="margin-top: 24px;">
                <a href="#/industry/shifts" class="btn-secondary" id="btn-go-insigrow-portal">
                  Go to Insigrow Executive Overview
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.bindEvents(container, user);
  },

  bindEvents(container, user) {
    let currentStep = 1;
    let departments = ['Customer Support', 'Operations', 'Logistics', 'Quality Assurance'];
    let shiftTemplates = [
      { id: 'shift-1', name: 'Morning Shift', start: '07:00', end: '15:30', breakMins: 60, days: 'Mon - Sun' },
      { id: 'shift-2', name: 'Afternoon Shift', start: '15:00', end: '23:30', breakMins: 60, days: 'Mon - Sun' },
      { id: 'shift-3', name: 'Night Shift', start: '23:00', end: '07:30', breakMins: 60, days: 'Mon - Sun' }
    ];
    let sentInvitations = [];

    const alertBox = container.querySelector('#onboarding-alert');
    const showAlert = (message, type = 'error') => {
      alertBox.className = `shifts-alert-banner ${type}`;
      alertBox.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'} ${message}</span>`;
      alertBox.style.display = 'flex';
    };
    const hideAlert = () => alertBox.style.display = 'none';

    // Step Transition Function
    const goToStep = (step) => {
      hideAlert();
      currentStep = step;

      // Update stepper circles
      container.querySelectorAll('.stepper-step').forEach(el => {
        const s = parseInt(el.getAttribute('data-step'), 10);
        el.classList.toggle('active', s === step);
        el.classList.toggle('completed', s < step);
      });

      // Update views
      container.querySelectorAll('.onboarding-step-view').forEach(view => {
        view.classList.remove('active');
      });
      const targetView = container.querySelector(`#step-view-${step}`);
      if (targetView) targetView.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Navigation Buttons
    container.querySelectorAll('.step-back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-target'), 10);
        goToStep(target);
      });
    });

    // STEP 1 -> STEP 2
    const btnStep1Next = container.querySelector('#btn-step-1-next');
    btnStep1Next.addEventListener('click', () => {
      const orgName = container.querySelector('#ob-org-name').value.trim();
      if (!orgName) {
        showAlert('Please provide your Organisation Name.');
        return;
      }
      goToStep(2);
    });

    // STEP 2: Department Management
    const deptChipsContainer = container.querySelector('#dept-chips-list');
    const inputNewDept = container.querySelector('#input-new-dept');
    const btnAddDept = container.querySelector('#btn-add-dept');

    const renderDeptChips = () => {
      deptChipsContainer.innerHTML = departments.map((d, idx) => `
        <div class="dept-chip">
          <span>${d}</span>
          <button type="button" class="btn-remove-chip" data-idx="${idx}" title="Remove department">×</button>
        </div>
      `).join('');

      deptChipsContainer.querySelectorAll('.btn-remove-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          departments.splice(idx, 1);
          renderDeptChips();
        });
      });
    };

    renderDeptChips();

    btnAddDept.addEventListener('click', () => {
      const val = inputNewDept.value.trim();
      if (val && !departments.includes(val)) {
        departments.push(val);
        inputNewDept.value = '';
        renderDeptChips();
      }
    });

    inputNewDept.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnAddDept.click();
      }
    });

    const btnStep2Next = container.querySelector('#btn-step-2-next');
    btnStep2Next.addEventListener('click', () => {
      if (!departments.length) {
        showAlert('Please add at least one department.');
        return;
      }
      renderShiftTemplates();
      goToStep(3);
    });

    // STEP 3: Shift Templates Management
    const shiftTemplatesContainer = container.querySelector('#shifts-templates-container');
    const btnAddShiftTemplate = container.querySelector('#btn-add-shift-template');

    const renderShiftTemplates = () => {
      shiftTemplatesContainer.innerHTML = shiftTemplates.map((s, idx) => `
        <div class="shift-template-card" data-idx="${idx}">
          <div class="template-header">
            <span class="template-name">${s.name}</span>
            <button type="button" class="btn-remove-template" data-idx="${idx}">Remove</button>
          </div>
          <div class="template-fields-row">
            <div class="template-field">
              <label>Start Time</label>
              <input type="time" class="shifts-input input-shift-start" value="${s.start}" data-idx="${idx}" />
            </div>
            <div class="template-field">
              <label>End Time</label>
              <input type="time" class="shifts-input input-shift-end" value="${s.end}" data-idx="${idx}" />
            </div>
            <div class="template-field">
              <label>Break</label>
              <select class="shifts-select select-shift-break" data-idx="${idx}">
                <option value="30" ${s.breakMins === 30 ? 'selected' : ''}>30 Mins</option>
                <option value="45" ${s.breakMins === 45 ? 'selected' : ''}>45 Mins</option>
                <option value="60" ${s.breakMins === 60 ? 'selected' : ''}>60 Mins</option>
              </select>
            </div>
          </div>
        </div>
      `).join('');

      shiftTemplatesContainer.querySelectorAll('.btn-remove-template').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          shiftTemplates.splice(idx, 1);
          renderShiftTemplates();
        });
      });

      shiftTemplatesContainer.querySelectorAll('.input-shift-start').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          shiftTemplates[idx].start = input.value;
        });
      });

      shiftTemplatesContainer.querySelectorAll('.input-shift-end').forEach(input => {
        input.addEventListener('change', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          shiftTemplates[idx].end = input.value;
        });
      });

      shiftTemplatesContainer.querySelectorAll('.select-shift-break').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.getAttribute('data-idx'), 10);
          shiftTemplates[idx].breakMins = parseInt(sel.value, 10);
        });
      });
    };

    renderShiftTemplates();

    btnAddShiftTemplate.addEventListener('click', () => {
      const newNum = shiftTemplates.length + 1;
      shiftTemplates.push({
        id: `shift-custom-${Date.now()}`,
        name: `Custom Shift ${newNum}`,
        start: '09:00',
        end: '17:30',
        breakMins: 45,
        days: 'Mon - Fri'
      });
      renderShiftTemplates();
    });

    const btnStep3Next = container.querySelector('#btn-step-3-next');
    btnStep3Next.addEventListener('click', () => {
      if (!shiftTemplates.length) {
        showAlert('Please maintain at least one shift template.');
        return;
      }
      renderInviteRows();
      goToStep(4);
    });

    // STEP 4: Invite Frontline Employees
    const inviteRowsContainer = container.querySelector('#invite-rows-list');
    const btnAddInviteRow = container.querySelector('#btn-add-invite-row');
    const btnSendInvites = container.querySelector('#btn-send-invitations');
    const btnSkipInvites = container.querySelector('#btn-skip-invites');

    let inviteRowsData = [
      { name: 'Marcus Brody', email: 'marcus.b@enterprisegrowth.com', role: 'Support Specialist', dept: departments[0] || 'Operations' },
      { name: 'Sarah Jenkins', email: 'sarah.j@enterprisegrowth.com', role: 'Frontline Associate', dept: departments[1] || 'Operations' }
    ];

    const renderInviteRows = () => {
      inviteRowsContainer.innerHTML = inviteRowsData.map((row, idx) => `
        <div class="invite-form-row" data-idx="${idx}">
          <input type="text" class="shifts-input inv-name" placeholder="Full Name" value="${row.name}" data-idx="${idx}" />
          <input type="email" class="shifts-input inv-email" placeholder="Corporate / Work Email" value="${row.email}" data-idx="${idx}" />
          <select class="shifts-select inv-role" data-idx="${idx}">
            <option value="Support Specialist" ${row.role === 'Support Specialist' ? 'selected' : ''}>Support Specialist</option>
            <option value="Team Lead" ${row.role === 'Team Lead' ? 'selected' : ''}>Team Lead</option>
            <option value="Frontline Associate" ${row.role === 'Frontline Associate' ? 'selected' : ''}>Frontline Associate</option>
            <option value="Senior Specialist" ${row.role === 'Senior Specialist' ? 'selected' : ''}>Senior Specialist</option>
          </select>
          <select class="shifts-select inv-dept" data-idx="${idx}">
            ${departments.map(d => `<option value="${d}" ${d === row.dept ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <button type="button" class="btn-remove-invite-row" data-idx="${idx}" title="Remove row">×</button>
        </div>
      `).join('');

      inviteRowsContainer.querySelectorAll('.btn-remove-invite-row').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          inviteRowsData.splice(idx, 1);
          renderInviteRows();
        });
      });

      inviteRowsContainer.querySelectorAll('.inv-name').forEach(input => {
        input.addEventListener('input', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          inviteRowsData[idx].name = input.value;
        });
      });

      inviteRowsContainer.querySelectorAll('.inv-email').forEach(input => {
        input.addEventListener('input', () => {
          const idx = parseInt(input.getAttribute('data-idx'), 10);
          inviteRowsData[idx].email = input.value;
        });
      });

      inviteRowsContainer.querySelectorAll('.inv-role').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.getAttribute('data-idx'), 10);
          inviteRowsData[idx].role = sel.value;
        });
      });

      inviteRowsContainer.querySelectorAll('.inv-dept').forEach(sel => {
        sel.addEventListener('change', () => {
          const idx = parseInt(sel.getAttribute('data-idx'), 10);
          inviteRowsData[idx].dept = sel.value;
        });
      });
    };

    btnAddInviteRow.addEventListener('click', () => {
      inviteRowsData.push({
        name: '',
        email: '',
        role: 'Support Specialist',
        dept: departments[0] || 'Operations'
      });
      renderInviteRows();
    });

    // Send Invitations
    btnSendInvites.addEventListener('click', async () => {
      hideAlert();
      const validInvites = inviteRowsData.filter(r => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim()));

      if (!validInvites.length) {
        showAlert('Please provide at least one valid employee email address.');
        return;
      }

      btnSendInvites.disabled = true;
      btnSendInvites.querySelector('.btn-text').textContent = 'Dispatching Invitations...';
      btnSendInvites.querySelector('.btn-spinner').style.display = 'inline-block';

      try {
        const payload = validInvites.map(r => ({
          fullName: r.name || r.email.split('@')[0],
          email: r.email.trim(),
          role: r.role,
          department: r.dept
        }));

        const res = await window.api.createInvitations(payload);

        if (res && res.success) {
          sentInvitations = res.invitations || [];
          showAlert(`Successfully sent ${sentInvitations.length} employee invitation(s)!`, 'success');

          // Display status box
          const resultsBox = container.querySelector('#invite-results-box');
          const resultsContent = container.querySelector('#invite-results-content');
          if (resultsBox && resultsContent) {
            resultsContent.innerHTML = sentInvitations.map(inv => `
              <div class="invite-result-row">
                <div>
                  <strong>${inv.fullName}</strong> (${inv.email}) · ${inv.department}
                </div>
                <div class="invite-link-copy-wrap">
                  <span class="invite-status-pill pending">Invitation Pending</span>
                  ${inv.previewUrl ? `<a href="${inv.previewUrl}" target="_blank" class="preview-mail-btn">View Test Email ↗</a>` : ''}
                </div>
              </div>
            `).join('');
            resultsBox.style.display = 'block';
          }

          setTimeout(() => {
            goToFinalStep();
          }, 1500);
        } else {
          throw new Error(res.message || 'Failed to dispatch invitations.');
        }
      } catch (err) {
        const msg = err.data && err.data.message ? err.data.message : err.message || 'Failed to send invitations.';
        showAlert(msg, 'error');
      } finally {
        btnSendInvites.disabled = false;
        btnSendInvites.querySelector('.btn-text').textContent = 'Send Invitations & Continue →';
        btnSendInvites.querySelector('.btn-spinner').style.display = 'none';
      }
    });

    btnSkipInvites.addEventListener('click', () => {
      goToFinalStep();
    });

    const goToFinalStep = async () => {
      // Update Summary Cards
      const orgName = container.querySelector('#ob-org-name').value.trim() || user.companyName;
      container.querySelector('#sum-org-name').textContent = orgName;
      container.querySelector('#sum-dept-count').textContent = `${departments.length} Departments (${departments.slice(0, 2).join(', ')}...)`;
      container.querySelector('#sum-shift-count').textContent = `${shiftTemplates.length} Active Shifts`;

      // Persist Onboarding Configuration
      try {
        await window.api.completeOnboarding({
          organizationProfile: {
            name: orgName,
            timezone: container.querySelector('#ob-timezone').value,
            teamSize: container.querySelector('#ob-team-size').value
          },
          departments,
          shiftTemplates
        });
      } catch (_) {}

      goToStep(5);

      if (typeof window.triggerConfetti === 'function') {
        window.triggerConfetti();
      }
    };

    // STEP 5: Launch Manager Workspace via SSO
    const btnLaunchWorkspace = container.querySelector('#btn-launch-manager-workspace');
    btnLaunchWorkspace.addEventListener('click', async () => {
      const origHtml = btnLaunchWorkspace.innerHTML;
      btnLaunchWorkspace.disabled = true;
      btnLaunchWorkspace.innerHTML = `
        <span class="spinner spinner-dark" style="width: 20px; height: 20px;"></span>
        <div class="launch-text-wrap">
          <strong class="launch-main-title">Connecting to ShiftPlanner...</strong>
          <span class="launch-sub-title">Generating cryptographically signed launch token</span>
        </div>
      `;

      try {
        const res = await window.api.getShiftsLaunchToken('MANAGER', '/overview');
        if (res && res.success && res.launchUrl) {
          window.open(res.launchUrl, '_blank');
        } else {
          throw new Error(res.message || 'Failed to obtain launch token.');
        }
      } catch (err) {
        showAlert(err.message || 'Launch error occurred.', 'error');
      } finally {
        btnLaunchWorkspace.disabled = false;
        btnLaunchWorkspace.innerHTML = origHtml;
      }
    });
  }
};

window.ShiftsOnboardingView = ShiftsOnboardingView;

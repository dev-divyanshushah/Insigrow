/**
 * Insigrow Industry Portal - 15-Day Free Trial Modal
 * Handles trial activation confirmation and real-time state updates
 */

const TrialModal = {
  INDUSTRY_LABELS: {
    fmcg: { title: 'FMCG & Consumer Goods', scope: 'demand forecasting, stock turnover models, and beat analytics' },
    ca: { title: 'Chartered Accountants & Advisory', scope: 'statutory ROC tracking, audit workpapers, and financial ratio analysis' },
    manufacturing: { title: 'Manufacturing Operations', scope: 'downtime root cause telemetry, yield regression models, and OEE diagnostics' },
    b2b: { title: 'B2B Enterprise Growth', scope: 'ASC 606 revenue waterfall schedules, deal slippage alerts, and sales quota intelligence' },
    shifts: { title: 'SHIFTS Workforce & Shift Management', scope: 'constraint-based auto-scheduling, Erlang-C demand planning, conflict auto-resolution, and full ShiftPlanner integration' }
  },

  open(industryKey, onActivated) {
    const info = this.INDUSTRY_LABELS[industryKey] || { title: industryKey.toUpperCase(), scope: 'advanced industry analytics' };

    let modal = document.getElementById('modal-trial-confirm');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'modal-trial-confirm';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">
            <span style="color: var(--color-primary); display: flex; align-items: center;">
              ${window.getIcon('sparkles')}
            </span>
            <span>Activate 15-Day Free Trial</span>
          </div>
          <button class="modal-close-btn" id="btn-close-trial-modal">
            ${window.getIcon('x')}
          </button>
        </div>

        <div class="modal-body">
          <div style="background: var(--color-primary-light); border: 1px solid var(--color-primary-border); border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 16px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em;">Target Industry Module</div>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--color-primary-dark);">${info.title}</div>
          </div>

          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
            You are about to activate a complimentary <strong>15-day full-access trial</strong> for the <strong>${info.title}</strong> solution.
          </p>

          <ul class="modal-checklist">
            <li class="modal-checklist-item">
              <span class="check-icon-circle">${window.getIcon('check', 'icon-sm')}</span>
              <div><strong>Unlock Full Premium Features:</strong> Immediate access to ${info.scope}.</div>
            </li>
            <li class="modal-checklist-item">
              <span class="check-icon-circle">${window.getIcon('check', 'icon-sm')}</span>
              <div><strong>Independent Duration:</strong> Valid for exactly 15 calendar days from now, without affecting your other industry modules.</div>
            </li>
            <li class="modal-checklist-item">
              <span class="check-icon-circle">${window.getIcon('check', 'icon-sm')}</span>
              <div><strong>Zero Cost & Commitment:</strong> No credit card or billing details required.</div>
            </li>
            <li class="modal-checklist-item">
              <span class="check-icon-circle">${window.getIcon('check', 'icon-sm')}</span>
              <div><strong>Persistent Storage:</strong> Your trial timer runs continuously on our cloud backend and remains active across browser refreshes and logins.</div>
            </li>
          </ul>

          <div id="trial-modal-alert"></div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" id="btn-cancel-trial">Cancel</button>
          <button class="btn-primary" id="btn-confirm-trial">
            ${window.getIcon('sparkles', 'icon-sm')}
            <span>Confirm & Activate 15-Day Trial</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#btn-close-trial-modal').addEventListener('click', close);
    modal.querySelector('#btn-cancel-trial').addEventListener('click', close);

    const btnConfirm = modal.querySelector('#btn-confirm-trial');
    btnConfirm.addEventListener('click', async () => {
      btnConfirm.disabled = true;
      btnConfirm.innerHTML = `<span class="spinner"></span> <span>Activating Trial...</span>`;

      try {
        const res = await window.api.activateTrial(industryKey);
        window.appState.setTrials(res.trials);
        if (typeof window.triggerConfetti === 'function') {
          window.triggerConfetti();
        }
        window.appState.showToast(`🎉 15-Day Free Trial activated for ${info.title}!`, 'success');
        close();

        if (typeof onActivated === 'function') {
          onActivated(res.trial);
        }
      } catch (err) {
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = `<span>Confirm & Activate 15-Day Trial</span>`;
        const alertBox = modal.querySelector('#trial-modal-alert');
        const msg = err.data && err.data.message ? err.data.message : err.message || 'Trial activation failed.';
        alertBox.innerHTML = `
          <div class="alert-banner error" style="margin-top: 12px; margin-bottom: 0;">
            ${window.getIcon('alertTriangle', 'icon')}
            <div>${msg}</div>
          </div>
        `;
      }
    });
  }
};

window.TrialModal = TrialModal;


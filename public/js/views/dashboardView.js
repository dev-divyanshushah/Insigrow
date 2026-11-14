/**
 * Insigrow Industry Portal - Dashboard Header & Layout
 * Implements the original light-themed Insigrow navigation header
 * with an elegant user account dropdown, followed by a balanced 5-solution selector.
 */

const DashboardView = {
  INDUSTRIES: [
    { id: 'fmcg', num: '01', label: 'FMCG', subLabel: 'Consumer Goods', fullLabel: 'Fast-Moving Consumer Goods', icon: 'package' },
    { id: 'manufacturing', num: '02', label: 'Manufacturing', subLabel: 'Production & Operations', fullLabel: 'Industrial Manufacturing Solutions', icon: 'cpu' },
    { id: 'b2b', num: '03', label: 'B2B Enterprise', subLabel: 'Business Solutions', fullLabel: 'B2B Enterprise Growth Platform', icon: 'briefcase' },
    { id: 'ca', num: '04', label: 'Finance', subLabel: 'CA & Advisory', fullLabel: 'Finance & Advisory Solutions', icon: 'fileText' },
    { id: 'shifts', num: '05', label: 'SHIFTS', subLabel: 'Workforce & Shifts', fullLabel: 'Workforce & Shift Management', icon: 'calendar' }
  ],

  renderHeader(container, activeIndustry, user, trials) {
    const existingHeader = container.querySelector('.insigrow-site-header');
    const existingSelector = container.querySelector('.dashboard-solutions-bar');

    if (existingHeader && existingSelector) {
      // Update active nav links in header
      existingHeader.querySelectorAll('.header-nav-item').forEach(link => {
        const ind = link.getAttribute('data-nav');
        link.classList.toggle('active', ind === activeIndustry);
      });

      // Update active cards in 5-solution selector
      existingSelector.querySelectorAll('.solution-selector-card').forEach(card => {
        const ind = card.getAttribute('data-industry');
        const isActive = ind === activeIndustry;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-selected', isActive ? 'true' : 'false');

        const activeIndicator = card.querySelector('.card-active-indicator');
        if (activeIndicator) {
          activeIndicator.classList.toggle('visible', isActive);
        }
        const activeBar = card.querySelector('.card-active-bar');
        if (activeBar) {
          activeBar.classList.toggle('active', isActive);
        }

        // Sync 15-day trial pill
        const trial = trials ? trials[ind] : null;
        let trialTag = card.querySelector('.card-trial-tag');
        if (trial && trial.isTrialActive) {
          if (!trialTag) {
            const numRow = card.querySelector('.card-num-row');
            if (numRow) {
              trialTag = document.createElement('span');
              trialTag.className = 'card-trial-tag';
              trialTag.title = `15-Day Free Trial Active (${trial.daysRemaining}d left)`;
              trialTag.innerHTML = `<span class="trial-dot"></span> 15D TRIAL`;
              numRow.insertBefore(trialTag, numRow.querySelector('.card-active-indicator'));
            }
          }
        } else if (trialTag) {
          trialTag.remove();
        }
      });
      return;
    }

    container.innerHTML = `
      <div class="dashboard-shell-layout">
        <!-- 1. Universal Light-Themed Insigrow Header (Phase 2) -->
        ${window.HeaderView ? window.HeaderView.render({
          activeNav: activeIndustry,
          mode: 'dashboard',
          user
        }) : ''}

        <!-- 2. Balanced Five-Solution Selector Bar (Phase 3) -->
        <section class="dashboard-solutions-bar" aria-label="Business Solutions Selector">
          <div class="solutions-bar-inner">
            <div class="solutions-grid-five" role="tablist">
              ${this.INDUSTRIES.map(ind => {
                const isActive = ind.id === activeIndustry;
                const trial = trials ? trials[ind.id] : null;
                const isTrialActive = trial && trial.isTrialActive;

                return `
                  <button 
                    class="solution-selector-card ${ind.id} ${isActive ? 'active' : ''}" 
                    data-industry="${ind.id}"
                    type="button"
                    role="tab"
                    aria-selected="${isActive}"
                    title="Switch to ${ind.label} Workspace"
                  >
                    <div class="card-num-row">
                      <span class="card-num">${ind.num}</span>
                      ${isTrialActive ? `
                        <span class="card-trial-tag" title="15-Day Free Trial Active (${trial.daysRemaining}d left)">
                          <span class="trial-dot"></span> 15D TRIAL
                        </span>
                      ` : ''}
                      <span class="card-active-indicator ${isActive ? 'visible' : ''}">Active</span>
                    </div>

                    <div class="card-content-row">
                      <div class="card-icon-box ${ind.id}">
                        ${window.getIcon(ind.icon, 'icon-md')}
                      </div>
                      <div class="card-text-block">
                        <h4 class="card-title">${ind.label}</h4>
                        <p class="card-sub">${ind.subLabel}</p>
                      </div>
                    </div>

                    <div class="card-active-bar ${isActive ? 'active' : ''}"></div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </section>

        <!-- 3. Main Dynamic Content Container for Industry Workspace -->
        <main class="page-container" id="industry-content-container"></main>

        <!-- 4. Enterprise Website Footer with "Powered by Ei8" -->
        <footer class="app-footer">
          <div class="footer-inner">
            <div class="footer-top-grid">
              <div class="footer-brand-column">
                <div class="footer-powered-wrap">
                  <span class="powered-by-label">Powered by</span>
                  <img src="/ei8-logo.png" alt="Ei8 Logo" class="footer-ei8-img" />
                </div>
                <p class="footer-desc">
                  Enterprise Management System (EMS) providing dedicated industry solutions for Fast-Moving Consumer Goods, Industrial Manufacturing, B2B Enterprise, Finance, and Workforce & Shift Management.
                </p>
                <div class="footer-badge-strip">
                  <span class="footer-status-indicator"></span>
                  <span>All enterprise systems operational • 15-Day Free Evaluation Active</span>
                </div>
              </div>

              <div class="footer-nav-col">
                <h4 class="footer-col-title">Industry Solutions</h4>
                <a href="#/industry/fmcg">FMCG & Consumer Goods</a>
                <a href="#/industry/manufacturing">Industrial Manufacturing</a>
                <a href="#/industry/b2b">B2B Enterprise Growth</a>
                <a href="#/industry/ca">Finance & Advisory</a>
                <a href="#/industry/shifts">SHIFTS Workforce Management</a>
              </div>

              <div class="footer-nav-col">
                <h4 class="footer-col-title">15-Day Free Trials</h4>
                <a href="#/industry/fmcg">FMCG Demand Forecast Trial</a>
                <a href="#/industry/manufacturing">Plant OEE Telemetry Trial</a>
                <a href="#/industry/b2b">ASC 606 Revenue Waterfall Trial</a>
                <a href="#/industry/ca">Finance Statutory & Tax Trial</a>
                <a href="#/industry/shifts">SHIFTS Intelligent Scheduling Trial</a>
              </div>

              <div class="footer-nav-col">
                <h4 class="footer-col-title">Platform Ecosystem</h4>
                <a href="#/landing">Public Platform Overview</a>
                <a href="https://insigrow.in" target="_blank" rel="noopener">Insigrow EMS Platform</a>
                <a href="https://insigrow.in" target="_blank" rel="noopener">Lead & Deal Tracking</a>
                <a href="https://insigrow.in" target="_blank" rel="noopener">Customer 360 & Timeline</a>
              </div>
            </div>

            <div class="footer-divider"></div>

            <div class="footer-bottom-bar">
              <div class="footer-powered-inline">
                <span class="powered-by-tag">Powered by</span>
                <img src="/ei8-logo.png" alt="Ei8 Logo" class="footer-inline-ei8-img" />
                <span class="footer-separator">•</span>
                <span class="footer-rights">© 2026 Ei8 Technologies. All rights reserved.</span>
              </div>
              <div class="footer-pills-row">
                <span class="footer-pill cyan">Enterprise Grade</span>
                <span class="footer-pill green">15-Day Free Trials</span>
                <span class="footer-pill orchid">5 Business Disciplines</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Initialize Header Events
    if (window.HeaderView && window.HeaderView.initEvents) {
      window.HeaderView.initEvents(container);
    }

    // Bind 5-Solution Selector Card Clicks
    container.querySelectorAll('.solution-selector-card').forEach(card => {
      card.addEventListener('click', () => {
        const ind = card.getAttribute('data-industry');
        if (ind && ind !== window.appState.activeIndustry) {
          window.location.hash = `#/industry/${ind}`;
        }
      });
    });
  }
};

window.DashboardView = DashboardView;

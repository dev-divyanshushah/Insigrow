/**
 * Insigrow Industry Portal - Dashboard Header & Layout
 * New Visual Concept: Enterprise Command Header (Two-Tier Command System)
 * Top: Full-Width Deep Navy Branding Bar (#14243B) with original INSIGROW logo & User Profile
 * Bottom: Large Individual Industry Navigation Cards Grid with Spring Physics
 */

const DashboardView = {
  INDUSTRIES: [
    { id: 'fmcg', num: '01', label: 'FMCG', subLabel: 'Consumer Goods', fullLabel: 'Fast-Moving Consumer Goods', icon: 'package' },
    { id: 'ca', num: '02', label: 'Finance', subLabel: 'CA & Advisory', fullLabel: 'Finance & Advisory Solutions', icon: 'fileText' },
    { id: 'manufacturing', num: '03', label: 'Manufacturing', subLabel: 'Production & Operations', fullLabel: 'Industrial Manufacturing Solutions', icon: 'cpu' },
    { id: 'b2b', num: '04', label: 'B2B Enterprise', subLabel: 'Business Solutions', fullLabel: 'B2B Enterprise Growth Platform', icon: 'briefcase' }
  ],

  renderHeader(container, activeIndustry, user, trials) {
    const initials = user && user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const existingHeader = container.querySelector('.cmd-enterprise-header') || container.querySelector('.app-header');
    if (existingHeader) {
      // Smoothly update tab states without rebuilding DOM
      existingHeader.querySelectorAll('.cmd-industry-tile, .industry-nav-item').forEach(btn => {
        const ind = btn.getAttribute('data-industry');
        const isActive = ind === activeIndustry;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');

        const activeBadge = btn.querySelector('.cmd-active-badge');
        if (activeBadge) {
          activeBadge.classList.toggle('visible', isActive);
        }

        const iconBox = btn.querySelector('.cmd-tile-icon-box');
        if (iconBox) {
          iconBox.classList.toggle('active', isActive);
        }

        const bottomLine = btn.querySelector('.cmd-tile-bottom-line');
        if (bottomLine) {
          bottomLine.classList.toggle('active', isActive);
        }

        // Sync 15-day trial pill
        const trial = trials ? trials[ind] : null;
        let trialPill = btn.querySelector('.cmd-trial-pill');
        if (trial && trial.isTrialActive) {
          if (!trialPill) {
            const statusContainer = btn.querySelector('.cmd-tile-status');
            if (statusContainer) {
              trialPill = document.createElement('span');
              trialPill.className = 'cmd-trial-pill';
              trialPill.title = `15-Day Free Trial Active (${trial.daysRemaining}d left)`;
              trialPill.innerHTML = '<span class="trial-pulse-dot"></span><span>15D TRIAL</span>';
              statusContainer.insertBefore(trialPill, statusContainer.firstChild);
            }
          }
        } else if (trialPill) {
          trialPill.remove();
        }
      });

      // Update sliding indicator position
      const navEl = existingHeader.querySelector('.cmd-industry-nav');
      const indEl = existingHeader.querySelector('#cmd-sliding-indicator');
      if (navEl && indEl) {
        const activeTile = navEl.querySelector('.cmd-industry-tile.active');
        if (activeTile) {
          const navRect = navEl.getBoundingClientRect();
          const tileRect = activeTile.getBoundingClientRect();
          const offsetLeft = tileRect.left - navRect.left + navEl.scrollLeft;
          indEl.style.width = `${tileRect.width}px`;
          indEl.style.transform = `translateX(${offsetLeft}px)`;
          indEl.style.opacity = '1';
        }
      }
      return;
    }

    container.innerHTML = `
      <header class="app-header cmd-enterprise-header">
        <!-- TOP SECTION – DARK BRANDING BAR (Full width #14243B) -->
        <div class="cmd-top-bar">
          <div class="cmd-top-inner">
            <!-- Left: Original INSIGROW Logo, Brand Name & Tagline -->
            <div class="cmd-brand-group">
              <a href="#/dashboard" class="cmd-brand-link" title="Insigrow Enterprise Solutions Platform">
                <img 
                  src="/insigrow-mark.png"
                  alt="Insigrow Logo" 
                  class="cmd-brand-logo" 
                  onerror="this.onerror=null; this.src='/insigrow-mark.png';"
                />
                <div class="cmd-brand-text">
                  <span class="cmd-brand-name">INSIGROW</span>
                  <span class="cmd-brand-tagline">ENTERPRISE MANAGEMENT PLATFORM</span>
                </div>
              </a>
            </div>

            <!-- Right: User Avatar, Name, Org & Sign Out -->
            <div class="cmd-user-group">
              <div class="cmd-profile-card" title="${user.email}">
                <div class="cmd-avatar-ring">
                  <div class="cmd-user-avatar">${initials}</div>
                </div>
                <div class="cmd-user-meta">
                  <span class="cmd-user-name">${user.fullName}</span>
                  <span class="cmd-user-org">${user.companyName || 'Enterprise Member'}</span>
                </div>
              </div>

              <button id="btn-header-signout" class="cmd-signout-btn" type="button" title="Sign out of portal">
                ${window.getIcon('logOut', 'icon-xs')}
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        <!-- BOTTOM SECTION – INDUSTRY SELECTOR (Large Individual Navigation Tiles) -->
        <div class="cmd-bottom-bar">
          <div class="cmd-bottom-inner">
            <nav class="cmd-industry-nav" aria-label="Industry Solutions Command Grid" role="tablist">
              <!-- Moving Gliding Active Accent Indicator -->
              <div class="cmd-sliding-indicator" id="cmd-sliding-indicator" aria-hidden="true"></div>

              ${this.INDUSTRIES.map(ind => {
                const isActive = ind.id === activeIndustry;
                const trial = trials ? trials[ind.id] : null;
                const isTrialActive = trial && trial.isTrialActive;

                return `
                  <button 
                    class="cmd-industry-tile industry-nav-item ${isActive ? 'active' : ''}" 
                    data-industry="${ind.id}"
                    title="${ind.fullLabel}"
                    type="button"
                    role="tab"
                    aria-selected="${isActive}"
                  >
                    <div class="cmd-tile-header">
                      <span class="cmd-tile-num">${ind.num}</span>
                      <div class="cmd-tile-status">
                        ${isTrialActive ? `
                          <span class="cmd-trial-pill" title="15-Day Free Trial Active (${trial.daysRemaining}d left)">
                            <span class="trial-pulse-dot"></span>
                            <span>15D TRIAL</span>
                          </span>
                        ` : ''}
                        <span class="cmd-active-badge ${isActive ? 'visible' : ''}">
                          <span class="cmd-active-dot"></span>
                          <span>ACTIVE</span>
                        </span>
                      </div>
                    </div>

                    <div class="cmd-tile-body">
                      <div class="cmd-tile-icon-box ${isActive ? 'active' : ''}">
                        ${window.getIcon(ind.icon, 'icon-md')}
                      </div>
                      <div class="cmd-tile-info">
                        <div class="cmd-tile-title">${ind.label}</div>
                        <div class="cmd-tile-sub">${ind.subLabel}</div>
                      </div>
                    </div>

                    <div class="cmd-tile-bottom-line ${isActive ? 'active' : ''}"></div>
                  </button>
                `;
              }).join('')}
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content Container for Industry Page -->
      <main class="page-container" id="industry-content-container"></main>

      <!-- Enterprise Website Footer with "Powered by Ei8" and the Ei8 Logo -->
      <footer class="app-footer">
        <div class="footer-inner">
          <div class="footer-top-grid">
            <div class="footer-brand-column">
              <div class="footer-powered-wrap">
                <span class="powered-by-label">Powered by</span>
                <img src="/ei8-logo.png" alt="Ei8 Logo" class="footer-ei8-img" />
              </div>
              <p class="footer-desc">
                Enterprise Management System (EMS) providing dedicated industry solutions for Fast-Moving Consumer Goods, Finance, Industrial Manufacturing, and B2B sectors.
              </p>
              <div class="footer-badge-strip">
                <span class="footer-status-indicator"></span>
                <span>All systems operational • 15-Day Free Evaluation Active</span>
              </div>
            </div>

            <div class="footer-nav-col">
              <h4 class="footer-col-title">Industry Solutions</h4>
              <a href="#/industry/fmcg">FMCG & Consumer Goods</a>
              <a href="#/industry/ca">Finance & Advisory</a>
              <a href="#/industry/manufacturing">Industrial Manufacturing</a>
              <a href="#/industry/b2b">B2B Enterprise Growth</a>
            </div>

            <div class="footer-nav-col">
              <h4 class="footer-col-title">15-Day Free Trials</h4>
              <a href="#/industry/fmcg">FMCG Demand Forecast Trial</a>
              <a href="#/industry/ca">Finance Statutory & Tax Trial</a>
              <a href="#/industry/manufacturing">Plant OEE Telemetry Trial</a>
              <a href="#/industry/b2b">ASC 606 Revenue Waterfall Trial</a>
            </div>

            <div class="footer-nav-col">
              <h4 class="footer-col-title">Platform Ecosystem</h4>
              <a href="#/dashboard">Solutions Dashboard</a>
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
              <span class="footer-pill orchid">Multi-Industry Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    `;

    // Setup animated sliding indicator for the large navigation tiles
    const navEl = container.querySelector('.cmd-industry-nav');
    const indEl = container.querySelector('#cmd-sliding-indicator');

    const updateSlidingIndicator = () => {
      if (!navEl || !indEl) return;
      const activeTile = navEl.querySelector('.cmd-industry-tile.active');
      if (activeTile) {
        const navRect = navEl.getBoundingClientRect();
        const tileRect = activeTile.getBoundingClientRect();
        const offsetLeft = tileRect.left - navRect.left + navEl.scrollLeft;
        indEl.style.width = `${tileRect.width}px`;
        indEl.style.transform = `translateX(${offsetLeft}px)`;
        indEl.style.opacity = '1';
      } else {
        indEl.style.opacity = '0';
      }
    };

    requestAnimationFrame(updateSlidingIndicator);
    setTimeout(updateSlidingIndicator, 60);
    setTimeout(updateSlidingIndicator, 250);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateSlidingIndicator);
    }
    window.updateSlidingIndicator = updateSlidingIndicator;
    window.addEventListener('resize', updateSlidingIndicator, { passive: true });

    // Setup scroll listener for subtle header elevation
    if (!window._cmdHeaderScrollBound) {
      window._cmdHeaderScrollBound = true;
      window.addEventListener('scroll', () => {
        const header = document.querySelector('.cmd-enterprise-header');
        if (header) {
          if (window.scrollY > 20) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }
      }, { passive: true });
    }

    // Bind navigation tile clicks
    container.querySelectorAll('.cmd-industry-tile, .industry-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const ind = btn.getAttribute('data-industry');
        if (ind && ind !== window.appState.activeIndustry) {
          window.location.hash = `#/industry/${ind}`;
        }
      });
    });

    // Bind Sign Out
    const signoutBtn = container.querySelector('#btn-header-signout');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', async () => {
        try {
          await window.api.logout();
          window.appState.setUser(null);
          window.appState.setTrials({});
          window.appState.showToast('Signed out successfully.', 'info');
          window.location.hash = '#/login';
        } catch (err) {
          window.location.hash = '#/login';
        }
      });
    }
  }
};

window.DashboardView = DashboardView;

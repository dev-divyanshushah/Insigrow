/**
 * Insigrow Industry Portal - Universal Enterprise Header Component
 * Light-themed, elegant SaaS header based on original Insigrow design reference.
 * Supports both public visitor state and authenticated user dropdown.
 */

const HeaderView = {
  /**
   * Renders the universal light-themed Insigrow header
   * @param {Object} options
   * @param {string} options.activeNav - 'fmcg' | 'manufacturing' | 'b2b' | 'ca' | 'shifts' | ''
   * @param {string} options.mode - 'public' | 'dashboard'
   * @param {Object} options.user - authenticated user or null
   */
  render(options = {}) {
    const { activeNav = '', mode = 'public', user = (window.appState && window.appState.user) } = options;

    const initials = user && user.fullName
      ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    const solutions = [
      { id: 'fmcg', name: 'FMCG' },
      { id: 'manufacturing', name: 'Manufacturing' },
      { id: 'b2b', name: 'B2B Enterprise' },
      { id: 'ca', name: 'Finance' },
      { id: 'shifts', name: 'SHIFTS' }
    ];

    // Build URL depending on mode or target
    const getNavUrl = (id) => {
      if (mode === 'dashboard') {
        return `#/industry/${id}`;
      }
      return `#/solution/${id}`;
    };

    return `
      <header class="insigrow-site-header" id="insigrow-site-header">
        <div class="header-container">
          <!-- Left: Original Insigrow Brand & Mark -->
          <a class="header-brand-link" href="#/landing" title="Insigrow Enterprise Portal">
            <img src="/insigrow-mark.png" alt="Insigrow Logo" class="header-brand-logo" />
            <span class="header-brand-text">INSIGROW</span>
          </a>

          <!-- Center: Five Business Solutions Navigation -->
          <nav class="header-nav-list" aria-label="Business Solutions">
            ${solutions.map(s => `
              <a 
                href="${getNavUrl(s.id)}" 
                class="header-nav-item ${s.id === 'shifts' ? 'shifts-nav-item' : ''} ${activeNav === s.id ? 'active' : ''}"
                data-nav="${s.id}"
              >
                <span>${s.name}</span>
                <span class="nav-active-pill"></span>
              </a>
            `).join('')}
          </nav>

          <!-- Right: Authentication or Elegant User Dropdown -->
          <div class="header-actions-group">
            ${user ? `
              <!-- Authenticated User Menu Dropdown -->
              <div class="header-account-dropdown" id="header-account-dropdown">
                <button 
                  type="button" 
                  class="header-account-trigger" 
                  id="btn-account-dropdown-toggle"
                  aria-haspopup="true" 
                  aria-expanded="false"
                  title="Account menu for ${user.fullName}"
                >
                  <span class="account-avatar-circle">${initials}</span>
                  <span class="account-user-name">${user.fullName.split(' ')[0]}</span>
                  <span class="account-chevron">▾</span>
                </button>

                <div class="header-account-menu" id="header-account-menu" role="menu">
                  <div class="account-menu-header">
                    <strong class="menu-user-fullname">${user.fullName}</strong>
                    <span class="menu-user-org">${user.companyName || user.email}</span>
                    <span class="menu-user-role-badge">${user.role === 'EMPLOYEE' ? 'Frontline Employee' : 'Operations Manager'}</span>
                  </div>
                  <div class="account-menu-divider"></div>
                  <a href="#/industry/${user.industry || 'shifts'}" class="account-menu-item" role="menuitem">
                    <span class="menu-item-icon">💼</span>
                    <span>My Workspace</span>
                  </a>
                  ${user.industry === 'shifts' && user.role !== 'EMPLOYEE' ? `
                    <a href="#/shifts/onboarding" class="account-menu-item" role="menuitem">
                      <span class="menu-item-icon">⚙️</span>
                      <span>Organisation Setup</span>
                    </a>
                  ` : ''}
                  <a href="javascript:void(0)" class="account-menu-item" id="btn-menu-account-settings" role="menuitem">
                    <span class="menu-item-icon">🔒</span>
                    <span>Account Settings</span>
                  </a>
                  <div class="account-menu-divider"></div>
                  <button type="button" class="account-menu-item signout" id="btn-header-signout-action" role="menuitem">
                    <span class="menu-item-icon">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ` : `
              <!-- Unauthenticated Visitor CTAs -->
              <a class="header-login-btn" href="#/login">Sign in</a>
              <a class="header-get-started-btn" href="#/register">
                <span>Get started</span>
                <span class="btn-arrow">↗</span>
              </a>
            `}

            <!-- Mobile Hamburger Toggle -->
            <button 
              type="button" 
              class="header-mobile-hamburger" 
              id="btn-mobile-nav-toggle"
              aria-label="Toggle mobile navigation menu"
              aria-expanded="false"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Slide-Down Drawer -->
        <div class="header-mobile-drawer" id="header-mobile-drawer">
          <div class="mobile-drawer-links">
            ${solutions.map(s => `
              <a href="${getNavUrl(s.id)}" class="mobile-drawer-link ${activeNav === s.id ? 'active' : ''}">
                <span>${s.name}</span>
                <span class="arrow-right">→</span>
              </a>
            `).join('')}
          </div>
          <div class="mobile-drawer-footer">
            ${user ? `
              <a href="#/industry/${user.industry || 'shifts'}" class="mobile-btn-primary">My Workspace ↗</a>
              <button type="button" class="mobile-btn-secondary" id="btn-mobile-signout">Sign Out</button>
            ` : `
              <a href="#/login" class="mobile-btn-secondary">Sign in</a>
              <a href="#/register" class="mobile-btn-primary">Get started ↗</a>
            `}
          </div>
        </div>
      </header>
    `;
  },

  /**
   * Initializes event listeners for the header (dropdown toggle, outside click, signout, mobile menu)
   * @param {HTMLElement} container
   */
  initEvents(container) {
    const dropdownToggle = container.querySelector('#btn-account-dropdown-toggle');
    const dropdownMenu = container.querySelector('#header-account-menu');
    const hamburgerBtn = container.querySelector('#btn-mobile-nav-toggle');
    const mobileDrawer = container.querySelector('#header-mobile-drawer');

    // Toggle user account dropdown
    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('open');
        dropdownMenu.classList.toggle('open', !isOpen);
        dropdownToggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#header-account-dropdown')) {
          dropdownMenu.classList.remove('open');
          dropdownToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Toggle mobile drawer
    if (hamburgerBtn && mobileDrawer) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.contains('open');
        mobileDrawer.classList.toggle('open', !isOpen);
        hamburgerBtn.classList.toggle('active', !isOpen);
        hamburgerBtn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      // Close drawer upon clicking any navigation link
      mobileDrawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          hamburgerBtn.classList.remove('active');
        });
      });
    }

    // Sign out handler
    const handleSignout = async () => {
      try {
        await window.api.logout();
        window.appState.setUser(null);
        window.appState.setTrials({});
        window.appState.showToast('Signed out successfully.', 'info');
        window.location.hash = '#/landing';
      } catch (err) {
        window.location.hash = '#/landing';
      }
    };

    const signoutBtn = container.querySelector('#btn-header-signout-action');
    if (signoutBtn) signoutBtn.addEventListener('click', handleSignout);

    const mobileSignoutBtn = container.querySelector('#btn-mobile-signout');
    if (mobileSignoutBtn) mobileSignoutBtn.addEventListener('click', handleSignout);

    // Account settings modal / info
    const settingsBtn = container.querySelector('#btn-menu-account-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const u = window.appState.user;
        window.appState.showToast(`Logged in as ${u ? u.fullName : 'User'} (${u ? u.email : ''}). All systems active.`, 'info');
        if (dropdownMenu) dropdownMenu.classList.remove('open');
      });
    }
  }
};

window.HeaderView = HeaderView;

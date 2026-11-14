/**
 * Insigrow Industry Portal - Main Application Orchestrator
 * Client Routing, Session Persistence, and View Controller
 * Enhanced with fluid page transitions and scroll-based motion observer
 */

(function () {
  const root = document.getElementById('app-root');

  // Viewport scroll-based motion observer (IntersectionObserver)
  function initScrollAnimations(rootElement = document) {
    if (!('IntersectionObserver' in window)) {
      rootElement.querySelectorAll('.motion-scroll-trigger').forEach(el => el.classList.add('is-in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    rootElement.querySelectorAll('.motion-scroll-trigger:not(.is-in-view)').forEach(el => {
      observer.observe(el);
    });
  }
  window.initScrollAnimations = initScrollAnimations;

  // Confetti Particle Explosion (for 15-day trial activation celebration)
  function triggerConfetti() {
    try {
      const canvas = document.createElement('canvas');
      canvas.id = 'insigrow-confetti-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '99999';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const colors = ['#0284c7', '#10b981', '#06b6d4', '#c026d3', '#f59e0b', '#3b82f6', '#34d399', '#0f2942'];
      const particles = [];
      const particleCount = 130;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: width * 0.5 + (Math.random() - 0.5) * 80,
          y: height * 0.52 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 18,
          vy: -Math.random() * 15 - 7,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rSpeed: (Math.random() - 0.5) * 14,
          opacity: 1,
          wobble: Math.random() * 10
        });
      }

      let start = null;
      const duration = 2800;

      function render(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = elapsed / duration;

        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.44; // gravity
          p.vx *= 0.98; // air resistance
          p.rotation += p.rSpeed;
          p.wobble += 0.12;
          p.opacity = Math.max(0, 1 - progress * 1.15);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(Math.cos(p.wobble), 1);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        });

        if (progress < 1) {
          requestAnimationFrame(render);
        } else {
          canvas.remove();
        }
      }

      requestAnimationFrame(render);
    } catch (_) {}
  }
  window.triggerConfetti = triggerConfetti;

  // Interactive Spotlight Luminescence & 3D Tilt for Cards
  function initInteractiveCards(rootElement = document) {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    const cards = rootElement.querySelectorAll(
      '.capability-card, .kpi-card, .feature-card, .built-around-card, .fmcg-sub-nav-item, .summary-stat-box'
    );

    cards.forEach(card => {
      if (card.dataset.spotlightInit) return;
      card.dataset.spotlightInit = 'true';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Subtle 3D magnetic tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = ((y - centerY) / centerY) * -4;
        const tiltY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }
  window.initInteractiveCards = initInteractiveCards;

  // Smooth Animated KPI Counters
  function initAnimatedCounters(rootElement = document) {
    if (!('IntersectionObserver' in window)) return;

    const counterElements = rootElement.querySelectorAll(
      '.kpi-value, .summary-stat-num, .highlight-val'
    );

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);

        const originalText = el.textContent.trim();
        // Parse numerical part and prefix/suffix
        const match = originalText.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
        if (!match) return;

        const prefix = match[1];
        const rawNumStr = match[2].replace(/,/g, '');
        const suffix = match[3];
        const targetVal = parseFloat(rawNumStr);
        if (isNaN(targetVal)) return;

        const isDecimal = rawNumStr.includes('.');
        const decimalPlaces = isDecimal ? rawNumStr.split('.')[1].length : 0;
        const hasCommas = match[2].includes(',');

        const duration = 1200;
        const startTime = performance.now();

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function step(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const currentVal = targetVal * easeOutCubic(progress);

          let formattedVal = isDecimal ? currentVal.toFixed(decimalPlaces) : Math.round(currentVal).toString();
          if (hasCommas) {
            const parts = formattedVal.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formattedVal = parts.join('.');
          }

          el.textContent = `${prefix}${formattedVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = originalText;
          }
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.15 });

    counterElements.forEach(el => observer.observe(el));
  }
  window.initAnimatedCounters = initAnimatedCounters;

  // Hero Interactive Cursor Glow
  function initHeroCursorGlow(rootElement = document) {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    const heroes = rootElement.querySelectorAll('.fmcg-hero-section, .industry-hero');
    heroes.forEach(hero => {
      if (hero.dataset.glowInit) return;
      hero.dataset.glowInit = 'true';

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hero.style.setProperty('--hero-mouse-x', `${x}px`);
        hero.style.setProperty('--hero-mouse-y', `${y}px`);
      });

      hero.addEventListener('mouseleave', () => {
        hero.style.removeProperty('--hero-mouse-x');
        hero.style.removeProperty('--hero-mouse-y');
      });
    });
  }
  window.initHeroCursorGlow = initHeroCursorGlow;

  // Desktop Magnetic Hover for Primary CTAs
  function initMagneticButtons(rootElement = document) {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    const btns = rootElement.querySelectorAll(
      '.btn-primary, .btn-trial, .btn-start-trial, .btn-unlock-trial-feature, .feature-cta-btn, #btn-confirm-trial, .btn-secondary'
    );
    btns.forEach(btn => {
      if (btn.dataset.magneticInit) return;
      btn.dataset.magneticInit = 'true';

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px) scale(1.02)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
  window.initMagneticButtons = initMagneticButtons;

  // Button & Tab Click Shockwave Ripple
  function initClickRipples() {
    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('.btn, .industry-tab, .fmcg-sub-nav-item, .feature-cta-btn');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'interactive-ripple';
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  async function initApp() {
    // 1. Session Restoration on page load / refresh
    let currentUser = null;
    try {
      const authRes = await window.api.me();
      if (authRes && authRes.success && authRes.user) {
        currentUser = authRes.user;
        window.appState.setUser(currentUser);
        window.appState.setTrials(authRes.trials);
      }
    } catch (err) {
      // Unauthenticated session
      currentUser = null;
    }

    // 2. Hash Change Listener
    window.addEventListener('hashchange', handleRoute);

    // 3. Custom Event Listeners
    window.addEventListener('auth:expired', () => {
      window.appState.showToast('Your session has expired. Please log in again.', 'info');
      window.location.hash = '#/login';
    });

    window.addEventListener('trial:updated', async (e) => {
      const industry = e.detail && e.detail.industry ? e.detail.industry : window.appState.activeIndustry;
      await loadAndRenderIndustry(industry);
    });

    // 4. Global micro-interactions
    initClickRipples();

    // 5. Initial Route
    await handleRoute();
  }

  async function handleRoute() {
    // Default entry point must ALWAYS be public Insigrow landing page, even if authenticated.
    const hash = window.location.hash || '#/landing';
    const [pathPart, queryPart] = hash.split('?');
    const params = new URLSearchParams(queryPart || '');

    // Parse path
    const path = pathPart.replace(/^#\/?/, '');

    // Public product landing page
    if (path === '' || path === 'landing') {
      window.LandingView.render(root);
      return;
    }

    // Dedicated Industry-Specific Landing Pages (Public)
    if (path.startsWith('solution/') || path.startsWith('solutions/') || (path.startsWith('landing/') && path !== 'landing')) {
      let indKey = (path.split('/')[1] || 'fmcg').toLowerCase().trim();
      if (indKey === 'finance') indKey = 'ca';
      if (['fmcg', 'ca', 'manufacturing', 'b2b', 'shifts'].includes(indKey)) {
        window.IndustryLandingView.render(root, indKey);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Dedicated SHIFTS Auth Flow (Manager Registration & Role-based Login)
    if (path === 'shifts/auth' || path === 'shifts/register' || path === 'shifts/login') {
      if (window.appState.user) {
        if (window.appState.user.role === 'EMPLOYEE') {
          window.location.hash = '#/industry/shifts';
          return;
        }
        if (window.appState.user.onboardingCompleted === false) {
          window.location.hash = '#/shifts/onboarding';
          return;
        }
        window.location.hash = '#/industry/shifts';
        return;
      }
      const initialTab = (params.get('tab') === 'login' || path === 'shifts/login') ? 'login' : 'register';
      if (window.ShiftsAuthView) {
        window.ShiftsAuthView.render(root, initialTab, params.get('email') || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Dedicated Employee Invitation Acceptance Flow (Public)
    if (path === 'shifts/invite') {
      const inviteToken = params.get('token') || '';
      if (window.ShiftsInviteView) {
        window.ShiftsInviteView.render(root, inviteToken);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Dedicated 5-Step Organisation Onboarding Wizard (Protected)
    if (path === 'shifts/onboarding') {
      if (!window.appState.user) {
        // Re-verify session
        try {
          const authRes = await window.api.me();
          if (authRes && authRes.success && authRes.user) {
            window.appState.setUser(authRes.user);
            window.appState.setTrials(authRes.trials);
          } else {
            window.location.hash = '#/shifts/auth?tab=login';
            return;
          }
        } catch (_) {
          window.location.hash = '#/shifts/auth?tab=login';
          return;
        }
      }
      if (window.ShiftsOnboardingView) {
        window.ShiftsOnboardingView.render(root);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Unauthenticated routes: register, login
    if (path === 'register') {
      if (window.appState.user) {
        window.location.hash = '#/dashboard';
        return;
      }
      let requestedIndustry = (params.get('industry') || '').toLowerCase().trim();
      if (requestedIndustry === 'finance') requestedIndustry = 'ca';
      if (requestedIndustry === 'shifts') {
        window.location.hash = '#/shifts/auth';
        return;
      }
      window.AuthView.renderRegister(
        root,
        params.get('email') || '',
        ['fmcg', 'ca', 'manufacturing', 'b2b', 'shifts'].includes(requestedIndustry) ? requestedIndustry : ''
      );
      return;
    }

    if (path === 'login') {
      if (window.appState.user) {
        window.location.hash = '#/dashboard';
        return;
      }
      window.AuthView.renderLogin(root, params.get('email') || '');
      return;
    }

    // Protected Routes: dashboard, industry/:id
    if (!window.appState.user) {
      // Re-verify session in case token is stored
      try {
        const authRes = await window.api.me();
        if (authRes && authRes.success && authRes.user) {
          window.appState.setUser(authRes.user);
          window.appState.setTrials(authRes.trials);
        } else {
          window.location.hash = '#/login';
          return;
        }
      } catch (_) {
        window.location.hash = '#/login';
        return;
      }
    }

    // Determine Industry (respect user's registered solution, never default to fmcg blindly)
    let targetIndustry = 'fmcg';
    if (window.appState.user && window.appState.user.industry) {
      let userInd = window.appState.user.industry.toLowerCase().trim();
      if (userInd === 'finance') userInd = 'ca';
      if (['fmcg', 'ca', 'manufacturing', 'b2b', 'shifts'].includes(userInd)) {
        targetIndustry = userInd;
      }
    }
    if (path.startsWith('industry/')) {
      let ind = (path.split('/')[1] || '').toLowerCase().trim();
      if (ind === 'finance') ind = 'ca';
      if (['fmcg', 'ca', 'manufacturing', 'b2b', 'shifts'].includes(ind)) {
        targetIndustry = ind;
      }
    }

    window.appState.setActiveIndustry(targetIndustry);

    // Render Dashboard Frame
    window.DashboardView.renderHeader(
      root,
      targetIndustry,
      window.appState.user,
      window.appState.trials
    );

    // Load and render industry section
    await loadAndRenderIndustry(targetIndustry);
  }

  async function loadAndRenderIndustry(industryKey) {
    const container = document.getElementById('industry-content-container');
    if (!container) return;

    // Fluid exit transition if content is already mounted
    if (container.children.length > 0 && !container.querySelector('.spinner')) {
      container.classList.add('page-exit');
      await new Promise(r => setTimeout(r, 120));
    } else {
      // Show loading indicator only on cold boot
      window.IndustryView.render(container, null, null);
    }

    try {
      const res = await window.api.getIndustryData(industryKey);
      if (res && res.success) {
        window.appState.setIndustryData(res.data);
        const trialState = res.data.trialState || (window.appState.trials ? window.appState.trials[industryKey] : null);
        window.IndustryView.render(container, res.data, trialState);

        // Fluid enter transition
        container.classList.remove('page-exit');
        container.classList.remove('page-enter');
        void container.offsetWidth; // Force reflow
        container.classList.add('page-enter');

        // Trigger viewport animations
        initScrollAnimations(container);
        initInteractiveCards(container);
        initAnimatedCounters(container);
        initHeroCursorGlow(container);
        initMagneticButtons(container);
      }
    } catch (err) {
      container.classList.remove('page-exit');
      container.innerHTML = `
        <div class="alert-banner error" style="margin-top: 24px;">
          ${window.getIcon('alertTriangle', 'icon')}
          <div>Failed to load data for ${industryKey.toUpperCase()}. Please try refreshing.</div>
        </div>
      `;
    }
  }

  // Start app on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

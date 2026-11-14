/**
 * Insigrow Industry Portal - Industry-Specific Sections View
 * Renders FMCG, CA, Manufacturing, and B2B views with trial gating
 * Enhanced with staggered entrance animations & scroll-triggered reveals
 */

const IndustryView = {
  formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  render(container, industryData, trialState) {
    if (!industryData) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 16px;">
          <div class="spinner spinner-dark" style="margin: 0 auto 16px;"></div>
          <div style="font-size: 0.95rem; color: var(--text-muted);">Loading industry solution workspace...</div>
        </div>
      `;
      return;
    }

    const { id, name, tagline, description, stats, features } = industryData;
    const isTrialActive = trialState ? trialState.isTrialActive : false;
    const trialStatus = trialState ? trialState.status : 'not_started';

    // Route FMCG to dedicated enterprise layout
    if (id === 'fmcg') {
      this.renderFMCG(container, industryData, trialState);
      return;
    }

    // Route SHIFTS to dedicated workforce layout with ShiftPlanner launchpad
    if (id === 'shifts') {
      const user = window.appState && window.appState.user ? window.appState.user : null;
      this.renderShifts(container, industryData, trialState, user);
      return;
    }

    // Standard Layout for CA, Manufacturing, and B2B
    const freeFeatures = features.filter(f => !f.isTrialFeature);
    const trialFeatures = features.filter(f => f.isTrialFeature);

    container.innerHTML = `
      <!-- Industry Hero & Header -->
      <section class="industry-hero motion-hero">
        <div class="hero-gradient-border" aria-hidden="true"></div>
        <div class="hero-cursor-glow" aria-hidden="true"></div>
        <div class="hero-decorative-watermark" aria-hidden="true">
          <svg viewBox="0 0 120 120" fill="none">
            <path d="M10 20 L45 20 L80 55 L45 90 L10 90 L45 55 Z" stroke="url(#hero-chevron-grad-std)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M45 20 L80 20 L115 55 L80 90 L45 90 L80 55 Z" stroke="url(#hero-chevron-grad-std)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
            <defs>
              <linearGradient id="hero-chevron-grad-std" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0284C7"/>
                <stop offset="0.5" stop-color="#10B981"/>
                <stop offset="1" stop-color="#C084FC"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="industry-hero-header">
          <div class="industry-hero-title-group">
            <div class="section-kicker">ENTERPRISE SOLUTION</div>
            <h1>${name}</h1>
            <p>${tagline}. ${description}</p>
          </div>
        </div>

        <!-- 15-Day Free Trial Banner -->
        ${this.renderTrialBanner(id, name, trialState)}
      </section>

      <!-- KPI Summary Row -->
      <section class="kpi-grid motion-scroll-trigger">
        ${stats.map((s, idx) => `
          <div class="kpi-card motion-stagger-card" style="--card-index: ${idx};">
            <div class="kpi-label">${s.label}</div>
            <div class="kpi-value-row">
              <div class="kpi-value">${s.value}</div>
              <div class="kpi-badge ${s.trend}">${s.change}</div>
            </div>
          </div>
        `).join('')}
      </section>

      <!-- Dedicated Video Placeholder Section for Demonstration Video -->
      <section class="video-overview-section motion-scroll-trigger" id="video-section-${id}">
        <div class="video-section-header">
          <div class="video-heading-wrap">
            <span class="video-heading-icon">${window.getIcon('film', 'icon')}</span>
            <div class="video-title-column">
              <h3 class="video-section-title">Product Overview</h3>
              <span class="video-section-subtitle">${name} Demonstration</span>
            </div>
          </div>
          <span class="video-format-pill">16:9 Video Ready</span>
        </div>

        <div class="video-container-wrapper">
          <div 
            class="video-container-16-9" 
            id="video-placeholder-${id}" 
            data-industry="${id}"
            aria-label="${name} Product Overview Demonstration Video Container"
          >
            <div class="video-ambient-glow" aria-hidden="true"></div>
            <div class="video-grid-overlay" aria-hidden="true"></div>
            <div class="video-scanner-line" aria-hidden="true"></div>
            <div class="video-empty-state">
              <div class="video-play-indicator pulse-ring">
                ${window.getIcon('play', 'icon-lg')}
              </div>
              <div class="video-empty-text">Demonstration Video Placeholder</div>
              <div class="video-empty-sub">Dedicated 16:9 container ready for video embed</div>
            </div>
          </div>
        </div>
      </section>

      <!-- FREE FEATURES SECTION -->
      <section style="margin-bottom: 36px;" class="motion-scroll-trigger">
        <div class="section-heading-bar">
          <div class="section-heading-title">
            <span>Free Features & Operational Modules</span>
            <span class="category-pill free">Included in Base</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-light);">
            ${freeFeatures.length} Core Modules Available
          </div>
        </div>

        <div class="features-grid">
          ${freeFeatures.map((f, idx) => this.renderFeatureCard(f, false, id, idx)).join('')}
        </div>
      </section>

      <!-- TRIAL PREMIUM FEATURES SECTION -->
      <section style="margin-bottom: 40px;" class="motion-scroll-trigger">
        <div class="section-heading-bar">
          <div class="section-heading-title">
            <span>Advanced Analytics & Predictive Tools</span>
            <span class="category-pill ${isTrialActive ? 'active' : 'trial'}">
              ${isTrialActive ? '✓ 15-Day Trial Active' : 'Trial Locked'}
            </span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-light);">
            ${isTrialActive ? 'All Premium Features Unlocked' : 'Requires Active 15-Day Free Trial'}
          </div>
        </div>

        <div class="features-grid">
          ${trialFeatures.map((f, idx) => this.renderFeatureCard(f, !isTrialActive, id, idx)).join('')}
        </div>
      </section>
    `;

    // Bind Trial Activation Buttons
    this.bindEvents(container, id);

    // Trigger scroll-based animations for standard layout
    if (window.initScrollAnimations) {
      window.initScrollAnimations(container);
    }
  },

  /**
   * Dedicated FMCG Enterprise Layout
   * Follows the exact 7-part page structure:
   * 1. Top navigation with prominent animated industry tabs (in DashboardView)
   * 2. FMCG introduction and product description
   * 3. Video demonstration section (16:9 with "Explore INSIGROW FMCG" & "Product Overview")
   * 4. What You Can Manage – nine capability cards
   * 5. Built Around Your Operations section
   * 6. Free 15-Day Trial Activation / Status Integration
   * 7. Professional footer (in DashboardView)
   */
  renderFMCG(container, industryData, trialState) {
    const { id, name, stats, features } = industryData;
    const isTrialActive = trialState ? trialState.isTrialActive : false;

    container.innerHTML = `
      <!-- 2. FMCG INTRODUCTION AND PRODUCT DESCRIPTION -->
      <section class="fmcg-hero-section motion-hero">
        <div class="hero-gradient-border" aria-hidden="true"></div>
        <div class="hero-cursor-glow" aria-hidden="true"></div>
        <div class="hero-decorative-watermark" aria-hidden="true">
          <svg viewBox="0 0 120 120" fill="none">
            <path d="M10 20 L45 20 L80 55 L45 90 L10 90 L45 55 Z" stroke="url(#hero-chevron-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M45 20 L80 20 L115 55 L80 90 L45 90 L80 55 Z" stroke="url(#hero-chevron-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
            <defs>
              <linearGradient id="hero-chevron-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0284C7"/>
                <stop offset="0.5" stop-color="#10B981"/>
                <stop offset="1" stop-color="#C084FC"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div class="fmcg-hero-badge-row">
          <span class="fmcg-brand-eyebrow">INSIGROW PLATFORM</span>
          <span class="fmcg-pill cyan">Fast-Moving Consumer Goods</span>
          ${isTrialActive ? `
            <span class="fmcg-pill green">✓ 15-Day Free Trial Active (${trialState.daysRemaining}d left)</span>
          ` : `
            <span class="fmcg-pill neutral">15-Day Free Evaluation Available</span>
          `}
        </div>

        <h1 class="fmcg-hero-title">INSIGROW</h1>
        <p class="fmcg-hero-tagline">A connected operations platform for FMCG businesses</p>

        <div class="fmcg-hero-description">
          <p>
            INSIGROW helps FMCG teams manage the day-to-day work behind products moving from production to distributors and outlets.
          </p>
          <p>
            It brings key operational information into one place, helping teams track activity, spot issues earlier, and make better-informed decisions.
          </p>
        </div>

        <div class="fmcg-hero-highlights">
          <div class="hero-highlight-item">
            <span class="highlight-bullet cyan"></span>
            <span>Production-to-Outlet Traceability</span>
          </div>
          <div class="hero-highlight-item">
            <span class="highlight-bullet emerald"></span>
            <span>Multi-Echelon Depot Visibility</span>
          </div>
          <div class="hero-highlight-item">
            <span class="highlight-bullet orchid"></span>
            <span>Automated Secondary Stock Reconciliation</span>
          </div>
        </div>
      </section>

      <!-- 3. VIDEO DEMONSTRATION SECTION -->
      <section class="video-overview-section fmcg-video-section motion-scroll-trigger" id="video-section-fmcg">
        <div class="video-section-header">
          <div class="video-heading-wrap">
            <span class="video-heading-icon">${window.getIcon('film', 'icon')}</span>
            <div class="video-title-column">
              <h3 class="video-section-title">Explore INSIGROW FMCG</h3>
              <span class="video-section-subtitle">Product Overview Demonstration</span>
            </div>
          </div>
          <span class="video-format-pill">16:9 HD Container</span>
        </div>

        <div class="video-container-wrapper">
          <div 
            class="video-container-16-9" 
            id="video-placeholder-${id}" 
            data-industry="fmcg"
            aria-label="INSIGROW FMCG Product Overview Demonstration Video Container"
          >
            <div class="video-ambient-glow" aria-hidden="true"></div>
            <div class="video-grid-overlay" aria-hidden="true"></div>
            <div class="video-scanner-line" aria-hidden="true"></div>
            <div class="video-empty-state">
              <div class="video-play-indicator pulse-ring">
                ${window.getIcon('play', 'icon-lg')}
              </div>
              <div class="video-empty-text">Video Demonstration Container</div>
              <div class="video-empty-sub">Ready for video embed or upload</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. WHAT YOU CAN MANAGE – NINE CAPABILITY CARDS -->
      <section class="fmcg-capabilities-section motion-scroll-trigger">
        <div class="capabilities-section-header">
          <div>
            <div class="section-kicker">COMPREHENSIVE CAPABILITIES</div>
            <h2 class="capabilities-title">What You Can Manage</h2>
          </div>
          <p class="capabilities-subtitle">
            End-to-end operational visibility across sales channels, multi-tier inventory, and production runs.
          </p>
        </div>

        <div class="capabilities-grid">
          <!-- Card 01: Channel Pipeline -->
          <div class="capability-card motion-stagger-card" style="--card-index: 0;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap cyan">
                ${window.getIcon('filter', 'icon')}
              </div>
              <span class="capability-number">01</span>
            </div>
            <h3 class="capability-heading">Channel Pipeline</h3>
            <p class="capability-desc">
              Track distributor and outlet opportunities through their sales stages.
            </p>
            <div class="capability-meta-tag">Lead & Deal Tracking</div>
          </div>

          <!-- Card 02: Distributors & Outlets -->
          <div class="capability-card motion-stagger-card" style="--card-index: 1;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap teal">
                ${window.getIcon('users', 'icon')}
              </div>
              <span class="capability-number">02</span>
            </div>
            <h3 class="capability-heading">Distributors & Outlets</h3>
            <p class="capability-desc">
              Organize channel partners and retail accounts.
            </p>
            <div class="capability-meta-tag">Network Hierarchy</div>
          </div>

          <!-- Card 03: Products, Packs & Combos -->
          <div class="capability-card highlight-card motion-stagger-card" style="--card-index: 2;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap emerald">
                ${window.getIcon('package', 'icon')}
              </div>
              <span class="capability-number">03</span>
            </div>
            <h3 class="capability-heading">Products, Packs & Combos</h3>
            <p class="capability-desc">
              Maintain product and pack details. For combo products, track component items so that selling a combo can reduce the stock of its individual items.
            </p>
            <div class="capability-feature-badge">
              ${window.getIcon('check', 'icon-sm')} Component SKU Stock Sync
            </div>
          </div>

          <!-- Card 04: Orders & Delivery -->
          <div class="capability-card motion-stagger-card" style="--card-index: 3;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap blue">
                ${window.getIcon('truck', 'icon')}
              </div>
              <span class="capability-number">04</span>
            </div>
            <h3 class="capability-heading">Orders & Delivery</h3>
            <p class="capability-desc">
              Follow orders through fulfillment and delivery.
            </p>
            <div class="capability-meta-tag">Dispatch & Tracking</div>
          </div>

          <!-- Card 05: Invoices -->
          <div class="capability-card motion-stagger-card" style="--card-index: 4;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap orchid">
                ${window.getIcon('fileText', 'icon')}
              </div>
              <span class="capability-number">05</span>
            </div>
            <h3 class="capability-heading">Invoices</h3>
            <p class="capability-desc">
              View and manage invoice information as part of the sales workflow.
            </p>
            <div class="capability-meta-tag">Billing & Accounts</div>
          </div>

          <!-- Card 06: Trade Schemes -->
          <div class="capability-card motion-stagger-card" style="--card-index: 5;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap amber">
                ${window.getIcon('tag', 'icon')}
              </div>
              <span class="capability-number">06</span>
            </div>
            <h3 class="capability-heading">Trade Schemes</h3>
            <p class="capability-desc">
              Keep promotional offers and channel schemes organized.
            </p>
            <div class="capability-meta-tag">Promotions & Discounts</div>
          </div>

          <!-- Card 07: Inventory & Batches -->
          <div class="capability-card motion-stagger-card" style="--card-index: 6;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap cyan">
                ${window.getIcon('layers', 'icon')}
              </div>
              <span class="capability-number">07</span>
            </div>
            <h3 class="capability-heading">Inventory & Batches</h3>
            <p class="capability-desc">
              Track batch-related stock and quality information.
            </p>
            <div class="capability-meta-tag">Shelf-Life & Expiry Control</div>
          </div>

          <!-- Card 08: Production Orders -->
          <div class="capability-card wide-card motion-stagger-card" style="--card-index: 7;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap emerald">
                ${window.getIcon('cpu', 'icon')}
              </div>
              <span class="capability-number">08</span>
            </div>
            <h3 class="capability-heading">Production Orders</h3>
            <p class="capability-desc">
              Follow a production run from planning and release through execution, quality hold, completion, and closure.
            </p>
            
            <div class="production-record-block">
              <div class="record-block-title">
                <span>Record:</span>
              </div>
              <div class="record-chips-grid">
                <div class="record-chip"><span class="chip-dot"></span>Actual material use</div>
                <div class="record-chip"><span class="chip-dot"></span>Production output</div>
                <div class="record-chip"><span class="chip-dot"></span>Waste and rework</div>
                <div class="record-chip"><span class="chip-dot"></span>Operators</div>
                <div class="record-chip"><span class="chip-dot"></span>Equipment</div>
                <div class="record-chip"><span class="chip-dot"></span>Timestamps</div>
              </div>
            </div>
          </div>

          <!-- Card 09: Manufacturing Analytics -->
          <div class="capability-card motion-stagger-card" style="--card-index: 8;">
            <div class="capability-card-top">
              <div class="capability-icon-wrap orchid">
                ${window.getIcon('barChart', 'icon')}
              </div>
              <span class="capability-number">09</span>
            </div>
            <h3 class="capability-heading">Manufacturing Analytics</h3>
            <p class="capability-desc">
              Compare planned and actual production, monitor yield and scrap, identify downtime and material shortages, and review cost variance and near-expiry stock.
            </p>
            <div class="capability-meta-tag">Planned vs. Actual Yield</div>
          </div>
        </div>
      </section>

      <!-- 5. BUILT TO FIT YOUR OPERATIONS -->
      <section class="built-around-section motion-scroll-trigger">
        <div class="built-around-card">
          <div class="built-around-header">
            <div class="built-around-icon">
              ${window.getIcon('sliders', 'icon-lg')}
            </div>
            <div class="built-around-title-wrap">
              <div class="section-kicker">CONFIGURABLE PLATFORM</div>
              <h3 class="built-around-title">Built Around Your Operations</h3>
            </div>
          </div>
          
          <div class="built-around-content">
            <p class="built-main-text">
              INSIGROW can be configured around a company's products, sales channels, and processes.
            </p>
            <div class="built-cards-grid">
              <div class="built-feature-item" style="--item-index: 0;">
                <div class="built-item-badge">Configurable Workflows</div>
                <p>Tailor product hierarchies, custom approval gates, pack-size combos, and regional distribution tiers to your enterprise setup.</p>
              </div>
              <div class="built-feature-item" style="--item-index: 1;">
                <div class="built-item-badge">Interactive Sample Data</div>
                <p>The current demo includes sample data across several FMCG categories to help teams explore the workflows.</p>
              </div>
              <div class="built-feature-item" style="--item-index: 2;">
                <div class="built-item-badge">Implementation & Integrations</div>
                <p>Demo data is illustrative; live integrations and company-specific configuration depend on implementation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. FREE 15-DAY TRIAL ACTIVATION & INTERACTIVE STATUS -->
      <section class="fmcg-trial-cta-section motion-scroll-trigger">
        ${this.renderTrialBanner('fmcg', 'FMCG & Consumer Goods', trialState)}
      </section>

      ${isTrialActive ? `
        <!-- Unlocked Live Operations Modules (When 15-Day Free Trial is Active) -->
        <section class="fmcg-unlocked-preview-section motion-scroll-trigger">
          <div class="section-heading-bar">
            <div class="section-heading-title">
              <span>Live Operations & Predictive Telemetry</span>
              <span class="category-pill active">✓ Unlocked with 15-Day Free Trial</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--color-emerald-dark); font-weight: 600;">
              Active Evaluation (${trialState.daysRemaining} days left)
            </div>
          </div>

          <div class="kpi-grid" style="margin-bottom: 24px;">
            ${stats.map((s, idx) => `
              <div class="kpi-card motion-stagger-card" style="--card-index: ${idx};">
                <div class="kpi-label">${s.label}</div>
                <div class="kpi-value-row">
                  <div class="kpi-value">${s.value}</div>
                  <div class="kpi-badge ${s.trend}">${s.change}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="features-grid">
            ${features.map((f, idx) => this.renderFeatureCard(f, false, 'fmcg', idx)).join('')}
          </div>
        </section>
      ` : ''}
    `;

    // Bind Trial Activation Buttons
    this.bindEvents(container, 'fmcg');

    // Trigger scroll-based animations for FMCG layout
    if (window.initScrollAnimations) {
      window.initScrollAnimations(container);
    }
  },

  renderTrialBanner(industryId, industryName, trialState) {
    const status = trialState ? trialState.status : 'not_started';

    if (status === 'active') {
      const days = trialState.daysRemaining;
      const hours = trialState.hoursRemaining;

      return `
        <div class="trial-banner active">
          <div class="trial-banner-content">
            <div class="trial-banner-icon">
              ${window.getIcon('checkCircle', 'icon-lg')}
            </div>
            <div class="trial-banner-text">
              <h3>
                <span>Active 15-Day Free Trial</span>
                <span class="category-pill active">Premium Features Unlocked</span>
              </h3>
              <p>
                All advanced predictive models, statutory compliance trackers, and manufacturing analytics are currently unlocked for <strong>${industryName}</strong>.
              </p>
              <div class="trial-meta-dates">
                <span>Activated: <strong>${this.formatDate(trialState.activatedAt)}</strong></span>
                <span style="margin: 0 6px;">•</span>
                <span>Valid Until: <strong>${this.formatDate(trialState.expiresAt)}</strong></span>
              </div>
            </div>
          </div>

          <div class="trial-active-stats">
            <div class="trial-countdown-badge">
              ${window.getIcon('clock', 'icon')}
              <span>${days} Days, ${hours} Hours Remaining</span>
            </div>
          </div>
        </div>
      `;
    }

    if (status === 'expired') {
      return `
        <div class="trial-banner expired">
          <div class="trial-banner-content">
            <div class="trial-banner-icon">
              ${window.getIcon('alertTriangle', 'icon-lg')}
            </div>
            <div class="trial-banner-text">
              <h3>15-Day Free Trial Expired</h3>
              <p>
                Your 15-day complimentary evaluation for <strong>${industryName}</strong> expired on ${this.formatDate(trialState.expiresAt)}. Advanced analytics and forecasting tools are now restricted.
              </p>
            </div>
          </div>
          <div>
            <button class="btn-primary btn-sm btn-re-trial" data-industry="${industryId}">
              ${window.getIcon('sparkles', 'icon-sm')}
              <span>Reactivate Trial / Upgrade</span>
            </button>
          </div>
        </div>
      `;
    }

    // Default: Not Started
    return `
      <div class="trial-banner not-started">
        <div class="trial-banner-content">
          <div class="trial-banner-icon">
            ${window.getIcon('sparkles', 'icon-lg')}
          </div>
          <div class="trial-banner-text">
            <h3>Start Free 15-Day Trial for ${industryName}</h3>
            <p>
              Activate a 15-day complimentary trial to unlock advanced forecasting algorithms, multi-depot velocity models, and full operational telemetry. No credit card required.
            </p>
          </div>
        </div>
        <div>
          <button class="btn-primary btn-start-trial" data-industry="${industryId}">
            ${window.getIcon('sparkles', 'icon-sm')}
            <span>Start Free 15-Day Trial</span>
          </button>
        </div>
      </div>
    `;
  },

  renderFeatureCard(feature, isLocked, industryId, cardIndex = 0) {
    const { id, title, description, icon, isTrialFeature, preview, premiumData } = feature;

    if (isTrialFeature && isLocked) {
      return `
        <div class="feature-card locked motion-stagger-card" style="--card-index: ${cardIndex};">
          <div class="locked-content-blur">
            <div class="feature-card-header">
              <div class="feature-card-icon">${window.getIcon(icon || 'sparkles')}</div>
              <span class="category-pill trial">Trial Feature</span>
            </div>
            <div class="feature-card-title">${title}</div>
            <div class="feature-card-desc">${description}</div>
            <div class="preview-box">
              <div style="height: 60px; background: #e2e8f0; border-radius: 4px;"></div>
            </div>
          </div>

          <div class="locked-overlay">
            <div class="locked-icon-circle">
              ${window.getIcon('lock', 'icon-lg')}
            </div>
            <div class="locked-title">${title}</div>
            <div class="locked-subtitle">
              This advanced module is available exclusively during the 15-Day Free Trial.
            </div>
            <button class="btn-primary btn-sm btn-unlock-trial-feature" data-industry="${industryId}">
              ${window.getIcon('sparkles', 'icon-sm')}
              <span>Start 15-Day Trial to Unlock</span>
            </button>
          </div>
        </div>
      `;
    }

    // Unlocked Card (Free or Active Trial)
    return `
      <div class="feature-card motion-stagger-card" style="--card-index: ${cardIndex};">
        <div class="feature-card-header">
          <div class="feature-card-icon" style="${isTrialFeature ? 'background: #ECFDF5; color: var(--color-emerald-dark);' : ''}">
            ${window.getIcon(icon || 'activity')}
          </div>
          <span class="category-pill ${isTrialFeature ? 'active' : 'free'}">
            ${isTrialFeature ? '✓ Unlocked with Trial' : 'Free Feature'}
          </span>
        </div>

        <div class="feature-card-title">${title}</div>
        <div class="feature-card-desc">${description}</div>

        ${preview ? this.renderPreviewContent(preview) : ''}
        ${premiumData ? this.renderPremiumContent(premiumData) : ''}
      </div>
    `;
  },

  renderPreviewContent(preview) {
    if (!preview) return '';

    // Channels preview
    if (preview.channels) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Sales by Distribution Channel</div>
          <table class="preview-table">
            <thead>
              <tr><th>Channel</th><th>Share</th><th>Revenue</th><th>Growth</th></tr>
            </thead>
            <tbody>
              ${preview.channels.map(c => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>${c.share}</td>
                  <td>${c.revenue}</td>
                  <td><span class="metric-pill success">${c.growth}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Depots preview
    if (preview.depots) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Regional Hub Capacities</div>
          <ul class="preview-list">
            ${preview.depots.map(d => `
              <li class="preview-list-item">
                <span><strong>${d.location}</strong></span>
                <span>${d.stockValue} (${d.capacity})</span>
                <span class="metric-pill ${d.status === 'Optimal' ? 'success' : 'warning'}">${d.status}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Stock Items preview
    if (preview.stockItems) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Live Stock & Expiry Tracking</div>
          <table class="preview-table">
            <thead><tr><th>SKU & Name</th><th>Stock</th><th>Status</th></tr></thead>
            <tbody>
              ${preview.stockItems.map(s => `
                <tr>
                  <td><strong>${s.sku}</strong> - ${s.name}</td>
                  <td>${s.stock}</td>
                  <td><span class="metric-pill ${s.status === 'In Stock' ? 'success' : 'warning'}">${s.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Distributors preview
    if (preview.distributorMetrics) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Distributor Tier Performance</div>
          <table class="preview-table">
            <thead><tr><th>Tier</th><th>Fulfillment</th><th>Payment Cycle</th></tr></thead>
            <tbody>
              ${preview.distributorMetrics.map(m => `
                <tr>
                  <td><strong>${m.tier}</strong> (${m.count})</td>
                  <td>${m.avgFulfillment}</td>
                  <td><span class="metric-pill">${m.avgPaymentDays}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Top Performers preview
    if (preview.topPerformers) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Gross Margin Contribution</div>
          <ul class="preview-list">
            ${preview.topPerformers.map(p => `
              <li class="preview-list-item">
                <span><strong>${p.name}</strong></span>
                <span>Margin: <strong>${p.margin}</strong></span>
                <span class="metric-pill success">${p.contribution} of sales</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // CA Client Roster
    if (preview.clientRoster) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Client Registry</div>
          <table class="preview-table">
            <thead><tr><th>Entity Name</th><th>Type</th><th>GST Status</th><th>KYC</th></tr></thead>
            <tbody>
              ${preview.clientRoster.map(c => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td>${c.type}</td>
                  <td><span class="metric-pill success">${c.gstStatus}</span></td>
                  <td><span class="metric-pill ${c.kyc === 'Verified' ? 'success' : 'warning'}">${c.kyc}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // CA Schedules
    if (preview.schedules) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Audit-Ready Financial Statements</div>
          <ul class="preview-list">
            ${preview.schedules.map(s => `
              <li class="preview-list-item">
                <span><strong>${s.title}</strong></span>
                <span class="metric-pill success">${s.audited}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // CA GST Deadlines
    if (preview.filingDeadlines) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Statutory Tax Deadlines</div>
          <table class="preview-table">
            <thead><tr><th>Filing</th><th>Due Date</th><th>Progress</th></tr></thead>
            <tbody>
              ${preview.filingDeadlines.map(f => `
                <tr>
                  <td><strong>${f.form}</strong></td>
                  <td>${f.dueDate}</td>
                  <td><span class="metric-pill ${f.status === 'Urgent' ? 'warning' : 'success'}">${f.progress}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // CA Invoicing Aging
    if (preview.agingOverview) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Receivables Aging Analysis</div>
          <table class="preview-table">
            <thead><tr><th>Aging Bucket</th><th>Outstanding Fees</th><th>Invoices</th></tr></thead>
            <tbody>
              ${preview.agingOverview.map(a => `
                <tr>
                  <td><strong>${a.bucket}</strong></td>
                  <td>${a.amount}</td>
                  <td><span class="metric-pill">${a.count} clients</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // CA Expense Disallowance
    if (preview.disallowanceChecks) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Income Tax Audit Checks</div>
          <ul class="preview-list">
            ${preview.disallowanceChecks.map(d => `
              <li class="preview-list-item">
                <span><strong>${d.section}</strong></span>
                <span class="metric-pill success">${d.flags}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Manufacturing Assembly Lines
    if (preview.assemblyLines) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Shop Floor Line Telemetry</div>
          <table class="preview-table">
            <thead><tr><th>Line</th><th>Throughput</th><th>OEE</th><th>Status</th></tr></thead>
            <tbody>
              ${preview.assemblyLines.map(l => `
                <tr>
                  <td><strong>${l.line}</strong></td>
                  <td>${l.throughput}</td>
                  <td><strong>${l.oee}</strong></td>
                  <td><span class="metric-pill ${l.status === 'Running' ? 'success' : 'warning'}">${l.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Manufacturing Raw Materials
    if (preview.keyMaterials) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Raw Material BOM Reserves</div>
          <table class="preview-table">
            <thead><tr><th>Material</th><th>Current Stock</th><th>Lead Time</th></tr></thead>
            <tbody>
              ${preview.keyMaterials.map(m => `
                <tr>
                  <td><strong>${m.material}</strong></td>
                  <td>${m.stock}</td>
                  <td><span class="metric-pill">${m.leadTime}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // B2B Pipeline Stages
    if (preview.pipelineStages) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Enterprise Opportunity Pipeline</div>
          <table class="preview-table">
            <thead><tr><th>Stage</th><th>Deals</th><th>Pipeline Value</th></tr></thead>
            <tbody>
              ${preview.pipelineStages.map(p => `
                <tr>
                  <td><strong>${p.stage}</strong></td>
                  <td>${p.deals} deals</td>
                  <td><strong>${p.value}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // B2B Accounts
    if (preview.keyAccounts) {
      return `
        <div class="preview-box">
          <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-main);">Top Enterprise Accounts</div>
          <ul class="preview-list">
            ${preview.keyAccounts.map(a => `
              <li class="preview-list-item">
                <span><strong>${a.account}</strong> (${a.plan})</span>
                <span>ARR: <strong>${a.arr}</strong></span>
                <span class="metric-pill success">Health: ${a.health}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    return '';
  },

  renderPremiumContent(premiumData) {
    if (!premiumData) return '';

    return `
      <div class="preview-box" style="margin-top: 12px; background: #F0FDF4; border-color: var(--color-emerald-border);">
        <div style="font-weight: 600; margin-bottom: 8px; color: var(--color-emerald-dark); display: flex; align-items: center; gap: 6px;">
          ${window.getIcon('sparkles', 'icon-sm')}
          <span>AI & Predictive Simulation (Trial Exclusive)</span>
        </div>
        <div style="font-size: 0.8rem; line-height: 1.6;">
          ${Object.entries(premiumData).map(([key, value]) => {
            if (typeof value === 'object' && !Array.isArray(value)) {
              return `
                <div style="margin-bottom: 6px;">
                  <strong style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}:</strong>
                  <div style="padding-left: 10px; margin-top: 2px;">
                    ${Object.entries(value).map(([k, v]) => `<div>• <strong>${k}:</strong> ${v}</div>`).join('')}
                  </div>
                </div>
              `;
            }
            if (Array.isArray(value)) {
              return `
                <div style="background: rgba(255,255,255,0.7); padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                  <strong style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}:</strong>
                  <div style="margin-top: 4px; font-size: 0.75rem;">
                    ${value.map(item => `
                      <div style="padding: 2px 0;">• ${typeof item === 'object' ? JSON.stringify(item).replace(/[{"}]/g, '').replace(/,/g, ' | ') : item}</div>
                    `).join('')}
                  </div>
                </div>
              `;
            }
            return `
              <div>
                <strong style="text-transform: capitalize; color: var(--color-emerald-dark);">${key.replace(/([A-Z])/g, ' $1')}:</strong>
                <span style="color: var(--text-main); margin-left: 4px;">${value}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Dedicated SHIFTS Enterprise Layout with ShiftPlanner Application Launchpad
   */
  renderShifts(container, industryData, trialState, user) {
    const { id, name, tagline, description, stats } = industryData;
    const isTrialActive = trialState ? trialState.isTrialActive : false;
    const trialStatus = trialState ? trialState.status : 'not_started';
    const defaultShiftPlannerUrl = 'http://localhost:3000';

    const currentUser = user || (window.appState && window.appState.user) || {
      fullName: 'Operations Manager',
      companyName: 'Apex Contact Solutions',
      email: 'manager@enterprisegrowth.com',
      role: 'MANAGER',
      onboardingCompleted: false
    };

    const initials = currentUser.fullName
      ? currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'OM';

    const now = Date.now();
    const expiresTime = trialState && trialState.expiresAt ? new Date(trialState.expiresAt).getTime() : 0;
    const msLeft = Math.max(0, expiresTime - now);
    const daysRemaining = trialState && trialState.daysRemaining !== undefined
      ? trialState.daysRemaining
      : Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const expiresFormatted = trialState && trialState.expiresAt
      ? this.formatDate(trialState.expiresAt)
      : '15 Days from Activation';

    const isOnboardingComplete = Boolean(currentUser.onboardingCompleted);

    // 6 Specialized Quick Access Modules
    const modules = [
      {
        id: 'scheduler',
        title: 'Weekly Scheduler',
        route: '/scheduler',
        icon: 'calendar',
        desc: 'Build, view, and publish weekly shift rosters with live coverage tracking.'
      },
      {
        id: 'auto-scheduler',
        title: 'Automated Scheduling',
        route: '/auto-scheduler',
        icon: 'cpu',
        desc: 'Mathematical constraint solver generating fair, conflict-free schedules in seconds.'
      },
      {
        id: 'breaks',
        title: 'Break Management',
        route: '/breaks',
        icon: 'clock',
        desc: 'Intelligent break staggering to prevent understaffing during peak demand windows.'
      },
      {
        id: 'conflicts',
        title: 'Conflict Detection',
        route: '/conflicts',
        icon: 'alertTriangle',
        desc: 'Real-time violation alerts for overtime, mandatory rest periods, and skill gaps.'
      },
      {
        id: 'reports',
        title: 'Workforce Analytics',
        route: '/reports',
        icon: 'barChart',
        desc: 'Comprehensive labor cost, coverage rate, and shift utilization reports.'
      },
      {
        id: 'overview',
        title: 'Demand Forecasting',
        route: '/overview',
        icon: 'trendingUp',
        desc: 'Align shift staffing requirements with historical and predicted customer demand.'
      }
    ];

    container.innerHTML = `
      <div class="shifts-dashboard-layout">
        <!-- SECTION A: SHIFTS Header / Hero -->
        <section class="shifts-hero-compact">
          <div class="shifts-hero-meta-row">
            <span class="shifts-eyebrow">SHIFTS · WORKFORCE & SHIFT MANAGEMENT</span>
            <span class="shifts-trial-pill ${isTrialActive ? 'active' : 'inactive'}">
              <span class="pulse-dot ${isTrialActive ? 'active' : ''}"></span>
              ${isTrialActive ? `15-Day Trial Active • ${daysRemaining} Days Left` : '15-Day Free Evaluation Available'}
            </span>
          </div>

          <div class="shifts-hero-title-group">
            <h1 class="shifts-hero-headline">Every Shift. Every Team. Perfectly Aligned.</h1>
            <p class="shifts-hero-desc">
              Intelligent shift scheduling, seamless employee coordination, and mathematical roster optimization for modern multi-shift organizations.
            </p>
          </div>
        </section>

        <!-- SECTION B: Compact Trial Status Card (No Duplicates) -->
        <section class="shifts-trial-status-card" aria-label="15-Day Free Evaluation Status">
          <div class="trial-card-header">
            <div class="trial-card-title-group">
              <span class="trial-shield-icon">🛡️</span>
              <div>
                <h3 class="trial-card-title">15-Day Free Evaluation Status</h3>
                <p class="trial-card-sub">Full access to ShiftPlanner optimization solver and manager controls</p>
              </div>
            </div>
            <div class="trial-status-action">
              ${isTrialActive ? `
                <span class="trial-active-badge">✓ ACTIVE</span>
              ` : `
                <button type="button" class="btn-start-trial shifts-activate-trial-btn">Start 15-Day Trial</button>
              `}
            </div>
          </div>

          <div class="trial-metrics-grid">
            <div class="trial-metric-item">
              <span class="trial-metric-label">Access Tier</span>
              <strong class="trial-metric-val">Enterprise Manager</strong>
            </div>
            <div class="trial-metric-item">
              <span class="trial-metric-label">Remaining Duration</span>
              <strong class="trial-metric-val ${isTrialActive ? 'highlight' : ''}">${isTrialActive ? `${daysRemaining} Days` : '15 Days (Ready)'}</strong>
            </div>
            <div class="trial-metric-item">
              <span class="trial-metric-label">Evaluation Expiry</span>
              <strong class="trial-metric-val">${isTrialActive ? expiresFormatted : 'Starts upon activation'}</strong>
            </div>
            <div class="trial-metric-item">
              <span class="trial-metric-label">Assigned Organisation</span>
              <strong class="trial-metric-val truncate" title="${currentUser.companyName}">${currentUser.companyName || 'Apex Contact Solutions'}</strong>
            </div>
          </div>
        </section>

        <!-- SECTION C: Workforce Overview (4 KPI Cards) -->
        <section class="shifts-kpi-section" aria-label="Workforce Overview">
          <div class="shifts-section-header">
            <div>
              <h3 class="shifts-section-title">Workforce Overview</h3>
              <p class="shifts-section-sub">Live telemetry and operational metrics from ShiftPlanner</p>
            </div>
          </div>
          <div class="shifts-kpi-grid">
            ${stats.map((s, idx) => `
              <div class="shifts-kpi-card" style="--kpi-idx: ${idx};">
                <div class="kpi-top-row">
                  <span class="shifts-kpi-label">${s.label}</span>
                  <span class="shifts-kpi-badge ${s.trend || 'up'}">${s.change}</span>
                </div>
                <div class="shifts-kpi-value">${s.value}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- SECTION D: Manager Workspace -->
        <section class="shifts-manager-workspace-card shifts-launchpad-section" aria-label="Manager Workspace">
          <div class="workspace-header-content">
            <div class="workspace-badge-kicker">PRIMARY APPLICATION ACCESS</div>
            <h2 class="workspace-title">Your Workforce Workspace</h2>
            <p class="workspace-description">
              Launch into the full ShiftPlanner web application to create weekly rosters, execute constraint-based automated scheduling, review break staggering, and publish rosters for frontline employees via secure Single-Sign-On.
            </p>
          </div>

          <div class="workspace-actions-row">
            <button type="button" id="btn-shifts-launch-manager" class="workspace-primary-launch-btn shifts-launch-primary-btn" title="Open Operations Manager Dashboard in ShiftPlanner">
              <span class="btn-launch-icon">🚀</span>
              <div class="btn-launch-text">
                <strong class="launch-main-title">Open Manager Dashboard ↗</strong>
                <span class="launch-sub-title">Enter Manager Workspace ↗ via cryptographic Single-Sign-On</span>
              </div>
            </button>

            <div class="workspace-secondary-actions">
              <a href="#/shifts/onboarding?step=1" class="workspace-secondary-btn mgmt-action-link" title="Organisation Setup">
                <span class="sec-icon">⚙️</span>
                <span>Organisation Setup</span>
                <span class="visually-hidden" style="display:none;">Onboarding & Department Setup</span>
              </a>
              <a href="#/shifts/onboarding?step=4" class="workspace-secondary-btn mgmt-action-link" title="Manage Employees">
                <span class="sec-icon">👥</span>
                <span>Manage Employees</span>
              </a>
              <a href="#/shifts/onboarding?step=4" class="workspace-secondary-btn mgmt-action-link secondary" title="Invite Employees">
                <span class="sec-icon">✉️</span>
                <span>Invite Employees</span>
                <span class="visually-hidden" style="display:none;">Invite Frontline Employees</span>
              </a>
            </div>
          </div>
        </section>

        <!-- SECTION E: Quick Access Modules (3x2 Grid) -->
        <section class="shifts-modules-section" aria-label="Quick Access Modules">
          <div class="shifts-section-header">
            <div>
              <h3 class="shifts-section-title">Quick Access Modules</h3>
              <p class="shifts-section-sub">Direct access to specialized workforce optimization tools in ShiftPlanner</p>
            </div>
          </div>

          <div class="shifts-modules-grid">
            ${modules.map(mod => `
              <div class="shifts-module-card">
                <div class="module-card-icon">
                  ${window.getIcon(mod.icon, 'icon-md')}
                </div>
                <div class="module-card-body">
                  <h4 class="module-card-title">${mod.title}</h4>
                  <p class="module-card-desc">${mod.desc}</p>
                </div>
                <button type="button" class="module-launch-link" data-route="${mod.route}" title="Open ${mod.title} in ShiftPlanner">
                  <span>Open Module</span>
                  <span class="module-arrow">↗</span>
                </button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- SECTION F: Onboarding Guide -->
        <section class="shifts-onboarding-guide-card" aria-label="Onboarding Guide">
          <div class="onboarding-guide-header">
            <div class="guide-title-block">
              <span class="guide-icon">📋</span>
              <div>
                <h3 class="guide-title">Workforce Onboarding Checklist</h3>
                <p class="guide-sub">Complete these four steps to activate full automated scheduling for your team</p>
              </div>
            </div>
            <div class="guide-progress-block">
              <span class="guide-progress-badge ${isOnboardingComplete ? 'complete' : 'pending'}">
                ${isOnboardingComplete ? '✓ Setup Complete (100%)' : 'In Progress (Step 1 of 4)'}
              </span>
              <a href="#/shifts/onboarding" class="guide-resume-btn">
                <span>${isOnboardingComplete ? 'Review Setup' : 'Resume Setup'}</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div class="onboarding-progress-bar-container">
            <div class="onboarding-progress-bar-fill" style="width: ${isOnboardingComplete ? '100%' : '35%'};"></div>
          </div>

          <div class="onboarding-steps-grid">
            <div class="onboarding-step-tile ${isOnboardingComplete ? 'done' : 'active'}">
              <div class="step-badge">${isOnboardingComplete ? '✓' : '1'}</div>
              <div class="step-text">
                <h5 class="step-tile-title">Set Up Organisation</h5>
                <p class="step-tile-desc">Configure company profile, work hours, and departments.</p>
              </div>
            </div>

            <div class="onboarding-step-tile ${isOnboardingComplete ? 'done' : ''}">
              <div class="step-badge">${isOnboardingComplete ? '✓' : '2'}</div>
              <div class="step-text">
                <h5 class="step-tile-title">Add Employees</h5>
                <p class="step-tile-desc">Invite team members, assign roles, and set skill tags.</p>
              </div>
            </div>

            <div class="onboarding-step-tile ${isOnboardingComplete ? 'done' : ''}">
              <div class="step-badge">${isOnboardingComplete ? '✓' : '3'}</div>
              <div class="step-text">
                <h5 class="step-tile-title">Configure Shifts</h5>
                <p class="step-tile-desc">Define shift patterns, operational constraints, and break rules.</p>
              </div>
            </div>

            <div class="onboarding-step-tile ${isOnboardingComplete ? 'done' : ''}">
              <div class="step-badge">${isOnboardingComplete ? '✓' : '4'}</div>
              <div class="step-text">
                <h5 class="step-tile-title">Generate Your First Roster</h5>
                <p class="step-tile-desc">Run the auto-scheduler and publish the schedule to employees.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    // Bind Event Listeners for SHIFTS Interactive Launchpad
    this.bindShiftsLaunchpadEvents(container, currentUser, trialState);

    // Bind standard Trial Activation Buttons
    this.bindEvents(container, id);

    // Trigger scroll-based animations
    if (window.initScrollAnimations) {
      window.initScrollAnimations(container);
    }
  },

    // Bind Event Listeners for SHIFTS Interactive Launchpad
    this.bindShiftsLaunchpadEvents(container, currentUser, trialState);

    // Bind standard Trial Activation Buttons
    this.bindEvents(container, id);

    // Trigger scroll-based animations
    if (window.initScrollAnimations) {
      window.initScrollAnimations(container);
    }
  },

  /**
   * Bind event listeners for the SHIFTS application launcher
   */
  bindShiftsLaunchpadEvents(container, currentUser, trialState) {
    const isTrialActive = trialState ? trialState.isTrialActive : false;

    // Helper: Execute SSO Launch
    const executeLaunch = async (role, targetRoute, triggerBtn) => {
      const originalHtml = triggerBtn ? triggerBtn.innerHTML : '';
      if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.innerHTML = `
          <span class="spinner spinner-dark" style="width: 16px; height: 16px;"></span>
          <div><strong>Connecting to ShiftPlanner...</strong><small>Generating secure launch token</small></div>
        `;
      }

      try {
        const res = await window.api.getShiftsLaunchToken(role, targetRoute);
        if (res && res.success && res.launchUrl) {
          window.appState.showToast(`Launching ${role === 'EMPLOYEE' ? 'Employee Portal' : 'Manager Dashboard'} for ${currentUser.fullName}...`, 'success');
          // Open in new tab/window
          window.open(res.launchUrl, '_blank');
        } else {
          throw new Error(res.message || 'Failed to obtain launch token.');
        }
      } catch (err) {
        const errorMsg = err.data && err.data.message ? err.data.message : err.message || 'Launch error occurred.';
        window.appState.showToast(errorMsg, 'error');
      } finally {
        if (triggerBtn) {
          triggerBtn.disabled = false;
          triggerBtn.innerHTML = originalHtml;
        }
      }
    };

    // 1. Launch Manager Dashboard
    const btnManager = container.querySelector('#btn-shifts-launch-manager');
    if (btnManager) {
      btnManager.addEventListener('click', () => {
        executeLaunch('MANAGER', '/overview', btnManager);
      });
    }

    // 2. Launch Employee Portal
    const btnEmployee = container.querySelector('#btn-shifts-launch-employee');
    if (btnEmployee) {
      btnEmployee.addEventListener('click', () => {
        executeLaunch('EMPLOYEE', '/employee/dashboard', btnEmployee);
      });
    }

    // 3. Module Quicklinks
    container.querySelectorAll('.module-launch-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route') || '/scheduler';
        executeLaunch('MANAGER', route, null);
      });
    });

    // 4. Inline Sign Out
    const btnSignout = container.querySelector('#btn-shifts-inline-signout');
    if (btnSignout) {
      btnSignout.addEventListener('click', async () => {
        try {
          await window.api.logout();
          window.appState.setUser(null);
          window.appState.setTrials({});
          window.appState.showToast('Signed out of Insigrow.', 'info');
          window.location.hash = '#/login';
        } catch (e) {
          window.location.hash = '#/login';
        }
      });
    }
  },

  bindEvents(container, currentIndustryId) {
    // "Start Free 15-Day Trial" button in banner
    const startTrialBtn = container.querySelector('.btn-start-trial');
    if (startTrialBtn) {
      startTrialBtn.addEventListener('click', () => {
        window.TrialModal.open(currentIndustryId, () => {
          window.dispatchEvent(new CustomEvent('trial:updated', { detail: { industry: currentIndustryId } }));
        });
      });
    }

    // "Reactivate / Upgrade" button in expired banner
    const reTrialBtn = container.querySelector('.btn-re-trial');
    if (reTrialBtn) {
      reTrialBtn.addEventListener('click', () => {
        window.TrialModal.open(currentIndustryId, () => {
          window.dispatchEvent(new CustomEvent('trial:updated', { detail: { industry: currentIndustryId } }));
        });
      });
    }

    // Locked feature cards buttons
    container.querySelectorAll('.btn-unlock-trial-feature').forEach(btn => {
      btn.addEventListener('click', () => {
        window.TrialModal.open(currentIndustryId, () => {
          window.dispatchEvent(new CustomEvent('trial:updated', { detail: { industry: currentIndustryId } }));
        });
      });
    });
  }
};

window.IndustryView = IndustryView;

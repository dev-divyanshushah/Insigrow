/** Public Insigrow product landing page. */
const LandingView = {
  products: [
    { id: 'fmcg', name: 'FMCG', eyebrow: 'Consumer goods, in motion', headline: 'See demand clearly. Keep every shelf ready.', description: 'Bring sales, distributor performance, and inventory into one practical view of your consumer goods business.', icon: 'package', points: ['Sales by channel and region', 'Depot stock, expiry, and replenishment', 'Distributor tiers and product margins'], premium: ['Demand forecasting and seasonal buffers', 'Beat performance and competitor insights'], color: 'mint' },
    { id: 'manufacturing', name: 'Manufacturing', eyebrow: 'From shop floor to schedule', headline: 'Make every shift more predictable.', description: 'Connect production, materials, and supplier performance so teams can spot friction before it slows the line.', icon: 'cpu', points: ['Assembly line OEE and live telemetry', 'BOM reserves, work orders, and WIP', 'Unit costs and supplier delivery'], premium: ['Downtime root-cause analysis', 'Yield optimization and stability models'], color: 'blue' },
    { id: 'b2b', name: 'B2B', eyebrow: 'A clearer path to growth', headline: 'Move complex deals forward with confidence.', description: 'Give revenue teams one shared view of accounts, pipeline, fulfillment, and customer health.', icon: 'briefcase', points: ['Lead routing and account 360', 'Visual deal pipeline and SLA tracking', 'Enterprise customer health cohorts'], premium: ['Revenue recognition and ARR waterfall', 'Win/loss insights and quota intelligence'], color: 'violet' },
    { id: 'ca', name: 'Finance', eyebrow: 'For finance and advisory teams', headline: 'Keep compliance and client finances in view.', description: 'Organize client records, statutory deadlines, receivables, and reporting in a workspace built for finance professionals.', icon: 'fileText', points: ['Client registry and audit schedules', 'GST deadlines and receivables aging', 'Expense checks and financial snapshots'], premium: ['ROC/MCA tracking and workpapers', 'Financial ratios and tax planning insights'], color: 'amber' }
  ],

  render(container) {
    const productCards = this.products.map((p, i) => `
      <article class="landing-product-card ${p.color} motion-scroll-trigger" id="solution-${p.id}">
        <div class="landing-card-top"><span class="landing-product-icon">${window.getIcon(p.icon, 'icon')}</span><span class="landing-card-index">0${i + 1} / 04</span></div>
        <p class="landing-eyebrow">${p.eyebrow}</p><h3>${p.name}</h3><p class="landing-card-description">${p.description}</p>
        <div class="landing-includes"><span>INCLUDED IN YOUR WORKSPACE</span><ul>${p.points.map(x => `<li>${window.getIcon('check', 'icon-xs')} ${x}</li>`).join('')}</ul></div>
        <div class="landing-includes premium"><span>UNLOCK DURING YOUR 15-DAY TRIAL</span><ul>${p.premium.map(x => `<li>${window.getIcon('sparkles', 'icon-xs')} ${x}</li>`).join('')}</ul></div>
        <a class="landing-card-cta" href="#/solution/${p.id}">Explore ${p.name}<span>→</span></a>
      </article>`).join('');

    container.innerHTML = `
      <div class="landing-page">
        <header class="landing-header"><a class="landing-brand" href="#/landing"><img src="/insigrow-mark.png" alt="Insigrow"><span>INSIGROW</span></a>
          <nav class="landing-nav" aria-label="Solutions">${this.products.map(p => `<a href="#/solution/${p.id}">${p.name}</a>`).join('')}</nav>
          <div class="landing-header-actions"><a class="landing-login" href="#/login">Sign in</a><a class="landing-header-cta" href="#/register">Get started <span>↗</span></a></div>
        </header>
        <main>
          <section class="landing-hero">
            <div class="landing-hero-copy"><div class="landing-kicker"><span></span> THE OPERATING VIEW FOR WHAT'S NEXT</div>
              <h1>One platform.<br><em>Built for your</em> industry.</h1>
              <p>Bring the important parts of your business into focus. Choose a solution made for the way your team works, then try the full experience for 15 days.</p>
              <div class="landing-hero-actions"><a class="landing-primary-cta" href="#/landing" data-scroll-target="solutions">Find your solution <span>↓</span></a><span class="landing-note">15 days free · No credit card</span></div>
              <div class="landing-proof"><div class="landing-proof-avatars"><b>F</b><b>M</b><b>B</b><b>₹</b></div><span>Purpose-built for teams across<br><strong>four business disciplines</strong></span></div>
            </div>
            <div class="landing-hero-art" aria-label="An overview of the Insigrow business intelligence workspace"><div class="landing-orbit orbit-one"></div><div class="landing-orbit orbit-two"></div>
              <div class="landing-art-caption"><span>INSIGROW / BUSINESS OVERVIEW</span><span>LIVE VIEW <i></i></span></div>
              <div class="landing-dashboard-card"><div class="landing-dash-head"><div><small>MONDAY, 09:41 AM</small><h3>Your business, in focus.</h3></div><span class="landing-dash-avatar">IG</span></div>
                <div class="landing-dash-chart"><div class="landing-chart-label"><span>Performance overview</span><b>+18.6% <small>this quarter</small></b></div><div class="chart-bars">${[33,46,39,57,50,66,58,76,63,89,73,100].map((h,i)=>`<i style="--bar:${h}%;--i:${i}"></i>`).join('')}</div><div class="chart-months"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span></div></div>
                <div class="landing-dash-bottom"><div><span class="dash-mini-icon mint">${window.getIcon('package','icon-xs')}</span><small>FMCG</small><b>On the move</b></div><div><span class="dash-mini-icon blue">${window.getIcon('cpu','icon-xs')}</span><small>PLANT</small><b>Running well</b></div><div><span class="dash-mini-icon violet">${window.getIcon('briefcase','icon-xs')}</span><small>PIPELINE</small><b>Growing steadily</b></div></div>
              </div><div class="landing-floating-tag"><span>✳</span><div><b>One clear view</b><small>Made for your industry</small></div></div><div class="landing-floating-stat"><span>↑</span><div><small>TEAM MOMENTUM</small><b>Moving forward</b></div></div>
              <div class="landing-art-grid"></div>
            </div>
          </section>
          <section class="landing-solutions" id="solutions"><div class="landing-section-heading"><div><div class="landing-kicker"><span></span> MADE FOR THE WAY YOU WORK</div><h2>Choose your industry.<br><em>See what changes.</em></h2></div><p>Each solution brings everyday operations together and gives you advanced tools to go further during your free trial.</p></div>
            <div class="landing-products-grid">${productCards}</div>
          </section>
          <section class="landing-trial-band"><div><span class="landing-kicker"><span></span> YOUR NEXT 15 DAYS START HERE</span><h2>See your work in a<br>whole new light.</h2><p>Create your account and your selected solution will be ready to explore for 15 days.</p></div><a href="#/register" class="landing-primary-cta">Start your free trial <span>↗</span></a><div class="landing-band-mark">INSIGROW<br><span>CLARITY, BUILT AROUND YOU.</span></div></section>
        </main>
        <footer class="landing-footer"><a class="landing-brand" href="#/landing"><img src="/insigrow-mark.png" alt=""><span>INSIGROW</span></a><span>Enterprise solutions, shaped around your business.</span><div class="footer-powered-wrap"><span>Powered by</span><img src="/ei8-logo.png" alt="Ei8" class="footer-inline-ei8-img" /></div></footer>
      </div>`;

    container.querySelectorAll('[data-scroll-target]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      document.getElementById(link.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    if (window.initScrollAnimations) window.initScrollAnimations(container);
  }
};
window.LandingView = LandingView;

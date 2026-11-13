/**
 * Insigrow Industry Portal - Dedicated Industry Landing Pages
 * Professional SaaS product landing pages for FMCG, Manufacturing, B2B, and Finance (CA)
 * Implements balanced 2-column hero with realistic enterprise operations dashboard preview
 */

const IndustryLandingView = {
  // Master industry definitions
  industries: {
    fmcg: {
      id: 'fmcg',
      name: 'FMCG & Consumer Goods',
      shortName: 'FMCG',
      color: 'mint',
      accentColor: '#00A7D3',
      kicker: 'CONSUMER GOODS & DISTRIBUTOR INTELLIGENCE',
      heroHeadline: 'See demand clearly.<br><em>Keep every retail shelf ready.</em>',
      heroDescription: 'Bring secondary sales, distributor inventory, and multi-depot replenishment into one real-time operational view. Stop stockouts and eliminate expired inventory dumps.',
      ctaText: 'Start Your 15-Day Free Trial',
      stats: [
        { label: 'Monthly GMV', value: '₹1.84 Cr', change: '+14.2% MoM', trend: 'up' },
        { label: 'SKU Fill Rate', value: '98.4%', change: '+3.1% vs Target', trend: 'up' },
        { label: 'Active Distributors', value: '142', change: '12 Regional Zones', trend: 'neutral' },
        { label: 'Days on Hand (DOH)', value: '18.4 Days', change: '-2.1 Days Faster', trend: 'up' }
      ],
      heroDashboard: {
        title: 'Distribution & Secondary Sales Ops',
        badge: 'FMCG OPS',
        kpis: [
          { name: 'Monthly GMV', val: '₹1.84 Cr', change: '+14.2%', trend: 'up', sub: 'Across 12 Zones' },
          { name: 'Secondary Fill Rate', val: '98.4%', change: '+3.1%', trend: 'up', sub: 'Retail Trade Beats' },
          { name: 'Days on Hand (DOH)', val: '18.4 Days', change: '-2.1 D', trend: 'up', sub: 'Faster Stock Turn' },
          { name: 'Active Outlets', val: '18,420', change: '96.8%', trend: 'neutral', sub: 'Retail Coverage' }
        ],
        chartTitle: 'Weekly Secondary Sales Run Rate',
        chartBadge: '+18.6% Quarter Growth',
        chartBars: [
          { label: 'W1', pct: 62 },
          { label: 'W2', pct: 75 },
          { label: 'W3', pct: 70 },
          { label: 'W4', pct: 86 },
          { label: 'W5', pct: 92 },
          { label: 'W6', pct: 100 }
        ],
        feedTitle: 'Regional Depot Stock Status',
        feedItems: [
          { name: 'North Hub (Gurugram)', meta: '₹42.5 L · 88% Cap', statusText: 'Optimal', statusClass: 'green' },
          { name: 'West Hub (Bhiwandi)', meta: '₹58.1 L · 92% Cap', statusText: 'Near Cap', statusClass: 'amber' },
          { name: 'South Hub (Bengaluru)', meta: '₹31.0 L · 64% Cap', statusText: 'Optimal', statusClass: 'green' }
        ]
      },
      challenges: [
        {
          title: 'Blind Spots in Secondary Sales',
          desc: 'Delayed distributor sales reports leave management guessing actual retail consumption until stock is already nearing expiry on dealer shelves.',
          icon: 'alertTriangle'
        },
        {
          title: 'Regional Inventory Imbalances',
          desc: 'Urban high-velocity depots face critical stockouts while regional warehouses accumulate slow-moving inventory, locking up working capital.',
          icon: 'layers'
        },
        {
          title: 'Distributor Scheme & Margin Leaks',
          desc: 'Manual tracking of discount schemes, seasonal rebates, and credit thresholds results in margin erosion and friction with distribution partners.',
          icon: 'fileText'
        },
        {
          title: 'Ineffective Field Beat Coverage',
          desc: 'Sales representatives waste time on low-yield routes without automated order booking, predictive replenishment, or beat compliance tracking.',
          icon: 'truck'
        }
      ],
      solutions: [
        {
          title: 'Secondary Sales & Channel Velocity',
          desc: 'Real-time synchronization of primary billing and secondary retail pull across General Trade (Kiranas), Modern Trade, and Quick Commerce channels.',
          icon: 'trendingUp',
          badge: 'Included in Core'
        },
        {
          title: 'Multi-Echelon Depot Inventory',
          desc: 'Central factory warehouse and regional C&F depot visibility with automated safety stock thresholds and replenishment recommendations.',
          icon: 'package',
          badge: 'Included in Core'
        },
        {
          title: 'AI-Powered Demand Forecasting',
          desc: 'Machine learning models combining historical sales run-rates, regional festivals, and seasonality to predict SKU demand 60 days in advance.',
          icon: 'sparkles',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Distributor Tiering & Margin Governance',
          desc: 'Automated distributor scoring based on payment cycles, order frequency, and territory return rates with dynamic credit control.',
          icon: 'shieldCheck',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Batch Expiry & FEFO Management',
          desc: 'Strict First-Expired-First-Out dispatch routing, batch-level tracking, and automated alerts for products within 90 days of expiration.',
          icon: 'layers',
          badge: 'Included in Core'
        },
        {
          title: 'Field Beat Performance & Order Booking',
          desc: 'Mobile-ready order capture, geo-fenced retailer check-ins, and automated daily sales reports (DSR) directly from retail beats.',
          icon: 'checkCircle',
          badge: 'Included in Core'
        }
      ],
      previewMetrics: {
        headline: 'Live Consumer Goods Operations Telemetry',
        sub: 'Real-time data feed from 142 authorized distributors & 4 regional depots',
        channels: [
          { name: 'General Trade (Kiranas)', share: '54%', rev: '₹99.36 L', growth: '+8.4%' },
          { name: 'Modern Trade (Supermarkets)', share: '28%', rev: '₹51.52 L', growth: '+19.2%' },
          { name: 'Quick Commerce / E-Com', share: '18%', rev: '₹33.12 L', growth: '+31.5%' }
        ],
        depots: [
          { name: 'North Hub (Gurugram)', cap: '88% Full', val: '₹42.5 L', status: 'Optimal' },
          { name: 'West Hub (Bhiwandi)', cap: '92% Full', val: '₹58.1 L', status: 'Near Cap' },
          { name: 'South Hub (Bengaluru)', cap: '64% Full', val: '₹31.0 L', status: 'Optimal' },
          { name: 'East Hub (Kolkata)', cap: '78% Full', val: '₹28.4 L', status: 'Optimal' }
        ]
      },
      benefits: [
        { num: '32%', label: 'Reduction in Retail Stockouts', desc: 'Predictive replenishment ensures high-demand SKUs are always stocked before weekend sales surges.' },
        { num: '4.2 Days', label: 'Faster Inventory Turnover (DOH)', desc: 'Cut warehouse carrying costs by eliminating slow-moving batch hoarding across regional C&F depots.' },
        { num: '99.1%', label: 'Secondary Order Fulfillment Rate', desc: 'Distributor orders are processed and allocated in hours rather than multiple business days.' },
        { num: '100%', label: 'Traceability & FEFO Compliance', desc: 'Complete batch visibility prevents product expiration write-offs and protects consumer trust.' }
      ],
      regHeadline: 'Ready to bring your FMCG distribution network into sharp focus?',
      regSubtitle: 'Activate your 15-day complimentary trial with all enterprise analytics, distributor margin intelligence, and forecasting unlocked.'
    },

    manufacturing: {
      id: 'manufacturing',
      name: 'Manufacturing & Industrial Operations',
      shortName: 'Manufacturing',
      color: 'blue',
      accentColor: '#116D7B',
      kicker: 'INDUSTRIAL MANUFACTURING & SHOP-FLOOR TELEMETRY',
      heroHeadline: 'Predictable shifts.<br><em>Zero unplanned line downtime.</em>',
      heroDescription: 'Connect shop-floor machines, assembly line OEE, raw material BOMs, and supplier quality into a unified real-time operations workspace for plant managers.',
      ctaText: 'Start Your 15-Day Free Trial',
      stats: [
        { label: 'Plant Overall OEE', value: '86.4%', change: '+3.2% vs Benchmark', trend: 'up' },
        { label: 'Daily Output', value: '14,850 Pcs', change: 'Across 2 Shifts', trend: 'up' },
        { label: 'Work Orders on Schedule', value: '94.8%', change: '38 Active Orders', trend: 'up' },
        { label: 'Scrap & Spoilage Rate', value: '1.18%', change: 'Target < 1.50%', trend: 'up' }
      ],
      heroDashboard: {
        title: 'Plant Operations & OEE Telemetry',
        badge: 'PLANT OPS',
        kpis: [
          { name: 'Production Efficiency', val: '89.4%', change: '+3.2%', trend: 'up', sub: 'Plant Line Average' },
          { name: 'Machine Uptime', val: '99.2%', change: '+0.8%', trend: 'up', sub: 'MTBF: 142.5 hrs' },
          { name: 'Active Orders', val: '38 Orders', change: '94.8%', trend: 'up', sub: 'Shift 1 & 2 on Track' },
          { name: 'Inventory Status', val: '22 Days', change: 'Safe', trend: 'neutral', sub: 'Raw Material Buffer' }
        ],
        chartTitle: 'Hourly Production Output vs Target',
        chartBadge: '14,850 Units Shift Target',
        chartBars: [
          { label: '08:00', pct: 72 },
          { label: '10:00', pct: 86 },
          { label: '12:00', pct: 80 },
          { label: '14:00', pct: 94 },
          { label: '16:00', pct: 90 },
          { label: '18:00', pct: 100 }
        ],
        feedTitle: 'Live Assembly Line Telemetry',
        feedItems: [
          { name: 'Line 1 (Stamping & Press)', meta: '480 pcs/hr · 89.2% OEE', statusText: 'Running', statusClass: 'green' },
          { name: 'Line 2 (CNC Machining)', meta: '320 pcs/hr · 84.6% OEE', statusText: 'Running', statusClass: 'green' },
          { name: 'Line 4 (Final Assembly & QA)', meta: '450 pcs/hr · Shift Change', statusText: 'Changeover', statusClass: 'amber' }
        ]
      },
      challenges: [
        {
          title: 'Unrecorded Machine Micro-Stoppages',
          desc: 'Frequent 2-5 minute micro-stoppages go unlogged by operators, silently eroding up to 18% of available shift production capacity.',
          icon: 'cpu'
        },
        {
          title: 'Raw Material Starvation & BOM Halts',
          desc: 'Assembly lines abruptly grind to a halt because critical tier-2 supplier delivery delays are only discovered when the job begins.',
          icon: 'layers'
        },
        {
          title: 'Distorted Unit Production Costing',
          desc: 'Fluctuating power tariffs, scrap rates, and direct labor overtime are tracked retrospectively, leaving actual batch margins unknown.',
          icon: 'pieChart'
        },
        {
          title: 'Reactive Equipment Breakdowns',
          desc: 'Emergency machine breakdowns force costly overtime shifts, scramble production schedules, and cause missed customer dispatch commitments.',
          icon: 'alertTriangle'
        }
      ],
      solutions: [
        {
          title: 'Live Shop-Floor OEE & Station Telemetry',
          desc: 'Real-time tracking of machine availability, performance rate, and quality yield across CNC, stamping, and automated assembly stations.',
          icon: 'activity',
          badge: 'Included in Core'
        },
        {
          title: 'BOM Reserves & WIP Stage Tracking',
          desc: 'Bill of Materials reservation logic linked to active work orders, preventing line starvation with automated lead-time buffers.',
          icon: 'layers',
          badge: 'Included in Core'
        },
        {
          title: 'Downtime Root Cause & MTBF / MTTR',
          desc: 'Automated Ishikawa classification of line stoppages, tracking Mean Time Between Failures and Mean Time to Repair improvements.',
          icon: 'cpu',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Unit Cost Variance & Energy Analytics',
          desc: 'Real-time calculation of direct materials, direct labor, utility power tariffs, and tooling consumables per finished component.',
          icon: 'pieChart',
          badge: 'Included in Core'
        },
        {
          title: 'Yield Optimization & Thermal Models',
          desc: 'Multi-variable regression models correlating machine temperatures, feed rates, and ambient humidity to scrap rate reduction.',
          icon: 'sparkles',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Tier-1 Vendor Quality & OTD Metrics',
          desc: 'Comprehensive scorecard tracking supplier defect PPM, on-time delivery rates (OTD), and inbound transit reliability.',
          icon: 'truck',
          badge: 'Included in Core'
        }
      ],
      previewMetrics: {
        headline: 'Plant Telemetry & Assembly Line Throughput',
        sub: 'Live shop floor monitoring across 4 active manufacturing lines',
        lines: [
          { name: 'Line 1 - Stamping & Press', throughput: '480 pcs/hr', oee: '89.2%', status: 'Running' },
          { name: 'Line 2 - CNC Machining Center', throughput: '320 pcs/hr', oee: '84.6%', status: 'Running' },
          { name: 'Line 3 - Heat Treatment Chamber', throughput: '210 pcs/hr', oee: '88.1%', status: 'Running' },
          { name: 'Line 4 - Final Assembly & QA', throughput: '450 pcs/hr', oee: '83.7%', status: 'Changeover' }
        ],
        downtime: [
          { cause: 'Planned Die Changeover', hours: '4.2 hrs', percent: '52%' },
          { cause: 'Sensor Calibration Stoppage', hours: '1.8 hrs', percent: '22%' },
          { cause: 'Material Feed Starvation', hours: '1.2 hrs', percent: '15%' },
          { cause: 'Unscheduled Mechanical Jam', hours: '0.9 hrs', percent: '11%' }
        ]
      },
      benefits: [
        { num: '18.5%', label: 'Increase in Plant OEE', desc: 'Eliminate micro-stoppages and optimize changeover intervals with live workstation telemetry.' },
        { num: '42%', label: 'Reduction in Line Downtime', desc: 'Predictive maintenance warnings notify maintenance engineers days before bearing or pump failure.' },
        { num: '₹28.4 L', label: 'Annual Projected Scrap Savings', desc: 'Precision parameter monitoring reduces component defects below 1.2% across high-tolerance runs.' },
        { num: '99.4%', label: 'On-Time Dispatch Reliability', desc: 'Work orders flow smoothly through production stages without missing customer delivery deadlines.' }
      ],
      regHeadline: 'Ready to modernize your manufacturing operations?',
      regSubtitle: 'Start your 15-day free trial with live machine telemetry, automated BOM planning, and downtime root-cause diagnostics.'
    },

    b2b: {
      id: 'b2b',
      name: 'B2B Enterprise Growth & Pipeline',
      shortName: 'B2B',
      color: 'violet',
      accentColor: '#528F4D',
      kicker: 'B2B SALES PIPELINE & ACCOUNT INTELLIGENCE',
      heroHeadline: 'Move enterprise deals forward.<br><em>Accelerate high-ticket revenue.</em>',
      heroDescription: 'Give revenue leaders, account executives, and customer success teams one shared operational view of lead routing, visual deal pipelines, SLA milestones, and recurring ARR.',
      ctaText: 'Start Your 15-Day Free Trial',
      stats: [
        { label: 'Active Pipeline Value', value: '₹12.8 Cr', change: '34 Qualified Deals', trend: 'up' },
        { label: 'YTD Closed-Won', value: '₹5.4 Cr', change: '+24.5% vs Prior Year', trend: 'up' },
        { label: 'Average Contract Value', value: '₹37.6 L', change: '+12% ACV Growth', trend: 'up' },
        { label: 'Net Retention Rate (NRR)', value: '118%', change: 'Low Churn: 0.6%', trend: 'up' }
      ],
      heroDashboard: {
        title: 'Enterprise Pipeline & Revenue Telemetry',
        badge: 'REV OPS',
        kpis: [
          { name: 'Active Pipeline', val: '₹12.8 Cr', change: '+24.5%', trend: 'up', sub: '34 Qualified Deals' },
          { name: 'Closed-Won (YTD)', val: '₹5.4 Cr', change: '+18.2%', trend: 'up', sub: 'New Enterprise ARR' },
          { name: 'Average Deal Size', val: '₹37.6 L', change: '+12%', trend: 'up', sub: 'Multi-Year Contract' },
          { name: 'Net Retention (NRR)', val: '118%', change: '0.6% Churn', trend: 'neutral', sub: 'Expansion Index' }
        ],
        chartTitle: 'Deal Pipeline Conversion Waterfall',
        chartBadge: '94% Forecast Accuracy',
        chartBars: [
          { label: 'Discovery', pct: 55 },
          { label: 'Proof', pct: 70 },
          { label: 'Proposal', pct: 85 },
          { label: 'Legal', pct: 90 },
          { label: 'Closing', pct: 96 },
          { label: 'Won', pct: 100 }
        ],
        feedTitle: 'Key Enterprise Account Health',
        feedItems: [
          { name: 'Apex Conglomerate Ltd', meta: '₹85 L ARR · Closing Nov', statusText: 'Strong', statusClass: 'green' },
          { name: 'Quantum FinTech Labs', meta: '₹48 L ARR · Proposal Stage', statusText: 'In Review', statusClass: 'blue' },
          { name: 'OmniHealth Solutions Pvt', meta: '₹32 L ARR · Security Audit', statusText: 'Negotiation', statusClass: 'amber' }
        ]
      },
      challenges: [
        {
          title: 'Stalled Multi-Stakeholder Deals',
          desc: 'High-ticket B2B deals drag on for quarters because teams lose track of champions, economic buyers, procurement approvals, and legal reviews.',
          icon: 'briefcase'
        },
        {
          title: 'Inaccurate Revenue Projections',
          desc: 'Executive forecasting relies on subjective sales rep optimism rather than verifiable deal milestones and stage conversion velocity.',
          icon: 'trendingUp'
        },
        {
          title: 'Silent Enterprise Customer Churn',
          desc: 'Post-sale handoffs fail and account teams only discover customer dissatisfaction when annual contract renewal negotiations stall.',
          icon: 'alertTriangle'
        },
        {
          title: 'Delayed Inbound Lead Response',
          desc: 'Inbound enterprise inquiries from websites, partner referrals, and trade expos sit for days before being routed to the right territory rep.',
          icon: 'users'
        }
      ],
      solutions: [
        {
          title: 'Automated Lead Routing & Scoring',
          desc: 'Ingest leads from inbound channels, evaluate ICP qualification scores, and assign immediately based on regional territory rules.',
          icon: 'user',
          badge: 'Included in Core'
        },
        {
          title: '360° Account Relationship Maps',
          desc: 'Map economic decision makers, internal champions, communication logs, and contract renewal dates in one unified client record.',
          icon: 'building',
          badge: 'Included in Core'
        },
        {
          title: 'Visual Deal Pipeline & Stage SLAs',
          desc: 'Custom deal stages with automated aging alerts for stuck opportunities, next-step enforcement, and expected close dates.',
          icon: 'sliders',
          badge: 'Included in Core'
        },
        {
          title: 'ARR Waterfall & Expansion Modeling',
          desc: 'Track new business, expansion revenue, contraction, and cohort-based net revenue retention across multi-year contracts.',
          icon: 'sparkles',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Win/Loss Diagnostics & Quota Tracking',
          desc: 'Analyze displacement factors against competitors, price resistance trends, and individual sales rep quota attainment distributions.',
          icon: 'pieChart',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Contract Deliverable & Renewal Milestones',
          desc: 'Automate post-sale implementation milestones, customer health scores, and 90-day renewal countdown notifications.',
          icon: 'checkCircle',
          badge: 'Included in Core'
        }
      ],
      previewMetrics: {
        headline: 'Enterprise Sales Velocity & Pipeline Telemetry',
        sub: 'Real-time pipeline monitoring across 34 active enterprise accounts',
        stages: [
          { stage: '1. Discovery & Needs Analysis', count: 12, value: '₹3.4 Cr', prob: '20%' },
          { stage: '2. Solution Proof & Architecture', count: 9, value: '₹4.2 Cr', prob: '45%' },
          { stage: '3. Proposal & Procurement Review', count: 8, value: '₹3.8 Cr', prob: '70%' },
          { stage: '4. Executive Negotiation & Closing', count: 5, value: '₹1.4 Cr', prob: '90%' }
        ],
        accounts: [
          { name: 'Apex Conglomerate Ltd', arr: '₹85 L', health: 'Strong', renewal: 'March 2027' },
          { name: 'Quantum FinTech Labs', arr: '₹48 L', health: 'Strong', renewal: 'Jan 2027' },
          { name: 'OmniHealth Solutions Pvt', arr: '₹32 L', health: 'Moderate', renewal: 'Dec 2026' }
        ]
      },
      benefits: [
        { num: '28%', label: 'Faster Sales Cycle Velocity', desc: 'Stage milestone governance eliminates deal stalls and accelerates contract closing times.' },
        { num: '118%', label: 'Net Revenue Retention (NRR)', desc: 'Proactive account health alerts prevent churn and expand annual contract values.' },
        { num: '94%', label: 'Forecast Accuracy within 5%', desc: 'Data-driven pipeline probability models replace guesswork with reliable quarter-end close forecasts.' },
        { num: '3.4x', label: 'Account Expansion Growth', desc: 'Uncover cross-sell and up-sell opportunities across enterprise subsidiaries and departments.' }
      ],
      regHeadline: 'Ready to scale your enterprise sales pipeline?',
      regSubtitle: 'Start your 15-day free trial with visual pipeline management, account 360 intelligence, and ARR forecasting.'
    },

    ca: {
      id: 'ca',
      name: 'Finance, CA & Statutory Advisory',
      shortName: 'Finance',
      color: 'amber',
      accentColor: '#B251A6',
      kicker: 'FINANCIAL REPORTING, AUDIT & COMPLIANCE ADVISORY',
      heroHeadline: 'Statutory compliance in order.<br><em>Client finances in clear view.</em>',
      heroDescription: 'Engineered for Chartered Accountants, corporate finance teams, and advisory firms. Keep client records, statutory GST/ROC filing deadlines, receivables aging, and Schedule III reporting perfectly synchronized.',
      ctaText: 'Start Your 15-Day Free Trial',
      stats: [
        { label: 'Corporate Clients', value: '86 Entities', change: '100% KYC Verified', trend: 'up' },
        { label: 'Unbilled Workpapers', value: '₹24.8 L', change: 'Across 42 Engagements', trend: 'up' },
        { label: 'Filings Due This Month', value: '114', change: '89 Completed', trend: 'up' },
        { label: 'Audit Trail Health', value: '100% Ready', change: 'Zero Red Flags', trend: 'up' }
      ],
      heroDashboard: {
        title: 'Statutory Calendar & Practice Telemetry',
        badge: 'TAX & AUDIT',
        kpis: [
          { name: 'Corporate Clients', val: '86 Entities', change: '100% KYC', trend: 'up', sub: 'Active Client Roster' },
          { name: 'Filings This Month', val: '114 Total', change: '89 Done', trend: 'up', sub: '78% on Schedule' },
          { name: 'Unbilled WIP', val: '₹24.8 L', change: '+14.2%', trend: 'up', sub: '42 Engagements' },
          { name: 'Audit Trail Health', val: '100% Ready', change: 'Clean', trend: 'neutral', sub: 'Sec 40A(3) Checked' }
        ],
        chartTitle: 'Statutory Tax & GST Return Progress',
        chartBadge: '100% On-Time Record',
        chartBars: [
          { label: 'GSTR-1', pct: 98 },
          { label: 'GSTR-3B', pct: 68 },
          { label: 'TDS 194', pct: 85 },
          { label: 'AOC-4', pct: 92 },
          { label: 'MGT-7', pct: 74 },
          { label: 'DIR-3', pct: 100 }
        ],
        feedTitle: 'Upcoming Statutory Deadlines',
        feedItems: [
          { name: 'GSTR-1 Monthly Return', meta: 'Due 11th · 84/86 Filed', statusText: 'Urgent', statusClass: 'amber' },
          { name: 'GSTR-3B Tax Return', meta: 'Due 20th · 32/86 Filed', statusText: 'In Progress', statusClass: 'blue' },
          { name: 'TDS Section 194C/J', meta: 'Due 7th · All Verified', statusText: 'On Schedule', statusClass: 'green' }
        ]
      },
      challenges: [
        {
          title: 'Penalty Risks from Missed Deadlines',
          desc: 'Tracking hundreds of GSTR-1, GSTR-3B, TDS returns, and MCA filings across multiple corporate clients on spreadsheets leads to stressful filing rushes and penalty notices.',
          icon: 'alertTriangle'
        },
        {
          title: 'Unbilled Hours & Stalled Receivables',
          desc: 'CA firms perform critical advisory work but fail to log billable hours or track client receivables aging beyond 60 days, straining operating cash flow.',
          icon: 'creditCard'
        },
        {
          title: 'Labor-Intensive Schedule III Statements',
          desc: 'Compiling balance sheets, P&L statements, and cash flow schedules compliant with Indian AS from messy client trial balances consumes weeks of partner time.',
          icon: 'fileText'
        },
        {
          title: 'Audit Trail & Disallowance Exposure',
          desc: 'Catching non-compliant cash expenses exceeding ₹10,000 under Section 40A(3) or missing 194C TDS deductions during busy tax audit seasons is error-prone.',
          icon: 'shieldCheck'
        }
      ],
      solutions: [
        {
          title: 'Corporate Client Registry & Partner Directory',
          desc: 'Maintain verified client rosters, GSTIN validation statuses, Director KYC registries, and assigned audit managers in one centralized database.',
          icon: 'briefcase',
          badge: 'Included in Core'
        },
        {
          title: 'Statutory Tax & GST Deadline Engine',
          desc: 'Proactive calendar alerts for GSTR-1, GSTR-3B, Advance Tax, and TDS payments with filing completion progress trackers.',
          icon: 'calendar',
          badge: 'Included in Core'
        },
        {
          title: 'Automated Schedule III Financial Reports',
          desc: 'Instant generation of Balance Sheets, Profit & Loss Statements, and Cash Flow Schedules compliant with Companies Act Schedule III.',
          icon: 'fileText',
          badge: 'Included in Core'
        },
        {
          title: 'Receivables Aging & Retainer Billing',
          desc: 'Track 0-30, 31-60, and 60+ days client receivables aging, automate payment reminders, and monitor unbilled partner hours.',
          icon: 'creditCard',
          badge: 'Included in Core'
        },
        {
          title: 'Full ROC & MCA Filing Workpapers',
          desc: 'Statutory tracking for AOC-4, MGT-7, DIR-3 KYC, and automated generation of 14 standard Tax Audit workpapers from trial balances.',
          icon: 'shieldCheck',
          badge: '15-Day Trial Feature'
        },
        {
          title: 'Financial Ratio Benchmarking & Tax Models',
          desc: 'Deep ratio diagnostics (Current, Quick, Debt-to-Equity, DSCR, DuPont ROE) and tax simulation models identifying unclaimed ITC.',
          icon: 'sparkles',
          badge: '15-Day Trial Feature'
        }
      ],
      previewMetrics: {
        headline: 'Firm Practice Management & Compliance Telemetry',
        sub: 'Live compliance monitoring across 86 active client entities',
        deadlines: [
          { form: 'GSTR-1 (Monthly Filers)', due: '11th of Month', progress: '84/86 Filed', status: 'Urgent' },
          { form: 'GSTR-3B (Tax Return)', due: '20th of Month', progress: '32/86 Filed', status: 'In Progress' },
          { form: 'TDS Section 194C/J', due: '7th of Month', progress: 'Scheduled', status: 'Upcoming' }
        ],
        aging: [
          { bucket: '0 - 30 Days Current', amount: '₹14.2 L', count: 42 },
          { bucket: '31 - 60 Days Due', amount: '₹7.1 L', count: 18 },
          { bucket: '60+ Days Overdue', amount: '₹3.5 L', count: 6 }
        ]
      },
      benefits: [
        { num: '100%', label: 'On-Time Statutory Compliance', desc: 'Automated deadline countdowns eliminate client penalty notices and late filing fees.' },
        { num: '38%', label: 'Reduction in Audit Compilation Time', desc: 'Pre-formatted Schedule III financial report generators cut manual ledger reconciliation in half.' },
        { num: '2.4x', label: 'Faster Client Receivables Realization', desc: 'Automated overdue aging notices and retainer billing tracking keep firm cash flow healthy.' },
        { num: 'Zero', label: 'Audit Trail Red Flags', desc: 'Built-in Section 40A(3) and 194C compliance checks catch disallowable expenses before submission.' }
      ],
      regHeadline: 'Ready to modernize your financial practice or corporate advisory?',
      regSubtitle: 'Activate your 15-day complimentary trial with automated statutory calendars, client receivables tracking, and financial analytics.'
    }
  },

  /**
   * Main render function for industry landing pages
   * @param {HTMLElement} container - Target DOM container
   * @param {string} industryKey - 'fmcg' | 'manufacturing' | 'b2b' | 'ca' | 'finance'
   */
  render(container, industryKey) {
    let key = (industryKey || 'fmcg').toLowerCase().trim();
    if (key === 'finance') key = 'ca';
    const ind = this.industries[key] || this.industries.fmcg;
    const dash = ind.heroDashboard;

    const navItems = [
      { id: 'fmcg', name: 'FMCG' },
      { id: 'manufacturing', name: 'Manufacturing' },
      { id: 'b2b', name: 'B2B Enterprise' },
      { id: 'ca', name: 'Finance & CA' }
    ];

    container.innerHTML = `
      <div class="landing-page industry-landing-page ${ind.color}">
        <!-- Top Navigation Bar -->
        <header class="landing-header">
          <a class="landing-brand" href="#/landing">
            <img src="/insigrow-mark.png" alt="Insigrow Logo" />
            <span>INSIGROW</span>
          </a>
          <nav class="landing-nav" aria-label="Industry Solutions">
            <a href="#/landing" class="nav-home-link">← Overview</a>
            ${navItems.map(item => `
              <a href="#/solution/${item.id}" class="${item.id === ind.id ? 'active-nav-link' : ''}">
                ${item.name}
              </a>
            `).join('')}
          </nav>
          <div class="landing-header-actions">
            <a class="landing-login" href="#/login">Sign in</a>
            <a class="landing-header-cta" href="#/register?industry=${ind.id}">
              Start Free Trial <span>↗</span>
            </a>
          </div>
        </header>

        <main>
          <!-- ======================================================== -->
          <!-- SECTION 1: HERO SECTION (BALANCED 55/45 TWO-COLUMN SAAS) -->
          <!-- ======================================================== -->
          <section class="ind-hero-section">
            <div class="ind-hero-container">
              <!-- LEFT COLUMN (~55%) -->
              <div class="ind-hero-left">
                <div class="ind-hero-badge">
                  <span class="ind-badge-dot"></span>
                  <span class="ind-badge-text">15-DAY FREE TRIAL · ${ind.shortName.toUpperCase()} SOLUTION</span>
                </div>

                <h1 class="ind-hero-heading">${ind.heroHeadline}</h1>
                <p class="ind-hero-description">${ind.heroDescription}</p>

                <div class="ind-hero-cta-group">
                  <a href="#/register?industry=${ind.id}" class="ind-btn-primary">
                    <span>${ind.ctaText}</span>
                    <span class="ind-btn-arrow">→</span>
                  </a>
                  <a href="#solutions-section" class="ind-btn-secondary" onclick="document.getElementById('solutions-section').scrollIntoView({behavior:'smooth'}); return false;">
                    <span>Explore Features</span>
                    <span class="ind-btn-arrow-down">↓</span>
                  </a>
                </div>

                <div class="ind-hero-trust-row">
                  <div class="ind-trust-item">
                    <span class="ind-trust-check">✓</span>
                    <span>No credit card required</span>
                  </div>
                  <div class="ind-trust-item">
                    <span class="ind-trust-check">✓</span>
                    <span>Immediate workspace access</span>
                  </div>
                  <div class="ind-trust-item">
                    <span class="ind-trust-check">✓</span>
                    <span>Confirmation email after registration</span>
                  </div>
                </div>
              </div>

              <!-- RIGHT COLUMN (~45%): REALISTIC SAAS DASHBOARD PREVIEW -->
              <div class="ind-hero-right">
                <div class="ind-dash-preview-card">
                  <!-- Chrome Top Bar -->
                  <div class="ind-dash-topbar">
                    <div class="ind-dash-dots">
                      <span class="dot red"></span>
                      <span class="dot amber"></span>
                      <span class="dot green"></span>
                    </div>
                    <div class="ind-dash-title">${dash.title}</div>
                    <div class="ind-dash-live-badge">
                      <span class="ind-live-indicator"></span>
                      <span>LIVE TELEMETRY</span>
                    </div>
                  </div>

                  <!-- 4 Core Operational KPI Metric Tiles -->
                  <div class="ind-dash-kpis">
                    ${dash.kpis.map(k => `
                      <div class="ind-dash-kpi">
                        <span class="ind-kpi-name">${k.name}</span>
                        <div class="ind-kpi-val-row">
                          <span class="ind-kpi-val">${k.val}</span>
                          <span class="ind-kpi-tag ${k.trend}">${k.change}</span>
                        </div>
                        <span class="ind-kpi-sub">${k.sub}</span>
                      </div>
                    `).join('')}
                  </div>

                  <!-- Mini Performance / Output Chart -->
                  <div class="ind-dash-chart-section">
                    <div class="ind-chart-header">
                      <span class="ind-chart-title">${dash.chartTitle}</span>
                      <span class="ind-chart-badge">${dash.chartBadge}</span>
                    </div>
                    <div class="ind-chart-bars-wrap">
                      ${dash.chartBars.map(b => `
                        <div class="ind-chart-col">
                          <div class="ind-chart-bar-bg">
                            <div class="ind-chart-bar-fill" style="height: ${b.pct}%;"></div>
                          </div>
                          <span class="ind-chart-col-label">${b.label}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Live Operations / Status Feed -->
                  <div class="ind-dash-feed-section">
                    <div class="ind-feed-header">${dash.feedTitle}</div>
                    <div class="ind-feed-list">
                      ${dash.feedItems.map(item => `
                        <div class="ind-feed-item">
                          <div class="ind-feed-info">
                            <span class="ind-feed-name">${item.name}</span>
                            <span class="ind-feed-meta">${item.meta}</span>
                          </div>
                          <span class="ind-feed-badge ${item.statusClass}">${item.statusText}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ======================================================== -->
          <!-- SECTION 2: INDUSTRY CHALLENGES -->
          <!-- ======================================================== -->
          <section class="industry-challenges-section" id="challenges-section">
            <div class="section-container">
              <div class="landing-section-heading">
                <div>
                  <div class="landing-kicker"><span></span> OPERATIONAL BOTTLENECKS</div>
                  <h2>The challenges facing<br><em>${ind.name} teams today.</em></h2>
                </div>
                <p>Traditional ERPs and fragmented spreadsheets create operational friction. Here is where businesses lose time, margin, and momentum.</p>
              </div>

              <div class="challenges-grid">
                ${ind.challenges.map((c, idx) => `
                  <div class="challenge-card motion-scroll-trigger">
                    <div class="challenge-icon-box">
                      ${window.getIcon(c.icon, 'icon')}
                      <span class="challenge-num">0${idx + 1}</span>
                    </div>
                    <h3>${c.title}</h3>
                    <p>${c.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- ======================================================== -->
          <!-- SECTION 3: INSIGROW SOLUTIONS -->
          <!-- ======================================================== -->
          <section class="industry-solutions-section" id="solutions-section">
            <div class="section-container">
              <div class="landing-section-heading">
                <div>
                  <div class="landing-kicker"><span></span> THE INSIGROW ADVANTAGE</div>
                  <h2>Engineered specifically for<br><em>${ind.shortName} operations.</em></h2>
                </div>
                <p>Explore the full suite of operational modules ready to deploy immediately in your Insigrow workspace.</p>
              </div>

              <div class="features-grid">
                ${ind.solutions.map(s => `
                  <div class="feature-card-detailed motion-scroll-trigger">
                    <div class="feature-top-meta">
                      <span class="feature-icon-badge">${window.getIcon(s.icon, 'icon')}</span>
                      <span class="feature-tier-pill ${s.badge.includes('Trial') ? 'premium-pill' : 'core-pill'}">${s.badge}</span>
                    </div>
                    <h3>${s.title}</h3>
                    <p>${s.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- ======================================================== -->
          <!-- SECTION 4: DASHBOARD / PRODUCT PREVIEW -->
          <!-- ======================================================== -->
          <section class="industry-preview-section">
            <div class="section-container">
              <div class="landing-section-heading">
                <div>
                  <div class="landing-kicker"><span></span> INSIDE THE PLATFORM</div>
                  <h2>The workspace your team<br><em>will actually love using.</em></h2>
                </div>
                <p>${ind.previewMetrics.sub}</p>
              </div>

              <div class="dashboard-mockup-wrapper motion-scroll-trigger">
                <div class="mockup-chrome-bar">
                  <div class="chrome-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div class="chrome-address">
                    app.insigrow.com/#/industry/${ind.id}
                  </div>
                  <div class="chrome-status">
                    ${window.getIcon('checkCircle', 'icon-xs')} Secured & Verified
                  </div>
                </div>

                <div class="mockup-content">
                  <div class="mockup-header-row">
                    <div>
                      <span class="mockup-kicker">${ind.name.toUpperCase()} SOLUTION</span>
                      <h2>${ind.previewMetrics.headline}</h2>
                    </div>
                    <a href="#/register?industry=${ind.id}" class="mockup-action-btn">
                      Explore Live Demo ↗
                    </a>
                  </div>

                  ${this.renderInteractiveDashboardMockup(ind)}
                </div>
              </div>
            </div>
          </section>

          <!-- ======================================================== -->
          <!-- SECTION 5: BUSINESS BENEFITS -->
          <!-- ======================================================== -->
          <section class="industry-benefits-section">
            <div class="section-container">
              <div class="landing-section-heading">
                <div>
                  <div class="landing-kicker"><span></span> MEASURABLE IMPACT</div>
                  <h2>Proven ROI and operational<br><em>speed across every metric.</em></h2>
                </div>
                <p>Designed to deliver immediate clarity and compounding efficiencies from day one.</p>
              </div>

              <div class="benefits-grid">
                ${ind.benefits.map(b => `
                  <div class="benefit-card motion-scroll-trigger">
                    <div class="benefit-number">${b.num}</div>
                    <div class="benefit-label">${b.label}</div>
                    <p class="benefit-description">${b.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- ======================================================== -->
          <!-- SECTION 6: DEDICATED COMPANY REGISTRATION SECTION -->
          <!-- ======================================================== -->
          <section class="industry-reg-section" id="register-band">
            <div class="industry-reg-container">
              <div class="reg-band-content">
                <div class="landing-kicker">
                  <span></span> 15-DAY COMPLIMENTARY TRIAL FOR ${ind.shortName.toUpperCase()}
                </div>
                <h2>${ind.regHeadline}</h2>
                <p class="reg-band-lead">${ind.regSubtitle}</p>
                
                <div class="reg-action-wrapper">
                  <a href="#/register?industry=${ind.id}" class="reg-primary-btn">
                    <span>Register Your Company</span>
                    <span class="btn-arrow">→</span>
                  </a>
                  <div class="reg-trust-notes">
                    <span>✓ No credit card required</span>
                    <span>✓ Immediate workspace access</span>
                    <span>✓ Confirmation email dispatched instantly</span>
                  </div>
                </div>
              </div>

              <div class="reg-band-sidecard">
                <div class="sidecard-inner">
                  <span class="sidecard-tag">TRIAL ENTITLEMENTS</span>
                  <h3>Included for 15 Days</h3>
                  <ul>
                    <li><span class="ind-trust-check">✓</span> Full ${ind.name} module suite</li>
                    <li><span class="ind-trust-check">✓</span> Live operational telemetry & KPIs</li>
                    <li><span class="ind-trust-check">✓</span> Advanced forecasting & root-cause tools</li>
                    <li><span class="ind-trust-check">✓</span> Dedicated onboarding & email support</li>
                  </ul>
                  <div class="sidecard-divider"></div>
                  <div class="sidecard-footer">
                    <small>Pre-selected Solution: <strong>${ind.shortName}</strong></small>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <!-- Footer -->
        <footer class="landing-footer">
          <a class="landing-brand" href="#/landing">
            <img src="/insigrow-mark.png" alt="Insigrow Logo" />
            <span>INSIGROW</span>
          </a>
          <span class="footer-center-text">
            Enterprise solutions, shaped around your business.
          </span>
          <div class="footer-powered-wrap">
            <span>Powered by</span>
            <img src="/ei8-logo.png" alt="Ei8" class="footer-inline-ei8-img" />
          </div>
        </footer>
      </div>
    `;

    // Initialize interactive motion and observer handlers
    if (typeof window.initScrollAnimations === 'function') {
      window.initScrollAnimations(container);
    }
    if (typeof window.initInteractiveCards === 'function') {
      window.initInteractiveCards(container);
    }
  },

  /**
   * Helper to render the interactive dashboard mockup inside Section 4
   */
  renderInteractiveDashboardMockup(ind) {
    if (ind.id === 'fmcg') {
      return `
        <div class="mockup-data-grid">
          <div class="mockup-widget">
            <div class="widget-head">
              <h4>Channel Revenue & Volume Distribution</h4>
              <span class="widget-tag">REAL-TIME</span>
            </div>
            <div class="channel-table">
              ${ind.previewMetrics.channels.map(c => `
                <div class="channel-row">
                  <div class="channel-name"><strong>${c.name}</strong></div>
                  <div class="channel-bar-wrap">
                    <div class="channel-fill" style="width: ${c.share};"></div>
                  </div>
                  <div class="channel-stats">
                    <span>${c.rev} (${c.share})</span>
                    <strong class="up">${c.growth}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mockup-widget">
            <div class="widget-head">
              <h4>Regional Depot Inventory Status</h4>
              <span class="widget-tag">MULTI-ECHELON</span>
            </div>
            <div class="depot-list">
              ${ind.previewMetrics.depots.map(d => `
                <div class="depot-item">
                  <div>
                    <strong>${d.name}</strong>
                    <small>Stock Value: ${d.val}</small>
                  </div>
                  <div style="text-align: right;">
                    <span class="status-pill ${d.status === 'Optimal' ? 'green' : 'amber'}">${d.status}</span>
                    <small style="display: block; margin-top: 3px;">${d.cap}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (ind.id === 'manufacturing') {
      return `
        <div class="mockup-data-grid">
          <div class="mockup-widget">
            <div class="widget-head">
              <h4>Assembly Line OEE & Throughput</h4>
              <span class="widget-tag">SHOP FLOOR</span>
            </div>
            <div class="mfg-lines-table">
              ${ind.previewMetrics.lines.map(l => `
                <div class="mfg-line-row">
                  <div>
                    <strong>${l.name}</strong>
                    <small>Rate: ${l.throughput}</small>
                  </div>
                  <div style="text-align: right;">
                    <span class="status-badge ${l.status === 'Running' ? 'green' : 'amber'}">${l.status}</span>
                    <span class="mfg-oee-val">${l.oee}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mockup-widget">
            <div class="widget-head">
              <h4>Downtime Cause Classification (Ishikawa)</h4>
              <span class="widget-tag">ROOT CAUSE</span>
            </div>
            <div class="downtime-table">
              ${ind.previewMetrics.downtime.map(dt => `
                <div class="downtime-row">
                  <div>
                    <strong>${dt.cause}</strong>
                    <small>${dt.hours} Total Shift Loss</small>
                  </div>
                  <div class="downtime-share">
                    <span>${dt.percent}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (ind.id === 'b2b') {
      return `
        <div class="mockup-data-grid">
          <div class="mockup-widget">
            <div class="widget-head">
              <h4>Deal Pipeline Funnel Stages</h4>
              <span class="widget-tag">WEIGHTED VALUE</span>
            </div>
            <div class="stages-table">
              ${ind.previewMetrics.stages.map(st => `
                <div class="stage-row">
                  <div>
                    <strong>${st.stage}</strong>
                    <small>${st.count} Active Opportunities</small>
                  </div>
                  <div style="text-align: right;">
                    <strong>${st.value}</strong>
                    <small style="display: block; color: var(--color-mint);">${st.prob} Win Prob</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mockup-widget">
            <div class="widget-head">
              <h4>Strategic Key Accounts (360° Health)</h4>
              <span class="widget-tag">NRR 118%</span>
            </div>
            <div class="accounts-table">
              ${ind.previewMetrics.accounts.map(acc => `
                <div class="account-row">
                  <div>
                    <strong>${acc.name}</strong>
                    <small>ARR: ${acc.arr}</small>
                  </div>
                  <div style="text-align: right;">
                    <span class="status-badge green">${acc.health}</span>
                    <small style="display: block; margin-top: 3px;">Renewal: ${acc.renewal}</small>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // Finance / CA
    return `
      <div class="mockup-data-grid">
        <div class="mockup-widget">
          <div class="widget-head">
            <h4>Statutory Filing Deadlines & Progress</h4>
            <span class="widget-tag">CALENDAR ENGINE</span>
          </div>
          <div class="deadlines-table">
            ${ind.previewMetrics.deadlines.map(d => `
              <div class="deadline-row">
                <div>
                  <strong>${d.form}</strong>
                  <small>Statutory Due Date: ${d.due}</small>
                </div>
                <div style="text-align: right;">
                  <span class="status-badge ${d.status === 'Urgent' ? 'red' : 'green'}">${d.status}</span>
                  <strong style="display: block; margin-top: 3px; font-size: 13px;">${d.progress}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="mockup-widget">
          <div class="widget-head">
            <h4>Client Receivables Aging Analysis</h4>
            <span class="widget-tag">CASH FLOW</span>
          </div>
          <div class="aging-table">
            ${ind.previewMetrics.aging.map(ag => `
              <div class="aging-row">
                <div>
                  <strong>${ag.bucket}</strong>
                  <small>${ag.count} Invoices</small>
                </div>
                <div style="text-align: right;">
                  <strong style="font-size: 15px; color: var(--text-main);">${ag.amount}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
};

window.IndustryLandingView = IndustryLandingView;

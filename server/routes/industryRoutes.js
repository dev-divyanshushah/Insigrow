const express = require('express');
const router = express.Router();
const { db, SUPPORTED_INDUSTRIES } = require('../db');
const { requireAuth } = require('../auth');

// Industry data definitions with Free and Trial features
const INDUSTRY_DATA = {
  fmcg: {
    id: 'fmcg',
    name: 'FMCG & Consumer Goods',
    shortName: 'FMCG',
    tagline: 'End-to-end sales, inventory velocity, and distributor network intelligence',
    description: 'Designed specifically for FMCG manufacturers and national distributors to streamline stock rotation, monitor secondary sales, and optimize SKU demand.',
    stats: [
      { label: 'Monthly GMV', value: '₹1.84 Cr', change: '+14.2% MoM', trend: 'up' },
      { label: 'Total Units Sold', value: '428,500', change: '+9.8% MoM', trend: 'up' },
      { label: 'Active Distributors', value: '142', change: '12 Regional Zones', trend: 'neutral' },
      { label: 'Average SKU Days (DOH)', value: '18.4 Days', change: '-2.1 Days (Faster)', trend: 'up' }
    ],
    features: [
      {
        id: 'fmcg-sales',
        title: 'Sales & Revenue Overview',
        category: 'Free',
        isTrialFeature: false,
        icon: 'trending-up',
        description: 'Track primary and secondary sales revenue across regions, channels, and retail outlets.',
        preview: {
          channels: [
            { name: 'General Trade (Kiranas)', share: '54%', revenue: '₹99.36 L', growth: '+8.4%' },
            { name: 'Modern Trade (Supermarkets)', share: '28%', revenue: '₹51.52 L', growth: '+19.2%' },
            { name: 'Quick Commerce / E-com', share: '18%', revenue: '₹33.12 L', growth: '+31.5%' }
          ]
        }
      },
      {
        id: 'fmcg-inventory',
        title: 'Inventory Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'package',
        description: 'Central warehouse and multi-echelon regional depot stock visibility with automated reorder levels.',
        preview: {
          depots: [
            { location: 'North Hub (Gurugram)', capacity: '88% Full', stockValue: '₹42.5 L', status: 'Optimal' },
            { location: 'West Hub (Bhiwandi)', capacity: '92% Full', stockValue: '₹58.1 L', status: 'Near Capacity' },
            { location: 'South Hub (Bengaluru)', capacity: '64% Full', stockValue: '₹31.0 L', status: 'Optimal' },
            { location: 'East Hub (Kolkata)', capacity: '78% Full', stockValue: '₹28.4 L', status: 'Optimal' }
          ]
        }
      },
      {
        id: 'fmcg-stock',
        title: 'Stock Monitoring',
        category: 'Free',
        isTrialFeature: false,
        icon: 'clipboard-list',
        description: 'Granular batch tracking, safety stock levels, and automated shelf-life expiration alerts.',
        preview: {
          stockItems: [
            { sku: 'FMCG-SKU-101', name: 'Instant Protein Cereal 500g', stock: '24,500 pkts', status: 'In Stock', expiry: '> 180 Days' },
            { sku: 'FMCG-SKU-108', name: 'Sparkling Lemonade 330ml', stock: '4,200 cans', status: 'Low Stock', expiry: '60 Days' },
            { sku: 'FMCG-SKU-204', name: 'Organic Cold Pressed Mustard Oil 1L', stock: '18,900 btls', status: 'In Stock', expiry: '> 240 Days' },
            { sku: 'FMCG-SKU-312', name: 'Herbal Hand Wash Refill 750ml', stock: '1,800 pkts', status: 'Reorder Required', expiry: '45 Days' }
          ]
        }
      },
      {
        id: 'fmcg-distributor',
        title: 'Distributor Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'users',
        description: 'Manage credit limits, payment cycles, territory quotas, and fill rates across your distributor network.',
        preview: {
          distributorMetrics: [
            { tier: 'Tier-1 Partners', count: 34, avgFulfillment: '97.8%', avgPaymentDays: '15 Days' },
            { tier: 'Tier-2 Regional', count: 76, avgFulfillment: '94.2%', avgPaymentDays: '21 Days' },
            { tier: 'Tier-3 Semi-Urban', count: 32, avgFulfillment: '90.5%', avgPaymentDays: '28 Days' }
          ]
        }
      },
      {
        id: 'fmcg-product',
        title: 'Product Performance',
        category: 'Free',
        isTrialFeature: false,
        icon: 'bar-chart-2',
        description: 'Unit economics, gross margin breakdown per SKU, and return/damage loss tracking.',
        preview: {
          topPerformers: [
            { name: 'Sparkling Lemonade 330ml', margin: '38.4%', contribution: '24.1%' },
            { name: 'Instant Protein Cereal 500g', margin: '34.2%', contribution: '21.5%' },
            { name: 'Herbal Hand Wash Refill 750ml', margin: '42.0%', contribution: '18.2%' }
          ]
        }
      },
      // TRIAL FEATURES
      {
        id: 'fmcg-forecasting',
        title: 'Demand Forecasting & Replenishment',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'sparkles',
        badge: 'Trial Feature',
        description: 'Machine-learning predictive demand forecasting with seasonal adjustments, weather correlation, and suggested purchase orders.',
        premiumData: {
          forecastAccuracy: '94.2%',
          next30DaysDemand: '486,000 units (+13.4% projected)',
          festiveUpliftBuffer: '+28% recommended stock for Diwali surge',
          suggestedBatchRuns: [
            { sku: 'Sparkling Lemonade 330ml', runVolume: '85,000 units', optimalProductionDate: 'Nov 18, 2026' },
            { sku: 'Instant Protein Cereal 500g', runVolume: '50,000 units', optimalProductionDate: 'Nov 22, 2026' }
          ],
          scenarioModel: 'Best Case: +19.2% | Expected: +13.4% | Conservative: +7.8%'
        }
      },
      {
        id: 'fmcg-analytics',
        title: 'Advanced Sales Analytics & Beat Tracking',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'pie-chart',
        badge: 'Trial Feature',
        description: 'Micro-level sales rep beat penetration, order conversion ratios, geo-heatmaps, and competitor price elasticity analysis.',
        premiumData: {
          fieldRepsActive: 88,
          dailyBeatAdherence: '96.4%',
          outletStrikeRate: '72.8%',
          competitorBenchmarking: [
            { brand: 'Insigrow Portfolio', shelfShare: '34.2%', pricePerUnit: '₹45' },
            { brand: 'Brand A (National)', shelfShare: '29.5%', pricePerUnit: '₹48' },
            { brand: 'Brand B (Regional)', shelfShare: '18.1%', pricePerUnit: '₹42' }
          ],
          exportFormats: ['Executive PDF', 'Raw Data CSV', 'Financial Excel (XLSX)']
        }
      }
    ]
  },

  ca: {
    id: 'ca',
    name: 'Finance',
    shortName: 'Finance',
    tagline: 'Corporate financial management, statutory compliance, tax tracking, and audit readiness',
    description: 'A tailored financial workspace for enterprise teams and corporate financial controllers to streamline statutory compliance, billing, and balance sheet reporting.',
    stats: [
      { label: 'Active Corporate Clients', value: '86', change: '+8 This Quarter', trend: 'up' },
      { label: 'Monthly Invoiced Fees', value: '₹24.8 L', change: '+18.5% YoY', trend: 'up' },
      { label: 'Filings Due This Month', value: '114', change: '89 Completed', trend: 'up' },
      { label: 'Audit Trail Health', value: '100% Ready', change: 'Zero Red Flags', trend: 'up' }
    ],
    features: [
      {
        id: 'ca-client',
        title: 'Client Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'briefcase',
        description: 'Comprehensive corporate registry, partner directory, KYC verification status, and assigned audit leads.',
        preview: {
          clientRoster: [
            { name: 'Apex Logistics Pvt Ltd', type: 'Private Limited', gstStatus: 'Active', kyc: 'Verified' },
            { name: 'BlueHorizon Retail LLP', type: 'LLP', gstStatus: 'Active', kyc: 'Verified' },
            { name: 'Vanguard Tech Solutions', type: 'Private Limited', gstStatus: 'Active', kyc: 'Pending Review' },
            { name: 'Kedia Agro Industries', type: 'Partnership', gstStatus: 'Active', kyc: 'Verified' }
          ]
        }
      },
      {
        id: 'ca-financial-reports',
        title: 'Financial Reports',
        category: 'Free',
        isTrialFeature: false,
        icon: 'file-text',
        description: 'Instant generation of Balance Sheets, Profit & Loss Statements, and Cash Flow Schedules compliant with Indian AS / Schedule III.',
        preview: {
          schedules: [
            { title: 'Statement of Profit & Loss (FY 2025-26)', status: 'Generated', audited: 'Preliminary' },
            { title: 'Balance Sheet & Depreciation Schedules', status: 'Generated', audited: 'Ready for Review' },
            { title: 'Cash Flow (Direct & Indirect Method)', status: 'Generated', audited: 'Completed' }
          ]
        }
      },
      {
        id: 'ca-gst-tax',
        title: 'GST and Tax Tracking',
        category: 'Free',
        isTrialFeature: false,
        icon: 'check-circle-2',
        description: 'Automated deadline calendar for GSTR-1, GSTR-3B, Advance Tax Q3, and TDS quarterly returns.',
        preview: {
          filingDeadlines: [
            { form: 'GSTR-1 (Oct 2026)', dueDate: '11th Nov 2026', progress: '84/86 Filed', status: 'Urgent' },
            { form: 'GSTR-3B (Oct 2026)', dueDate: '20th Nov 2026', progress: '32/86 Filed', status: 'In Progress' },
            { form: 'TDS Payment (Section 194C/J)', dueDate: '7th Dec 2026', progress: 'Scheduled', status: 'Upcoming' }
          ]
        }
      },
      {
        id: 'ca-invoicing',
        title: 'Invoice Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'credit-card',
        description: 'Firm billing tracker, retainership invoices, unbilled WIP hours, and aging analysis for client receivables.',
        preview: {
          agingOverview: [
            { bucket: '0 - 30 Days', amount: '₹14.2 L', count: 42 },
            { bucket: '31 - 60 Days', amount: '₹7.1 L', count: 18 },
            { bucket: '60+ Days (Overdue)', amount: '₹3.5 L', count: 6 }
          ]
        }
      },
      {
        id: 'ca-expense',
        title: 'Expense Monitoring',
        category: 'Free',
        isTrialFeature: false,
        icon: 'dollar-sign',
        description: 'Categorize operational expenses, track disallowable items under Section 40(a)(ia), and flag irregular cash vouchers.',
        preview: {
          disallowanceChecks: [
            { section: 'Section 40A(3) - Cash > ₹10,000', flags: '0 Exceptions Detected' },
            { section: 'Section 194C TDS Non-Deduction', flags: '1 Flag (Resolved)' },
            { section: 'Personal vs Business Expenditure', flags: 'Categorized' }
          ]
        }
      },
      // TRIAL FEATURES
      {
        id: 'ca-compliance',
        title: 'Comprehensive Compliance Tracking',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'shield-check',
        badge: 'Trial Feature',
        description: 'Full statutory ROC tracking, MCA filing timelines (MGT-7, AOC-4), DIR-3 KYC, and Income Tax 44AB automated audit workpapers.',
        premiumData: {
          rocComplianceScore: '98.5%',
          statutoryCalendar: [
            { compliance: 'AOC-4 Financial Statement Filing', entities: 74, status: 'Completed', deadline: '30 Oct' },
            { compliance: 'MGT-7 Annual Return Filing', entities: 74, status: 'In Final Audit', deadline: '29 Nov' },
            { compliance: 'DIR-3 KYC Web Verifications', entities: 182, status: '100% Filed', deadline: 'Completed' }
          ],
          automatedWorkpapers: '14 Audit workpapers auto-populated from client trial balances',
          riskScorecard: 'Low Risk Profile (All compliance on schedule)'
        }
      },
      {
        id: 'ca-analytics',
        title: 'Advanced Financial Analytics & Ratio Analysis',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'trending-up',
        badge: 'Trial Feature',
        description: 'Deep financial ratio benchmarking (Current, Quick, Debt-to-Equity, DSCR, DuPont ROE), tax simulation modeling, and firm realization rates.',
        premiumData: {
          clientBenchmarking: {
            avgCurrentRatio: '1.84 (Healthy liquidity)',
            avgDebtEquity: '0.42 (Conservative leverage)',
            avgInterestCoverage: '5.8x'
          },
          taxOptimizationSavings: '₹14.2 Lakhs identified in unclaimed ITC & eligible depreciation for clients',
          firmRealizationRate: '92.4% realization on billed hours',
          exportReady: true
        }
      }
    ]
  },

  manufacturing: {
    id: 'manufacturing',
    name: 'Industrial Manufacturing & Operations',
    shortName: 'Manufacturing',
    tagline: 'Shop-floor OEE, raw material BOM planning, supply chain and batch cost optimization',
    description: 'Built for industrial plant managers and operations heads to monitor assembly line throughput, eliminate downtime, and track direct unit costs.',
    stats: [
      { label: 'Plant Overall OEE', value: '86.4%', change: '+3.2% vs Benchmark', trend: 'up' },
      { label: 'Daily Output (Units)', value: '14,850', change: 'Across 2 Shifts', trend: 'up' },
      { label: 'Active Work Orders', value: '38', change: '94.8% On Schedule', trend: 'up' },
      { label: 'Scrap & Spoilage Rate', value: '1.18%', change: 'Target < 1.50%', trend: 'up' }
    ],
    features: [
      {
        id: 'mfg-production',
        title: 'Production Monitoring',
        category: 'Free',
        isTrialFeature: false,
        icon: 'activity',
        description: 'Live shop floor metrics, shift output tracking, machine run-time vs idle time across production lines.',
        preview: {
          assemblyLines: [
            { line: 'Line 1 - Stamping & Press', throughput: '480 pcs/hr', oee: '89.2%', status: 'Running' },
            { line: 'Line 2 - CNC Machining', throughput: '320 pcs/hr', oee: '84.6%', status: 'Running' },
            { line: 'Line 3 - Heat Treatment', throughput: '210 pcs/hr', oee: '88.1%', status: 'Running' },
            { line: 'Line 4 - Final Assembly & QA', throughput: '450 pcs/hr', oee: '83.7%', status: 'Changeover' }
          ]
        }
      },
      {
        id: 'mfg-raw-material',
        title: 'Raw Material Inventory',
        category: 'Free',
        isTrialFeature: false,
        icon: 'layers',
        description: 'Bill of Materials (BOM) stock reserves, critical component reorder triggers, and supplier lead times.',
        preview: {
          keyMaterials: [
            { item: 'Cold Rolled Steel Sheet 2mm', available: '42.5 Tons', bufferDays: '22 Days', status: 'Safe' },
            { item: 'Industrial Polymer Resin Grade C', available: '8.4 Tons', bufferDays: '14 Days', status: 'Safe' },
            { item: 'Precision Bearing Assemblies', available: '1,200 pcs', bufferDays: '5 Days', status: 'Low Buffer' },
            { item: 'Anti-Corrosive Coating Primer', available: '450 Liters', bufferDays: '18 Days', status: 'Safe' }
          ]
        }
      },
      {
        id: 'mfg-orders',
        title: 'Order Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'folder-check',
        description: 'Job card issuance, Work-in-Progress (WIP) stage tracking, batch serialization, and dispatch schedules.',
        preview: {
          activeBatches: [
            { batchId: 'BATCH-2026-904', part: 'Hydraulic Valve Flange', qty: '5,000 pcs', stage: 'QA Testing', eta: 'Nov 12' },
            { batchId: 'BATCH-2026-908', part: 'Transmission Housing B', qty: '2,500 pcs', stage: 'Machining', eta: 'Nov 16' },
            { batchId: 'BATCH-2026-912', part: 'High-Tensile Fasteners', qty: '20,000 pcs', stage: 'Packaging', eta: 'Nov 11' }
          ]
        }
      },
      {
        id: 'mfg-cost',
        title: 'Production Cost Analysis',
        category: 'Free',
        isTrialFeature: false,
        icon: 'pie-chart',
        description: 'Standard vs actual costing, variance analysis across raw materials, direct shop-floor labor, and utility power tariffs.',
        preview: {
          costBreakdown: [
            { component: 'Direct Raw Materials', share: '61.8%', variance: '-1.2% (Favorable)' },
            { component: 'Direct Machine Labor', share: '14.5%', variance: '+0.4% (Neutral)' },
            { component: 'Electricity & Utilities', share: '12.2%', variance: '-0.8% (Favorable)' },
            { component: 'Tooling & Consumables', share: '11.5%', variance: '+0.6% (Neutral)' }
          ]
        }
      },
      {
        id: 'mfg-supply-chain',
        title: 'Supply Chain Overview',
        category: 'Free',
        isTrialFeature: false,
        icon: 'truck',
        description: 'Tier-1 vendor on-time delivery rate (OTD), supplier defect PPM, and inbound logistics transit times.',
        preview: {
          vendorPerformance: [
            { vendor: 'Tata Metaliks Ltd', category: 'Steel Castings', otd: '98.2%', defectPpm: '85 PPM' },
            { vendor: 'PolyChem Industries', category: 'Resins', otd: '94.5%', defectPpm: '120 PPM' },
            { vendor: 'Precision Fasteners Corp', category: 'Hardware', otd: '96.8%', defectPpm: '40 PPM' }
          ]
        }
      },
      // TRIAL FEATURES
      {
        id: 'mfg-performance',
        title: 'Operational Performance & Downtime Root Cause',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'cpu',
        badge: 'Trial Feature',
        description: 'Real-time MTBF (Mean Time Between Failures) and MTTR (Mean Time to Repair) diagnostics, Ishikawa downtime classification, and micro-stoppage telemetry.',
        premiumData: {
          plantMtbf: '142.5 Hours (+18% improvement)',
          plantMttr: '34.2 Minutes (Target < 45m)',
          downtimeBreakdown: [
            { cause: 'Planned Die Changeover', hours: '4.2 hrs', percent: '52%' },
            { cause: 'Sensor Calibration Stoppage', hours: '1.8 hrs', percent: '22%' },
            { cause: 'Material Feed Starvation', hours: '1.2 hrs', percent: '15%' },
            { cause: 'Unscheduled Mechanical Jam', hours: '0.9 hrs', percent: '11%' }
          ],
          assemblyBottleneckAnalysis: 'Line 2 station #4 identified as throughput limiting factor'
        }
      },
      {
        id: 'mfg-analytics',
        title: 'Advanced Manufacturing Analytics & Yield Optimization',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'sliders',
        badge: 'Trial Feature',
        description: 'Multi-variable regression models correlating furnace temperatures, feed rates, and ambient humidity to scrap rate reduction and energy efficiency.',
        premiumData: {
          yieldOptimizationForecast: '+2.1% scrap reduction achievable via thermal stabilization',
          annualSavingsProjected: '₹28.4 Lakhs',
          kwhPerFinishedUnit: '1.42 kWh/unit (Lowest in 12 months)',
          predictiveMaintenanceAlerts: [
            { machine: 'CNC Center #03 Spindle', status: 'Vibration anomaly detected (Schedule service within 7 days)' },
            { machine: 'Hydraulic Press Pump #01', status: 'Pressure drop within normal tolerance' }
          ]
        }
      }
    ]
  },

  b2b: {
    id: 'b2b',
    name: 'B2B Enterprise Growth & Sales',
    shortName: 'B2B',
    tagline: 'Multi-stage deal pipelines, key account management, contract tracking, and revenue forecasting',
    description: 'Engineered for B2B tech, industrial, and consulting sales organizations to manage enterprise accounts, accelerate deal velocity, and close high-ticket contracts.',
    stats: [
      { label: 'Active Pipeline Value', value: '₹12.8 Cr', change: '34 Active Deals', trend: 'up' },
      { label: 'Closed-Won (YTD)', value: '₹5.4 Cr', change: '+24.5% vs Last Year', trend: 'up' },
      { label: 'Average Deal Size', value: '₹37.6 L', change: '+12% ACV Growth', trend: 'up' },
      { label: 'Net Retention Rate (NRR)', value: '118%', change: 'Low Churn: 0.6%', trend: 'up' }
    ],
    features: [
      {
        id: 'b2b-lead',
        title: 'Lead Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'user-plus',
        description: 'Automated lead ingestion from web forms, trade events, and LinkedIn; auto-scoring and territory round-robin assignment.',
        preview: {
          recentLeads: [
            { company: 'Zenith Logistics Global', contact: 'Vikram Mehta (COO)', source: 'Inbound Web', score: 92, status: 'SQL' },
            { company: 'Sterling Infra Ltd', contact: 'Neha Saxena (VP Procurement)', source: 'Trade Expo', score: 85, status: 'SQL' },
            { company: 'Acro Polymers Group', contact: 'Rajesh Nair (Director)', source: 'Partner Referral', score: 78, status: 'MQL' }
          ]
        }
      },
      {
        id: 'b2b-crm',
        title: 'Customer Relationship Management',
        category: 'Free',
        isTrialFeature: false,
        icon: 'building-2',
        description: 'Centralized 360-degree account timelines, stakeholder hierarchy mapping, meeting logs, and renewal dates.',
        preview: {
          keyAccounts: [
            { name: 'Apex Conglomerate', arr: '₹85 L', health: 'Strong', renewal: 'March 2027' },
            { name: 'Quantum FinTech Labs', arr: '₹48 L', health: 'Strong', renewal: 'Jan 2027' },
            { name: 'OmniHealth Solutions', arr: '₹32 L', health: 'Moderate', renewal: 'Dec 2026' }
          ]
        }
      },
      {
        id: 'b2b-pipeline',
        title: 'Sales Pipeline',
        category: 'Free',
        isTrialFeature: false,
        icon: 'kanban',
        description: 'Visual stages from Qualification through Proposal and Legal Negotiation to Closed-Won milestones.',
        preview: {
          stages: [
            { stage: '1. Discovery & Qual', deals: 12, value: '₹3.8 Cr' },
            { stage: '2. Solution Proposal', deals: 8, value: '₹4.2 Cr' },
            { stage: '3. Procurement & Legal', deals: 5, value: '₹2.9 Cr' },
            { stage: '4. Closed-Won This Q', deals: 9, value: '₹1.9 Cr' }
          ]
        }
      },
      {
        id: 'b2b-order',
        title: 'Order Tracking & Contract Fulfillment',
        category: 'Free',
        isTrialFeature: false,
        icon: 'file-check-2',
        description: 'Master service agreement (MSA) adherence, milestone sign-offs, SLA compliance, and deliverable invoicing.',
        preview: {
          deliverables: [
            { project: 'Zenith Phase 1 Deployment', status: 'Milestone 2 Completed', sla: '99.8% Adherence' },
            { project: 'Sterling Annual Maintenance', status: 'Active Contract', sla: '100% Adherence' },
            { project: 'Quantum Custom API Suite', status: 'User Acceptance Testing', sla: '98.5% Adherence' }
          ]
        }
      },
      {
        id: 'b2b-analytics',
        title: 'Client Analytics',
        category: 'Free',
        isTrialFeature: false,
        icon: 'line-chart',
        description: 'Customer Lifetime Value (LTV), Customer Acquisition Cost (CAC), payback period, and cohort retention matrices.',
        preview: {
          cohortMetrics: [
            { metric: 'LTV to CAC Ratio', value: '4.8x (Enterprise Grade)' },
            { metric: 'Average Sales Cycle', value: '54 Days' },
            { metric: 'Annual Gross Churn', value: '0.6% (Best-in-Class)' }
          ]
        }
      },
      // TRIAL FEATURES
      {
        id: 'b2b-revenue',
        title: 'Revenue Tracking & ASC 606 Recognition',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'banknote',
        badge: 'Trial Feature',
        description: 'Granular ARR/MRR waterfall breakdowns, multi-year deferred revenue recognition schedules, and contracted backlog realization.',
        premiumData: {
          annualRecurringRevenue: '₹14.8 Cr (+32% YoY)',
          contractedBacklog: '₹8.4 Cr committed for H1 2027',
          waterfall: {
            beginningArr: '₹11.2 Cr',
            newLogoArr: '+₹2.4 Cr',
            expansionArr: '+₹1.6 Cr',
            churnArr: '-₹0.4 Cr',
            endingArr: '₹14.8 Cr'
          },
          netRevenueRetention: '118%'
        }
      },
      {
        id: 'b2b-performance-reports',
        title: 'Business Performance Reports & Win/Loss Intelligence',
        category: 'Trial',
        isTrialFeature: true,
        icon: 'award',
        badge: 'Trial Feature',
        description: 'Sales representative quota attainment rankings, deal slippage probability algorithms, and competitor battlecard win/loss analytics.',
        premiumData: {
          winLossRatio: '68% Win Rate against direct competitors',
          topWinningFactor: 'Platform Reliability & Enterprise Integration (44% of mentions)',
          repQuotaAttainment: [
            { rep: 'Karan Sharma', quota: '₹2.0 Cr', achieved: '118%', status: 'Exceeding' },
            { rep: 'Priya Sen', quota: '₹1.8 Cr', achieved: '104%', status: 'On Target' },
            { rep: 'Rahul Verma', quota: '₹1.5 Cr', achieved: '91%', status: 'Nearing Target' }
          ],
          aiDealSlippageAlert: '1 Deal (₹45L) flagged with slow stakeholder response time'
        }
      }
    ]
  }
};

/**
 * GET /api/industry/:industry
 * Fetches data for an industry. Gating trial-only data based on user's active trial!
 */
router.get('/:industry', requireAuth, (req, res) => {
  const { industry } = req.params;
  const indKey = industry.toLowerCase().trim();

  if (!SUPPORTED_INDUSTRIES.includes(indKey) || !INDUSTRY_DATA[indKey]) {
    return res.status(404).json({
      success: false,
      message: `Industry "${industry}" not found. Supported: ${SUPPORTED_INDUSTRIES.join(', ')}`
    });
  }

  const rawData = INDUSTRY_DATA[indKey];
  const userTrials = db.getUserTrials(req.user.id);
  const trialState = userTrials[indKey];
  const isTrialActive = trialState ? trialState.isTrialActive : false;

  // Process features: hide confidential premium data if trial is not active
  const sanitizedFeatures = rawData.features.map(f => {
    if (f.isTrialFeature) {
      if (isTrialActive) {
        return {
          ...f,
          isLocked: false,
          premiumData: f.premiumData
        };
      } else {
        return {
          ...f,
          isLocked: true,
          // Hide full premium data on the server when trial is not active
          premiumData: null,
          lockReason: 'Requires an active 15-day free trial'
        };
      }
    }
    return {
      ...f,
      isLocked: false
    };
  });

  return res.json({
    success: true,
    data: {
      ...rawData,
      features: sanitizedFeatures,
      trialState
    }
  });
});

/**
 * GET /api/industry/list/all
 * Lists all 4 industries with summary overview
 */
router.get('/', requireAuth, (req, res) => {
  const userTrials = db.getUserTrials(req.user.id);
  const list = SUPPORTED_INDUSTRIES.map(key => {
    const item = INDUSTRY_DATA[key];
    return {
      id: item.id,
      name: item.name,
      shortName: item.shortName,
      tagline: item.tagline,
      description: item.description,
      trialState: userTrials[key]
    };
  });

  res.json({ success: true, industries: list });
});

module.exports = router;


# Insigrow – Industry Solutions Portal

A clean, modern, enterprise SaaS web platform built as a subordinate product of **Insigrow**, providing specialized vertical solutions for four key industries:
1. **FMCG** (Fast-Moving Consumer Goods)
2. **CA** (Chartered Accountants & Financial Advisory)
3. **Manufacturing** (Plant Operations & Supply Chain)
4. **B2B** (Enterprise Growth & Contract Sales)

The platform features secure user authentication, persistent database storage, and an **Independent 15-Day Free Trial System** for each industry sector.

---

## 🚀 Key Features

### 1. User Authentication & Session Persistence
- **Persistent Registration:** Validates Full Name, Company Name, Business Email, Phone Number, and matching Passwords. Enforces duplicate email prevention.
- **Secure Password Hashing:** Uses `bcryptjs` with salted hashing before saving to the database.
- **Session Management:** Issues cryptographic JSON Web Tokens (`jsonwebtoken`) with 30-day persistence, maintaining sessions across browser refreshes and reopenings.
- **Protected Routes:** Enforces authentication on all dashboard and industry views.
- **Password Reset Simulation:** Interactive "Forgot Password" modal for verified email addresses.

### 2. Main Dashboard & Consistent Industry Navigation
- Horizontal top navigation bar with quick-switch tabs for **FMCG**, **CA**, **Manufacturing**, and **B2B**.
- Dynamic active trial status indicators on the navigation tabs.
- Personalized welcome badge displaying the registered user's name and company.
- Seamless, single-page application (SPA) routing with clean browser history.

### 3. Industry-Specific Modules & Realistic Data

| Industry | Free Features | 15-Day Trial Premium Features |
| :--- | :--- | :--- |
| **FMCG** | • Sales & Revenue by Channel<br>• Central & Regional Inventory Depots<br>• Live Stock & Expiry Tracking<br>• Distributor Tier Management<br>• Product Margin Contribution | • **Demand Forecasting & Replenishment** (ML predictive models, seasonal buffer recommendations)<br>• **Advanced Beat Sales Analytics** (Field rep strike rates, competitor benchmarking) |
| **CA** | • Corporate Client Registry<br>• Audit-Ready Financial Schedules<br>• GST & Statutory Tax Deadlines<br>• Receivables Aging Analysis<br>• Deductible Expense Checks (Sec 40A) | • **Comprehensive Statutory ROC/MCA Tracking** (AOC-4, MGT-7, automated workpapers)<br>• **Advanced Financial Ratio Analytics** (DuPont ROE, DSCR, tax optimization savings) |
| **Manufacturing** | • Live Assembly Line Telemetry (OEE)<br>• Raw Material BOM Reserves<br>• Job Cards & Work Orders (WIP)<br>• Direct Unit Cost Allocation<br>• Tier-1 Vendor Reliability (OTD) | • **Operational Downtime Root Cause (MTBF/MTTR)** (Ishikawa stoppage breakdown)<br>• **Yield Optimization Analytics** (Multi-variable regression models, thermal stability) |
| **B2B** | • Inbound Lead Scoring & Routing<br>• Key Account CRM 360<br>• Visual Deal Pipeline Stages<br>• Contract Fulfillment & SLA Adherence<br>• Enterprise Health Cohort Analytics | • **ASC 606 Revenue Recognition & Waterfall** (ARR/MRR expansion, contracted backlog)<br>• **Win/Loss Intelligence & Quota Attainment** (AI deal slippage alerts, rep rankings) |

### 4. Independent 15-Day Free Trial Engine
- **Per-Industry Independence:** Each of the 4 industries has its own independent trial. Activating FMCG does not affect CA, Manufacturing, or B2B. Users can activate trials for multiple industries independently.
- **Strict 15-Day Duration:** Trials run for exactly 15 calendar days from the activation timestamp.
- **Persistent Storage:** Stored on the server in `data/trials.json`. Logging out, closing the tab, or refreshing restores the exact remaining time.
- **Server-Side Enforcement:** Trial verification and feature data gating are strictly enforced on the server.
- **Live Countdown & Expiry States:**
  - *Not Started:* Displays informative banner and "Start Free 15-Day Trial" CTA.
  - *Active:* Displays emerald banner, active countdown badge (`X Days, Y Hours Remaining`), and valid-through timestamps. Unlocks all premium tools.
  - *Expired:* Displays amber notice and restricts premium tools once the 15-day window concludes.
- **Interactive Lock Overlays:** Attempting to access trial-exclusive features while on the free tier shows a clean preview with an instant "Start 15-Day Trial to Unlock" action that opens the confirmation modal.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** Node.js & Express 5
- **Database:** Persistent JSON database (`server/db.js`) with atomic file writes to `data/users.json` and `data/trials.json`
- **Security:** `bcryptjs` password hashing, `jsonwebtoken` session tokens, HTTP-only cookies
- **Frontend:** Semantic HTML5, modern CSS3 (Custom SaaS Design System inspired by Tailwind & Linear), modular Vanilla JavaScript (ES6+)
- **Icons:** Embedded Lucide SVG vector icon system (`public/js/icons.js`)

---

## 🏃 Getting Started

### 1. Start the Server
```bash
npm start
```
The server will start on `http://localhost:5000`.

### 2. Open in Browser
Visit `http://localhost:5000` in your web browser.

### 3. Run the Automated Tests
```bash
node test/integration.test.js
node test/routes.test.js
```
All integration and route tests will execute in-process and verify data persistence, authentication, trial duration math, and endpoint access gating.

---

## 📂 Project Structure

```
Insigrow-2/
├── package.json               # Project manifest and scripts
├── server/
│   ├── server.js              # Express app, middleware, routes, and SPA fallback
│   ├── db.js                  # Persistent database engine (users & trials)
│   ├── auth.js                # JWT signing, verification, and route guards
│   └── routes/
│       ├── authRoutes.js      # /api/auth (register, login, me, logout, forgot-password)
│       ├── trialRoutes.js     # /api/trials (get trials, activate trial)
│       └── industryRoutes.js  # /api/industry (fmcg, ca, manufacturing, b2b data)
├── public/
│   ├── index.html             # Main single-page application shell
│   ├── css/
│   │   └── styles.css         # Modern enterprise SaaS design system
│   └── js/
│       ├── icons.js           # Embedded SVG vector icon library
│       ├── api.js             # API client with token management
│       ├── state.js           # Central reactive state & toast bus
│       ├── app.js             # Client router & session restoration
│       └── views/
│           ├── authView.js      # Register, Login, & Forgot Password UI
│           ├── dashboardView.js # Persistent header & 4 industry navigation tabs
│           ├── industryView.js  # Industry cards, KPI metrics, & preview tables
│           └── trialModal.js   # 15-Day Trial confirmation modal
├── data/                      # Persistent storage directory
│   ├── users.json             # Registered users (bcrypt hashed)
│   └── trials.json            # Industry trial records & timestamps
└── test/
    ├── integration.test.js    # Comprehensive persistent database & trial math test suite
    └── routes.test.js         # API route handlers & gating validation test suite
```


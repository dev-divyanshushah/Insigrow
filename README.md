# Insigrow Enterprise Suite

Unified repository containing the Insigrow Multi-Industry Business Solutions Portal and the SHIFTS Workforce Management application.

---

## Repository Structure

```
Insigrow/
├── InsigrowIndustrySolutions/   # Multi-Industry Solutions Portal (Port 5000)
│   ├── public/                  # Frontend UI, components, and industry views
│   ├── server/                  # Express API, auth, trials, and session management
│   ├── data/                    # JSON persistent data storage
│   └── test/                    # Comprehensive integration and E2E test suites
│
└── ShiftPlanner/                # SHIFTS – Workforce & Shift Management Application
    ├── src/                     # React + Vite frontend application (Port 3000)
    ├── backend/                 # Express backend, Prisma SQLite ORM (Port 5001)
    └── prisma/                  # Database schema, migrations, and seed script
```

---

## Getting Started

### 1. Insigrow Industry Solutions (Portal)
```bash
cd InsigrowIndustrySolutions
npm install
node server/server.js
```
- Open `http://localhost:5000` in your browser.
- Run tests: `npm test`

### 2. ShiftPlanner (Workforce & Shift Management)
```bash
cd ShiftPlanner
npm install
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001`
- Database push & seed: `npm run db:setup`

---

## Authentication & Role-Based Routing
- **Manager Account**: `manager@shiftflow.com` / `Manager@123` -> Redirects to `/overview`
- **Employee Account**: `employee@shiftflow.com` / `Employee@123` -> Redirects to `/employee/dashboard`
- **15-Day Free Trial**: Accessible from Insigrow Portal with instant organization onboarding

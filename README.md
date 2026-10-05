# LandLens — Intelligence Layer for India's Land Stack

> **Smart India Hackathon 2026 — Land Governance Innovation Track**  
> A GIS intelligence platform that connects fragmented land records around a common parcel identity.

---

## 🗺️ What is LandLens?

Land information in India is distributed across dozens of disconnected systems — Revenue records (RoR/Khata) in one department, Registration deeds in another, Zoning plans with the municipality, Building permissions with the ULB, and satellite change data from ISRO. No single system connects these around the same plot of land.

**LandLens** is the intelligence layer that sits above these systems. It:

1. **Connects** data from multiple state/department systems via an adapter architecture
2. **Normalizes** everything into a canonical parcel-centric data model anchored by ULPIN
3. **Cross-checks** datasets using the Land Truth Engine to detect inconsistencies
4. **Presents** a unified Parcel 360 view tailored to each user's role
5. **Enables** verification workflows, evidence-backed AI Q&A, and audit trails

---

## 🚀 Live Demo

> **⚠️ PROTOTYPE / DEMONSTRATION** — All data is synthetic. No real government records are used.

```
URL: http://localhost:3000
```

### Quick Login Credentials

| Role | Email | Password |
|---|---|---|
| **District Admin** | admin@landlens.in | admin123 |
| **Revenue Officer** | revenue@landlens.in | revenue123 |
| **Planning Officer** | planning@landlens.in | planning123 |
| **Registration Officer** | registration@landlens.in | reg123 |
| **Citizen** | citizen@landlens.in | citizen123 |

---

## ✨ Key Features

### 🔍 Parcel 360° View
Every parcel has a complete profile page at `/parcels/[id]` showing:
- ULPIN, Khasra No., Survey No., Area, Land Use, Zoning
- Record of Rights (RoR), current owners, ownership chain
- Registration records, mutation history
- Building permissions, encumbrances, mortgages
- Tax status, property valuation
- Litigation/disputes
- Satellite change detection alerts

### ⚖️ Land Truth Engine
Deterministic rule-based engine that cross-checks 17 data categories:
- Detects area mismatches between RoR and Registration deeds
- Flags zoning violations vs. actual land use
- Identifies road reservation conflicts
- Alerts on active encumbrances affecting transaction eligibility
- Shows cited evidence and recommended actions — no guessing, no combined scores

### 🗺️ GIS Intelligence Map
- Interactive MapLibre GL map centered on Raipur, Chhattisgarh
- Color-coded parcels (green = clean, amber = review, red = conflict)
- Click any parcel → Parcel 360 view
- Layer controls for zoning, land use, infrastructure

### 🤖 Evidence-Based AI Assistant
- Parcel-aware chatbot grounded strictly in available records
- Ask in plain English: *"Is this parcel disputed?"*, *"What is the zoning here?"*
- Every answer cites the source dataset and record ID
- Does not make legal determinations — only explains evidence

### 📋 Smart Workflow Engine
- Detected conflicts auto-generate verification tasks
- Tasks flow through: `Open → In Progress → Pending Review → Resolved`
- SLA tracking (hours elapsed vs. SLA hours)
- Every state transition appended to audit log with actor, timestamp, action

### 👥 Role-Based Dashboards
Six different interfaces, one for each government role:

| Role | Route | Focus |
|---|---|---|
| Citizen | `/citizen` | Search parcels, track applications, public info |
| Revenue Officer | `/revenue-officer` | RoR, mutations, verification queue |
| Planning Officer | `/planning-officer` | Zoning, master plans, building permissions |
| Registration Officer | `/registration-officer` | Deeds, transactions, encumbrances |
| District Admin | `/district-admin` | Executive dashboard, hotspot map, analytics |
| System Admin | `/admin` | Users, data sources, API health, audit logs |

### 🔗 Interoperability / State Adapter Architecture
- Chhattisgarh adapter: normalizes Bhu-Naksha format → canonical schema
- Tamil Nadu adapter: normalizes TamilNilam format → canonical schema
- Canonical schema covers 17 entities (Parcel, Owner, RoR, Registration, Mutation, Zoning, MasterPlan, BuildingPermission, Encumbrance, Mortgage, Tax, Litigation, Utility, Restriction, Valuation, Infrastructure, SatelliteChange)

### 📜 Audit Trail
- Every access, workflow transition, and query logged
- Fields: timestamp, actor, role, action, parcel ID, dataset, previous/new state
- View at `/audit`

### 🚨 Alerts System
- Satellite-detected unauthorized construction alerts
- SLA breach alerts for overdue workflow tasks
- Data conflict alerts for new records
- Visible at `/alerts`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           STATE / DEPARTMENT SYSTEMS         │
│   Bhu-Naksha  │  TamilNilam  │  SRO  │  ULB │
└───────────────────┬─────────────────────────┘
                    │
            Adapter Layer
      (src/lib/adapters.ts)
                    │
┌───────────────────▼─────────────────────────┐
│         CANONICAL PARCEL DATA MODEL          │
│     Anchored by ULPIN / Parcel ID            │
│         (src/lib/data.ts)                    │
└───────────────────┬─────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
┌────────▼───────┐   ┌────────▼────────────┐
│ LAND TRUTH     │   │  GIS / MapLibre GL   │
│ ENGINE         │   │  (src/app/map/)       │
│(intelligence.ts)│   └────────┬────────────┘
└────────┬───────┘            │
         │                    │
┌────────▼────────────────────▼────────────┐
│         ROLE-BASED APPLICATION LAYER      │
│  Citizen / Revenue / Planning / Reg /     │
│  District Admin / System Admin            │
│           (src/app/*/page.tsx)            │
└──────────────────┬────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
   REST API Routes        AI Assistant
   (src/app/api/)     (src/components/AIAssistant.tsx)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.8 (Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Vanilla CSS |
| GIS / Maps | MapLibre GL JS v6 |
| 3D Visualization | React Three Fiber + @react-three/drei |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand + React useState |
| AI Engine | Custom deterministic rule engine (no external LLM) |

---

## 📁 Project Structure

```
landlens-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── login/                     # Authentication
│   │   ├── map/                       # GIS map
│   │   ├── parcels/[id]/              # Parcel 360 view
│   │   ├── citizen/                   # Citizen dashboard
│   │   ├── revenue-officer/           # Revenue Officer dashboard
│   │   ├── planning-officer/          # Planning Officer dashboard
│   │   ├── registration-officer/      # Registration Officer dashboard
│   │   ├── district-admin/            # District Admin dashboard
│   │   ├── admin/                     # System Admin dashboard
│   │   ├── workflows/                 # Workflow engine
│   │   ├── alerts/                    # Alerts panel
│   │   ├── audit/                     # Audit trail
│   │   ├── analytics/                 # Analytics dashboard
│   │   ├── data-sources/              # Data source registry
│   │   ├── technical-architecture/    # Technical architecture page
│   │   └── api/                       # REST API routes
│   │       ├── parcels/[id]/          # Parcel data endpoint
│   │       ├── parcels/[id]/truth/    # Land Truth Engine endpoint
│   │       ├── parcels/[id]/satellite/# Satellite data endpoint
│   │       └── data-sources/          # Data sources endpoint
│   ├── components/
│   │   ├── AppShell.tsx               # Main app shell + RBAC navigation
│   │   ├── AIAssistant.tsx            # AI chatbot component
│   │   ├── PremiumLandingPage.tsx     # Marketing homepage
│   │   ├── LandingPage.tsx            # Legacy landing page
│   │   ├── NotificationCenter.tsx     # Notification bell
│   │   └── OperationalPrimitives.tsx  # Reusable UI primitives
│   ├── lib/
│   │   ├── data.ts                    # Synthetic demo dataset (120+ records)
│   │   ├── intelligence.ts            # Land Truth Engine + AI assistant logic
│   │   ├── adapters.ts                # State adapter architecture
│   │   ├── auth.ts                    # Auth context + RBAC
│   │   ├── operations.ts              # Audit logging + notifications
│   │   └── types.ts                  # TypeScript type definitions
│   └── app/globals.css               # Design system + Tailwind v4
├── scripts/
│   └── test-intelligence.mjs         # CLI test for Land Truth Engine
└── public/
```

---

## 🔌 API Reference

### `GET /api/parcels/[id]`
Returns full canonical parcel data including all 17 data categories.

### `GET /api/parcels/[id]/truth`
Returns Land Truth Engine analysis: conflicts, consistency scores, evidence, recommended actions.

### `GET /api/parcels/[id]/satellite`
Returns satellite change detection records for the parcel.

### `GET /api/data-sources`
Returns the data source registry with connection status, schema version, and sync timestamps.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/piyushmarkandey1-ui/Landlens.git
cd Landlens

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🧪 Testing the Land Truth Engine

```bash
node scripts/test-intelligence.mjs
```

This runs the deterministic rule engine against all synthetic parcels and outputs conflict findings to the console.

---

## 📊 Demo Data

The prototype ships with **120+ synthetic records** across Raipur, Chhattisgarh including:

- **20 parcels** with full identity (ULPIN, Khasra, Survey No., coordinates)
- **Ownership records** with acquisition history
- **RoR records** from multiple tehsils
- **Registration deeds** with area discrepancies (intentional conflicts for demo)
- **Building permissions** from ULB
- **Encumbrances and mortgages** from SBI and other banks
- **Tax records** with defaulter scenarios
- **Litigation records** with active court cases
- **Satellite change detection** events with confidence scores
- **Workflow tasks** in various stages

All inconsistencies (area mismatches, zoning violations, etc.) are intentionally injected to showcase the Land Truth Engine.

---

## 🔐 Role-Based Access Control

```
Citizen          → Can view public parcel data only
Revenue Officer  → Can view + verify revenue records (RoR, mutations)
Planning Officer → Can view + manage planning data (zoning, permissions)
Reg. Officer     → Can view + manage registration workflows
District Admin   → Can view cross-department analytics and all data
System Admin     → Can manage users, data sources, system configuration
```

Role permissions are enforced at both the UI and API layer.

---

## 🌐 Interoperability Design

LandLens addresses the core interoperability challenge in Indian land administration:

> Different states use different systems, schemas, terminology, units and workflows.

**Solution: Adapter Pattern**

```typescript
// Each state has an adapter
ChhattisgarphAdapter.transform(bhuNakshaRecord) → CanonicalParcel
TamilNaduAdapter.transform(tamilNilamRecord)    → CanonicalParcel
GenericStateAdapter.transform(anyRecord)        → CanonicalParcel
```

This allows new states to be onboarded without changing the core application logic.

---

## ⚠️ Important Disclaimers

- **This is a prototype / demonstration platform**
- **All data is synthetic** — no real government records, ownership data or legal information is used
- **No legal determinations are made** — LandLens flags and explains, officers retain authority
- **Not affiliated with any government body** — built for Smart India Hackathon 2026

---

## 📄 License

This project was built for Smart India Hackathon 2026 and is a demonstration prototype.

---

*Built with ❤️ for Smart India Hackathon 2026 — Land Governance Innovation*

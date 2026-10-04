# LandLens — Testing & Verification Guide

## 🚀 Quick Start

The development server is running at:
- **Local**: http://localhost:3001
- **Network**: http://10.73.145.80:3001

(Port 3000 was already in use, so Next.js automatically used 3001)

---

## ✅ Pre-Flight Checklist

### 1. Landing Page (http://localhost:3001)
Navigate to the home page and verify:

#### Hero Section
- [ ] 3D parcel cloud visualization is rendering smoothly
- [ ] ULPIN targeting rings are animating (3 concentric circles)
- [ ] "CG-RPR-0001-0001" ULPIN badge is centered
- [ ] Headline reads: "Every parcel. One intelligent view."
- [ ] Two CTA buttons: "Explore LandLens" and "View GIS Demo"
- [ ] Quick stats show: 630M+ Parcels and 10+ Datasets

#### Navigation
- [ ] Top nav shows: Logo | Live Map | Architecture | Explore LandLens
- [ ] All nav links are clickable
- [ ] Logo links back to home
- [ ] "Explore LandLens" button has gradient background

#### Content Sections
- [ ] Stats bar shows 4 metrics (630M+, 10+, 10, 4.2×)
- [ ] "How It Works" section has 6 horizontal cards (01-06)
- [ ] "Land Truth Engine" section with mock intelligence panel
- [ ] Mock panel shows: Parcel P-00427 with conflict alerts
- [ ] "The right view for every role" section with 4 role cards
- [ ] "Intelligence Features" section with 3 cards (AI, Satellite, Analytics)
- [ ] "Security & Trust" section with 4 features and audit trail
- [ ] Final CTA section with two buttons
- [ ] Footer with logo and links

#### Visual Quality
- [ ] No horizontal scrolling at any width
- [ ] Typography is clear and hierarchical
- [ ] Colors are professional (navy, cyan, emerald)
- [ ] Animations are subtle (not excessive)
- [ ] Demo badge is NOT visible on landing page

---

### 2. Login Page (http://localhost:3001/login)

Click "Explore LandLens" to navigate to login.

#### Layout
- [ ] Logo at top with "LandLens" text
- [ ] Heading: "Select Your Role"
- [ ] Two-column grid: Role selector (left) + Details (right)
- [ ] "Demo Mode — No real credentials required" badge visible

#### Role Selection
- [ ] 6 roles listed: Citizen, Revenue Officer, Planning Officer, Registration Officer, District Admin, System Admin
- [ ] Each role shows department name
- [ ] Selected role highlights with indigo background
- [ ] Right panel updates when selecting different roles

#### Role Details
Test each role by clicking:

**Citizen**:
- [ ] Name: Priya Mehta
- [ ] Access includes: Public parcel info, Land use, "Can I build" tool, Service tracking

**Revenue Officer**:
- [ ] Name: Suresh Kumar Patle
- [ ] Department: Board of Revenue
- [ ] Access includes: RoR, Ownership, Conflict queue, Field verification

**Planning Officer**:
- [ ] Name: Rani Dubey
- [ ] Department: Raipur Development Authority
- [ ] Access includes: Zoning, Master plan, Building permissions, Satellite alerts

**Registration Officer**:
- [ ] Name: Meena Chandel
- [ ] Department: Registration Department
- [ ] Access includes: Registration records, Transaction history, etc.

**District Admin**:
- [ ] Name: R.K. Sharma IAS
- [ ] Department: District Collectorate
- [ ] Access includes: District dashboard, Conflict hotspot, KPIs, Escalation

**System Admin**:
- [ ] Name: Priya Gupta
- [ ] Department: NIC / IT Cell
- [ ] Access includes: User management, Dataset registry, API connectors, Audit logs

#### Sign In
- [ ] "Sign in as [Role]" button at bottom
- [ ] Button has gradient background
- [ ] "Back to Landing Page" link works

---

### 3. Dashboard (After Login)

Login as **Revenue Officer** and verify:

#### Layout
- [ ] Left sidebar (256px) is visible
- [ ] Logo at top: "LL" icon + "LandLens" + "GIS Intelligence"
- [ ] User info card shows: Avatar (initials) + Name + Role badge + District
- [ ] Navigation items visible with icons
- [ ] Active item highlighted (Dashboard)
- [ ] Badge counts: 10 on Alerts, 4 on Workflows
- [ ] Sign Out button at bottom

#### Top Bar
- [ ] Breadcrumb: Dashboard > Dashboard
- [ ] Bell icon on right (with red dot indicator)
- [ ] Role chip: "Revenue Officer" in amber
- [ ] Demo badge in top-right: "🔸 Demo Data"

#### Content
- [ ] Welcome message: "Welcome back, Suresh Kumar Patle"
- [ ] Role info: "Revenue Officer · Board of Revenue · Raipur, Chhattisgarh"
- [ ] Critical alert banner (if applicable)
- [ ] 4 KPI cards: Open Conflicts (10), Active Workflows (4), Pending Services, Verified Parcels
- [ ] Recent Conflict Alerts table (5 rows)
- [ ] Data Sources list (right side)
- [ ] Quick Actions panel
- [ ] District Overview stats bar

#### Interactions
- [ ] Click "View all" on alerts → navigates to /alerts
- [ ] Click a conflict alert → navigates to parcel detail
- [ ] Click KPI cards → navigate to respective pages
- [ ] Click Quick Actions links → navigate correctly

---

### 4. GIS Map (http://localhost:3001/map)

Click "GIS Map" in sidebar.

#### Layout
- [ ] Map occupies full height of content area
- [ ] Sidebar still visible on left
- [ ] Top bar still visible
- [ ] No overlapping elements

#### Map Controls
- [ ] Map loads successfully (MapLibre)
- [ ] Zoom controls visible (+ / -)
- [ ] Map is interactive (pan, zoom)
- [ ] Loading state shows: "Loading GIS Map…" (before map loads)

#### Parcel Selection
- [ ] Parcels visible on map (if implemented)
- [ ] Click parcel → opens drawer or navigates to detail
- [ ] Map markers/boundaries render correctly

---

### 5. Parcel 360 Page

Navigate to a parcel (e.g., http://localhost:3001/parcels/P001)

#### Header
- [ ] "Back to Map" link at top
- [ ] ULPIN displayed: e.g., "CG-RPR-0001-0001"
- [ ] Parcel ID: "Parcel P001"
- [ ] Location: Village name
- [ ] Address visible
- [ ] Status badges: Active/Disputed, Land Use, Area

#### Land Truth Engine Summary
- [ ] Panel with alert icon (or checkmark if no issues)
- [ ] Summary text explaining findings
- [ ] Metrics: Rules evaluated, Datasets compared, Issues detected, Evidence records
- [ ] Color coding: Red (conflicts), Amber (review), Emerald (verified)

#### Data Sections (Left Column)
- [ ] Data Health Overview (grid with status badges)
- [ ] Parcel Identity (ULPIN, Khasra, Survey, Area, etc.)
- [ ] Record of Rights (RoR) - owner, khata, area
- [ ] Registration Records - documents, sale value, dates
- [ ] Mutations - mutation history
- [ ] Zoning & Master Plan
- [ ] Building Permissions
- [ ] Encumbrances & Mortgages
- [ ] Litigation (if applicable)
- [ ] Satellite Change Detection

#### Right Column
- [ ] Rule Findings panel (with severity badges)
- [ ] Property Tax card (status, amounts)
- [ ] Valuation card (rates, total value)
- [ ] Quick Actions (View on Map, Create Workflow)

#### Interactions
- [ ] Click section headers to expand/collapse
- [ ] Click "View on Map" → navigates to /map
- [ ] Click "Create Workflow Task" → navigates to /workflows
- [ ] Info rows display correctly
- [ ] Badges show proper colors (verified=green, conflict=red, etc.)

---

### 6. Navigation Testing

Test all sidebar navigation items:

**For Revenue Officer**, verify these are visible and clickable:
- [ ] Dashboard
- [ ] GIS Map
- [ ] Parcel Search
- [ ] Revenue
- [ ] Alerts (badge: 10)
- [ ] Workflows (badge: 4)
- [ ] Audit
- [ ] Settings

**For District Admin**, additional items:
- [ ] Analytics
- [ ] Data Sources

**For System Admin**, additional items:
- [ ] Admin

**For Citizen**, different items:
- [ ] Dashboard
- [ ] GIS Map
- [ ] Citizen Portal

---

### 7. Responsive Testing

Test at different viewport widths:

#### Desktop (1920px)
- [ ] Landing hero: Left content + Right visualization side-by-side
- [ ] Stats: 4 columns
- [ ] Process steps: 6 columns
- [ ] Role cards: 4 columns
- [ ] No horizontal scrolling

#### Laptop (1440px)
- [ ] All content visible
- [ ] Sidebar at full width
- [ ] No clipping

#### Tablet (1024px)
- [ ] Landing hero stacks vertically
- [ ] Stats: 2-4 columns
- [ ] Process steps: 3 columns
- [ ] Role cards: 2 columns
- [ ] Sidebar at full width

#### Small Tablet (768px)
- [ ] Stats: 2 columns
- [ ] Process steps: 2 columns
- [ ] Role cards: 1-2 columns
- [ ] Content readable
- [ ] No overlapping

#### Mobile (390px)
- [ ] All content stacks vertically
- [ ] Text is readable
- [ ] Buttons are touch-friendly (44px+)
- [ ] Navigation needs mobile treatment (hamburger)

---

### 8. Visual Quality

#### Typography
- [ ] Headings are bold and clear
- [ ] Body text is 14px and readable
- [ ] Proper line heights (1.2-1.6)
- [ ] Metadata text is subtle (12px, gray)
- [ ] Monospace fonts for ULPIN, coordinates

#### Colors
- [ ] Primary actions: Indigo gradient
- [ ] Success/Verified: Emerald green
- [ ] Warnings: Amber yellow
- [ ] Errors/Conflicts: Red
- [ ] Backgrounds: Dark navy (#080D18)
- [ ] Text: White/light gray on dark

#### Spacing
- [ ] No content touching screen edges
- [ ] Proper padding in cards (16-24px)
- [ ] Margins between sections (24-48px)
- [ ] Consistent gaps in grids

#### Borders & Shadows
- [ ] Card borders subtle (indigo 8-15% opacity)
- [ ] Border radius: 12px
- [ ] Shadows on elevated elements
- [ ] No harsh edges

#### Animations
- [ ] 3D parcel cloud rotates slowly
- [ ] Targeting rings pulse gently
- [ ] Hover states smooth (0.15s)
- [ ] Page transitions smooth (0.2s)
- [ ] No jarring motion

---

### 9. Functional Testing

#### Authentication Flow
- [ ] Login with each role works
- [ ] Role determines visible nav items
- [ ] Role chip displays correct label
- [ ] Citizen redirects to /citizen
- [ ] Officers redirect to /dashboard
- [ ] Sign out works, returns to login

#### Data Display
- [ ] Parcels load correctly
- [ ] Conflict alerts show proper severity
- [ ] Workflow tasks display status
- [ ] Data sources show sync status
- [ ] Audit logs show timestamps
- [ ] All dates formatted correctly

#### Links & Navigation
- [ ] All sidebar links work
- [ ] Breadcrumbs update correctly
- [ ] Back buttons work
- [ ] External links (if any) open correctly
- [ ] Logo links to appropriate page (home for landing, dashboard for app)

---

### 10. Browser Testing

#### Chrome/Edge (Primary)
- [ ] Landing page renders correctly
- [ ] 3D visualization works
- [ ] Map loads properly
- [ ] All features functional
- [ ] Console has no errors

#### Firefox
- [ ] Landing page renders correctly
- [ ] 3D visualization works
- [ ] Map loads properly
- [ ] All features functional

#### Safari (if available)
- [ ] Landing page renders correctly
- [ ] 3D visualization works
- [ ] Map loads properly
- [ ] All features functional

---

### 11. Performance Testing

#### Load Times
- [ ] Landing page loads < 3 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Map loads < 5 seconds
- [ ] Parcel 360 loads < 2 seconds
- [ ] Navigation transitions < 0.3 seconds

#### Console Checks
- [ ] No errors in console
- [ ] No hydration warnings
- [ ] No missing asset warnings
- [ ] No failed API calls
- [ ] TypeScript errors: 0

#### Network
- [ ] Font files load correctly
- [ ] Images load (if any)
- [ ] MapLibre assets load
- [ ] No 404 errors

---

### 12. Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through landing page elements
- [ ] Tab through navigation items
- [ ] Enter key activates buttons/links
- [ ] Escape key closes modals (if any)
- [ ] Focus indicators visible

#### Color Contrast
- [ ] White text on dark background: AAA
- [ ] Cyan text on dark background: AA+
- [ ] Button text readable
- [ ] Badge text readable
- [ ] Link text distinguishable

#### Screen Reader (Optional)
- [ ] Headings announced correctly
- [ ] Buttons have labels
- [ ] Links have meaningful text
- [ ] Images have alt text (if any)

---

## 🐛 Known Issues (If Any)

Document any issues found during testing:

### Critical
- None

### High
- None

### Medium
- Mobile responsive needs hamburger menu (Phase 2)

### Low
- Light mode not implemented (Phase 2)

---

## 📊 Test Results Template

Copy and fill this after testing:

```
=== LANDLENS TESTING REPORT ===
Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari]
Viewport: [1920px / 1440px / 1024px / etc.]

LANDING PAGE: [ PASS / FAIL ]
- Hero Section: ✓
- Navigation: ✓
- Content Sections: ✓
- Footer: ✓
- Responsive: ✓

LOGIN PAGE: [ PASS / FAIL ]
- Layout: ✓
- Role Selection: ✓
- Sign In: ✓

DASHBOARD: [ PASS / FAIL ]
- Layout: ✓
- KPI Cards: ✓
- Data Display: ✓
- Navigation: ✓

GIS MAP: [ PASS / FAIL ]
- Map Loads: ✓
- Controls Work: ✓
- Interactions: ✓

PARCEL 360: [ PASS / FAIL ]
- Header: ✓
- Data Sections: ✓
- Conflicts: ✓
- Actions: ✓

VISUAL QUALITY: [ PASS / FAIL ]
- Typography: ✓
- Colors: ✓
- Spacing: ✓
- Animations: ✓

FUNCTIONAL: [ PASS / FAIL ]
- Auth Flow: ✓
- Navigation: ✓
- Data Display: ✓

PERFORMANCE: [ PASS / FAIL ]
- Load Times: ✓
- Console Clean: ✓

ACCESSIBILITY: [ PASS / FAIL ]
- Keyboard Nav: ✓
- Color Contrast: ✓

OVERALL RESULT: ✅ PASS / ❌ FAIL

NOTES:
[Any additional comments]
```

---

## 🎯 Success Criteria

The redesign is successful if:

1. ✅ Landing page looks professional and GIS-focused
2. ✅ Navigation is clear and consistent
3. ✅ Typography hierarchy is evident
4. ✅ Colors are appropriate for government platform
5. ✅ No horizontal scrolling at any width
6. ✅ All existing functionality works
7. ✅ Demo badge is minimal and non-intrusive
8. ✅ Animations are subtle and purposeful
9. ✅ Console has no errors
10. ✅ Overall aesthetic is enterprise-grade

---

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify the dev server is running on port 3001
3. Clear browser cache and reload
4. Restart the dev server: `npm run dev`

---

**Happy Testing!** 🚀


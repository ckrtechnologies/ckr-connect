# Plan: CKR Connect BDM Mobile App (`frontend-bdm`)

**Date:** 23 Sep 2026  
**Status:** Approved Prototype Translation & Scaffolding Plan  
**Target Directory:** `frontend-bdm/`  
**Reference Docs:** `docs/PRD.md`, `docs/SCREEN-MAP.md`, `docs/DESIGN.md`, `docs/SCHEMA.md`, `docs/API.md`  
**Visual Reference:** Approved Prototype (`prototype/index.html`, `prototype/app.js`, `prototype/tokens.css`, `prototype/styles.css`)

---

## 1. Prototype Analysis & Visual Fidelity

The stakeholder-approved prototype in `prototype/` establishes the exact look, feel, and user journey for the Business Development Manager (BDM) mobile app.

### Key Visual & Design Foundations
- **Design System:** Microsoft Fluent 2 Design System adapted for mobile telecalling operations.
- **Color Palette:**
  - Brand Cortana Blue: Primary `#0067B8`, Hover/Active `#005A9E`, Pressed `#004578`, Light `#EFF6FC`.
  - Neutrals: Canvas/Background `#FAF9F8` (Fluent layered off-white, not stark white), Surface `#FFFFFF` (Cards, bottom sheets), Surface Alt `#F3F2F1`, Borders `#EDEBE9` and `#E1DFDD`.
  - Typography Colors: Primary text `#201F1E`, Secondary/captions `#605E5C`, Disabled `#A19F9D`.
  - Status Indicators:
    - Success (Won, Present): `#107C10`, Background `#DFF6DD`
    - Warning (Follow-up Due, Overdue, Half-day): `#D97706` / `#797673`, Background `#FFF4CE`
    - Error (Lost, Overdue, Absent): `#A4262C`, Background `#FDE7E9`
    - Info (New, Contacted, Inbound): `#0078D4`, Background `#EFF6FC`
  - High-Urgency Untouched Banner: Background `#FFF4CE`, Text `#78350F`, Border `#F2C94C`, Button `#D97706`.
- **Typography & Density:** Segoe UI Variable / System Sans-serif ramp:
  - Display: 28px (Bold 700)
  - Title: 20px (SemiBold 600)
  - Subtitle / H2: 16px (SemiBold 600)
  - Body: 14px (Regular 400 & SemiBold 600) — enterprise density
  - Caption: 12px (Regular 400)
  - Overline / Badge: 10px (SemiBold 700, Uppercase)
- **Radii:** `xs: 2`, `sm: 4`, `md: 8`, `lg: 12`, `pill: 9999`.
- **Elevation:** Fluent soft shadow levels (subtle border-driven elevation).

### Screen Coverage (B-01 through B-10 + Overlays)
1. **Shell & Navigation:**
   - Top App Bar with screen title, "+ Add Lead" quick pill button, and Notification bell with unread badge counter.
   - Bottom Tab Navigation (4 thumb-reachable tabs):
     - `B-02`: **Dashboard**
     - `B-05`: **My Leads** (with live active count badge)
     - `B-03` / `B-04`: **Attendance**
     - `B-09`: **Alerts** (with unread badge)
2. **`B-01` BDM Login:** Employee ID/Email & Password input, branded CKR Connect header, 44px primary action button.
3. **`B-02` BDM Workspace & Dashboard (US-21, US-31):**
   - 3 Segmented Sub-Tabs: "Today's Activity" (default), "Pipeline Funnel", "My Performance".
   - *Today's Activity Tab:*
     - Punch Status Header Card (Check-in time, live active pulse, Punch Out button).
     - Quick Action Bar ("➕ Add Inbound Lead", "📋 My Pipeline").
     - High-Urgency Alert Banner: Untouched Leads alert (Amber box with direct "Call Now" CTA).
     - My Leads Pipeline Matrix: 2-column clickable cards with count, ₹ Lakhs pipeline value, and priority tag (Untouched, Follow-ups Due, Contacted, Proposal, Deals Won, Total Assigned).
     - Daily Calling Target & Performance Scorecard: Target progress meter (% completed, X/15 calls logged), Call Result pills (Positive, Ringing/Neutral, Demo).
     - Quick action bar: "+ Log Call / Interaction", "Filter My Leads ›".
     - Today's Call Ledger & Results feed: Real-time call timeline with channel icons, contact/school name, result pill, notes quotation, next action reminder.
   - *Pipeline Funnel Tab:* Stage breakdown and overdue counts.
   - *My Performance Tab:* Self-scoped KPI metrics (Revenue Won, Weighted Pipeline, Avg Deal Size, Conversion Rate) + Weekly Deal Progress bar chart (no peer ranking).
4. **`B-03` Attendance Punch (US-13):** Large hero card with current date, large thumb-friendly punch button (PUNCH IN / PUNCH OUT, animated state, punch in time), link to monthly history.
5. **`B-04` Attendance History (US-17):** Monthly summary card, list of daily punch logs with date, in/out timestamps, and color-coded status badges.
6. **`B-05` My Assigned Leads (US-08, US-12):**
   - Header with total lead count, "+ Add Lead" action.
   - Search bar with live search, clear button.
   - Urgency quick filter chips (horizontal scroll): All, 🚨 Overdue, ⏰ Due Today, 🏆 Won.
   - Stage filter chips (horizontal scroll): All, ⚡ Untouched, Follow-up, Proposal, Contacted, Won.
   - Counter & Reset Filters action.
   - Lead cards: Untouched indicator, contact name, school/company, city/state, ₹ value, priority, direct "📞 Call" & "💬 WA" action buttons.
   - Empty state with reset CTA.
7. **`B-06` Mobile Lead Detail & Stepper + Waterfall History (US-09, US-24):**
   - Header bar with back button ("‹ My Leads") and status badge.
   - Key entity header card: Name, company, city, state, forecast value, priority badge, win %, direct Call/WA/Email touch targets.
   - Pipeline Progress Chevron Stepper (BPF bar): stages New → Contacted → Follow-up → Proposal → Won with interactive advance.
   - Primary Action buttons: "Close Deal as Won" / Won banner, "+ Log Activity", "📎 Scope BRD".
   - Full Lead Specifications: specs table with phone, email, location, institution, solution tag, budget, expected value, next action due, touchpoints logged, assigned BDM, source, created date.
   - Attached Scope Document (BRD) status and upload trigger.
   - Interaction Waterfall History: connected vertical timeline with channel icons, call outcome pills, discussion notes quote, next action indicator, genesis inbound lead node.
8. **`B-07` Log Follow-up / Interaction (US-10):**
   - Channel picker (Call, WhatsApp, Video Demo, Site Visit, Note).
   - Call Result outcome picker (Terms Agreed, Demo Scheduled, Virtual Demo Completed, Site Visit, Interested, Ringing/No Answer, Not Interested).
   - Discussion Notes textarea.
   - Next Action Scheduled Date picker.
   - Save to Waterfall CTA.
9. **`B-08` Upload BRD Document (US-11):**
   - Document picker interface (PDF/DOCX), VPS disk storage notice, Upload CTA.
10. **`B-09` In-App Alerts & Notifications Feed (US-18):**
    - List of notifications (lead assignments, overdue follow-ups, system notices) with unread state indicators and mark as read.
11. **`B-10` First-Login Welcome Walkthrough (US-34):**
    - 3-slide onboarding carousel introducing My Leads, Attendance Punch, and Live Alerts with skip and next/finish buttons.
12. **Shared Overlays & Modals:**
    - Quick Add Inbound Lead bottom sheet / modal (Mandatory: Name, Phone, Notes; Optional: Company, Offering Tag, Value, Date, City, State, Email).
    - Close Deal as Won modal (Closed deal amount ₹, Deal type, Customer Account name, Closing notes).
    - Drop-off / Lost modal (Lost vs Invalid with reason dropdowns).

---

## 2. Architecture & Coding Guidelines

### House Stack Compliance (`ckr-mobile-project-process`)
- **Framework:** React Native bare CLI (`react-native`), New Architecture/Fabric enabled.
- **Language:** **Plain JavaScript (.js / .jsx) — strictly no TypeScript (.ts / .tsx)**. Use JSDoc `@param` / `@returns` for type hinting.
- **State Management:** **Redux Toolkit (RTK)** for UI/client state + **RTK Query** for all server data caching and mutations.
- **Navigation:** `@react-navigation/native` with `@react-navigation/bottom-tabs` and `@react-navigation/native-stack`.
- **Domain-Driven Design (DDD) Modular Architecture:**
  - Code is partitioned by business domain (`auth`, `workspace`, `leads`, `attendance`, `notifications`).
  - Cross-domain rules: A domain only imports from itself and `shared/` — domains never cross-import from other domains directly.
  - Adding a new domain simply requires creating a domain folder and registering its routes/slices in the shared assembler.

### Crash Resilience Compliance (`crash-resilience`)
- **Loading State Guards:** Every CTA button (Submit, Save, Punch In/Out, Won Confirm) is `disabled={loading}` and displays `<ActivityIndicator>` while the operation is in flight.
- **Never Silently Fail:** All catches display an alert dialog (`Alert.alert`) with friendly Indian context messaging instead of silent `console.error`.
- **Navigation Guards:** Back buttons and modal dismissal are disabled during in-flight async submissions.
- **Root Error Boundary:** The application tree is wrapped in an `ErrorBoundary` that catches any unhandled JS exceptions and provides a recovery button.
- **Graceful Fallbacks & Offline/Mock Mode:** Built-in seed data support so the app functions seamlessly in disconnected environments or before backend onboarding.

---

## 3. Proposed Folder Structure in `frontend-bdm`

```
frontend-bdm/
├── package.json
├── App.jsx
├── index.js
├── babel.config.js
├── metro.config.js
└── src/
    ├── shared/
    │   ├── theme/
    │   │   ├── colors.js             # Fluent 2 color tokens
    │   │   ├── typography.js         # Typography ramp & fonts
    │   │   ├── spacing.js            # Spacing tokens (4 to 48)
    │   │   ├── radius.js             # Border radii
    │   │   ├── shadows.js            # Fluent elevation levels
    │   │   └── index.js
    │   ├── components/
    │   │   ├── ErrorBoundary.jsx     # Global error boundary
    │   │   ├── FluentButton.jsx      # Primary, secondary, danger, success buttons with loading spinner
    │   │   ├── FluentInput.jsx       # Standard inputs with focus ring
    │   │   ├── FluentCard.jsx        # Surface container card with border
    │   │   ├── StatusBadge.jsx       # Color-coded status badge with paired background
    │   │   ├── ProcessFlowBar.jsx    # Business Process Flow chevron stepper
    │   │   ├── WaterfallNode.jsx     # Timeline node for activity history
    │   │   ├── FilterChip.jsx        # Scrolling filter chip button
    │   │   ├── BottomSheet.jsx       # Reusable bottom sheet modal container
    │   │   ├── MetricTile.jsx        # KPI metric tile with label & value
    │   │   └── EmptyState.jsx        # Empty search / zero-state placeholder
    │   ├── navigation/
    │   │   ├── RootNavigator.jsx     # Auth flow vs App bottom tabs
    │   │   ├── BottomTabNavigator.jsx # 4-tab thumb navigation
    │   │   └── routes.js             # Route name definitions
    │   ├── store/
    │   │   ├── index.js              # configureStore configuration
    │   │   ├── api.js                # Base RTK Query API slice with auth headers
    │   │   └── slices/
    │   │       ├── authSlice.js      # User session, JWT tokens, onboarding flag
    │   │       └── uiSlice.js        # Global date preset, filter states, modal flags
    │   └── utils/
    │       ├── formatters.js         # ₹ Indian currency formatting, dates
    │       ├── communication.js      # tel:, wa.me, mailto: deep linking handlers
    │       └── mockSeedData.js       # High-fidelity mock seed data mirrored from prototype
    └── domains/
        ├── auth/
        │   ├── screens/
        │   │   ├── LoginScreen.jsx          # B-01
        │   │   └── WelcomeWalkthroughScreen.jsx # B-10
        │   ├── api.js
        │   └── slice.js
        ├── workspace/
        │   ├── screens/
        │   │   └── WorkspaceScreen.jsx      # B-02
        │   ├── components/
        │   │   ├── PunchStatusBanner.jsx
        │   │   ├── UntouchedAlertBox.jsx
        │   │   ├── PipelineMatrixGrid.jsx
        │   │   ├── CallingTargetCard.jsx
        │   │   ├── CallLedgerFeed.jsx
        │   │   ├── FunnelTab.jsx
        │   │   └── PerformanceTab.jsx
        │   └── api.js
        ├── attendance/
        │   ├── screens/
        │   │   ├── AttendancePunchScreen.jsx   # B-03
        │   │   └── AttendanceHistoryScreen.jsx # B-04
        │   ├── components/
        │   │   ├── PunchHeroButton.jsx
        │   │   └── AttendanceHistoryItem.jsx
        │   └── api.js
        ├── leads/
        │   ├── screens/
        │   │   ├── MyLeadsScreen.jsx        # B-05
        │   │   ├── LeadDetailScreen.jsx     # B-06
        │   │   ├── LogFollowupScreen.jsx    # B-07
        │   │   └── UploadBrdScreen.jsx      # B-08
        │   ├── components/
        │   │   ├── LeadCardItem.jsx
        │   │   ├── LeadSpecsTable.jsx
        │   │   ├── QuickAddLeadModal.jsx
        │   │   ├── CloseDealWonModal.jsx
        │   │   └── DropoffLostModal.jsx
        │   └── api.js
        └── notifications/
            ├── screens/
            │   └── NotificationsScreen.jsx  # B-09
            ├── components/
            │   └── NotificationCardItem.jsx
            └── api.js
```

---

## 4. Implementation Steps

### Phase 1: Environment & Project Scaffolding
- Initialize package configuration in `frontend-bdm/` with standard bare React Native dependencies:
  - React (`^19.0.0`), React Native latest (`^0.86.0`, New Architecture/Fabric mandatory)
  - `@reduxjs/toolkit` and `react-redux`
  - `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
  - `react-native-safe-area-context`, `react-native-screens`
- Configure `metro.config.js`, `babel.config.js`, `index.js`, and `app.json`.

### Phase 2: Shared Foundations, Tokens & Theme
- Create `src/shared/theme/` (`colors.js`, `typography.js`, `spacing.js`, `radius.js`, `shadows.js`).
- Build shared reusable UI primitives in `src/shared/components/`:
  - `ErrorBoundary.jsx`
  - `FluentButton.jsx`
  - `FluentInput.jsx`
  - `FluentCard.jsx`
  - `StatusBadge.jsx`
  - `ProcessFlowBar.jsx` (Business Process Flow stepper)
  - `BottomSheet.jsx`
  - `FilterChip.jsx`
  - `EmptyState.jsx`
- Implement Indian locale helpers in `src/shared/utils/formatters.js` (₹ amounts, phone numbers, timestamps) and communication linkers (`Linking.openURL`).

### Phase 3: Shared Navigation & Redux Store
- Configure RTK Store and base RTK Query API slice in `src/shared/store/`.
- Setup `authSlice.js` and `uiSlice.js`.
- Build `RootNavigator.jsx` and `BottomTabNavigator.jsx` with Fluent bottom bar styling and badge overlays.

### Phase 4: Domain Implementations
1. **Auth Domain (`B-01`, `B-10`):**
   - `LoginScreen.jsx` with input guards and loading feedback.
   - `WelcomeWalkthroughScreen.jsx` 3-step carousel.
2. **Workspace Domain (`B-02`):**
   - `WorkspaceScreen.jsx` with segmented tabs.
   - Untouched leads urgent alert, 2-column status matrix, daily target progress bar, call ledger feed, funnel & performance tabs.
3. **Attendance Domain (`B-03`, `B-04`):**
   - `AttendancePunchScreen.jsx` with large interactive toggle hero button and timer.
   - `AttendanceHistoryScreen.jsx` with monthly summary and status pills.
4. **Leads Domain (`B-05`, `B-06`, `B-07`, `B-08` + Modals):**
   - `MyLeadsScreen.jsx`: Search input, urgency chips, stage chips, lead cards with direct Call/WA buttons.
   - `LeadDetailScreen.jsx`: Top navigation, entity header, forecast card, BPF stepper, primary actions, full specification table, interaction waterfall connected timeline.
   - `LogFollowupScreen.jsx`: Channel picker, outcome dropdown, notes, next action date picker.
   - `UploadBrdScreen.jsx`: File selection card and VPS storage notes.
   - Modals: `QuickAddLeadModal.jsx`, `CloseDealWonModal.jsx`, `DropoffLostModal.jsx`.
5. **Notifications Domain (`B-09`):**
   - `NotificationsScreen.jsx` with color-coded alerts and unread indicators.

### Phase 5: Verification & Walkthrough
- Test and verify component rendering, navigation transitions, modal openings, state updates, filter operations, and crash-resilience guards.
- Verify exact visual alignment with the stakeholder-approved prototype.

---

## 5. Verification Plan

### Automated Verification
- Run code syntax and lint checks:
  ```bash
  cd frontend-bdm && node -e "require('./package.json')"
  ```
- Validate that all imports follow domain-driven boundaries (no cross-domain internal imports).
- Verify bundle compilation using Metro bundler / build checks.

### Manual Verification Flow
- **Navigation & Shell:** Verify tab switching between Dashboard, My Leads, Attendance, and Alerts.
- **Login Flow:** Verify `B-01` login authentication and redirection to `B-02` or `B-10`.
- **Calling Targets & Leads Matrix:** Check that tapping on status cards filters the lead list accordingly.
- **Lead Detail & BPF Stepper:** Advance through BPF stages (New → Contacted → Follow-up → Proposal → Won) and verify visual stage update.
- **Modals:** Open Quick Add Lead, Close Deal as Won, and Drop-off modals, and verify loading states on confirmation.
- **Communication Links:** Verify phone dialer and WhatsApp deep links trigger properly.

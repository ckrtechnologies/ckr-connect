# DESIGN.md — CKR Internal CRM (Web)

> CKR Technologies · React + Vite (web, not React Native)
> Visual direction: **Microsoft Fluent 2 Design System**, styled to look and feel like Dynamics 365 (Sales Hub) — command bar, site map, entity grids, Business Process Flow bar, Fluent color/type tokens.
> This document is the single source of truth for all UI decisions across both apps. `src/theme.js` in each app must mirror Section 1 exactly. Agents must not invent values that exist here. If something is not covered, propose an addition — do not improvise silently.
>
> **⚠️ One open conflict with an earlier locked decision — flagged, not silently changed:** the earlier house rule was "every overlay is a left-anchored, full-height drawer." True Dynamics 365 uses a **right-anchored "Quick Create" panel** (docked right, not full height in all cases, not left) for fast record creation, alongside full in-page forms for detailed edits — it does not use left drawers at all. Section 2.3 below documents the *authentic Dynamics pattern* (right panel). If you want the literal Dynamics look, this replaces the earlier left-drawer rule; if you want to keep drawers anchored left as originally specified, say so and I'll revert just that section. Everything else in this document is now styled to match Dynamics/Fluent regardless of that choice.

---

## 1. Foundations (Tokens)

### 1.1 Color

Fluent 2 palette, matching Dynamics 365's actual brand color ("Cortana blue") and neutral system.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` (brand) | #0067B8 | #2899F5 | Command bar accents, primary buttons, active nav, links |
| `primaryPressed` | #005A9E | #1F7FD1 | Pressed/hover state of primary |
| `secondary` | #038387 | #22B8BD | Secondary accents (rare — Fluent is mostly neutral + one brand color) |
| `background` | #FAF9F8 | #201F1E | App canvas (classic Fluent/Office neutral grey, not pure white) |
| `surface` | #FFFFFF | #292827 | Cards, panels, grids, forms |
| `surfaceAlt` | #F3F2F1 | #323130 | Grid row stripes, nested surfaces, hover on nav items |
| `textPrimary` | #201F1E | #F3F2F1 | Headings, body |
| `textSecondary` | #605E5C | #C8C6C4 | Captions, meta, field labels |
| `textDisabled` | #A19F9D | #797775 | Disabled labels |
| `textOnPrimary` | #FFFFFF | #FFFFFF | Text on primary buttons |
| `border` | #EDEBE9 | #3B3A39 | Dividers, grid lines, input borders |
| `borderStrong` | #8A8886 | #605E5C | Input focus/active borders |
| `success` / `successBg` | #107C10 / #DFF6DD | #6BB700 / #393D1B | Won, confirmations |
| `warning` / `warningBg` | #797300 / #FFF4CE | #FCE100 / #433519 | Overdue, cautions |
| `error` / `errorBg` | #A80000 / #FDE7E9 | #F1707B / #442726 | Lost, destructive, errors |
| `info` / `infoBg` | #0067B8 / #F3F9FD | #2899F5 / #11304A | Informational banners |
| `overlay` | rgba(0,0,0,0.4) | rgba(0,0,0,0.6) | Behind panels/dialogs |

Status-badge color mapping (lead status/attendance):
- New = `info`, Contacted/Follow-up = `primary` (tint), Negotiation = `warning`, Won = `success`, Lost = `error`, Invalid = `textSecondary` (neutral grey — data-quality, not a sales outcome)
- Attendance matrix: Present = `success`, Absent = `error`, Half day = `warning`, Leave = `info`, Holiday = `surfaceAlt`/grey

Rules:
- Background is off-white (`#FAF9F8`), never pure white — this is the specific Fluent/Office "canvas" grey that gives Dynamics its look; `surface` (pure white) sits on top of it for cards/grids/panels, creating the layered depth Dynamics is known for.
- Status colors always paired with their `*Bg` tint for badges/banners.
- Dark mode defined from day one.

### 1.2 Typography

Font: **Segoe UI Variable** (via `@fontsource/segoe-ui-variable` or self-hosted — Microsoft's actual Fluent 2 typeface). Fallback: `"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif` (so BDMs on non-Windows devices still get a close system match).

| Token | Size/LineHeight | Weight | Usage |
|---|---|---|---|
| `display` | 28/36 | 600 | Dashboard big numbers |
| `h1` (Title2) | 20/28 | 600 | Page titles, command bar title |
| `h2` (Title3) | 16/22 | 600 | Section/panel headers |
| `h3` (Subtitle1) | 14/20 | 600 | Card titles, grid section headers |
| `body` (Body1) | 14/20 | 400 | Default text — Fluent's default body size is smaller/denser than typical web apps, part of the Dynamics "dense grid" feel |
| `bodyBold` (Body1Strong) | 14/20 | 600 | Emphasis, field labels |
| `caption` (Caption1) | 12/16 | 400 | Meta, helper text, grid secondary lines |
| `overline` | 10/14 | 600, +0.3 letter-spacing, uppercase | Status badges, section labels |

Rules: no other sizes exist. This ramp is intentionally denser than the earlier Inter-based spec — that density (14px body, 12px captions, tight line-heights) is a core part of what makes an interface read as "enterprise CRM" rather than a modern consumer app.

### 1.3 Spacing

Scale: `4, 8, 12, 16, 20, 24, 32, 48` → `space.xs → space.3xl`. Fluent is tighter than the earlier spec:
- Page horizontal padding: **20** on Admin (desktop), **16** on BDM (mobile).
- Gap between grid rows: 0 (rows touch, separated by `border` only — the dense-grid look). Between form fields: 16. Between sections: 24.

### 1.4 Radius

Fluent uses small, subtle corners — **not** the rounded/soft look of the earlier spec:
`sm: 2` (inputs, buttons, chips) · `md: 4` (cards, grid containers) · `lg: 8` (panels, dialogs) · `full: 999` (avatars, pills only).

### 1.5 Elevation

Fluent's shadow system (`shadow2`/`shadow4`/`shadow8`/`shadow16`/`shadow28`):
- `level0`: flat (grids, default surfaces — Fluent relies on `border` far more than shadow)
- `level1` (shadow4): cards, dropdown menus — `0 2px 4px rgba(0,0,0,0.1), 0 0 2px rgba(0,0,0,0.08)`
- `level2` (shadow16): panels (Quick Create), command bar overflow menus — `0 8px 16px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.12)`
- Never stack shadows; prefer `border` over shadow wherever Fluent components allow it (this is a flatter, less "floaty" look than typical modern SaaS).

### 1.6 Iconography

Set: **Fluent System Icons** (`@fluentui/react-icons`) — the actual icon set Dynamics 365 ships with. One weight (Regular; Filled only for active/selected states, e.g. active site map item).
Sizes: `16` (inline, grid cells), `20` (default — command bar, site map, form fields), `24` (feature/empty-state), `28` (dashboard tile icons).

### 1.7 Motion tokens

| Token | Value | Usage |
|---|---|---|
| `duration.ultraFast` | 100ms | Hover, focus ring |
| `duration.fast` | 150ms | Button press, toggle |
| `duration.normal` | 200ms | Panel slide, dropdown open |
| `duration.slow` | 300ms | Page-level transitions |
| `easing.decelerate` | cubic-bezier(0.1, 0.9, 0.2, 1) | Entering (Fluent's actual "decelerate" curve) |
| `easing.accelerate` | cubic-bezier(0.7, 0, 1, 0.5) | Exiting |

Rules: Fluent motion is quick and subtle (100–300ms), noticeably snappier than typical consumer-app easing. Respect `prefers-reduced-motion`.

---

## 2. Layout & Navigation

### 2.1 Page anatomy (matches Dynamics 365 Unified Interface structure)

**Admin (desktop-first):**
`Command bar (top, full width)` → `Site map (left, collapsible)` + `Content area` side by side → content area shows either a **Grid view** (list of records) or a **Form** (single record, with tabs + Business Process Flow bar at top).

**BDM (mobile-first):**
`App bar (top: title + notification bell)` → `Content area` → `Bottom nav (4 items)`. Dynamics' own mobile client compresses the site map into a hamburger/bottom nav exactly this way, so the mobile-first BDM app stays faithful to the pattern while remaining usable one-handed.

### 2.2 Command bar (Admin, top of every screen)

Height 44px, `surface` bg, `border` bottom. Left: app name/breadcrumb ("CKR Connect › Leads"). Center-left: primary command buttons — icon (20px, Fluent icon) + label, e.g. **+ New**, **Assign**, **Bulk upload**, **Delete** — shown/hidden based on selection state in the grid below (select a row → contextual commands appear, exactly like Dynamics). Right: global search box, notification bell, user avatar/menu.

### 2.3 Site map (Admin, left nav)

Width 240px expanded / 48px collapsed (icon-only), `surface` bg, `border` right. Grouped, collapsible sections matching the sidebar categories already defined: **Dashboard, Leads, Staff, Masters, Attendance, Reports, Settings** (+ reserved Finance/Marketing/Projects/Renewals shown greyed out with a "Coming soon" tag — same as Dynamics greys out unlicensed apps/areas). Active item = `primary` left border accent (3px) + `primary` text + `surfaceAlt` bg, mirroring Dynamics' selected-item treatment.

### 2.4 Business Process Flow bar (replaces "LeadStepper" — same concept, now placed exactly where Dynamics puts it)

A full-width horizontal bar pinned at the **top of the Lead Detail form**, directly below the command bar, above the form tabs. Chevron-shaped stage segments (New → Contacted → Follow-up → Proposal → Won), current stage highlighted in `primary`, completed stages in `primary` at lower opacity with a checkmark, upcoming stages in `surfaceAlt`/grey. Lost/Invalid shows as a red/grey flag on the bar rather than a continued chevron. This is the authentic Dynamics 365 "Business Process Flow" component — used identically on A-04 and B-06.

### 2.5 Grid views (Lead List, Staff List, Attendance Matrix)

Dense data grid, row height 40 (denser than the earlier 48px spec), `border` only between rows (no zebra striping by default — Dynamics grids are flat white with hairline dividers), checkbox column for multi-select (drives the command bar's contextual commands), sortable column headers with a small sort-direction chevron, column resize handles. Sticky header on scroll.

### 2.6 Forms (record detail — Lead Detail, Staff Detail)

Tabbed layout (`Summary`, `Details`, `Related` — Dynamics' classic tab structure), two-column field layout within a tab (label above field, Fluent style), Business Process Flow bar (§2.4) pinned above the tabs. A **Timeline** panel (interaction/activity history — `lead_interactions`) docks on the right side of the form or as its own tab, matching Dynamics' Activities/Timeline pane on Lead and Opportunity forms.

### 2.7 Quick Create panel (the authentic Dynamics overlay pattern)

Docks from the **right edge** of the viewport (not left), width 440px fixed, full height, `level2` shadow, `surface` bg. Used for fast record creation from anywhere (+ New Lead from the command bar) without leaving the current grid. Header: `h2` title + close (X). Footer: sticky, **Save and Close** (primary) + **Save and New** (secondary) — Dynamics' actual two-button Quick Create footer pattern. Full in-record editing (beyond quick fields) still happens by opening the full Form (§2.6), not the panel.

*This section is the one that conflicts with the originally-specified left-anchored drawer — see the flag at the top of this document.*

On **BDM (mobile)**, any panel/form is naturally full-screen regardless of anchor side, so the left-vs-right distinction only matters on Admin desktop.

### 2.8 Dashboards

Card/tile grid (Dynamics dashboard style): each tile is a `surface` card with `level1` elevation, a chart (waterfall, leaderboard) or a big-number stat, a `h3` tile title, and a "View records" link in the corner — same interaction Dynamics dashboards use to drill from a chart into its underlying grid.

### 2.9 Responsiveness

- Admin designed at 1440px, degrades to 1024px (site map auto-collapses to icon-only below ~1200px, exactly as Dynamics' site map does).
- BDM designed at 390px, works at 360px.

---

## 3. Components

### 3.1 Buttons

Primary (`primary` bg, `textOnPrimary`, `sm` radius — Fluent buttons are barely rounded), Secondary (outline, `border` + `textPrimary`), Subtle/Ghost (no border, text only — used heavily in the command bar), Destructive (`error` outline, filled only inside a confirm dialog). Heights: 24 (command bar buttons), 32 (default/grid row actions), 40 (form primary actions), 48 (BDM primary CTAs).

### 3.2 Inputs

Height 32 (Admin form fields — Fluent inputs are compact), 44 (BDM). Label above (`bodyBold`, `textSecondary`), helper/error text below (`caption`). Focus = `borderStrong` 2px outline (Fluent's focus style, not a colored glow).

### 3.3 Selection controls

Switch (toggles), Checkbox (grid multi-select — square, Fluent style), Radio (≤5 options), Combo box/Select (Fluent's `Combobox` component for tag/source/BDM pickers — supports type-to-filter, matching Dynamics' lookup fields).

### 3.4 Cards / Tiles

`surface` bg, radius `md`, padding 16, `level1` elevation. Dashboard tiles and BDM lead-list rows.

### 3.5 Badges, avatars

Badge: `overline` text on status `*Bg` tint, radius `sm` (not pill-shaped — Dynamics status badges are small rounded rectangles, not full pills), height 20. Avatar: circular, 24/32/40, initials fallback on `primary` at 15% opacity — same as Dynamics' Office-style persona avatars.

### 3.6 Feedback components

- **Toast/Notification banner**: top-right (Admin, matches Dynamics' notification flyout position), bottom-center above nav (BDM). Auto-dismiss 4s.
- **Dialog** (small, centered): destructive confirmations only. Title `h2`, body `body`, destructive button `error`.
- **Skeleton**: `surfaceAlt` shimmer blocks mirroring grid/form layout.
- **Progress**: thin `primary` bar under the command bar during any save/upload — matches Dynamics' top-of-page progress indicator.

### 3.7 Business Process Flow bar (see §2.4 — the shared "stepper" component, `src/shared/components/ProcessFlowBar.jsx`)

### 3.8 Waterfall chart (dashboard)

Horizontal bar chart (Recharts, themed to Fluent's chart palette), one bar per stage with a count label; Lost/Invalid as a separate callout beside the chart.

---

## 4. States & Feedback Patterns

1. **Loading**: skeleton matching grid/form layout. Never a blank white screen.
2. **Empty**: Fluent icon (24px) + `h3` title + one-line `caption` + primary command if actionable ("No leads yet" → "+ New lead" command).
3. **Error**: full-page error (icon + "Something went wrong" + Retry) for failed initial load; toast for failed actions; inline field errors for validation.
4. **Offline**: slim `warningBg` banner "You're offline"; no offline write queueing required for v1.

---

## 5. Interaction Rules

- Minimum tap target 44×44 on BDM; command-bar/grid actions on Admin can be smaller (28–32px) since desktop uses pointer precision, matching Dynamics' own density.
- Every interactive element gives feedback within 100ms.
- Debounce all submit buttons; disable while request in flight.
- Destructive actions always confirm via Dialog, naming the action ("Suspend staff," never "Yes").
- **Contextual commands**: command bar buttons like Assign/Bulk-delete only appear once one or more grid rows are checked — exactly like Dynamics' selection-driven command bar.

---

## 6. Content & UX Writing

- Tone: professional, direct, second person.
- Buttons = verb + object: "Add lead," "Assign to BDM." Command bar buttons can be a single verb ("New," "Assign," "Delete") matching Dynamics' compact command labels.
- Errors = what happened + what to do, no raw error codes.
- Sentence case everywhere except `overline`.
- Numbers: currency `₹1,29,999`, dates `12 Mar 2026`, relative time under 24h ("2h ago").
- All strings in an i18n/strings file from day one.

---

## 7. Accessibility (minimum bar)

- Text contrast ≥ 4.5:1.
- `aria-label` on every icon-only button (command bar is icon-heavy — this matters more here than in a typical app).
- Keyboard navigable: Tab order logical, Esc closes panels/dialogs, focus trapped inside an open panel.
- Don't communicate by color alone.

---

## 8. Platform Conventions

- Browser-only. Target latest Chrome/Edge/Safari; mobile Safari + Chrome for BDM.
- No PWA/install prompts required for v1.

---

## 9. Recurring Flow Patterns

- **Auth**: email + password only, no OTP/social login. `force_password_reset` on first login.
- **Onboarding (BDM only, first login)**: immediately after the forced first-login password change, a max-3-slide walkthrough (skippable) introduces My Leads, Attendance, and Notifications, then lands on the Dashboard. Shown exactly once (`has_seen_onboarding`). Present by house default even for an internal/B2B tool — not silently omitted. Admin has no onboarding walkthrough (assumed familiar with the tool they administer).
- **Staff credential handoff**: since there's no email/WhatsApp integration, a newly created (or reset) staff account's password is shown exactly once, in a small centered `Dialog` (not a drawer/panel — it's a single copyable value, not a form) with a prominent copy button and a "this won't be shown again" warning.
- **Bulk CSV upload**: template download → file select → validation preview → confirm commit → result summary.
- **Lead assignment**: select row(s) in grid → command bar "Assign" appears → Quick Create-style right panel → pick BDM (Combobox) → confirm → toast + notification.
- **Status change**: via Business Process Flow bar (§2.4) — advancing a stage is a click on the next chevron; Lost/Invalid opens a required-reason field inline before committing.
- **Search**: global search in command bar, debounce 300ms, recent/suggested results dropdown.

---

## 10. Governance

- `src/theme.js` (each app) mirrors Section 1 — any token change updates both in the same PR.
- New component → spec added here first, then built in `components/ui/`.
- Review checklist before marking any screen complete:
  - [ ] Only theme tokens used (no raw hex/px)
  - [ ] Command bar contextual commands correct for the current selection state
  - [ ] All 4 data states implemented
  - [ ] Panel/dialog pattern followed per §2.7 (no stray left drawers unless that decision is reverted — see flag at top)
  - [ ] Touch targets meet minimum on BDM, keyboard/focus handled on Admin
  - [ ] Copy follows §6; strings externalized
  - [ ] Works at 1024px (Admin) / 360px (BDM)

> Anything that violates this document is a bug, even if it "looks fine."

---

## 11. Implementation Stack (design rule → approved library)

| Design area | Approved library | Rule |
|---|---|---|
| Component primitives | **Fluent UI React v9** (`@fluentui/react-components`) | Buttons, inputs, Combobox, Dialog, Drawer/Panel, Tabs, DataGrid — the actual Microsoft library Dynamics 365 itself is built on; use it directly rather than re-skinning shadcn/Radix |
| Styling & tokens | Fluent UI's `makeStyles`/design tokens (`@fluentui/react-theme`) | Theme object mirrors Section 1 exactly; no Tailwind (Fluent's styling system replaces it here) |
| Grids/tables | **Fluent UI `DataGrid`** (`@fluentui/react-data-grid-react`) or TanStack Table styled with Fluent tokens if DataGrid is too limited for virtualization at scale | Admin dense grids |
| Icons | `@fluentui/react-icons` | Fluent System Icons, Regular weight |
| Charts | Recharts, themed to Fluent palette (no native Fluent chart library for custom charts) | Waterfall, dashboard tiles |
| Animations | Framer Motion, tuned to §1.7's fast/subtle durations | Panel slide, dropdown open |
| Forms | React Hook Form + Zod, fields rendered with Fluent UI input components | Validation |
| Server state | RTK Query (`@reduxjs/toolkit`) | All server fetching/caching |
| Client state | RTK slices | UI flags, panel open/close, grid selection |
| Sockets | `socket.io-client` | Live notification push |
| Routing | `react-router-dom` | Both SPAs |

Rules:
- Fluent UI React v9 replaces shadcn/ui + Tailwind from the earlier spec — this is the one dependency swap needed to make the app *actually* built from Microsoft's own component library, not just visually imitate it.
- These are the only UI libraries agents may install. Anything else requires stopping and asking first.

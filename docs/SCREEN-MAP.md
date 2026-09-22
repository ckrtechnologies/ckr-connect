# SCREEN-MAP — CKR Internal CRM

**Version:** v1.0
**Date:** 22 Sep 2026
**Companion docs:** PRD.md v1.0, DESIGN.md v1.0 (Fluent/Dynamics 365 visual direction)

S-ID prefix: `A-` = Admin app, `B-` = BDM app.

---

## Admin App (`connect.ckrtechnologies.in/admin/`) — Desktop-first

**Site map (left nav, top-level):** Dashboard · Leads · Staff · Masters · Attendance · Reports · Settings
*(Reserved, not built in v1: Finance · Marketing · Projects · Renewals — see PRD §7)*

Each top-level nav item opens directly onto its primary grid/list screen; create, bulk-upload, and assign actions appear as **contextual command-bar buttons** (per DESIGN.md §2.2) rather than separate nav items — enabled once a row is selected, or always-visible for "+ New."

| S-ID | Screen | Purpose | Entry Point | Data In | Data Out | Story IDs |
|---|---|---|---|---|---|---|
| A-01 | Login | Admin authentication | Direct URL | email, password | JWT | US-01 |
| A-02 | Dashboard | Funnel, lead-status waterfall, leaderboard, attendance summary, overdue follow-ups, weighted pipeline value, won revenue | Site map → Dashboard (post-login landing) | date range filter | aggregated metrics, waterfall chart data, forecast/revenue figures | US-20, US-23, US-28 |
| A-03 | Lead List (grid) | Browse/search/filter all leads, multi-select drives command bar (Assign, Bulk actions) | Site map → Leads | filters (status/tag/BDM/source/state/city/date), search | paginated lead rows | US-06 |
| A-04 | Lead Detail (form) | View/edit lead; Business Process Flow bar at top; tabs (Summary/Details/Related); Timeline panel (interaction/assignment/status history) | From A-03 row click | lead edits | updated lead, history timelines, BPF stage | US-02, US-09 (view), US-24 |
| A-05 | Quick Create — Lead | Fast single-lead creation (panel, per DESIGN.md §2.7) | "+ New" command on A-03 | lead fields | new lead row | US-02 |
| A-06 | Bulk Upload (CSV) | Upload CSV, preview, validate, commit | "Bulk upload" command on A-03 | CSV file | insert summary, error report | US-03 |
| A-07 | Assign/Reassign Lead(s) | Assign single or multi-selected leads to a BDM; reassign from one BDM to another | "Assign" command on A-03 (bulk) or A-04 (single) | lead id(s), target BDM | assignment history rows, notification | US-04, US-05 |
| A-08 | Staff List (grid) | View/manage BDM/staff accounts; "Reset password" as a row/command-bar action | Site map → Staff | — | staff list | (staff mgmt), US-33 |
| A-09 | Quick Create / Edit — Staff | Create staff (ID + password) or edit existing (staff fields, block/suspend status); on creation, shows a one-time confirmation view with the initial password + copy button | "+ New" command on A-08 / row click | staff fields, initial password | new/updated user row, one-time password display | (staff mgmt), US-32 |
| A-10 | Masters | Manage lookup tables — Product/Service Tags (live in v1); Lead Source/Status masters TBD | Site map → Masters | master item fields | master list per type | US-07 |
| A-11 | Attendance Matrix | Month view, BDMs × dates, color-coded | Site map → Attendance | month selector | matrix grid | US-16 |
| A-12 | Attendance Edit | Manually correct a BDM's attendance for a date | From A-11 cell click | status, times | updated attendance row, audit log | US-14 |
| A-13 | Holiday Calendar | Add/manage company holidays | Tab/section inside A-11, or Settings | date, name | holiday list | US-15 |
| A-14 | Notifications | Admin's own notification feed (e.g. escalations) | Bell icon (command bar) | — | notification list | US-18 (admin-facing subset) |
| A-15 | Export/Reports | Generate CSV exports of filtered leads or attendance | Site map → Reports | current filters | CSV download | US-06 |
| A-16 | Daily Interaction Report | Cross-BDM, date-scoped rollup of all logged interactions | Site map → Reports (tab) | date/date range, BDM filter | interaction rows, 0-activity flags, CSV export | US-22 |
| A-17 | Account List (grid) | Browse/search companies CKR has sold or is selling to | Site map → Leads (tab, or its own site map item — TBD) | search | account rows, lead count, lifetime revenue per row | US-29 |
| A-18 | Account Detail | Company info + full lead history timeline (won/lost/in-progress) + lifetime revenue rollup | From A-17 row click, or linked from A-04 | account edits | updated account, lead history | US-29 |

---

## BDM App (`connect.ckrtechnologies.in/bdm/`) — Mobile-first responsive

**Bottom nav (4 items, thumb reach):** Dashboard · My Leads · Attendance · Notifications

| S-ID | Screen | Purpose | Entry Point | Data In | Data Out | Story IDs |
|---|---|---|---|---|---|---|
| B-01 | Login | BDM authentication | Direct URL | email, password | JWT | US-01 |
| B-02 | Dashboard | My pipeline funnel, follow-ups due, conversion rate, attendance summary; "My Performance" tab — revenue won, avg deal size, weighted pipeline, new-business vs upsell/resell split, interactions logged, avg time-to-close, trend chart (no peer ranking) | Bottom nav → Dashboard | — | aggregated own metrics + performance figures | US-21, US-31 |
| B-03 | Attendance (Punch) | Large thumb-friendly check-in/check-out button, today's status | Bottom nav → Attendance | tap | attendance row | US-13 |
| B-04 | Attendance History | Calendar/list of own attendance, monthly summary (tab within B-03) | Tab inside Attendance | month selector | attendance history | US-17 |
| B-05 | My Leads | List of assigned leads, filterable (status/tag), overdue/due-today highlighted | Bottom nav → My Leads (default landing after dashboard) | filters | lead rows | US-08, US-12 |
| B-06 | Lead Detail | View lead info; Business Process Flow bar at top; interaction timeline; update status; linked Account (if any) | From B-05 row tap | status update, lost/invalid reason | updated lead, status history, BPF stage | US-09, US-24 |
| B-07 | Log Follow-up (panel) | Add an interaction entry against a lead | Button inside B-06 (full-screen on mobile) | type, notes, next action/date | new interaction row, updated lead fields | US-10 |
| B-08 | Upload BRD (panel) | Attach/replace BRD file against a lead | Button inside B-06 (full-screen on mobile) | file | stored file path (VPS disk), updated lead | US-11 |
| B-09 | Notifications | Own notification feed (lead assigned, follow-up due) | Bottom nav → Notifications | — | notification list, mark-read | US-18 |
| B-10 | Welcome (first-login onboarding) | Max-3-slide walkthrough (My Leads, Attendance, Notifications), shown once | Automatic, right after first forced password change | tap through/skip | `has_seen_onboarding = true` | US-34 |

---

## Cross-App Notes

- Both apps share the same JWT auth mechanism but are served as separate SPA bundles (`base: '/admin/'`, `base: '/bdm/'` in Vite config).
- `socket.io` connection established on login in both apps for live notification delivery (US-18).
- No screen in the BDM app exposes other BDMs' leads or cross-BDM data — every query is server-scoped to `current_user.id`.
- **Overlay pattern:** Quick Create panels/forms per DESIGN.md §2.7 — anchor side (left vs right) is an open item, see PRD §3 Locked Decisions.
- **Shared component:** Business Process Flow bar (`ProcessFlowBar`, DESIGN.md §2.4/§3.7) is used identically in A-04 and B-06.
- **Accounts (A-17/A-18)** are Admin-only in v1 — BDM app shows a read-only "linked account" summary on B-06 (prior deals with this company) but has no standalone Account list/management screen.

---

## Sign-off

| Name | Role | Date |
|---|---|---|
| Chandan Mallik | Co-Founder & CTO, CKR Technologies | 22 Sep 2026 |

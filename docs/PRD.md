# PRD — CKR Internal CRM (Admin + BDM)

**Version:** v1.0
**Date:** 22 Sep 2026
**Owner:** Chandan Mallik, Co-Founder & CTO, CKR Technologies
**Status:** Active Development — Phase 1 (Admin Panel) Complete, Phase 2 (BDM Mobile App) Ready to Start

---

## 1. Purpose

CKR Technologies has hired telecallers acting as Business Development Managers (BDMs) to sell IT products and services. This CRM gives:

- **Admin** — full visibility and control over leads, BDMs, and attendance.
- **BDM** — a mobile-first tool to manage assigned leads, log follow-ups, upload BRDs, and mark attendance.

This is an **internal tool**, not a client deliverable — so the prototype-first/payment-gate process in the CKR standard does not apply. PRD + Screen Map are drafted and locked by internal sign-off (Chandan) instead of a client signature.

---

## 2. Platforms

| App | Users | Design priority |
|---|---|---|
| `connect.ckrtechnologies.in/admin/` | Admin | Desktop-first |
| `connect.ckrtechnologies.in/bdm/` | BDM (telecallers) | Mobile-first responsive |
| `connect.ckrtechnologies.in/api/` | Shared Express backend | — |
| `connect.ckrtechnologies.in/api/files/` | Files/CDN — self-hosted on the CKR VPS (`FILES_DIR`, no third-party object storage); served only via authenticated Express routes (e.g. `GET /leads/:id/brd/download`), never a public/static Nginx location | — |

---

## 3. Locked Decisions

- **Two separate React + Vite SPAs**, one shared Express backend, path-based routing under one Nginx server block (`/admin/`, `/bdm/`, `/api/`).
- **Admin = desktop-first, BDM = mobile-first responsive** (BDMs may not have laptops).
- **Notifications: in-app/web only** (no WhatsApp, no email) — bell icon + unread count, delivered via `socket.io`.
- **Hosting: Tier 1** — shared Postgres on CKR VPS, own schema (`crm`) + own DB role, Express-owned auth (JWT, bcrypt), no Supabase Auth/PostgREST/RLS.
- **Roles:** `admin`, `bdm` only for v1. No manager/team-lead tier yet.
- **Lead tagging:** Product (School Management ERP, Other ERP/Software) and Service (Custom App/Website Development) via an admin-editable `tags` master. Leads can have multiple tags via a `lead_tags` junction table.
- **State field** added to leads (alongside city) — relevant mainly for School ERP leads sold across Indian states.
- **Attendance:** self-punch by BDM (check-in/check-out); Admin can view/edit; holidays handled via a separate `holidays` table — a BDM not punching on a holiday is not counted absent.
- **Visual direction: Fluent 2 / Dynamics 365 look** — command bar, collapsible site map, dense entity grids, Business Process Flow bar on Lead Detail (replaces the earlier generic "stepper" concept with the authentic Dynamics component), Fluent UI React v9 component library. Full spec in DESIGN.md. **Open item:** whether the Quick Create overlay is right-anchored (authentic Dynamics) or left-anchored (originally specified) — flagged in DESIGN.md §2.7, not yet resolved.
- **Admin sidebar (v1):** Dashboard, Leads, Staff, Masters, Attendance, Reports, Settings — each top-level item opens a grid/list screen with create/bulk/assign actions built in via the command bar (not separate nav items). Reserved-but-unbuilt slots: Finance, Marketing, Projects, Renewals (see §7).
- **BDM sidebar (v1):** Dashboard, My Leads, Attendance, Notifications — kept to 4 items for mobile bottom-nav thumb reach.
- **Follow-up history** is a separate log table (`lead_interactions`), not just fields on `leads` — required for the interaction trail and analytics.
- **Invalid vs Lost kept distinct:** `junk`/`invalid` (bad data — wrong number, duplicate, spam, not interested at first contact) is a separate status from `lost` (genuine opportunity that didn't convert). Marking a lead Invalid requires a mandatory `invalid_reason`, mirroring how `lost_reason` works — kept apart so lost-reason analytics aren't polluted by bad-data noise.
- **Pipeline value and Accounts are core v1, not Phase 2:** deal-value forecasting (`expected_value`, stage-weighted probability) and an `accounts` entity (so repeat business, upsell, and resell are traceable against a company, not lost in disconnected lead records) are both required for real pipeline visibility — moved out of the earlier Finance/Phase-2 placeholder into this build. Revenue *recognition*/invoicing stays in Finance (Phase 2); *forecasting and deal value at the point of winning* does not.
- **AI lead scoring is Phase 2**, but the schema is built now to support it: `leads.ai_score` reserved as a nullable column, and every interaction/status-change stays structured and append-only (`lead_interactions`, `lead_status_history`) specifically so a future scoring job has clean training data without a re-migration.
- **Out of scope for v1:** WhatsApp/email notifications, HR/payroll/compensation fields, leave-request workflow, geo/IP-restricted attendance, manager hierarchy, actual AI scoring computation, invoicing/AMC revenue recognition — flagged for Phase 2, not built now.

---

## 4. User Roles

| Role | Access |
|---|---|
| **Admin** | Full CRUD leads, assign/reassign/bulk-assign leads, bulk CSV upload, manage BDM accounts, view/edit all attendance, manage holidays, manage tags, view all dashboards/analytics |
| **BDM** | View only own assigned leads, update lead status, log follow-ups, upload BRD, punch own attendance, view own dashboard |

---

## 5. User Stories & Acceptance Criteria

### Epic A — Authentication

**US-01 (Admin/BDM):** As a user, I can log in with email/password so I can access my role-specific app.
- AC-1: Login validates credentials against `users` table (bcrypt); returns JWT (access + refresh).
- AC-2: Wrong credentials show a clear error, no user enumeration (generic "invalid email or password").
- AC-3: Admin JWT only grants access to `/admin/` routes and admin-scoped API endpoints; BDM JWT only grants BDM-scoped ones — enforced server-side, not just hidden in UI.
- AC-4: Session persists via refresh token; expired access token auto-refreshes silently.
- AC-5: Inactive (`is_active = false`) users cannot log in, even with correct credentials.

---

### Epic B — Lead Management (Admin)

**US-02:** As Admin, I can create a lead manually so it enters the pipeline.
- AC-1: Required fields: name, phone, source, tag (product/service). All others optional.
- AC-2: New lead defaults to status `new`, `created_by` = current admin, `assigned_to` = null (pool) unless assigned at creation.

**US-03:** As Admin, I can bulk upload leads via CSV so I can onboard large batches at once.
- AC-1: CSV template provided for download (matches lead fields).
- AC-2: Upload validates rows before commit — invalid rows (missing required fields, malformed phone) are rejected with a downloadable error report; valid rows are inserted.
- AC-3: Duplicate detection by phone number — duplicates flagged, not silently created twice (admin chooses skip/merge/create-anyway).
- AC-4: Upload result summary shown: rows processed, inserted, skipped, failed.

**US-04:** As Admin, I can assign a lead (or multiple leads at once) to a BDM so work gets distributed.
- AC-1: Single and multi-select (bulk) assignment supported from the lead list.
- AC-2: Assignment writes to `leads.assigned_to` and inserts a row into `lead_assignment_history`.
- AC-3: Assigned BDM gets an in-app notification.

**US-05:** As Admin, I can take back a lead from a BDM and reassign it to another BDM.
- AC-1: Reassignment is just another `lead_assignment_history` entry (`assigned_from` = old BDM, `assigned_to` = new BDM, `assigned_by` = admin).
- AC-2: Old BDM loses visibility of the lead immediately; new BDM gains it and is notified.

**US-06:** As Admin, I can filter/search leads by status, tag, BDM, source, state, city, date range so I can find relevant leads quickly.
- AC-1: All filters combinable (AND logic); search by name/phone/company as free text.
- AC-2: Filtered view is exportable (CSV).

**US-06b:** As Admin, I can bulk delete leads.
- AC-1: Single and multi-select (bulk) deletion supported from the lead list.
- AC-2: Deletion cascades or handles interaction history, status history and assignment history so no orphans remain.

**US-07:** As Admin, I can manage the Product/Service tag master so new offerings (e.g. future ERPs) can be added without a code change.
- AC-1: Admin can add/deactivate a tag; deactivated tags stay on existing leads but aren't selectable for new leads.

---

### Epic C — Lead Management (BDM)

**US-08:** As BDM, I can see only leads assigned to me so I focus on my own pipeline.
- AC-1: Lead list query is always scoped server-side to `assigned_to = current_user.id` — never client-filtered.

**US-09:** As BDM, I can update a lead's status as it progresses through the pipeline.
- AC-1: Status change writes to `leads.status` and inserts a `lead_status_history` row (old, new, changed_by, timestamp).
- AC-2: Marking status `lost` requires a `lost_reason` (mandatory field on that transition).

**US-10:** As BDM, I can log a follow-up/interaction against a lead so there's a record of what happened.
- AC-1: Each log entry captures type (call/whatsapp/email/meeting/site visit), notes, and optional next action/next follow-up date.
- AC-2: Saving a log entry auto-updates `leads.last_followup_date` and increments `leads.followup_count` (DB trigger or service-layer transaction).
- AC-3: If "next follow-up date" is set on the log, it updates `leads.next_followup_date`.

**US-11:** As BDM, I can upload a BRD document against a lead.
- AC-1: File uploaded directly to Express (multipart), written to disk under `FILES_DIR` on the CKR VPS; accepted types PDF/DOC/DOCX, max size enforced (e.g. 10MB).
- AC-2: `leads.brd_url` stores the file's path on disk; upload is replaceable (re-upload writes a new file, old file retained for audit unless explicitly deleted); downloads only ever go through an authenticated Express route (§ API.md), never a direct/public file link.

**US-12:** As BDM, I can see my leads with overdue or due-today follow-ups highlighted so I don't miss them.
- AC-1: Leads where `next_followup_date <= today` and status not in (won, lost, junk) are visually flagged (e.g. red/amber) in the BDM's lead list.

---

**US-25:** As Admin or BDM, I can mark a lead as Invalid so bad-quality data (wrong number, duplicate, spam, not interested at first contact) doesn't pollute the real pipeline or lost-reason analytics.
- AC-1: Marking a lead Invalid requires a mandatory `invalid_reason` (dropdown: Wrong Number, Duplicate, Not Interested, Spam, Out of Service Area, Other).
- AC-2: `invalid_reason` is a separate field from `lost_reason` — Invalid and Lost are distinct terminal statuses, never merged.
- AC-3: An Invalid lead is removed from active follow-up queues, overdue-follow-up counts, and the main pipeline funnel — but remains visible/filterable in reports.
- AC-4: Status change writes to `lead_status_history` like any other transition.

---

### Epic D — Attendance

**US-13:** As BDM, I can punch check-in and check-out so my attendance is recorded.
- AC-1: One `attendance` row per BDM per date (unique constraint); check-in creates it, check-out updates it.
- AC-2: Cannot check in twice in the same day without checking out first (or check-in is idempotent — button disables after first punch).

**US-14:** As Admin, I can view and manually edit any BDM's attendance so I can correct mistakes.
- AC-1: Admin edit writes an audit trail (who edited, when) — not a silent overwrite.

**US-15:** As Admin, I can mark a date as a company holiday so BDMs aren't penalized for not punching in.
- AC-1: Holiday dates stored in `holidays` table, not as `attendance` rows.
- AC-2: Any report/matrix treats a date-with-no-attendance-row as `holiday` (not `absent`) if it exists in `holidays`; otherwise `absent`.
- AC-3: A BDM who *does* punch in on a holiday still has it recorded normally (optional working day).

**US-16:** As Admin, I can view a monthly attendance matrix (BDMs × dates) with color-coded status so I can scan attendance at a glance.
- AC-1: Matrix endpoint returns per-BDM, per-date status for a given month, merging `attendance` + `holidays`.
- AC-2: Color mapping: Present = green, Absent = red, Half day = amber, Leave = blue, Holiday = grey, Future date = neutral/blank.

**US-17:** As BDM, I can view my own attendance history and monthly summary.
- AC-1: Shows present/absent/leave/holiday counts for the selected month plus a simple calendar/list view.

---

### Epic E — Notifications

**US-18:** As BDM, I receive an in-app notification when a lead is assigned to me or a follow-up is due.
- AC-1: Notification created server-side (on assignment; via daily cron for follow-up-due/overdue) and pushed live via `socket.io` if the user is connected, otherwise visible on next login.
- AC-2: Bell icon shows unread count; clicking marks as read and deep-links to the relevant lead.

**US-19 (system):** A daily cron job checks for due/overdue follow-ups.
- AC-1: Runs once daily (e.g. 9 AM IST) via BullMQ scheduler; queries leads where `next_followup_date <= today` and status not terminal; creates one `notifications` row per matching lead per assigned BDM (not duplicated if already notified today).

---

### Epic F — Dashboards & Analytics

**US-20:** As Admin, I see a dashboard with lead funnel, BDM leaderboard, conversion rate, attendance summary, and overdue follow-ups.
- AC-1: All metrics scoped to a selectable date range (default: current month).
- AC-2: Leaderboard sortable by leads won, conversion %, or leads assigned.

**US-21:** As BDM, I see a dashboard with my own pipeline funnel, follow-ups due, conversion rate, and attendance summary.
- AC-1: Scoped entirely to `current_user.id` server-side.

**US-31 (BDM):** As BDM, I can see my own performance so I know how I'm doing without needing to ask Admin or compare myself to anyone else.
- AC-1: A "My Performance" section/tab on the BDM Dashboard (B-02) shows: leads assigned, leads won, conversion rate, revenue won (₹), average deal size, my weighted pipeline value, new-business vs upsell/resell split (count + revenue), interactions logged, average time-to-close, attendance summary.
- AC-2: A simple trend chart (leads won or revenue, by week or month) so the BDM can see improvement over time, not just the current period.
- AC-3: **No ranking, leaderboard position, or visibility into any other BDM's numbers** — this view is strictly self-scoped, by design, for Phase 1. Peer comparison is explicitly deferred (see PRD §7).
- AC-4: Scoped entirely to `current_user.id` server-side, same enforcement as US-21.

---

### Epic G — Reporting & Pipeline Visualization

**US-22 (Admin):** As Admin, I can view a daily report of interaction history so I can see exactly what follow-up activity happened across all BDMs on a given day.
- AC-1: Report defaults to today; a date (or date range) is selectable.
- AC-2: Each row shows timestamp, BDM, lead name/company, interaction type, notes, next action set (if any).
- AC-3: Filterable by BDM; sortable by time.
- AC-4: Exportable as CSV.
- AC-5: A BDM with zero logged interactions on the selected date is flagged (0-activity indicator), independent of attendance status.

**US-23 (Admin):** As Admin, I see a lead-status waterfall on the dashboard so I can read the pipeline at a glance.
- AC-1: Horizontal bar chart, one bar per stage (New → Contacted → Follow-up → Proposal → Won), showing lead count per stage for the selected date range.
- AC-2: Lost/Invalid shown as a separate drop-off callout, not inline in the main sequential flow (a lead can exit from any stage).
- AC-3: Scoped to the same date-range selector as the rest of the dashboard (US-20).

**US-24 (Admin & BDM):** As a user opening a lead, I see a visual stage tracker (stepper) so I instantly know where the lead stands in the pipeline.
- AC-1: Stepper shows all forward stages (New → Contacted → Follow-up → Proposal → Won) with passed/current/upcoming states, sourced from `leads.status` (current) and `lead_status_history` (passed stages + timestamps, shown on hover/tap).
- AC-2: If the lead is Lost or Invalid, the stepper shows the drop-off point with a distinct marker instead of continuing the normal sequence.
- AC-3: Shared component (`src/shared/components/ProcessFlowBar` — see DESIGN.md §2.4), used identically in Admin Lead Detail (A-04) and BDM Lead Detail (B-06).
- AC-4: Admin can click a stepper stage to jump/correct status directly. BDM can advance forward or branch to Lost/Invalid from it, but does not get an arbitrary free-jump control — forward progression + branch-off only.

---

### Epic H — Pipeline Forecasting, Deal Value & Accounts

**US-26 (Admin/BDM):** As a user, I can set an expected deal value on a lead so the pipeline reflects real ₹ forecast, not just a headcount funnel.
- AC-1: `expected_value` is editable at any stage (unlike `budget`, which is a loose pre-sale estimate — `expected_value` is the working forecast figure used in pipeline math).
- AC-2: Each pipeline stage has a default probability weight (New 10%, Contacted 20%, Follow-up 40%, Proposal 60%, Won 100%, Lost/Invalid 0%); Admin can override per-lead if a deal is unusually likely/unlikely to close.
- AC-3: Weighted pipeline value = `expected_value × probability`, summed per stage/BDM/product — shown on the dashboard (US-28).

**US-27 (BDM/Admin):** As a user, when I mark a lead Won, I record the actual deal value so conversions translate into real revenue tracking, not just a count.
- AC-1: `won_amount` is required when status → Won (mirrors the mandatory `lost_reason`/`invalid_reason` pattern on their transitions).
- AC-2: `won_amount` may differ from `expected_value` — both are kept, not overwritten, so forecast accuracy is measurable over time.

**US-28 (Admin):** As Admin, I see forecasted and won revenue on the dashboard so I know what sales to expect, not just how many leads are moving.
- AC-1: Dashboard shows: total weighted pipeline value (open leads), total won revenue (selected date range), average deal size, revenue by BDM, revenue by product/service tag.
- AC-2: Scoped to the same date-range selector as the rest of the dashboard.

**US-29 (Admin):** As Admin, I can create and view Accounts (companies) so repeat business, upsell, and resell opportunities are tracked against a company's full history, not scattered across disconnected leads.
- AC-1: An Account holds: company name, state, city, and a rollup of every lead ever raised against it (won, lost, in-progress) plus total lifetime revenue.
- AC-2: A lead can be linked to an existing Account (searchable) or spawn a new one; linking is optional at lead creation, but required before a lead can be tagged `upsell` or `resell` (AC-3).
- AC-3: `deal_type` on a lead: `new_business` (default — first contact with this company), `upsell` (selling more to an existing won account), `resell`/`renewal` (repeat purchase from an existing won account). This distinction is what "reselling and upselling" tracking actually means — it requires knowing a lead belongs to a company CKR has sold to before, which requires the Account link.
- AC-4: Account Detail screen shows the full lead history for that company as a timeline, so a BDM revisiting a past client sees prior deals before making the upsell pitch.

**US-30 (Phase 2 — schema reserved now, not computed in v1):** As Admin, I want the system to flag leads likely to close and accounts likely to upsell, using AI.
- AC-1 (Phase 2): A scoring job analyzes `lead_interactions` (frequency, type, recency), `lead_status_history` (time-in-stage/velocity), `expected_value`, `source`, and `tag_id` to compute `leads.ai_score` (0–100).
- AC-2 (v1, now): `leads.ai_score` and `leads.ai_score_updated_at` exist as nullable columns from day one so this can be added later without a schema migration; no UI surfaces them until Phase 2.

---

### Epic I — Staff Onboarding

**US-32 (Admin):** As Admin, when I create a new staff account, I can immediately see and copy the initial password so I can hand it to the new hire, since the system doesn't email/WhatsApp it automatically (notifications are in-app only, per §3 Locked Decisions).
- AC-1: On successful staff creation (A-09), a confirmation view shows the `employee_id` and the initial password once, with a copy-to-clipboard control.
- AC-2: The plaintext password is never retrievable again after this screen closes — only a reset flow (US-33) can issue a new one.
- AC-3: `force_password_reset = true` is set automatically on creation.

**US-33 (Admin):** As Admin, I can reset a staff member's password (e.g. they forgot it, or onboarding credentials were lost before handoff) so they aren't permanently locked out — since there's no self-service "forgot password" email flow in v1.
- AC-1: Admin action on Staff Detail (A-08/A-09) generates a new temporary password, shown once with copy control (same pattern as US-32), and sets `force_password_reset = true` again.

**US-34 (BDM):** As a new BDM, after my forced first-login password change, I see a brief welcome walkthrough so I understand the app before I'm dropped into an empty dashboard.
- AC-1: Shown exactly once, immediately after the first successful password change — never again on subsequent logins (tracked via a `has_seen_onboarding` flag on `users`, or equivalent).
- AC-2: Max 3 slides, skippable, introducing: My Leads (where assigned leads appear), Attendance (daily punch), Notifications (how they'll be told about assignments/follow-ups) — per the house onboarding pattern (DESIGN.md §9).
- AC-3: Ends by landing on the Dashboard (B-02), which may legitimately show zero leads/activity for a brand-new BDM — this is expected, not an error state, until Admin assigns their first lead.

**Explicit v1 limitation (not a bug):** a newly created BDM starts with **zero assigned leads** — there is no automatic starter-lead assignment. Admin must manually assign leads after onboarding. Documented here so it isn't mistaken for a defect during UAT.

---

## 6. Non-Functional Requirements

- **Auth:** JWT access + refresh, bcrypt password hashing, rate-limited login endpoint.
- **Data isolation:** Own Postgres schema (`crm`) + own DB role on the shared Tier-1 VPS instance, per house standard.
- **Responsiveness:** BDM app must be usable on a mobile viewport (~360–420px) for all core flows (attendance punch, lead list, lead detail, follow-up log, BRD upload).
- **File storage:** self-hosted on the CKR VPS (no third-party object storage) — files live under a `.env`-configured directory (`FILES_DIR`), outside the Nginx webroot; every file access goes through an authenticated Express route, never a public URL.
- **Backups:** Nightly `pg_dump -n crm`, 30-day retention (same as client-project standard, applied here too since this holds real business data).

---

## 7. Out of Scope (v1) — Reserved for Phase 2

- WhatsApp/email notifications
- Payroll/compensation/HR module
- Leave request/approval workflow
- Manager/team-lead role tier
- Geo/IP-fenced attendance
- Client-facing anything (this is 100% internal)
- Actual AI lead-scoring computation (schema reserved now — see US-30)
- BDM-facing peer leaderboard/ranking — BDM sees own performance only in v1 (US-31); ranking visibility (public, private-rank-only, or none) is a deliberate call deferred to Phase 2
- Invoicing/AMC revenue recognition (deal value/forecasting itself is core v1 — see Epic H)
- **Reserved Admin sidebar categories (nav slots shown, screens not built in v1):**
  - **Finance** — invoicing, payment tracking, BDM incentive/commission, expense tracking
  - **Marketing** — campaign tracking, ad spend, marketing-sourced lead analytics
  - **Projects** — post-conversion (Won) hand-off into project delivery tracking, eventually linking to `ckr-mobile-project-process` docs per client project
  - **Renewals** — AMC/subscription renewal tracking for ongoing clients
- **Automated marketing lead capture (Phase 2):**
  - **Meta Lead Ads:** leads submitted via Facebook/Instagram instant-form ads captured automatically into `leads` via Meta Graph API webhook (`leadgen` field) — server receives `leadgen_id`, fetches full lead payload, auto-creates a lead tagged with `source = 'meta_lead_ads'` and the originating `campaign_id`/`form_id`.
  - **WhatsApp Ads (Click-to-WhatsApp):** leads generated by a user messaging in after clicking a WhatsApp ad, captured via WhatsApp Business Cloud API webhook, using the `referral` payload (ad/campaign reference) to auto-create a lead tagged `source = 'whatsapp_ads'`.
  - Both plug into the same internal "create lead" service already used by manual add and CSV upload — new entry points only, no change to core lead pipeline.
  - Requires: Meta Business/Developer app + Page access token (Lead Ads); WhatsApp Business Cloud API number + webhook verification (WhatsApp Ads). Not built in v1.

---

## Sign-off

| Name | Role | Date |
|---|---|---|
| Chandan Mallik | Co-Founder & CTO, CKR Technologies | 22 Sep 2026 |

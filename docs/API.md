# API.md — CKR Internal CRM

**Version:** v1.0
**Base URL:** `https://connect.ckrtechnologies.in/api`
**Auth:** Bearer JWT (access token) on every route except `/auth/login`. Role enforced server-side per route (`admin` / `bdm` / `any`).
**Response shape (standard):** `{ success: boolean, data?: T, error?: { code: string, message: string } }`
**Companion docs:** PRD.md v1.0, SCREEN-MAP.md v1.0, SCHEMA.md v1.0

---

## Domain: `bootstrap`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/bootstrap` | admin, bdm | **one call, right after login**, returning every reference/lookup list used across multiple screens: `tags` (active only), `bdm_list` (admin only — lightweight id+name), `holidays` (current year). Cached client-side for the whole session (RTK Query, long `keepUnusedDataFor`, invalidated only when the relevant master actually changes — e.g. a tag is added/deactivated). | app shell (all) |

**Why this exists:** without it, Lead List (A-03/B-05) filters, Lead Detail's edit form (A-04/B-06), Quick Create Lead (A-05), Assign (A-07), and Daily Report (A-16) would each independently call `GET /tags` and `GET /users/bdm-list` on their own mount — five-plus redundant calls for data that barely ever changes in a session. `/bootstrap` is fetched once at login; every screen above reads from the shared RTK Query cache instead of issuing its own request. A screen only bypasses the cache if its `tags`/`bdm_list` copy is invalidated (e.g. Admin edits Masters mid-session), which RTK Query's tag-invalidation handles automatically.

---

## Domain: `auth`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| POST | `/auth/login` | any | email + password → access + refresh JWT | A-01, B-01 |
| POST | `/auth/refresh` | any | refresh token → new access token | — |
| POST | `/auth/logout` | any | invalidate refresh token | — |
| POST | `/auth/change-password` | any | forced on `force_password_reset = true`, or voluntary | — |
| PATCH | `/auth/onboarding-seen` | bdm | sets `has_seen_onboarding = true`; called once the welcome walkthrough is dismissed/completed | B-10 |

---

## Domain: `leads`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/leads` | admin | list/filter/search leads (query: status, tags, assigned_to, source, state, city, date_from, date_to, search, page, limit) | A-03 |
| GET | `/leads/mine` | bdm | list own assigned leads only — server-scoped to `req.user.id`, same filters as above minus `assigned_to` | B-05 |
| GET | `/leads/:id?include=interactions,status_history,assignment_history,account` | admin, bdm (own only) | **consolidated** lead detail call — returns the lead, BPF/stepper state, and every related panel Lead Detail needs (interaction timeline, status history, assignment history, linked account summary) in one response. Replaces what would otherwise be 3-4 separate round-trips per page load. Omit an `include` value to skip that section if a future lighter view needs it. | A-04, B-06 |
| POST | `/leads` | admin | create a single lead | A-05 |
| POST | `/leads/bulk-upload` | admin | upload CSV, returns validation preview (no commit) | A-06 |
| POST | `/leads/bulk-upload/commit` | admin | commit a previously validated upload batch | A-06 |
| POST | `/leads/bulk-delete` | admin | permanently delete multiple leads and their related history | A-03 |
| PATCH | `/leads/:id` | admin, bdm (own only) | update lead fields | A-04, B-06 |
| PATCH | `/leads/:id/status` | admin, bdm (own only) | change status; `lost_reason` required if → lost, `invalid_reason` required if → invalid; writes `lead_status_history` | A-04, B-06 (US-09, US-25) |
| POST | `/leads/:id/assign` | admin | assign/reassign to a BDM; writes `lead_assignment_history`, fires notification | A-07 |
| POST | `/leads/assign-bulk` | admin | assign/reassign multiple lead ids to one BDM in one call | A-07 |
| POST | `/leads/:id/brd` | admin, bdm (own only) | multipart upload, saved to disk under `FILES_DIR/brd/<lead_id>/`; returns the stored path, which `leads.brd_url` references | A-05/A-04, B-08 |
| GET | `/leads/:id/brd/download` | admin, bdm (own only) | authenticated download — checks the requester owns/can-access this lead, then streams the file from disk (never a direct/public file URL) | A-04, B-06 |
| GET | `/leads/export` | admin | CSV export of leads matching current filters | A-15 |

---

## Domain: `accounts`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/accounts` | admin | list/search accounts (query: search, state, city) | A-17 |
| GET | `/accounts/:id` | admin | account detail + lead history timeline + lifetime revenue rollup (computed, not stored) | A-18 |
| POST | `/accounts` | admin | create an account (or implicitly via `POST /leads` with a new company name — TBD dedup UX) | A-17, A-05 |
| PATCH | `/accounts/:id` | admin | edit account fields | A-18 |

**Note on `leads` pipeline fields** (`expected_value`, `probability_override`, `won_amount`, `deal_type`, `account_id`) — these are fields on the existing `leads` endpoints (`POST /leads`, `PATCH /leads/:id`, `PATCH /leads/:id/status`), not a separate domain. `PATCH /leads/:id/status` rejects (400) a transition to `won` without `won_amount`, same pattern as `lost_reason`/`invalid_reason`.

---

## Domain: `interactions`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/interactions` | admin, bdm (own only) | list and filter interaction history across leads or for a specific lead | A-16, A-04, B-06 |
| POST | `/interactions` | admin, bdm (own only) | log a follow-up; server updates `last_followup_date`, `followup_count`, `next_followup_date` on the lead | B-07 |
| GET | `/interactions/daily-summary` | admin | cross-BDM interaction rollup (query: date or date_from/date_to, bdm_id) + 0-activity flags | A-16 |
| GET | `/interactions/export-csv` | admin | CSV export of interactions ledger | A-16 |

---

## Domain: `tags` (Masters)

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/tags` | admin | full tag list for Masters management (CRUD screen itself) — **not** what other screens use for dropdowns; they read from the `/bootstrap` cache instead | A-10 |
| POST | `/tags` | admin | create a tag | A-10 |
| PATCH | `/tags/:id` | admin | edit/deactivate a tag | A-10 |

---

## Domain: `users` (Staff)

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/users` | admin | list staff (query: role, status) | A-08 |
| GET | `/users/:id` | admin | staff detail | A-08 |
| POST | `/users` | admin | create staff account (employee_id, initial password, sets `force_password_reset = true`) — response includes the plaintext password **once**, shown on A-09's confirmation view; never retrievable again after | A-09 |
| POST | `/users/:id/reset-password` | admin | generate a new temporary password, sets `force_password_reset = true` again — response includes the plaintext password once, same pattern as creation | A-08/A-09 |
| PATCH | `/users/:id` | admin | edit staff fields | A-09 |
| PATCH | `/users/:id/status` | admin | suspend / reactivate / mark resigned (`status`, `is_active`) | A-08, A-09 |
| GET | `/users/bdm-list` | admin | lightweight BDM list — this is the data `bootstrap.bdm_list` is sourced from server-side; the Assign panel (A-07) and every other screen needing a BDM dropdown read the `/bootstrap` cache, not this endpoint directly. Exists as its own route mainly so `/bootstrap`'s service layer has something to call, and for any future screen needing a fresh/uncached read. | A-07 |

---

## Domain: `attendance`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| POST | `/attendance/punch-in` | bdm | check-in for today (idempotent — no-op if already punched) | B-03 |
| POST | `/attendance/punch-out` | bdm | check-out for today | B-03 |
| GET | `/attendance/mine` | bdm | own attendance history (query: month) | B-04 |
| GET | `/attendance/matrix` | admin | BDMs × dates matrix for a month, merged with `holidays` | A-11 |
| PATCH | `/attendance/:id` | admin | manually correct a punch; sets `edited_by`/`edited_at` | A-12 |

---

## Domain: `holidays`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/holidays` | admin, bdm | list holidays (query: year) | A-13, B-04 |
| POST | `/holidays` | admin | add a holiday | A-13 |
| DELETE | `/holidays/:id` | admin | remove a holiday | A-13 |

---

## Domain: `notifications`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/notifications` | admin, bdm | own notification list (unread first) | A-14, B-09 |
| PATCH | `/notifications/:id/read` | admin, bdm | mark one as read | A-14, B-09 |
| PATCH | `/notifications/read-all` | admin, bdm | mark all as read | A-14, B-09 |
| WS | `socket.io` event `notification:new` | admin, bdm | live push on new notification | both apps |

---

## Domain: `dashboard`

| Method | Path | Role | Purpose | Screen |
|---|---|---|---|---|
| GET | `/dashboard/admin` | admin | funnel counts, waterfall data, leaderboard, attendance summary, overdue-followup count, weighted pipeline value, won revenue, avg deal size, revenue by BDM/tag (query: date_from, date_to) | A-02 |
| GET | `/dashboard/bdm` | bdm | own funnel, follow-ups due, conversion rate, attendance summary, revenue won, avg deal size, weighted pipeline value, new-business vs upsell/resell split, interactions logged, avg time-to-close, trend series (query: date_from, date_to, trend_interval=week\|month). Never includes any other BDM's data — no ranking/comparison fields. | B-02 |

---

## Cron / Jobs (BullMQ + system-cron, no external endpoint — internal only)

| Job | Schedule | Purpose |
|---|---|---|
| `followup-reminder` | Daily, 09:00 IST | Queries leads where `next_followup_date <= today` and status not terminal; creates `notifications` rows (deduplicated per lead per day) — see US-19 |

---

## Auth & scoping rules (apply to every route above)

- Every `bdm`-accessible route that touches `leads`, `lead_interactions`, or `attendance` is filtered server-side by `assigned_to = req.user.id` (leads) or `bdm_id = req.user.id` (interactions/attendance) — **never** trusted from a client-supplied `assigned_to`/`bdm_id` query param.
- `admin`-only routes reject a `bdm` JWT with `403`, not a silently filtered response.
- All mutating routes validate input with `zod` before touching the database (per house AGENTS.md rule).

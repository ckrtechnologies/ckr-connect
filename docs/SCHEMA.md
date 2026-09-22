# SCHEMA.md — CKR Internal CRM

**Version:** v1.0
**Date:** 22 Sep 2026
**Schema name:** `connect` (Tier 1 hosting — shared Postgres on CKR VPS, own schema + own DB role, no RLS/Supabase Auth; isolation via Postgres grants)
**Companion docs:** PRD.md v1.0, SCREEN-MAP.md v1.0

---

## 1. `users`

Staff accounts — both Admin and BDM.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| employee_id | text, unique | auto-generated (e.g. `CKR-BDM-001`) or admin-entered |
| name | text | |
| email | text, unique | |
| phone | text | |
| password_hash | text | bcrypt |
| role | enum('admin','bdm') | |
| designation | text | nullable |
| department | text | nullable |
| date_of_joining | date | nullable |
| profile_photo_url | text | nullable, file path under `FILES_DIR` on the CKR VPS |
| status | enum('active','suspended','resigned') | staff lifecycle |
| is_active | boolean | default true — login gate; kept alongside `status` for a fast login check |
| force_password_reset | boolean | default true — set on staff creation, cleared after first password change; re-set to true on an Admin-triggered password reset (US-33) |
| has_seen_onboarding | boolean | default false — flips to true after the BDM completes the first-login welcome walkthrough (US-34); never shown again once true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## 2. `tags` (Product/Service master)

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | e.g. "School Management ERP" |
| type | enum('product','service') | |
| is_active | boolean | default true |
| created_at | timestamptz | |

---

## 3. `accounts`

Represents a company CKR has sold or is selling to — enables upsell/resell tracking and per-company revenue rollup. Not a client of the ckr-mobile-project-process delivery pipeline; purely a CRM-side concept for this lead-tracking tool.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | company name |
| state | text | nullable |
| city | text | nullable |
| created_by | uuid, FK → users.id | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Rollups (computed, not stored):** total leads, won leads, lifetime revenue (`SUM(leads.won_amount) WHERE account_id = accounts.id AND status = 'won'`) — served via a query on Account Detail (A-17), not persisted columns, so they never go stale.

---

## 4. `leads`

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | contact person |
| company_name | text | nullable — free-text convenience copy; the authoritative link is `account_id` below |
| account_id | uuid, FK → accounts.id | nullable — links this lead to a company's full history; required before `deal_type` can be 'upsell' or 'resell' |
| phone | text | |
| email | text | nullable |
| city | text | nullable |
| state | text | nullable — Indian state/UT, primarily used for School ERP leads |
| source | enum('website','referral','cold_call','social_media','walk_in','meta_lead_ads','whatsapp_ads','other') | `meta_lead_ads`/`whatsapp_ads` reserved for Phase 2 |
| campaign_ref | text | nullable — Meta/WhatsApp ad or form/campaign id (Phase 2) |
| tag_id | uuid, FK → tags.id | |
| sub_requirement | text | nullable |
| deal_type | enum('new_business','upsell','resell') | default 'new_business' — requires `account_id` set for 'upsell'/'resell' |
| assigned_to | uuid, FK → users.id | nullable (unassigned pool) |
| status | enum('new','contacted','follow_up','proposal','won','lost','invalid') | default 'new' |
| priority | enum('high','medium','low') | nullable |
| budget | numeric | nullable — loose pre-sale estimate, distinct from `expected_value` |
| expected_value | numeric | nullable — working forecast figure, editable at any stage |
| probability_override | integer | nullable, 0–100 — overrides the stage-default probability (New 10 / Contacted 20 / Follow-up 40 / Proposal 60 / Won 100 / Lost,Invalid 0) for weighted-pipeline math |
| won_amount | numeric | nullable — required when status → 'won'; the actual closed deal value, kept separate from `expected_value` |
| next_followup_date | date | nullable |
| last_followup_date | date | auto — updated from `lead_interactions` |
| followup_count | integer | auto — counted from `lead_interactions` |
| brd_url | text | nullable, file path under `FILES_DIR` on the CKR VPS (served only via the authenticated `/leads/:id/brd/download` route) |
| lost_reason | text | nullable — required when status → 'lost' |
| invalid_reason | enum('wrong_number','duplicate','not_interested','spam','out_of_service_area','other') | nullable — required when status → 'invalid'; kept separate from `lost_reason` so bad-data noise doesn't distort lost-reason analytics |
| ai_score | integer | nullable, 0–100 — reserved for Phase 2 AI lead-scoring job; no UI surfaces this in v1 |
| ai_score_updated_at | timestamptz | nullable — reserved for Phase 2 |
| created_by | uuid, FK → users.id | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## 5. `lead_interactions`

Follow-up/interaction history — one lead has many.

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lead_id | uuid, FK → leads.id | |
| bdm_id | uuid, FK → users.id | who logged it |
| type | enum('call','whatsapp','email','meeting','site_visit') | |
| notes | text | |
| status_snapshot | text | lead status at time of log |
| next_action | text | nullable |
| created_at | timestamptz | |

---

## 6. `lead_assignment_history`

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lead_id | uuid, FK → leads.id | |
| assigned_from | uuid, FK → users.id | nullable (first assignment) |
| assigned_to | uuid, FK → users.id | |
| assigned_by | uuid, FK → users.id | admin who did it |
| assigned_at | timestamptz | |

---

## 7. `lead_status_history`

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| lead_id | uuid, FK → leads.id | |
| old_status | text | nullable |
| new_status | text | |
| changed_by | uuid, FK → users.id | |
| changed_at | timestamptz | |

---

## 8. `attendance`

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| bdm_id | uuid, FK → users.id | |
| date | date | |
| check_in_time | timestamptz | nullable |
| check_out_time | timestamptz | nullable |
| status | enum('present','absent','half_day','leave') | `holiday` is never stored here — derived at read-time from `holidays` |
| edited_by | uuid, FK → users.id | nullable — set when Admin manually corrects a punch |
| edited_at | timestamptz | nullable |
| created_at | timestamptz | |

Unique constraint: `(bdm_id, date)`.

---

## 9. `holidays`

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| date | date, unique | |
| name | text | e.g. "Diwali", "Republic Day" |
| created_by | uuid, FK → users.id | |
| created_at | timestamptz | |

**Read-time logic:** for any (BDM, date) with no `attendance` row — if `date` exists in `holidays`, status = `holiday`; otherwise status = `absent`. A BDM who punches in on a holiday still gets a normal `attendance` row.

---

## 10. `notifications`

| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → users.id | recipient |
| lead_id | uuid, FK → leads.id | nullable |
| type | enum('followup_due','followup_overdue','lead_assigned','other') | |
| message | text | |
| is_read | boolean | default false |
| created_at | timestamptz | |

Delivered via `socket.io` live push if connected; otherwise read on next login. Cron-generated `followup_due`/`followup_overdue` notifications are deduplicated per lead per day (no repeat spam within the same day).

---

## Relations summary

- `users` 1—N `leads` (assigned_to, created_by)
- `users` 1—N `accounts` (created_by)
- `accounts` 1—N `leads` — repeat business, upsell, resell all traced through this link
- `leads` N—1 `tags`
- `leads` 1—N `lead_interactions`
- `leads` 1—N `lead_assignment_history`
- `leads` 1—N `lead_status_history`
- `users` 1—N `attendance`
- `users` 1—N `lead_interactions` (bdm_id)
- `users` 1—N `notifications`
- `leads` 1—N `notifications` (nullable)

---

## Indexes (required in the first migration — not an afterthought)

Per `AGENTS.md` §9's database-load rules, these are written into the initial schema migration, not added later:

```sql
CREATE INDEX idx_leads_assigned_to ON crm.leads (assigned_to);
CREATE INDEX idx_leads_status ON crm.leads (status);
CREATE INDEX idx_leads_tag_id ON crm.leads (tag_id);
CREATE INDEX idx_leads_account_id ON crm.leads (account_id);
CREATE INDEX idx_leads_next_followup_date ON crm.leads (next_followup_date);
CREATE INDEX idx_leads_created_at ON crm.leads (created_at);
CREATE INDEX idx_lead_interactions_lead_id ON crm.lead_interactions (lead_id);
CREATE INDEX idx_lead_interactions_bdm_created ON crm.lead_interactions (bdm_id, created_at);
CREATE INDEX idx_lead_status_history_lead_id ON crm.lead_status_history (lead_id);
CREATE INDEX idx_lead_assignment_history_lead_id ON crm.lead_assignment_history (lead_id);
CREATE INDEX idx_notifications_user_unread ON crm.notifications (user_id, is_read);
CREATE INDEX idx_accounts_name ON crm.accounts (name);
-- attendance(bdm_id, date) is already covered by its UNIQUE constraint (§8), which Postgres backs with an index automatically.
```

---

## Isolation & access (Tier 1 pattern)

- Schema `crm` + DB role `crm_user`, provisioned via `new-client.sh` pattern (adapted for an internal project, not per-client).
- Express connects via `DATABASE_URL` using `crm_user`; no `service_role`, no RLS, no `supabase.from()`.
- Every mutating query is scoped server-side by `req.user.role` / `req.user.id` — a BDM's queries are always additionally filtered `WHERE assigned_to = req.user.id` at the repository layer, never trusted from client-supplied filters.

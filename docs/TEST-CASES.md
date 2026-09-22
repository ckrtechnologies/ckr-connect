# TEST-CASES.md — CKR Internal CRM

**Version:** v1.0
**Scope:** P0 (blocking) and P1 (important) cases only, generated from PRD.md v1.0 acceptance criteria. Exhaustive per-field checks live in dev code review, not here.
**Sign-off:** internal UAT by Chandan Mallik before production rollout.

Priority definitions: **P0** = breaks core workflow or data integrity if wrong. **P1** = degrades experience/analytics but has a workaround.

---

## Staff Onboarding

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-80 | P0 | Admin creates a new staff account | One-time confirmation shows `employee_id` + initial password with a copy button; `force_password_reset = true` set | US-32 |
| TC-81 | P0 | Admin re-opens the staff record after creation | Plaintext password is not shown/retrievable anywhere — only a "Reset password" action is available | US-32 |
| TC-82 | P0 | Admin resets an existing staff member's password | New password shown once, same pattern as creation; `force_password_reset = true` set again | US-33 |
| TC-83 | P0 | New BDM logs in for the first time, changes password | Immediately sees the 3-slide welcome walkthrough, not the dashboard directly | US-34 |
| TC-84 | P0 | Same BDM logs out and back in | Welcome walkthrough does NOT show again (`has_seen_onboarding = true`) | US-34 |
| TC-85 | P1 | A brand-new BDM (zero assigned leads) views My Leads and Dashboard | Shows a normal Empty state, not an error | US-34 |

---

## Auth

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-01 | P0 | Log in with correct email/password (Admin) | JWT issued, redirected to Admin Dashboard | US-01 |
| TC-02 | P0 | Log in with correct email/password (BDM) | JWT issued, redirected to BDM Dashboard | US-01 |
| TC-03 | P0 | Log in with wrong password | Generic "invalid email or password" error, no account-existence hint | US-01 |
| TC-04 | P0 | Log in as a suspended (`is_active = false`) staff account | Login rejected even with correct credentials | US-01 |
| TC-05 | P0 | BDM attempts to call an admin-only API route directly (e.g. `/users`) with a valid BDM JWT | 403 rejected, not silently filtered | US-01 |
| TC-06 | P1 | New staff logs in for the first time | Forced to change password before reaching dashboard | (staff mgmt) |

---

## Lead Management — Admin

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-10 | P0 | Create a lead with only required fields (name, phone, source, tag) | Lead created, status = New, appears in Lead List | US-02 |
| TC-11 | P0 | Upload a CSV with a mix of valid and invalid rows | Preview shows counts; invalid rows listed with reasons; only valid rows insert on commit | US-03 |
| TC-12 | P0 | Upload a CSV containing a phone number already in the system | Duplicate flagged; admin prompted skip/merge/create-anyway, not silently duplicated | US-03 |
| TC-13 | P0 | Assign a single lead to a BDM | `assigned_to` updated, `lead_assignment_history` row created, BDM notified | US-04 |
| TC-14 | P0 | Multi-select 5 leads and bulk-assign to one BDM | All 5 reassigned in one action, one history row per lead | US-04 |
| TC-15 | P0 | Reassign a lead from BDM A to BDM B | BDM A loses visibility immediately; BDM B gains it and is notified | US-05 |
| TC-16 | P1 | Filter Lead List by status + tag + state combined | Results match AND logic across all active filters | US-06 |
| TC-17 | P1 | Deactivate a tag | Tag no longer selectable on new leads; existing leads keep the tag label | US-07 |

---

## Lead Management — BDM

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-20 | P0 | BDM opens "My Leads" | Only leads with `assigned_to = self` are shown — verified server-side, not just UI filter | US-08 |
| TC-21 | P0 | BDM changes a lead's status to a valid next stage | Status updates, `lead_status_history` row written, stepper reflects new stage | US-09 |
| TC-22 | P0 | BDM attempts to mark a lead "Lost" without entering a reason | Blocked — `lost_reason` mandatory on this transition | US-09 |
| TC-23 | P0 | BDM logs a follow-up interaction with a next-followup date | Interaction saved; `leads.last_followup_date`, `followup_count`, and `next_followup_date` all update correctly | US-10 |
| TC-24 | P0 | BDM uploads a BRD (valid PDF, under size limit) | File saved to disk under `FILES_DIR`; `brd_url` updated | US-11 |
| TC-24b | P0 | A BDM not assigned to a lead attempts `GET /leads/:id/brd/download` for that lead's BRD, using a valid JWT | Rejected (403/404) — download route enforces the same ownership check as every other BDM-scoped route, not just the upload | US-11 |
| TC-25 | P1 | BDM uploads a file exceeding the size limit or wrong type | Upload rejected with a clear error, no partial upload | US-11 |
| TC-26 | P1 | BDM views "My Leads" with one lead overdue and one due today | Both visually flagged distinctly from leads not yet due | US-12 |

---

## Invalid Leads

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-30 | P0 | Mark a lead "Invalid" without selecting a reason | Blocked — `invalid_reason` mandatory | US-25 |
| TC-31 | P0 | Mark a lead "Invalid" with reason "Duplicate" | Status = invalid, `invalid_reason` saved separately from `lost_reason`; lead drops out of overdue/follow-up queues and the main pipeline funnel | US-25 |
| TC-32 | P1 | Run lost-reason analytics after marking several leads Invalid | Invalid leads do not appear in the Lost-reason breakdown | US-25 |

---

## Pipeline, Deal Value & Accounts

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-35 | P0 | Attempt to mark a lead "Won" without entering `won_amount` | Blocked — `won_amount` mandatory on this transition | US-27 |
| TC-36 | P0 | Set `expected_value` on a lead in "Negotiation" stage | Weighted pipeline value on dashboard updates by `expected_value × 60%` (stage default) | US-26 |
| TC-37 | P1 | Admin overrides probability on a specific lead | Weighted pipeline calculation uses the override, not the stage default | US-26 |
| TC-38 | P0 | Link a lead to an existing Account, then set `deal_type = upsell` | Allowed — account_id present. | US-29 |
| TC-39 | P0 | Attempt to set `deal_type = upsell` on a lead with no linked account | Blocked — `account_id` required for upsell/resell | US-29 |
| TC-33 | P1 | Open Account Detail for a company with 2 prior won leads and 1 in-progress | Lead history timeline shows all 3; lifetime revenue = sum of the 2 won `won_amount`s | US-29 |

---

## Attendance

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-40 | P0 | BDM punches check-in, then check-out same day | One `attendance` row created and updated; correct times recorded | US-13 |
| TC-41 | P0 | BDM attempts to punch check-in twice same day | Second attempt is a no-op / button disabled, no duplicate row (unique constraint on `bdm_id, date` respected) | US-13 |
| TC-42 | P0 | Admin manually edits a BDM's attendance for a past date | Row updates, `edited_by`/`edited_at` set — not a silent overwrite | US-14 |
| TC-43 | P0 | Admin marks a date as a holiday; a BDM does not punch in that day | Matrix/report shows "Holiday" for that BDM on that date, not "Absent" | US-15 |
| TC-44 | P1 | A BDM punches in on a marked holiday | Normal attendance row created as usual (optional working day) | US-15 |
| TC-45 | P0 | Admin opens Attendance Matrix for a month with a mix of present/absent/leave/holiday days | Correct color per cell (green/red/amber/blue/grey) matching each derived status | US-16 |
| TC-46 | P1 | BDM views own attendance history for the current month | Correct present/absent/leave/holiday counts shown | US-17 |

---

## Notifications

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-50 | P0 | Admin assigns a lead to a BDM who is currently logged in | BDM receives a live notification via socket.io without refreshing | US-18 |
| TC-51 | P1 | A lead's `next_followup_date` is today; cron runs | Exactly one notification created for the assigned BDM (not duplicated if cron re-runs same day) | US-19 |
| TC-52 | P1 | BDM clicks a notification | Marked read, deep-links to the correct lead | US-18 |

---

## Dashboards & Reports

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-60 | P1 | Admin views dashboard for current month | Funnel, waterfall, leaderboard, attendance summary, and overdue-followup count all match underlying data | US-20, US-23 |
| TC-61 | P1 | BDM views own dashboard | All metrics scoped to self only | US-21 |
| TC-65 | P0 | BDM opens "My Performance" tab | Shows revenue won, avg deal size, weighted pipeline, new-business/upsell split, interactions logged, avg time-to-close, trend chart — all for self only, no ranking or other-BDM figures present anywhere in the response | US-31 |
| TC-62 | P1 | Admin opens Daily Interaction Report for a date with no logged interactions from one BDM | That BDM shows a 0-activity flag | US-22 |
| TC-63 | P1 | Open Lead Detail for a lead that has passed through New → Contacted → Follow-up | Stepper shows those 3 stages as passed, current stage highlighted, remaining stages upcoming | US-24 |
| TC-64 | P1 | Open Lead Detail for a lead marked Lost mid-pipeline | Stepper shows the drop-off marker at the stage it exited from, not a continued sequence | US-24 |

---

## Cross-cutting

| TC ID | Priority | Steps | Expected Result | Story |
|---|---|---|---|---|
| TC-70 | P0 | Any drawer (Add Lead, Assign, Log Follow-up, etc.) is opened on Admin (desktop) | Slides in from left, auto-fit width, full viewport height, no centered modal | DESIGN.md §2.3 |
| TC-71 | P0 | Any drawer is opened on BDM (mobile viewport) | Takes full screen | DESIGN.md §2.3 |
| TC-72 | P1 | Double-click/tap a submit button rapidly on any create/update form | Only one request fires; button disabled after first click | AGENTS.md |
| TC-73 | P1 | In one session, open Lead List filters, then Quick Create Lead, then Assign — all three use the Tags/BDM dropdowns | Only one `/bootstrap` call fires (on login); none of the three screens issues its own `/tags` or `/users/bdm-list` request | AGENTS.md §9 |
| TC-74 | P1 | Admin adds a new tag in Masters (A-10), then opens Quick Create Lead | New tag appears in the dropdown — the bootstrap cache's `tags` slice was invalidated and refetched, not silently stale | AGENTS.md §9 |

---

## Sign-off

| Name | Role | Date |
|---|---|---|
| Chandan Mallik | Co-Founder & CTO, CKR Technologies | |

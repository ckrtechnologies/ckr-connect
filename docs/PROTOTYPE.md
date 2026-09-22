# PROTOTYPE.md — CKR Internal CRM

> Hand this file to Antigravity along with `PRD.md`, `SCREEN-MAP.md`, and `DESIGN.md` (all in the same folder). Build a single clickable HTML prototype covering both apps — no backend, no real data persistence, static/mock data only.

---

## 1. What to build

One self-contained HTML file (or a small static site — index.html + a JS router, no build step required) implementing the **prototype shell** per house standard, adapted for this internal, no-client-intake project:

- **Left bar** — platform switcher: **Admin Panel** / **BDM App** (from SCREEN-MAP.md's two apps).
- **Top bar** — "CKR Internal CRM", current screen title + its S-ID (e.g. "Lead Detail · A-04"), and **version + date** ("Prototype v0.1 · 22 Sep 2026").
- **Centre canvas** — Admin renders **full-width** (desktop chrome); BDM renders inside a **phone frame at ~390×844**.

**No intake form for this project** (internal tool, no client) — skip Section 3–5 of the house prototype-and-intake process entirely. Tokens come directly from `DESIGN.md` §1, not a derived `tokens.json`.

---

## 2. Source of truth — read these first, in this order

1. `DESIGN.md` — **all** styling. Generate `tokens.css` from DESIGN.md §1 exactly (Fluent 2 palette: `primary #0067B8`, background `#FAF9F8`, Segoe UI Variable typography, `sm/md/lg` radius scale, Fluent shadow levels). No colors, spacing, or fonts invented outside this file.
2. `SCREEN-MAP.md` — **every** screen listed (A-01 through A-18, B-01 through B-09) must exist in the prototype, labelled with its S-ID. Do not add or skip a screen.
3. `PRD.md` — for what each screen's data/behavior should represent (field names, statuses, required-reason transitions) so the mock data and clickable flows are realistic, not arbitrary.

---

## 3. Fluent/Dynamics visual patterns to actually implement in the prototype

Since the whole point of this prototype is to validate the Dynamics-style direction before real build, these must be **visibly present and clickable**, not just described:

- **Command bar** (Admin, top of every grid/form) — contextual buttons that appear/disappear based on grid row selection (e.g. checking a lead row reveals "Assign" and "Delete" buttons).
- **Site map** (Admin, left nav) — collapsible, with the reserved Finance/Marketing/Projects/Renewals items visible but greyed out with a "Coming soon" tag (non-clickable).
- **Business Process Flow bar** — on Lead Detail (A-04, B-06), a horizontal chevron stepper (New → Contacted → Follow-up → Proposal → Won) with a working "advance stage" click that visibly moves the highlight, and a Lost/Invalid branch-off state reachable from any stage.
- **Dense entity grid** — Lead List (A-03), Staff List (A-08): 40px row height, checkbox column, sortable headers, hairline row dividers (no zebra striping).
- **Quick Create panel** — build **both** variants (left-anchored and right-anchored) behind a toggle in the prototype's top bar labelled "Panel side: Left / Right", so Chandan can compare and pick one live in the prototype rather than from a written description. This resolves the open DESIGN.md §2.7 question experientially.
- **Dashboard tiles** — waterfall chart (mock counts), leaderboard table, weighted-pipeline-value and won-revenue stat tiles.

---

## 4. Screens to include (all, per SCREEN-MAP.md)

**Admin:** A-01 Login, A-02 Dashboard, A-03 Lead List, A-04 Lead Detail, A-05 Quick Create Lead, A-06 Bulk Upload, A-07 Assign/Reassign, A-08 Staff List, A-09 Quick Create/Edit Staff, A-10 Masters, A-11 Attendance Matrix, A-12 Attendance Edit, A-13 Holiday Calendar, A-14 Notifications, A-15 Reports, A-16 Daily Interaction Report, A-17 Account List, A-18 Account Detail.

**BDM:** B-01 Login, B-02 Dashboard, B-03 Attendance Punch, B-04 Attendance History, B-05 My Leads, B-06 Lead Detail, B-07 Log Follow-up, B-08 Upload BRD, B-09 Notifications.

---

## 5. Rules (house standard, applied)

- **Clickable, not a gallery** — real navigation between screens (Login → Dashboard, Lead List row click → Lead Detail, command bar "+ New" → Quick Create panel → Save closes panel and returns to the grid with the new row visible, etc.).
- **Real-feeling mock content** — realistic Indian names/companies/phone numbers, realistic ₹ amounts, real-looking dates — never Lorem Ipsum. Anything genuinely undecided (e.g. exact Masters field list beyond Tags) shows as `[TO BE PROVIDED]`.
- **Unhappy states included** — at least one Empty state (e.g. Lead List with zero results after a filter), one Loading skeleton, and one Error/retry state somewhere in the prototype, styled per `DESIGN.md` §4.
- **One icon set only** — Fluent System Icons (or a close visual placeholder if the actual icon font isn't available in this static build — flag which).
- **Same density everywhere** — 14px body text, 40px grid rows, Fluent's tight spacing scale — consistently, not just on one sample screen.
- **Sign-off page** inside the prototype (internal version): version, date, and a simple confirmation line — "Reviewed and approved to proceed to build — Chandan Mallik, CKR Technologies" with a date field. No client approver since this is internal.
- **No backend calls** — all data is static JS objects/arrays baked into the prototype; button actions update local state only (e.g. checking a checkbox, opening a panel), nothing persists on reload.

---

## 6. Deliverable

A single folder (or one HTML file if feasible) that can be opened directly in a browser or deployed to `connect.ckrtechnologies.in/prototype` with basic access protection (simple password gate, `noindex` meta tag) — same as the house standard for client prototypes, applied here even though there's no external client, so it's safe to share internally without it being publicly indexed.

---

## 7. What happens after this

This prototype is for Chandan's own review — once approved (Section 5's sign-off), it becomes the **visual reference** for the real build: `AGENTS.md` instructs the coding agent to reference the signed prototype screen (by S-ID) alongside `DESIGN.md` and `API.md` when building each real screen, per house process. Any screen/flow change discovered here is cheap now; a change after real build starts is a change request.

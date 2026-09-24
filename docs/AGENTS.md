# AGENTS.md — CKR Internal CRM

> CKR Technologies · React + Vite (web) + Express + Postgres
> This file is the agent's rulebook — design comes from `docs/DESIGN.md`, data comes from `docs/API.md`, schema from `docs/SCHEMA.md`, behavior comes from here. Build only what's in `docs/SCREEN-MAP.md`.

---

## 1. Project Context

- **Project:** CKR Internal CRM — Admin + BDM lead/attendance management for telecalling staff
- **Owner:** Chandan Mallik, Co-Founder & CTO, CKR Technologies
- **Docs:** `docs/PRD.md`, `docs/SCREEN-MAP.md`, `docs/DESIGN.md`, `docs/API.md`, `docs/SCHEMA.md`, `docs/TEST-CASES.md`
- **Roles:** Admin, BDM
- **Phase:** Phase 1 (Admin web app) is complete. Currently working on Phase 2 (BDM Mobile-first web app).
- **Repos:** three — `admin-web/` (Done), `bdm-web/` (Active), `backend/` (Active, extending as needed)

---

## 2. Stack & Versions

- Web only — **React + Vite SPA** for both `admin-web` and `bdm-web`. No React Native, no Next.js (this isn't a public SEO site).
- Language: **Plain JavaScript (.js/.jsx)** — never TypeScript. JSDoc for type-hinting.
- Routing: `react-router-dom`.
- State/data: **Redux Toolkit** — RTK slices (client/UI state) + **RTK Query** (all server data).
- Backend: **Express.js + PostgreSQL** (`crm` schema on the CKR VPS, plain Postgres — not accessed via Supabase client libraries). Express owns auth, sockets, files, jobs.
- Files/CDN: **self-hosted on the CKR VPS** — no third-party object storage. Express writes/reads files under a directory set by `FILES_DIR` in `.env`; Nginx never serves this directory directly (it's outside the webroot) — every download goes through an authenticated Express route that checks the requester's role/ownership first, then streams the file. This keeps the "never public, always authorized" rule from the house standard without needing R2/S3.
- Do not add a new npm dependency without listing it and asking first, except libraries already named in `docs/DESIGN.md` §11.

---

## 3. Design Rules (non-negotiable)

1. Read `docs/DESIGN.md` in full before writing or modifying UI code.
2. Never use raw hex colors, literal px font sizes, or arbitrary spacing/radius. Always import from each app's `src/theme.js` (Tailwind config + CSS variables per DESIGN.md §1).
3. If a screen needs a value not in the theme, stop and propose adding it to `DESIGN.md` §1 — do not invent a one-off.
4. Every screen fetching data implements all 4 states from `DESIGN.md` §4: loading (skeleton), empty, error (retry), offline (banner).
5. **Overlay pattern — ⚠️ pending confirmation:** `DESIGN.md` was restyled to match Dynamics 365/Fluent, which uses a **right-anchored Quick Create panel** (`DESIGN.md` §2.7), replacing the originally-specified left-anchored drawer. Agents must follow whichever pattern `DESIGN.md` §2.7 currently documents — do not build both, and do not silently pick one if the doc still shows the conflict flag at its top. Full in-record edits beyond quick fields use the full Form (§2.6), not the panel. The only overlay exception is a small centered `Dialog` for destructive yes/no confirmations.
6. Only use the libraries mapped in `DESIGN.md` §11 — **Fluent UI React v9** (`@fluentui/react-components`) for all component primitives, `@fluentui/react-icons` for icons, Recharts (Fluent-themed) for charts, Framer Motion, React Hook Form + Zod. No shadcn/ui, no Tailwind, no lucide-react — these were replaced when the design moved to the Fluent/Dynamics look.
7. Reuse an existing component from `src/components/ui/` (or `src/shared/components/` for cross-domain pieces like `LeadStepper`) before creating a new one.
8. Copy/text follows `DESIGN.md` §6 (sentence case, verb+object buttons, no raw error codes), sourced from a strings file, not hardcoded inline.
9. Minimum touch target 44×44 on BDM. Keyboard-navigable, focus-trapped drawers, Esc closes.
10. Before marking a screen complete, self-check against `DESIGN.md` §10's checklist and report which boxes pass.

---

## 4. API & Data Rules

1. All network calls go through `src/api/` (one RTK Query slice per resource: `leadsApi.js`, `attendanceApi.js`, etc.). Never raw `fetch`/`axios` inside a screen/component.
2. The contract is `docs/API.md`. Do not invent an endpoint, field, or response shape not listed there — stop and ask instead of guessing.
3. All mutating requests show a loading state on the trigger control and disable it while in flight — never allow a double-submit (critical for lead creation and status changes, which write audit-trail rows).
4. **`lead_status_history`, `lead_assignment_history`, and `lead_interactions` rows are append-only** — never updated or deleted once written, only inserted. The UI never exposes an edit/delete control for a logged interaction or a history row.
5. A BDM-scoped request is **always** filtered server-side by `req.user.id` at the repository layer (per `docs/API.md`'s "Auth & scoping rules"). Never trust a client-supplied `assigned_to`/`bdm_id` filter as the sole scoping mechanism.
6. `leads.status` transitions to `lost` or `invalid` are rejected server-side (400) if `lost_reason` / `invalid_reason` is missing — this is enforced in the backend `validation.js`, not just the frontend form.
7. `leads.status` transition to `won` is rejected server-side (400) if `won_amount` is missing. `deal_type = 'upsell'` or `'resell'` is rejected if `account_id` is not set. Both enforced in `validation.js`, mirroring rule 6.
8. Weighted pipeline value (`expected_value × probability`) is always computed server-side in `dashboard/service.js` — never trust a client-computed forecast figure.

---

## 5. Code Conventions

- Plain JavaScript, JSDoc `@param`/`@returns` on shared functions and API responses.
- Naming: PascalCase components, camelCase functions/variables, kebab-case non-component file names, PascalCase component file names.
- No inline styles for token-covered values (color/spacing/type/radius); inline style objects only for one-off layout math.
- One component per file. Screens live in `src/domains/<domain>/screens/<ScreenName>/index.jsx`; shared UI in `src/shared/components/`.
- Every async call wrapped in try/catch or handled via RTK Query's error state.
- Every exported function/component gets a one-line JSDoc if its purpose isn't obvious.

---

## 6. Backend Rules

- Pattern: `routes.js → controller.js → service.js → repository.js → validation.js`, per domain folder (`leads`, `attendance`, `users`, `notifications`, `interactions`, `holidays`, `tags`, `dashboard`, `auth`). `app.js` only imports each domain's `routes.js`.
- A domain's `repository.js` is the only file touching that domain's tables.
- Every route validates input with `zod` before touching the database.
- Standard response shape: `{ success: boolean, data?: T, error?: { code: string, message: string } }`.
- **No Row-Level Security, no Supabase Auth, no `supabase.from()`, no `service_role` key** — this is Tier 1 hosting: one shared Postgres role (`crm_user`) scoped to the `crm` schema via Postgres grants; all authorization (admin vs bdm, own-records-only) is enforced in the Express service/repository layer, per request.
- Secrets: only `src/config/secrets.js` reads `process.env`; scoped named exports per domain (e.g. `auth` gets `JWT_SECRET`, `files` gets `FILES_DIR` + the download-token signing secret). ESLint `no-restricted-properties` bans `process.env` elsewhere.
- Migrations are the only way schema changes happen — never hand-edit tables via psql/Studio on the shared instance outside a migration file.
- Auth: email + password (bcrypt + JWT access/refresh), no OTP/social login for this internal tool. `force_password_reset` enforced on first login after staff creation.
- Cron: BullMQ + system-cron for the daily `followup-reminder` job (see `docs/API.md` "Cron / Jobs"). Not `pg_cron` (single-database, not used per house standard).

---

## 7. What the Agent Must Never Do

- Never commit secrets, API keys, or `.env` contents.
- Never log, store, or re-expose a staff account's plaintext password after its one-time creation/reset response (US-32/US-33) — only the bcrypt hash persists; no audit log, error log, or admin screen ever shows it again.
- Never modify an already-applied migration — write a new one.
- Never change `src/theme.js` without updating `DESIGN.md` §1 first (and flagging it).
- Never build a centered floating modal — see Design Rule 5.
- Never allow editing or deletion of `lead_status_history`, `lead_assignment_history`, or `lead_interactions` rows once written.
- Never let a lead transition to `lost`/`invalid` without its reason field, on either frontend or backend.
- Never expose one BDM's leads, interactions, or attendance to another BDM, or to a BDM-scoped API response.
- Never add WhatsApp/email notification code, HR/payroll fields, or a manager/team-lead role — explicitly out of scope for v1 (PRD §7).
- Never add a screen, field, or endpoint not present in `docs/SCREEN-MAP.md`, `docs/API.md`, or `docs/SCHEMA.md` without flagging it first.
- Never introduce Supabase Auth, RLS policies, or `supabase.from()` calls — this project uses Express-owned auth and plain Postgres access only.

---

## 9. Performance & Database Resource Rules

These apply to every screen and every migration — not optional polish, checked at code review same as the design rules.

### Frontend: minimizing server round-trips

1. **RTK Query is the only data layer** (already stated in §2) — this gives automatic request de-duping for free: if two components on the same screen ask for the same cache key, it's one network call, not two. Never bypass it with a manual `fetch`/`axios` call "just this once."
2. **Consolidate multi-panel screens into one endpoint call.** Lead Detail (A-04/B-06) is the clearest case: it needs the lead, its interaction timeline, status history, assignment history, and linked account summary — this is **one** call (`GET /leads/:id?include=...`, per `docs/API.md`), never 3-4 separate `useQuery` hooks firing on mount. Before building any screen with more than one data-dependent panel, check `docs/API.md` for a consolidated endpoint; if one doesn't exist for a genuinely multi-panel screen, stop and propose adding one rather than composing several calls client-side.
3. **Fetch shared reference data once, at app-shell level — never per-screen.** `GET /bootstrap` (per `docs/API.md`) returns Tags, BDM list, and current-year Holidays in one call right after login. Lead List, Lead Detail, Quick Create Lead, Assign, and Daily Report all read this **one cached result** for their dropdowns — none of them calls `/tags` or `/users/bdm-list` directly on mount. This is not optional polish: five screens independently re-fetching data that changes maybe once a week is exactly the pattern this section exists to prevent. Set a long `keepUnusedDataFor` (RTK Query) on the bootstrap query; invalidate only the specific slice (e.g. `tags`) when Masters (A-10) actually changes it.
4. **Targeted cache invalidation, not blanket refetch.** A mutation invalidates only the specific cache tag it affects (e.g. logging a follow-up invalidates that one lead's interaction list, not the entire Lead List grid). Use RTK Query's `providesTags`/`invalidatesTags` per resource — never a manual full-cache `refetch()` after every mutation as a shortcut.
5. **Prefetch on navigation intent** for list→detail flows (RTK Query's `usePrefetch`) on row hover/focus in dense grids (Lead List, Staff List), so Detail feels instant on click instead of showing a loading skeleton every time.
6. **Virtualize any list that can exceed ~50 rows** (`docs/DESIGN.md` §2.5/§11) — this is a render-cost rule, not a network one, but it compounds with the above: a virtualized grid also makes it easy to paginate the underlying query instead of fetching every row up front.
7. **Debounce search/filter inputs** (300ms, already in `DESIGN.md` §9) so typing in a search box doesn't fire a request per keystroke.

### Backend: minimizing database load

1. **Index every foreign key and every column used in a `WHERE`/`ORDER BY` on a frequently-queried table** — at minimum: `leads(assigned_to)`, `leads(status)`, `leads(tag_id)`, `leads(account_id)`, `leads(next_followup_date)`, `leads(created_at)`, `lead_interactions(lead_id)`, `lead_interactions(bdm_id, created_at)`, `attendance(bdm_id, date)` (already a unique constraint, which also serves as the index), `notifications(user_id, is_read)`. Write these into the first migration, not added later as an afterthought.
2. **No N+1 queries.** A list endpoint that needs related data (e.g. Lead List showing the assigned BDM's name, or the tag label) does it with a single `JOIN`/aggregate query in the repository layer — never a loop that queries once per row. This is the single most common way a "works fine with 20 leads" screen becomes slow at 2,000.
3. **Dashboard and report endpoints (`/dashboard/admin`, `/dashboard/bdm`, `/interactions/daily-report`, attendance matrix) are single aggregate queries** (`GROUP BY`, `SUM`, `COUNT` in one round-trip to Postgres) — never computed by pulling raw rows into Node and summing in JavaScript. The database is far better at this than the application layer, and it avoids pulling thousands of rows over the wire for a handful of numbers.
4. **Paginate every list endpoint** (`leads`, `users`, `accounts`, notifications) — `limit`/`page` or cursor-based, never "return everything and let the frontend slice it."
5. **Connection pooling** — Express connects to Postgres through a pool (`pg.Pool`, sized appropriately for the VPS — start around 10-20 connections, not one-per-request), configured once in `config/database.js`, reused across all domains. Never open a fresh client connection per request.
6. **Cron/report queries that scan a wide date range** (e.g. daily interaction report over a custom range) should hit the indexed `created_at` column, and results should still be paginated if the range can return more than a page's worth of rows — the "select everything, filter in the frontend" anti-pattern applies here too.

---

## 10. When the Agent Is Unsure

If a task is ambiguous — a missing field, an unclear nav target, a design value not in the tokens, or a scope question (e.g. "should Masters include Lead Source?") — stop and ask a specific question rather than guessing a plausible-looking default. A wrong guess that "looks fine" is worse than a paused task.

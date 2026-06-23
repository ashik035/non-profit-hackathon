## Goal
Verify Supabase connectivity to project `pvpopofbqoysxkthznox`, then (re)create tables matching every CSV in `table-data/` and import all rows.

## Step 1 — Verify connectivity
- Confirm `.env` has `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` pointing at `pvpopofbqoysxkthznox`.
- Confirm `src/integrations/supabase/client.ts` uses those vars.
- Run a quick `psql` ping (`SELECT 1`) using the project's `SUPABASE_DB_URL` to confirm DB-level reach from the sandbox.
- Confirm the `csv-import` edge function is deployed against the right project ref.

## Step 2 — Scan `table-data/`
- List all 97 CSVs in `table-data/`.
- For each CSV: read header row + sample rows, infer column types (uuid, timestamptz, jsonb, numeric, boolean, text fallback).
- Table name = CSV filename (snake_case, no extension), placed in a dedicated `csv_data` schema to avoid colliding with the existing `public` app schema (members, donations, etc. already exist there).

## Step 3 — Generate schema SQL
- One `CREATE SCHEMA IF NOT EXISTS csv_data;`
- For each CSV: `DROP TABLE IF EXISTS csv_data.<name>; CREATE TABLE csv_data.<name> (...);` with inferred columns, all nullable, no FKs (raw import).
- `GRANT USAGE ON SCHEMA csv_data` + `GRANT SELECT` to `anon`, `authenticated`; `GRANT ALL` to `service_role`. RLS left off (raw import schema, no policies needed for service-role edge function reads; can be enabled later if exposed to client).

## Step 4 — Generate insert SQL
- For each CSV emit batched `INSERT INTO csv_data.<name> (...) VALUES (...), ...;` in chunks of ~200 rows, with proper escaping and `NULL` for empty cells.
- Bundle as `.ts` string modules under `supabase/functions/csv-import/` (same pattern as the prior import).

## Step 5 — Execute via edge function
- Reuse / redeploy `supabase/functions/csv-import` (connects with `SUPABASE_DB_URL`, runs `create.sql` then `insert.sql`, returns counts).
- Invoke it once and report per-table row counts + any failures.

## Step 6 — Verify
- Query `information_schema.tables WHERE table_schema='csv_data'` → expect 97 tables.
- `SELECT count(*)` on a handful of representative tables (clients, meetings, tasks, nonprofit_donations) and compare to CSV line counts.
- Report results back with SQL editor link.

## Notes / decisions
- Using `csv_data` schema (not `public`) — `public` already holds the live app tables with RLS; dumping raw CSV copies there would clash with `nonprofit_members`, `tasks`, `projects`, etc.
- All columns typed loosely (text where ambiguous) to guarantee import succeeds; can tighten later.
- No RLS on `csv_data` — schema is server/admin-only, not exposed via PostgREST grants to anon by default.
- No frontend changes.
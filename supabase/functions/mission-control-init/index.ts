// Idempotent schema bootstrap for Mission Control.
// Calls a Postgres function via service role to run DDL.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const DDL = `
CREATE TABLE IF NOT EXISTS public.mission_control_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  status text NOT NULL DEFAULT 'running',
  goal text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  synthesis jsonb,
  health_score integer,
  agents_total integer DEFAULT 0,
  agents_completed integer DEFAULT 0,
  agents_failed integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.mission_control_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.mission_control_runs(id) ON DELETE CASCADE,
  source_agent text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  detail text,
  recommended_action text,
  metric jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mc_findings_run ON public.mission_control_findings(run_id);
CREATE INDEX IF NOT EXISTS idx_mc_runs_user ON public.mission_control_runs(user_id, started_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_control_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_control_findings TO authenticated;
GRANT SELECT ON public.mission_control_runs TO anon;
GRANT SELECT ON public.mission_control_findings TO anon;
GRANT ALL ON public.mission_control_runs TO service_role;
GRANT ALL ON public.mission_control_findings TO service_role;

ALTER TABLE public.mission_control_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_control_findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mc_runs_select_all_auth" ON public.mission_control_runs;
CREATE POLICY "mc_runs_select_all_auth" ON public.mission_control_runs
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "mc_runs_insert_self" ON public.mission_control_runs;
CREATE POLICY "mc_runs_insert_self" ON public.mission_control_runs
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mc_runs_update_self" ON public.mission_control_runs;
CREATE POLICY "mc_runs_update_self" ON public.mission_control_runs
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "mc_findings_select_all_auth" ON public.mission_control_findings;
CREATE POLICY "mc_findings_select_all_auth" ON public.mission_control_findings
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "mc_findings_insert_auth" ON public.mission_control_findings;
CREATE POLICY "mc_findings_insert_auth" ON public.mission_control_findings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Also allow anon read for demo visibility
DROP POLICY IF EXISTS "mc_runs_select_anon" ON public.mission_control_runs;
CREATE POLICY "mc_runs_select_anon" ON public.mission_control_runs
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "mc_findings_select_anon" ON public.mission_control_findings;
CREATE POLICY "mc_findings_select_anon" ON public.mission_control_findings
  FOR SELECT TO anon USING (true);

-- Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'mission_control_findings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_control_findings';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'mission_control_runs'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_control_runs';
  END IF;
END $$;

-- Helper RPC to run arbitrary DDL via service role (used by this function only)
`;

async function execSql(sql: string) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  // Use the postgrest-meta endpoint via supabase-js raw fetch using the
  // built-in HTTP API: POST /pg/query is NOT available, so we wrap statements
  // in a one-off RPC by creating a helper function lazily.
  // The simplest reliable path: use the pg-meta endpoint via the management API
  // is not available either. Instead, we POST to /rest/v1/rpc/exec_ddl after
  // ensuring exec_ddl exists.
  // Bootstrap exec_ddl using the pg-rest "query" endpoint isn't available.
  // Fallback: run each statement via the Supabase SQL endpoint exposed at
  // /pg-meta/default/query if present; otherwise rely on a pre-existing
  // exec_sql function. We'll first try exec_sql.
  const tryRpc = async (fn: string) => {
    const resp = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ sql }),
    });
    return resp;
  };
  let resp = await tryRpc("exec_sql");
  if (resp.status === 404) {
    // Need to create exec_sql first using direct REST? Not possible.
    // As a last resort, use the Postgres REST via the deno-postgres client.
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      return { ok: false, status: 500, body: "no exec_sql RPC and SUPABASE_DB_URL missing" };
    }
    const client = new Client(dbUrl);
    await client.connect();
    try {
      await client.queryArray(sql);
    } finally {
      await client.end();
    }
    return { ok: true, status: 200, body: "ddl executed via direct postgres" };
  }
  const text = await resp.text();
  return { ok: resp.ok, status: resp.status, body: text };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const result = await execSql(DDL);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e?.message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

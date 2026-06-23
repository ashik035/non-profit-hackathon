// One-shot CSV import runner. POST to execute create+insert SQL using DB connection.
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createSql = await Deno.readTextFile(new URL("./create.sql", import.meta.url));
const insertSql = await Deno.readTextFile(new URL("./insert.sql", import.meta.url));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return new Response(JSON.stringify({ error: "SUPABASE_DB_URL missing" }), { status: 500, headers: corsHeaders });

  const client = new Client(dbUrl);
  await client.connect();
  const results: Record<string, unknown> = {};
  try {
    await client.queryArray(createSql);
    results.created = true;

    // Execute insert SQL split by statements (each ends with ";\n")
    const statements = insertSql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
    let ok = 0, failed: { idx: number; err: string }[] = [];
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.queryArray(statements[i]);
        ok++;
      } catch (e) {
        failed.push({ idx: i, err: String(e).slice(0, 300) });
      }
    }
    results.inserts_ok = ok;
    results.inserts_failed = failed.length;
    results.failures = failed.slice(0, 10);
  } catch (e) {
    results.error = String(e);
  } finally {
    await client.end();
  }
  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});

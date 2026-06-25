/**
 * Execute seed SQL against the project database via SUPABASE_DB_URL.
 * POST { sql: string, fileName?: string }
 * No table drops — insert/upsert only.
 */

import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(
      JSON.stringify({ success: false, error: "SUPABASE_DB_URL missing" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    let body: { sql?: string; fileName?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!body.sql || typeof body.sql !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Missing sql in body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const client = new Client(dbUrl);
    await client.connect();
    const start = Date.now();

    try {
      await client.queryArray(body.sql);
    } finally {
      await client.end();
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileName: body.fileName ?? "unknown",
        durationMs: Date.now() - start,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

/**
 * Save Agency Role
 *
 * Upserts the caller's row in user_role_preferences using the service role,
 * bypassing RLS gaps that block direct INSERTs from the browser.
 * Caller is authenticated via the JWT in the Authorization header.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_ROLES = [
  "executive_director",
  "development_director",
  "finance_manager",
  "operations_manager",
  "owner",
  "pm",
  "ic",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Identify caller from JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { agency_role } = await req.json();
    if (!agency_role || !VALID_ROLES.includes(agency_role)) {
      return new Response(JSON.stringify({ error: "invalid agency_role" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Manual upsert: find existing row, then update or insert.
    const { data: existing, error: selErr } = await admin
      .from("user_role_preferences")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (selErr) throw selErr;

    if (existing?.id) {
      const { error } = await admin
        .from("user_role_preferences")
        .update({ agency_role, role: "user" })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await admin
        .from("user_role_preferences")
        .insert({ user_id: userId, role: "user", agency_role });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ success: true, agency_role }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("save-agency-role error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

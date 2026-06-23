import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACCOUNTS = [
  { role: "admin", email: "ashik.admin@nonprofitai.test", password: "Ashik@Admin#2026" },
  { role: "moderator", email: "ashik.moderator@nonprofitai.test", password: "Ashik@Mod#2026" },
  { role: "user", email: "ashik.user@nonprofitai.test", password: "Ashik@User#2026" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const results: any[] = [];

  for (const acct of ACCOUNTS) {
    let userId: string | null = null;
    let status = "created";

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: acct.email,
      password: acct.password,
      email_confirm: true,
      user_metadata: { first_name: "Ashik", last_name: "Ashik", full_name: "Ashik Ashik" },
    });

    if (createErr) {
      // Likely already exists — look it up
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find((u) => u.email === acct.email);
      if (!found) {
        results.push({ email: acct.email, role: acct.role, error: createErr.message });
        continue;
      }
      userId = found.id;
      status = "existed";
      // Force password reset to known value
      await supabase.auth.admin.updateUserById(userId, { password: acct.password });
    } else {
      userId = created.user!.id;
    }

    // Upsert profile
    await supabase.from("profiles").upsert(
      { id: userId, full_name: "Ashik Ashik", email: acct.email },
      { onConflict: "id" }
    );

    // Insert role (ignore conflict)
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: acct.role });
    const roleStatus = roleErr ? (roleErr.message.includes("duplicate") ? "exists" : roleErr.message) : "assigned";

    results.push({ email: acct.email, password: acct.password, role: acct.role, user_id: userId, status, role_status: roleStatus });
  }

  return new Response(JSON.stringify({ ok: true, accounts: results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

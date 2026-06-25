import { supabase } from "@/integrations/supabase/client";
import type { AgencyRole } from "@/hooks/useAgencyRole";

/**
 * Upserts the caller's agency_role in user_role_preferences.
 * Tries save-agency-role edge function first, then direct client upsert.
 */
export async function upsertAgencyRolePreference(agencyRole: AgencyRole): Promise<void> {
  const { data, error } = await supabase.functions.invoke("save-agency-role", {
    body: { agency_role: agencyRole },
  });

  if (!error && !data?.error) return;

  const edgeMessage = data?.error ?? error?.message ?? "save-agency-role failed";
  console.warn("save-agency-role unavailable, using direct upsert:", edgeMessage);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error("Not authenticated");

  const { data: existing, error: selErr } = await supabase
    .from("user_role_preferences")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing?.id) {
    const { error: updErr } = await supabase
      .from("user_role_preferences")
      .update({ agency_role: agencyRole, role: "user" })
      .eq("id", existing.id);
    if (updErr) throw updErr;
  } else {
    const { error: insErr } = await supabase
      .from("user_role_preferences")
      .insert({ user_id: user.id, role: "user", agency_role: agencyRole });
    if (insErr) throw insErr;
  }
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cacheConfig } from "@/lib/cache";
import type { AgencyRole } from "@/hooks/useAgencyRole";

export interface UserAgencyRow {
  /** user id from auth.users / profiles */
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  agency_role: AgencyRole | null;
  /** true if a user_role_preferences row exists */
  has_prefs: boolean;
}

const ADMIN_AGENCY_ROLES_KEY = ["admin", "agencyRoles"] as const;

/**
 * Admin-only: fetches all profiles joined with their agency role preferences.
 * Performs two queries and merges client-side (Supabase doesn't support JOINs
 * across auth schema and public schema in a single REST call).
 */
export function useAgencyRoleAdmin() {
  return useQuery<UserAgencyRow[]>({
    queryKey: ADMIN_AGENCY_ROLES_KEY,
    queryFn: async (): Promise<UserAgencyRow[]> => {
      // 1. All profiles
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name", { ascending: true });

      if (profErr) throw profErr;

      // 2. All role preferences
      const { data: prefs, error: prefsErr } = await supabase
        .from("user_role_preferences")
        .select("user_id, agency_role");

      if (prefsErr) throw prefsErr;

      const prefsMap = new Map(
        (prefs ?? []).map((p) => [p.user_id, p])
      );

      return (profiles ?? []).map((prof) => {
        const pref = prefsMap.get(prof.id);
        return {
          user_id: prof.id,
          full_name: prof.full_name ?? null,
          email: prof.email ?? null,
          avatar_url: prof.avatar_url ?? null,
          agency_role: (pref?.agency_role as AgencyRole | null) ?? null,
          has_prefs: !!pref,
        };
      });
    },
    staleTime: cacheConfig.staleTime.medium,
  });
}

export interface UpsertAgencyRolePayload {
  user_id: string;
  agency_role: AgencyRole | null;
}

/**
 * Admin-only: upserts a user_role_preferences row for any user.
 */
export function useUpsertAgencyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, agency_role }: UpsertAgencyRolePayload) => {
      const { data: existing, error: selErr } = await supabase
        .from("user_role_preferences")
        .select("id")
        .eq("user_id", user_id)
        .limit(1)
        .maybeSingle();
      if (selErr) throw selErr;

      if (existing?.id) {
        const { error } = await supabase
          .from("user_role_preferences")
          .update({ agency_role, role: "user" })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_role_preferences")
          .insert({ user_id, role: "user", agency_role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_AGENCY_ROLES_KEY });
    },
    onError: () => {
      toast.error("Failed to update agency role.");
    },
  });
}

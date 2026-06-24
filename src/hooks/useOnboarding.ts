import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Read onboarding flag + profile from the user's own profile row
      // (avoids admin-only app_config, which throws 42501 for non-admins).
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, metadata")
        .eq("id", currentUser.id)
        .maybeSingle();

      const meta = (profile?.metadata as Record<string, unknown> | null) ?? null;
      const hasCompletedOnboarding = meta?.onboarding_completed === true;
      const hasProfile = !!profile?.full_name && profile.full_name.trim() !== "";

      setShowOnboarding(!hasCompletedOnboarding || !hasProfile);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setShowOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      // Merge the flag into profiles.metadata. The wizard also writes this,
      // but call this as a safety net for any other completion paths.
      const { data: existing } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user.id)
        .maybeSingle();

      const meta = (existing?.metadata as Record<string, unknown> | null) ?? {};
      await supabase
        .from("profiles")
        .update({
          metadata: {
            ...meta,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          },
        })
        .eq("id", user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };


  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding,
    skipOnboarding,
    user,
  };
}

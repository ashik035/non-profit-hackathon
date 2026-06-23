import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MCHistoryPoint {
  id: string;
  health_score: number | null;
  completed_at: string | null;
  finding_count: number;
}

export function useMissionControlHistory(limit = 10) {
  return useQuery<MCHistoryPoint[]>({
    queryKey: ["mc-history", limit],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("mission_control_runs")
        .select("id, health_score, completed_at, synthesis")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(limit);
      return ((data ?? []) as any[])
        .reverse()
        .map((r) => ({
          id: r.id,
          health_score: r.health_score,
          completed_at: r.completed_at,
          finding_count: r.synthesis?.finding_count ?? 0,
        }));
    },
    refetchInterval: 10_000,
  });
}

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MCFinding {
  id: string;
  run_id: string;
  source_agent: string;
  severity: "red" | "amber" | "green" | "info";
  title: string;
  detail: string | null;
  recommended_action: string | null;
  metric: Record<string, unknown> | null;
  created_at: string;
}

export interface MCRun {
  id: string;
  status: string;
  goal: string | null;
  started_at: string;
  completed_at: string | null;
  synthesis: { summary?: string; top_priorities?: string[]; finding_count?: number } | null;
  health_score: number | null;
  agents_total: number | null;
  agents_completed: number | null;
  agents_failed: number | null;
}

export const MISSION_CONTROL_AGENTS = [
  { slug: "donor-churn-risk", name: "Donor Churn Risk", emoji: "💝" },
  { slug: "executive-briefer", name: "Executive Briefer", emoji: "📋" },
  { slug: "strategic-insights", name: "Strategic Insights", emoji: "📈" },
  { slug: "action-item-tracker", name: "Action Item Tracker", emoji: "✅" },
  { slug: "grant-deadline-watcher", name: "Grant Deadline Watcher", emoji: "🎯" },
  { slug: "data-health-scanner", name: "Data Health Scanner", emoji: "🩺" },
] as const;

export function useMissionControl() {
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<MCRun | null>(null);
  const [findings, setFindings] = useState<MCFinding[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load latest run on mount
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("mission_control_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1);
      if (data?.[0]) {
        setRun(data[0] as MCRun);
        setRunId(data[0].id);
        const { data: f } = await (supabase as any)
          .from("mission_control_findings")
          .select("*")
          .eq("run_id", data[0].id)
          .order("created_at", { ascending: true });
        setFindings((f as MCFinding[]) ?? []);
      }
    })();
  }, []);

  // Realtime subscribe per run
  useEffect(() => {
    if (!runId) return;
    const ch = supabase
      .channel(`mc:${runId}`)
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "mission_control_findings", filter: `run_id=eq.${runId}` },
        (payload: any) => {
          setFindings((prev) => {
            if (prev.some((p) => p.id === payload.new.id)) return prev;
            return [...prev, payload.new as MCFinding];
          });
        },
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "mission_control_runs", filter: `id=eq.${runId}` },
        (payload: any) => setRun(payload.new as MCRun),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [runId]);

  const startScan = useCallback(async (goal = "Full organizational scan") => {
    setError(null);
    setRunning(true);
    setFindings([]);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error: invokeError } = await supabase.functions.invoke("mission-control-scan", {
        body: { user_id: userData.user?.id ?? null, goal },
      });
      if (invokeError) throw invokeError;
      const newRunId = (data as any)?.run_id;
      if (newRunId) {
        setRunId(newRunId);
        // Fetch the now-complete run + findings
        const [{ data: r }, { data: f }] = await Promise.all([
          (supabase as any).from("mission_control_runs").select("*").eq("id", newRunId).single(),
          (supabase as any).from("mission_control_findings").select("*").eq("run_id", newRunId).order("created_at", { ascending: true }),
        ]);
        if (r) setRun(r as MCRun);
        if (f) setFindings(f as MCFinding[]);
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setRunning(false);
    }
  }, []);

  return { run, runId, findings, running, error, startScan };
}

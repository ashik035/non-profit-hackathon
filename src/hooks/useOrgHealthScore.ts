import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { HealthBreakdownItem } from "@/components/dashboard/OrgHealthScore";

interface OrgHealth {
  score: number;
  scoreColor: "green" | "amber" | "red";
  breakdown: HealthBreakdownItem[];
  insight: string;
}

function colorFor(pct: number): "green" | "amber" | "red" {
  if (pct >= 75) return "green";
  if (pct >= 50) return "amber";
  return "red";
}

export function useOrgHealthScore() {
  return useQuery<OrgHealth>({
    queryKey: ["org-health-score"],
    queryFn: async () => {
      const [
        { data: donations },
        { data: members },
        { data: volunteerShifts },
        { data: campaigns },
        { data: actions },
        { data: mcRun },
      ] = await Promise.all([
        (supabase as any).from("nonprofit_donations").select("donor_name, amount, donated_at, created_at").limit(2000),
        (supabase as any).from("nonprofit_members").select("email, phone, status").limit(1000),
        (supabase as any).from("nonprofit_volunteer_shifts").select("shift_date, hours, created_at").limit(1000),
        (supabase as any).from("nonprofit_campaigns").select("goal_amount, raised_amount, status").limit(200),
        (supabase as any).from("meeting_action_items").select("status").limit(500),
        (supabase as any).from("mission_control_runs").select("health_score, synthesis, completed_at").order("started_at", { ascending: false }).limit(1),
      ]);

      // Donor retention: % donors with >1 gift
      const donorCounts = new Map<string, number>();
      for (const d of donations ?? []) {
        const k = (d as any).donor_name ?? "Anonymous";
        donorCounts.set(k, (donorCounts.get(k) ?? 0) + 1);
      }
      const totalDonors = donorCounts.size || 1;
      const repeatDonors = [...donorCounts.values()].filter((c) => c > 1).length;
      const retentionPct = (repeatDonors / totalDonors) * 100;

      // Volunteer engagement: shifts last 30 days vs total
      const now = Date.now();
      const recentShifts = (volunteerShifts ?? []).filter((s: any) => {
        const dt = new Date(s.shift_date ?? s.created_at).getTime();
        return now - dt < 1000 * 60 * 60 * 24 * 30;
      }).length;
      const volPct = Math.min(100, (recentShifts / Math.max(1, (volunteerShifts ?? []).length)) * 100 * 3);

      // Grant pipeline health: avg raised/goal
      const camp = (campaigns ?? []).filter((c: any) => Number(c.goal_amount ?? 0) > 0);
      const pipelinePct = camp.length === 0 ? 100 :
        (camp.reduce((s: number, c: any) => s + Math.min(100, (Number(c.raised_amount ?? 0) / Number(c.goal_amount)) * 100), 0) / camp.length);

      // Data completeness
      const mRows = members ?? [];
      const complete = mRows.filter((m: any) => m.email && m.phone).length;
      const dataPct = mRows.length === 0 ? 100 : (complete / mRows.length) * 100;

      // Meeting follow-through
      const aRows = actions ?? [];
      const done = aRows.filter((a: any) => a.status === "completed" || a.status === "done").length;
      const actionPct = aRows.length === 0 ? 100 : (done / aRows.length) * 100;

      const breakdown: HealthBreakdownItem[] = [
        { label: "Donor retention", value: `${retentionPct.toFixed(0)}%`, percent: retentionPct, color: colorFor(retentionPct) },
        { label: "Volunteer engagement", value: `${recentShifts} recent`, percent: volPct, color: colorFor(volPct) },
        { label: "Grant pipeline", value: `${pipelinePct.toFixed(0)}%`, percent: pipelinePct, color: colorFor(pipelinePct) },
        { label: "Data completeness", value: `${dataPct.toFixed(0)}%`, percent: dataPct, color: colorFor(dataPct) },
        { label: "Action follow-through", value: `${actionPct.toFixed(0)}%`, percent: actionPct, color: colorFor(actionPct) },
      ];

      const weighted = (retentionPct * 0.25 + volPct * 0.15 + pipelinePct * 0.25 + dataPct * 0.15 + actionPct * 0.20);
      const lastMc = (mcRun ?? [])[0];
      const score = Math.round(lastMc?.health_score ?? weighted);
      const insight = lastMc?.synthesis?.summary
        ? "Latest Mission Control scan synthesized — see Mission Control for details."
        : "Run a Mission Control scan to generate a fresh executive briefing.";

      return { score, scoreColor: colorFor(score), breakdown, insight };
    },
    staleTime: 60_000,
  });
}

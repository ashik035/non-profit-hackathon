import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoardReportLive {
  totals: {
    totalRaised: number;
    donationCount: number;
    memberCount: number;
    activeMembers: number;
    eventsCount: number;
    programsCount: number;
  };
  topDonors: { name: string; amount: number }[];
  recentSynthesis: string | null;
  latestRunId: string | null;
  generatedAt: string;
}

export function useBoardReportLive() {
  return useQuery<BoardReportLive>({
    queryKey: ["board-report-live"],
    queryFn: async () => {
      const [
        { data: donations },
        { data: members },
        { data: events },
        { data: programs },
        { data: mcRun },
      ] = await Promise.all([
        (supabase as any).from("nonprofit_donations").select("donor_name, amount").limit(5000),
        (supabase as any).from("nonprofit_members").select("status").limit(2000),
        (supabase as any).from("nonprofit_events").select("id").limit(500),
        (supabase as any).from("nonprofit_programs").select("id").limit(500),
        (supabase as any).from("mission_control_runs").select("id, synthesis, completed_at").order("started_at", { ascending: false }).limit(1),
      ]);

      const dRows = donations ?? [];
      const totalRaised = dRows.reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);

      const donorMap = new Map<string, number>();
      for (const d of dRows) {
        const k = (d as any).donor_name ?? "Anonymous";
        donorMap.set(k, (donorMap.get(k) ?? 0) + Number((d as any).amount ?? 0));
      }
      const topDonors = [...donorMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount }));

      const mRows = members ?? [];
      const activeMembers = mRows.filter((m: any) => m.status === "active").length;

      const lastMc = (mcRun ?? [])[0];

      return {
        totals: {
          totalRaised,
          donationCount: dRows.length,
          memberCount: mRows.length,
          activeMembers,
          eventsCount: (events ?? []).length,
          programsCount: (programs ?? []).length,
        },
        topDonors,
        recentSynthesis: lastMc?.synthesis?.summary ?? null,
        latestRunId: lastMc?.id ?? null,
        generatedAt: new Date().toISOString(),
      };
    },
    staleTime: 30_000,
  });
}

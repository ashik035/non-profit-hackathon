import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio } from "lucide-react";

interface TickerEvent {
  id: string;
  label: string;
  when: number;
  kind: "finding" as const | "action";
}

const MAX_ITEMS = 8;

export default function LiveActivityTicker() {
  const [events, setEvents] = useState<TickerEvent[]>([]);

  // Seed with recent items
  useEffect(() => {
    (async () => {
      const [{ data: findings }, { data: actions }] = await Promise.all([
        (supabase as any).from("mission_control_findings").select("id, source_agent, title, created_at").order("created_at", { ascending: false }).limit(5),
        (supabase as any).from("mission_control_actions").select("id, action_type, title, created_at, status").order("created_at", { ascending: false }).limit(3),
      ]);
      const seed: TickerEvent[] = [];
      for (const f of (findings ?? [])) {
        seed.push({ id: `f-${f.id}`, kind: "finding" as const, label: `${f.source_agent} flagged: ${f.title.slice(0, 60)}`, when: new Date(f.created_at).getTime() });
      }
      for (const a of (actions ?? [])) {
        seed.push({ id: `a-${a.id}`, kind: "action" as const, label: `AI drafted: ${a.title.slice(0, 60)}`, when: new Date(a.created_at).getTime() });
      }
      seed.sort((a, b) => b.when - a.when);
      setEvents(seed.slice(0, MAX_ITEMS));
    })();
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel("mc-ticker")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "mission_control_findings" },
        (payload: any) => {
          setEvents((prev) => [{
            id: `f-${payload.new.id}`,
            kind: "finding" as const,
            label: `${payload.new.source_agent} flagged: ${(payload.new.title ?? "").slice(0, 60)}`,
            when: Date.now(),
          }, ...prev].slice(0, MAX_ITEMS));
        },
      )
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "mission_control_actions" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [{
              id: `a-${payload.new.id}`,
              kind: "action" as const,
              label: `AI drafted: ${(payload.new.title ?? "").slice(0, 60)}`,
              when: Date.now(),
            }, ...prev].slice(0, MAX_ITEMS));
          } else if (payload.eventType === "UPDATE" && payload.new.status === "executed") {
            setEvents((prev) => [{
              id: `e-${payload.new.id}-${Date.now()}`,
              kind: "action" as const,
              label: `✓ Executed: ${(payload.new.title ?? "").slice(0, 60)}`,
              when: Date.now(),
            }, ...prev].slice(0, MAX_ITEMS));
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (events.length === 0) return null;

  const latest = events[0];
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2 flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary shrink-0">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        LIVE
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis flex-1">
        <span className={latest.kind === "action" ? "text-primary" : ""}>{latest.label}</span>
        <span className="opacity-50"> · {Math.max(0, Math.round((Date.now() - latest.when) / 1000))}s ago</span>
      </div>
    </div>
  );
}

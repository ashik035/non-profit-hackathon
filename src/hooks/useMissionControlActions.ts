import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MCAction {
  id: string;
  finding_id: string | null;
  run_id: string | null;
  user_id: string | null;
  action_type: string;
  status: "draft" | "approved" | "executed" | "dismissed";
  title: string;
  draft_content: string;
  edited_content: string | null;
  destination: Record<string, unknown> | null;
  dismissed_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  executed_at: string | null;
}

export function useMissionControlActions(runId: string | null) {
  const [actions, setActions] = useState<MCAction[]>([]);
  const [drafting, setDrafting] = useState<string | null>(null); // finding_id being drafted
  const [executing, setExecuting] = useState<string | null>(null); // action_id

  // Load actions for the run
  useEffect(() => {
    if (!runId) {
      setActions([]);
      return;
    }
    (async () => {
      const { data } = await (supabase as any)
        .from("mission_control_actions")
        .select("*")
        .eq("run_id", runId)
        .order("created_at", { ascending: true });
      setActions((data as MCAction[]) ?? []);
    })();
  }, [runId]);

  // Realtime
  useEffect(() => {
    if (!runId) return;
    const ch = supabase
      .channel(`mc-actions:${runId}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "mission_control_actions", filter: `run_id=eq.${runId}` },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setActions((prev) => prev.some((p) => p.id === payload.new.id) ? prev : [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setActions((prev) => prev.map((p) => p.id === payload.new.id ? payload.new : p));
          } else if (payload.eventType === "DELETE") {
            setActions((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [runId]);

  const draftAction = useCallback(async (findingId: string) => {
    setDrafting(findingId);
    const t0 = performance.now();
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase.functions.invoke("mission-control-draft-action", {
        body: { finding_id: findingId, user_id: userData.user?.id ?? null },
      });
      if (error) throw error;
      const action: MCAction | undefined = (data as any)?.action;
      if (action) {
        setActions((prev) => prev.some((p) => p.id === action.id) ? prev.map((p) => p.id === action.id ? action : p) : [...prev, action]);
      }
      const ms = Math.round(performance.now() - t0);
      toast.success(`Draft ready in ${(ms / 1000).toFixed(1)}s`, {
        description: action?.title ?? "AI generated an action draft",
      });
      return action;
    } catch (e: any) {
      toast.error("Couldn't draft action", { description: e?.message ?? String(e) });
    } finally {
      setDrafting(null);
    }
  }, []);

  const executeAction = useCallback(async (actionId: string, editedContent?: string) => {
    setExecuting(actionId);
    try {
      const { data, error } = await supabase.functions.invoke("mission-control-execute-action", {
        body: { action_id: actionId, edited_content: editedContent ?? null },
      });
      if (error) throw error;
      toast.success("Executed — task created", {
        description: (data as any)?.task_id ? `Task ${(data as any).task_id.slice(0, 8)} created` : undefined,
      });
    } catch (e: any) {
      toast.error("Execution failed", { description: e?.message ?? String(e) });
    } finally {
      setExecuting(null);
    }
  }, []);

  const dismissAction = useCallback(async (actionId: string, reason: string) => {
    try {
      const { error } = await (supabase as any)
        .from("mission_control_actions")
        .update({ status: "dismissed", dismissed_reason: reason, updated_at: new Date().toISOString() })
        .eq("id", actionId);
      if (error) throw error;
      toast.success("Dismissed");
    } catch (e: any) {
      toast.error("Couldn't dismiss", { description: e?.message ?? String(e) });
    }
  }, []);

  const actionForFinding = useCallback((findingId: string) => {
    return actions.find((a) => a.finding_id === findingId && a.status !== "dismissed") ?? null;
  }, [actions]);

  return { actions, draftAction, executeAction, dismissAction, drafting, executing, actionForFinding };
}

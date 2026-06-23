import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MCFinding } from "@/hooks/useMissionControl";

export function useCreateTaskFromFinding() {
  const [creating, setCreating] = useState<string | null>(null);

  const createTask = async (finding: MCFinding) => {
    setCreating(finding.id);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const title = finding.title.slice(0, 200);
      const description = [
        finding.detail,
        finding.recommended_action ? `\n\nRecommended: ${finding.recommended_action}` : "",
        `\n\nSource: Mission Control · ${finding.source_agent}`,
      ].filter(Boolean).join("");

      const priority = finding.severity === "red" ? "high" : finding.severity === "amber" ? "medium" : "low";
      const dueDays = finding.severity === "red" ? 3 : finding.severity === "amber" ? 7 : 14;
      const due = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const { error } = await (supabase as any).from("tasks").insert({
        title,
        description,
        priority,
        status: "pending",
        due_date: due,
        created_by: userData.user?.id ?? null,
      });
      if (error) throw error;
      toast.success("Task created", { description: title });
    } catch (e: any) {
      toast.error("Couldn't create task", { description: e?.message ?? String(e) });
    } finally {
      setCreating(null);
    }
  };

  return { createTask, creating };
}

// Mission Control: AI-draft an action for a finding.
// Picks a prompt template by source_agent, calls Lovable AI Gateway,
// and inserts a draft into mission_control_actions.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL = "google/gemini-3-flash-preview";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface Finding {
  id: string;
  run_id: string;
  source_agent: string;
  severity: string;
  title: string;
  detail: string | null;
  recommended_action: string | null;
  metric: Record<string, unknown> | null;
}

function pickActionType(agent: string): { type: string; label: string } {
  switch (agent) {
    case "donor-churn-risk": return { type: "donor_email", label: "Re-engagement email" };
    case "executive-briefer": return { type: "task_reassign", label: "Ops task" };
    case "strategic-insights": return { type: "comms_draft", label: "Mid-month appeal" };
    case "action-item-tracker": return { type: "task_reassign", label: "Action item plan" };
    case "grant-deadline-watcher": return { type: "grant_reminder", label: "Grant reminder" };
    case "data-health-scanner": return { type: "cleanup_checklist", label: "Data cleanup checklist" };
    default: return { type: "task_reassign", label: "Follow-up task" };
  }
}

function buildPrompt(finding: Finding): { system: string; user: string } {
  const { type } = pickActionType(finding.source_agent);
  const base = `Finding: ${finding.title}\nDetail: ${finding.detail ?? "n/a"}\nRecommended: ${finding.recommended_action ?? "n/a"}\nSeverity: ${finding.severity}`;

  switch (type) {
    case "donor_email":
      return {
        system: "You are a warm, sincere nonprofit Development Director. Write a personalized re-engagement email to a lapsed donor. Format as 'Subject: ...\\n\\nBody: ...'. Keep body under 160 words. Be genuine, not salesy. Mention specific impact.",
        user: base,
      };
    case "grant_reminder":
      return {
        system: "You are a Grants Manager. Draft a concise internal action plan to close out a grant deadline. Include: 1) immediate next step, 2) owner suggestion, 3) 3-item checklist, 4) draft outreach line to the funder. Be specific and operational.",
        user: base,
      };
    case "comms_draft":
      return {
        system: "You are a nonprofit Communications Director. Draft a mid-month donor appeal email. Format as 'Subject: ...\\n\\nBody: ...'. 140 words max. Include 3 segment suggestions at the bottom (e.g. lapsed mid-tier, recurring monthly, first-time donors).",
        user: base,
      };
    case "cleanup_checklist":
      return {
        system: "You are a nonprofit Data Operations specialist. Produce a 5-item prioritized cleanup checklist with owner suggestions and time estimates. Format as a numbered list.",
        user: base,
      };
    case "task_reassign":
    default:
      return {
        system: "You are a nonprofit Operations Manager. Produce a concrete action plan with: 1) one-line summary, 2) suggested owner, 3) due date suggestion, 4) 3-step execution plan. Be terse and operational.",
        user: base,
      };
  }
}

async function aiDraft(system: string, user: string): Promise<string> {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": LOVABLE_API_KEY,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (resp.status === 429) throw new Error("Rate limited — try again in a moment");
  if (resp.status === 402) throw new Error("AI credits exhausted");
  if (!resp.ok) throw new Error(`AI gateway ${resp.status}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const findingId: string | undefined = body.finding_id;
    if (!findingId) {
      return new Response(JSON.stringify({ error: "finding_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if a draft already exists (idempotent)
    const { data: existing } = await supabase
      .from("mission_control_actions")
      .select("*")
      .eq("finding_id", findingId)
      .in("status", ["draft", "approved"])
      .limit(1);
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ action: existing[0], cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: finding, error: fErr } = await supabase
      .from("mission_control_findings")
      .select("*")
      .eq("id", findingId)
      .single();
    if (fErr || !finding) throw new Error(fErr?.message ?? "finding not found");

    const { type, label } = pickActionType(finding.source_agent);
    const { system, user } = buildPrompt(finding as Finding);
    const draft = await aiDraft(system, user);

    const { data: action, error: aErr } = await supabase
      .from("mission_control_actions")
      .insert({
        finding_id: findingId,
        run_id: (finding as any).run_id,
        user_id: body.user_id ?? null,
        action_type: type,
        status: "draft",
        title: `${label}: ${(finding as any).title}`.slice(0, 200),
        draft_content: draft,
      })
      .select()
      .single();
    if (aErr || !action) throw new Error(aErr?.message ?? "failed to insert action");

    return new Response(JSON.stringify({ action }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String((e as any)?.message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

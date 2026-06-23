// Mission Control — multi-agent org scan.
// Fans out 6 "agent" calls in parallel, each computes findings from live data
// + optional Lovable AI synthesis, writes to mission_control_findings, then
// produces an overall executive briefing.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL = "google/gemini-3-flash-preview";

type Severity = "red" | "amber" | "green" | "info";
interface Finding {
  source_agent: string;
  severity: Severity;
  title: string;
  detail: string;
  recommended_action?: string;
  metric?: Record<string, unknown>;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function aiSummarize(system: string, prompt: string): Promise<string> {
  if (!LOVABLE_API_KEY) return "";
  try {
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
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!resp.ok) return "";
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

// ---------- Agent implementations ----------

async function agentDonorChurn(): Promise<Finding[]> {
  const { data: donations } = await supabase
    .from("nonprofit_donations")
    .select("donor_name, amount, donated_at, created_at")
    .limit(1000);
  const findings: Finding[] = [];
  const rows = donations ?? [];
  const byDonor = new Map<string, { total: number; last: string; count: number }>();
  for (const d of rows) {
    const k = (d as any).donor_name ?? "Anonymous";
    const dt = (d as any).donated_at ?? (d as any).created_at ?? new Date().toISOString();
    const e = byDonor.get(k) ?? { total: 0, last: dt, count: 0 };
    e.total += Number((d as any).amount ?? 0);
    e.count += 1;
    if (dt > e.last) e.last = dt;
    byDonor.set(k, e);
  }
  const now = Date.now();
  const atRisk = [...byDonor.entries()]
    .filter(([_, v]) => v.total > 500 && (now - new Date(v.last).getTime()) > 1000 * 60 * 60 * 24 * 180)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);
  if (atRisk.length === 0) {
    findings.push({
      source_agent: "donor-churn-risk",
      severity: "green",
      title: "Donor base is engaged",
      detail: `${byDonor.size} unique donors, no high-value lapses detected in last 180 days.`,
    });
  } else {
    for (const [name, v] of atRisk) {
      findings.push({
        source_agent: "donor-churn-risk",
        severity: "red",
        title: `At-risk donor: ${name}`,
        detail: `Lifetime $${v.total.toFixed(0)} across ${v.count} gifts. No gift in 180+ days (last: ${new Date(v.last).toLocaleDateString()}).`,
        recommended_action: "Personal outreach from Development Director within 7 days.",
        metric: { lifetime: v.total, last_gift: v.last },
      });
    }
  }
  return findings;
}

async function agentExecutiveBriefer(): Promise<Finding[]> {
  const [{ data: tasks }, { data: meetings }] = await Promise.all([
    supabase.from("tasks").select("status, due_date, priority").limit(500),
    supabase.from("meetings").select("title, scheduled_at, status").limit(50),
  ]);
  const overdue = (tasks ?? []).filter((t: any) =>
    t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
  ).length;
  const upcoming = (meetings ?? []).filter((m: any) =>
    m.scheduled_at && new Date(m.scheduled_at) > new Date()
  ).length;
  const sev: Severity = overdue > 10 ? "red" : overdue > 3 ? "amber" : "green";
  return [{
    source_agent: "executive-briefer",
    severity: sev,
    title: `${overdue} overdue tasks, ${upcoming} upcoming meetings`,
    detail: `Operations snapshot across ${(tasks ?? []).length} tracked tasks and ${(meetings ?? []).length} meetings.`,
    recommended_action: overdue > 3 ? "Review overdue queue in next leadership standup." : undefined,
    metric: { overdue, upcoming },
  }];
}

async function agentStrategicInsights(): Promise<Finding[]> {
  const { data: donations } = await supabase
    .from("nonprofit_donations")
    .select("amount, donated_at, created_at")
    .limit(2000);
  const rows = donations ?? [];
  const now = new Date();
  const thisMonth = rows.filter((d: any) => {
    const dt = new Date(d.donated_at ?? d.created_at);
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  });
  const lastMonth = rows.filter((d: any) => {
    const dt = new Date(d.donated_at ?? d.created_at);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return dt.getMonth() === lm.getMonth() && dt.getFullYear() === lm.getFullYear();
  });
  const t = thisMonth.reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);
  const l = lastMonth.reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0);
  const delta = l > 0 ? ((t - l) / l) * 100 : 0;
  const sev: Severity = delta < -20 ? "red" : delta < 0 ? "amber" : "green";
  return [{
    source_agent: "strategic-insights",
    severity: sev,
    title: `Giving ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs last month`,
    detail: `This month: $${t.toFixed(0)} from ${thisMonth.length} gifts. Last month: $${l.toFixed(0)} from ${lastMonth.length} gifts.`,
    recommended_action: delta < 0 ? "Launch mid-month appeal to close the gap." : "Maintain momentum with thank-you campaign.",
    metric: { this_month: t, last_month: l, pct_change: delta },
  }];
}

async function agentActionTracker(): Promise<Finding[]> {
  const { data: items } = await supabase
    .from("meeting_action_items")
    .select("title, status, due_date, assignee_name")
    .limit(500);
  const rows = items ?? [];
  const open = rows.filter((r: any) => r.status !== "completed" && r.status !== "done").length;
  const overdue = rows.filter((r: any) =>
    r.due_date && new Date(r.due_date) < new Date() && r.status !== "completed"
  ).length;
  const sev: Severity = overdue > 5 ? "red" : overdue > 0 ? "amber" : "green";
  return [{
    source_agent: "action-item-tracker",
    severity: sev,
    title: `${open} open action items (${overdue} overdue)`,
    detail: `Tracked across ${rows.length} meeting commitments.`,
    recommended_action: overdue > 0 ? "Reassign or close overdue items in next ops sync." : undefined,
    metric: { open, overdue, total: rows.length },
  }];
}

async function agentGrantDeadlines(): Promise<Finding[]> {
  const { data: campaigns } = await supabase
    .from("nonprofit_campaigns")
    .select("name, goal_amount, raised_amount, end_date, status")
    .limit(200);
  const rows = campaigns ?? [];
  const findings: Finding[] = [];
  const now = Date.now();
  const soon = rows
    .filter((c: any) => c.end_date && new Date(c.end_date).getTime() - now < 1000 * 60 * 60 * 24 * 30 && new Date(c.end_date).getTime() > now)
    .slice(0, 3);
  if (soon.length === 0) {
    findings.push({
      source_agent: "grant-deadline-watcher",
      severity: "green",
      title: "No grant deadlines in next 30 days",
      detail: `${rows.length} campaigns tracked.`,
    });
  }
  for (const c of soon) {
    const goal = Number((c as any).goal_amount ?? 0);
    const raised = Number((c as any).raised_amount ?? 0);
    const pct = goal > 0 ? (raised / goal) * 100 : 0;
    findings.push({
      source_agent: "grant-deadline-watcher",
      severity: pct < 50 ? "red" : pct < 80 ? "amber" : "green",
      title: `${(c as any).name} closes ${new Date((c as any).end_date).toLocaleDateString()}`,
      detail: `Raised $${raised.toFixed(0)} of $${goal.toFixed(0)} goal (${pct.toFixed(0)}%).`,
      recommended_action: pct < 80 ? "Push final outreach to close the gap." : "Send thank-you and renewal pitch.",
      metric: { pct, goal, raised },
    });
  }
  return findings;
}

async function agentDataHealth(): Promise<Finding[]> {
  const [{ data: members }, { data: donations }] = await Promise.all([
    supabase.from("nonprofit_members").select("email, phone").limit(1000),
    supabase.from("nonprofit_donations").select("donor_name, amount, payment_method").limit(1000),
  ]);
  const mRows = members ?? [];
  const dRows = donations ?? [];
  const missingEmail = mRows.filter((m: any) => !m.email).length;
  const missingPhone = mRows.filter((m: any) => !m.phone).length;
  const missingMethod = dRows.filter((d: any) => !d.payment_method).length;
  const totalMissing = missingEmail + missingPhone + missingMethod;
  const sev: Severity = totalMissing > 50 ? "red" : totalMissing > 10 ? "amber" : "green";
  return [{
    source_agent: "data-health-scanner",
    severity: sev,
    title: `${totalMissing} missing fields across members + donations`,
    detail: `Members missing email: ${missingEmail}, missing phone: ${missingPhone}. Donations missing payment method: ${missingMethod}.`,
    recommended_action: totalMissing > 10 ? "Run data cleanup workflow this week." : "Data quality is healthy.",
    metric: { missingEmail, missingPhone, missingMethod },
  }];
}

const AGENTS: Array<{ name: string; run: () => Promise<Finding[]> }> = [
  { name: "donor-churn-risk", run: agentDonorChurn },
  { name: "executive-briefer", run: agentExecutiveBriefer },
  { name: "strategic-insights", run: agentStrategicInsights },
  { name: "action-item-tracker", run: agentActionTracker },
  { name: "grant-deadline-watcher", run: agentGrantDeadlines },
  { name: "data-health-scanner", run: agentDataHealth },
];

function computeHealth(findings: Finding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity === "red") score -= 12;
    else if (f.severity === "amber") score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

async function runScan(userId: string | null, goal: string, existingRunId: string | null) {
  let runId = existingRunId;
  if (!runId) {
    const { data: run, error } = await supabase
      .from("mission_control_runs")
      .insert({ user_id: userId, goal, status: "running", agents_total: AGENTS.length, agents_completed: 0, agents_failed: 0 })
      .select()
      .single();
    if (error || !run) throw new Error(error?.message ?? "failed to create run");
    runId = (run as any).id as string;
  } else {
    await supabase
      .from("mission_control_runs")
      .update({ status: "running", agents_total: AGENTS.length, agents_completed: 0, agents_failed: 0 })
      .eq("id", runId);
  }

  let completed = 0;
  let failed = 0;
  const allFindings: Finding[] = [];

  // Fan out in parallel. Each agent inserts its findings + increments counter on completion.
  // Stagger start so the UI animation reads as live multi-agent activity.
  const results = await Promise.allSettled(
    AGENTS.map(async (a, i) => {
      await new Promise((r) => setTimeout(r, 400 + i * 350 + Math.random() * 400));
      try {
        const findings = await a.run();
        if (findings.length) {
          await supabase.from("mission_control_findings").insert(
            findings.map((f) => ({ ...f, run_id: runId })),
          );
        }
        completed += 1;
        allFindings.push(...findings);
        await supabase
          .from("mission_control_runs")
          .update({ agents_completed: completed })
          .eq("id", runId);
        return findings;
      } catch (err) {
        failed += 1;
        await supabase.from("mission_control_findings").insert({
          run_id: runId,
          source_agent: a.name,
          severity: "info",
          title: `${a.name} encountered an error`,
          detail: String((err as any)?.message ?? err),
        });
        await supabase
          .from("mission_control_runs")
          .update({ agents_failed: failed })
          .eq("id", runId);
        throw err;
      }
    }),
  );

  for (const r of results) {
    if (r.status === "rejected") {/* already counted */}
  }

  const summary = await aiSummarize(
    "You are the chief of staff for a nonprofit. Given agent findings, produce a 3-bullet executive briefing focused on the most urgent priorities. Be direct and concrete. No fluff.",
    `Findings JSON:\n${JSON.stringify(allFindings, null, 2)}`,
  );
  const health = computeHealth(allFindings);
  const top = allFindings
    .filter((f) => f.severity === "red")
    .slice(0, 3)
    .map((f) => f.title);

  await supabase
    .from("mission_control_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      agents_completed: completed,
      agents_failed: failed,
      synthesis: { summary, top_priorities: top, finding_count: allFindings.length },
      health_score: health,
    })
    .eq("id", runId);

  return { run_id: runId, health, findings: allFindings.length, summary };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const userId: string | null = body.user_id ?? null;
    const goal: string = body.goal ?? "Full organizational scan";
    const result = await runScan(userId, goal);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String((e as any)?.message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

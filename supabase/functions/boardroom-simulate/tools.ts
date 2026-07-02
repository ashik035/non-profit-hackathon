// Lightweight data tools personas can call — grounded in live nonprofit tables.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface ToolContext {
  supabase: SupabaseClient;
  userId: string;
}

export const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "get_financial_snapshot",
      description:
        "Get the organization's latest financial snapshot: total raised this year, donation count, top campaigns by raised amount, and average gift size. Call this before making any financial claim.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_program_metrics",
      description:
        "Get program and community metrics: active members count, volunteer count, upcoming events count, and recent event registrant totals. Call this before making any claim about programs or beneficiaries.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "search_org_knowledge",
      description:
        "Search the organization's knowledge base for a short phrase. Returns up to 3 matching entries with title and snippet.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Short search phrase, 2-6 words" } },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  if (name === "get_financial_snapshot") return getFinancialSnapshot(ctx);
  if (name === "get_program_metrics") return getProgramMetrics(ctx);
  if (name === "search_org_knowledge") {
    const q = String(args.query ?? "").slice(0, 120);
    return searchOrgKnowledge(q, ctx);
  }
  return { error: `unknown tool: ${name}` };
}

/** Extract meaningful keywords from the board question for knowledge search. */
export function extractQuestionKeywords(question: string): string {
  const stop = new Set([
    "should", "we", "the", "our", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
    "is", "are", "be", "can", "will", "would", "could", "this", "that", "with", "from", "by",
    "how", "what", "when", "where", "why", "do", "does", "did", "launch", "start", "begin",
  ]);
  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w));
  return words.slice(0, 5).join(" ") || "mission strategy governance";
}

async function getFinancialSnapshot(ctx: ToolContext) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const quarterStart = new Date();
  quarterStart.setMonth(quarterStart.getMonth() - 3);

  const { data: donations } = await ctx.supabase
    .from("nonprofit_donations")
    .select("amount, campaign_id, created_at, donor_name")
    .gte("created_at", yearStart)
    .order("created_at", { ascending: false })
    .limit(2000);

  const rows = donations ?? [];
  const totalRaised = rows.reduce((sum, d) => sum + Number(d.amount ?? 0), 0);
  const count = rows.length;
  const avgGift = count > 0 ? Math.round(totalRaised / count) : 0;

  const last90 = rows.filter((d) => new Date(d.created_at) >= quarterStart);
  const last90Total = last90.reduce((sum, d) => sum + Number(d.amount ?? 0), 0);

  const { data: campaigns } = await ctx.supabase
    .from("nonprofit_campaigns")
    .select("id, name, goal, raised, is_active")
    .order("raised", { ascending: false })
    .limit(5);

  const activeCampaigns = (campaigns ?? []).filter((c) => c.is_active);
  const totalGoal = activeCampaigns.reduce((s, c) => s + Number(c.goal ?? 0), 0);
  const totalCampaignRaised = activeCampaigns.reduce((s, c) => s + Number(c.raised ?? 0), 0);

  return {
    year_to_date: {
      total_raised_usd: Math.round(totalRaised),
      donation_count: count,
      average_gift_usd: avgGift,
      last_90_days_usd: Math.round(last90Total),
      last_90_donation_count: last90.length,
    },
    active_campaigns: activeCampaigns.map((c) => ({
      name: c.name,
      raised: Number(c.raised ?? 0),
      goal: Number(c.goal ?? 0),
      pct_of_goal: Number(c.goal ?? 0) > 0
        ? Math.round((Number(c.raised ?? 0) / Number(c.goal)) * 100)
        : 0,
    })),
    campaign_pipeline: {
      active_count: activeCampaigns.length,
      combined_goal_usd: totalGoal,
      combined_raised_usd: totalCampaignRaised,
      pct_of_combined_goal: totalGoal > 0 ? Math.round((totalCampaignRaised / totalGoal) * 100) : 0,
    },
    top_campaigns: (campaigns ?? []).slice(0, 3).map((c) => ({
      name: c.name,
      raised: Number(c.raised ?? 0),
      goal: Number(c.goal ?? 0),
      is_active: c.is_active,
    })),
    as_of: new Date().toISOString().slice(0, 10),
  };
}

async function getProgramMetrics(ctx: ToolContext) {
  const today = new Date().toISOString().slice(0, 10);

  const [members, volunteers, events, registrants, programs, memberTiers] = await Promise.all([
    ctx.supabase
      .from("nonprofit_members")
      .select("id", { count: "exact", head: true })
      .eq("status", "Active"),
    ctx.supabase.from("nonprofit_volunteers").select("id", { count: "exact", head: true }),
    ctx.supabase
      .from("nonprofit_events")
      .select("id, title, date, capacity")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(5),
    ctx.supabase
      .from("nonprofit_event_registrants")
      .select("id", { count: "exact", head: true }),
    ctx.supabase
      .from("nonprofit_programs")
      .select("name, status, beneficiary_count, volunteer_hours, budget_used, budget_total, outcomes_achieved, outcomes_target")
      .order("beneficiary_count", { ascending: false })
      .limit(8),
    ctx.supabase
      .from("nonprofit_members")
      .select("tier")
      .eq("status", "Active"),
  ]);

  const tierCounts: Record<string, number> = {};
  for (const m of memberTiers.data ?? []) {
    const tier = String(m.tier ?? "General");
    tierCounts[tier] = (tierCounts[tier] ?? 0) + 1;
  }

  const programRows = programs.data ?? [];
  const activePrograms = programRows.filter((p) => p.status === "active");
  const planningPrograms = programRows.filter((p) => p.status === "planning");
  const totalBeneficiaries = programRows.reduce((s, p) => s + Number(p.beneficiary_count ?? 0), 0);
  const totalVolunteerHours = programRows.reduce((s, p) => s + Number(p.volunteer_hours ?? 0), 0);
  const budgetUsed = programRows.reduce((s, p) => s + Number(p.budget_used ?? 0), 0);
  const budgetTotal = programRows.reduce((s, p) => s + Number(p.budget_total ?? 0), 0);

  return {
    active_members: members.count ?? 0,
    member_tiers: tierCounts,
    volunteer_count: volunteers.count ?? 0,
    event_registrants_total: registrants.count ?? 0,
    upcoming_events: (events.data ?? []).map((e) => ({
      title: e.title,
      date: e.date,
      capacity: e.capacity,
    })),
    programs: {
      active_count: activePrograms.length,
      planning_count: planningPrograms.length,
      total_beneficiaries: totalBeneficiaries,
      total_volunteer_hours: totalVolunteerHours,
      budget_used_usd: budgetUsed,
      budget_total_usd: budgetTotal,
      budget_utilization_pct: budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0,
      active_programs: activePrograms.slice(0, 5).map((p) => ({
        name: p.name,
        beneficiaries: p.beneficiary_count,
        outcomes: `${p.outcomes_achieved}/${p.outcomes_target}`,
        budget_used: p.budget_used,
        budget_total: p.budget_total,
      })),
      planning_programs: planningPrograms.map((p) => p.name),
    },
  };
}

async function searchOrgKnowledge(query: string, ctx: ToolContext) {
  if (!query) return { matches: [] };
  const safe = query.replace(/[%_]/g, "");
  const { data } = await ctx.supabase
    .from("knowledge_entries")
    .select("title, content")
    .or(`title.ilike.%${safe}%,content.ilike.%${safe}%`)
    .limit(3);

  return {
    matches: (data ?? []).map((k) => ({
      title: k.title,
      snippet: String(k.content ?? "").slice(0, 320),
    })),
  };
}

/** Full org brief injected into every persona turn. */
export async function buildOrgBrief(ctx: ToolContext, question: string): Promise<string> {
  const keywords = extractQuestionKeywords(question);
  const [fin, prog, kb] = await Promise.all([
    getFinancialSnapshot(ctx),
    getProgramMetrics(ctx),
    searchOrgKnowledge(keywords, ctx),
  ]);

  const finData = fin as {
    year_to_date?: { total_raised_usd?: number; donation_count?: number; last_90_days_usd?: number };
    campaign_pipeline?: { pct_of_combined_goal?: number; active_count?: number };
  };
  const progData = prog as {
    active_members?: number;
    volunteer_count?: number;
    programs?: {
      active_count?: number;
      planning_count?: number;
      budget_utilization_pct?: number;
      total_beneficiaries?: number;
    };
  };

  const summary = [
    `YTD raised: $${finData.year_to_date?.total_raised_usd ?? 0} (${finData.year_to_date?.donation_count ?? 0} gifts)`,
    `Last 90 days: $${finData.year_to_date?.last_90_days_usd ?? 0}`,
    `Active campaigns: ${finData.campaign_pipeline?.active_count ?? 0} at ${finData.campaign_pipeline?.pct_of_combined_goal ?? 0}% of combined goal`,
    `Active members: ${progData.active_members ?? 0}`,
    `Volunteers: ${progData.volunteer_count ?? 0}`,
    `Programs: ${progData.programs?.active_count ?? 0} active, ${progData.programs?.planning_count ?? 0} planning`,
    `Beneficiaries served: ${progData.programs?.total_beneficiaries ?? 0}`,
    `Program budget utilization: ${progData.programs?.budget_utilization_pct ?? 0}%`,
  ].join("; ");

  return [
    `ORG SUMMARY: ${summary}`,
    `FINANCIAL DETAIL:\n${JSON.stringify(fin, null, 2)}`,
    `PROGRAM & COMMUNITY DETAIL:\n${JSON.stringify(prog, null, 2)}`,
    `KNOWLEDGE BASE (keywords: "${keywords}"):\n${JSON.stringify(kb, null, 2)}`,
  ].join("\n\n");
}

export function makeServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

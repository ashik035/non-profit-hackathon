// Lightweight data tools personas can call.
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

async function getFinancialSnapshot(ctx: ToolContext) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const { data: donations } = await ctx.supabase
    .from("nonprofit_donations")
    .select("amount, campaign_id, created_at")
    .gte("created_at", yearStart)
    .limit(2000);

  const totalRaised =
    donations?.reduce((sum, d) => sum + Number(d.amount ?? 0), 0) ?? 0;
  const count = donations?.length ?? 0;
  const avgGift = count > 0 ? Math.round(totalRaised / count) : 0;

  const { data: campaigns } = await ctx.supabase
    .from("nonprofit_campaigns")
    .select("id, name, goal, raised, is_active")
    .order("raised", { ascending: false })
    .limit(3);

  return {
    year_to_date: {
      total_raised_usd: Math.round(totalRaised),
      donation_count: count,
      average_gift_usd: avgGift,
    },
    top_campaigns: (campaigns ?? []).map((c) => ({
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

  const [members, volunteers, events, registrants] = await Promise.all([
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
  ]);

  return {
    active_members: members.count ?? 0,
    volunteer_count: volunteers.count ?? 0,
    event_registrants_total: registrants.count ?? 0,
    upcoming_events: (events.data ?? []).map((e) => ({
      title: e.title,
      date: e.date,
      capacity: e.capacity,
    })),
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
      snippet: String(k.content ?? "").slice(0, 240),
    })),
  };
}

export function makeServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

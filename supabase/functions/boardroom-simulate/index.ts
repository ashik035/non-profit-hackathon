// Boardroom Simulator — multi-persona debate orchestrator with NDJSON streaming.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { chatCompletion } from "../_shared/ai-provider-routing.ts";
import { PERSONAS, TURN_ORDER, type Persona, type PersonaId, type VoteStance } from "./personas.ts";
import {
  buildOrgBrief,
  executeTool,
  extractQuestionKeywords,
  makeServiceClient,
  type ToolContext,
} from "./tools.ts";

const MODEL = "google/gemini-3-flash-preview";
const ROUNDS = Math.min(2, Math.max(1, parseInt(Deno.env.get("BOARDROOM_ROUNDS") ?? "1", 10) || 1));

interface Turn {
  persona: PersonaId;
  text: string;
}

interface VoteBreakdown {
  yes_pct: number;
  no_pct: number;
  conditional_pct: number;
  counts: { yes: number; no: number; conditional: number };
  lean: VoteStance | "split";
  tally: string;
}

interface PersonaVoteDetail {
  vote: VoteStance;
  rationale: string;
}

interface BoardroomFinalDoc {
  vote: Record<string, string> & { tally?: string };
  vote_breakdown: VoteBreakdown;
  persona_votes: Record<PersonaId, PersonaVoteDetail>;
  memo: string;
  analysis: {
    financial: string;
    programs: string;
    growth: string;
    governance: string;
    summary: string;
  };
  conditions: string[];
  chair_guidance: string;
  data_used: string[];
  risks: string[];
  dissent: string;
}

type Enqueue = (obj: unknown) => void;

const PERSONA_IDS: PersonaId[] = ["elena", "marcus", "david", "priya"];

function transcriptForPrompt(transcript: Turn[]): string {
  if (transcript.length === 0) return "(no prior turns — you are opening)";
  return transcript
    .map((t) => {
      const p = PERSONAS.find((x) => x.id === t.persona)!;
      return `${p.name} (${p.role}):\n${t.text}`;
    })
    .join("\n\n---\n\n");
}

function friendlyAiError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("402") || msg.toLowerCase().includes("credit")) {
    return "AI credits exhausted — configure OPENAI_API_KEY or add Lovable credits, then reconvene.";
  }
  if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
    return "AI rate limit hit — wait a moment and reconvene the board.";
  }
  if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
    return "Session expired — please sign in again.";
  }
  return msg.slice(0, 300);
}

function normalizeVote(raw: string): VoteStance {
  const v = raw.toLowerCase().trim();
  if (v.startsWith("yes")) return "yes";
  if (v.startsWith("no")) return "no";
  return "conditional";
}

function parsePositionFromTurn(text: string): VoteStance | null {
  const labeled = text.match(/Position:\s*(Yes|No|Conditional)/i);
  if (labeled) return normalizeVote(labeled[1]);

  const tail = text.slice(-280).toLowerCase();

  if (
    /\b(i('| a)?m against|i oppose|i('| would)? (can'?t|cannot) support|i'?d vote no|vote no|recommend against|not ready to approve|we should (wait|defer|pause))\b/.test(
      tail,
    )
  ) {
    return "no";
  }
  if (
    /\b(i support|i'?m (in favor|for this)|i'?d vote yes|vote yes|ready to (approve|move forward)|let'?s (proceed|do this)|i recommend (we|proceeding|moving))\b/.test(
      tail,
    ) &&
    !/\b(only if|provided that|conditional|pending)\b/.test(tail)
  ) {
    return "yes";
  }
  if (
    /\b(conditional|only if|provided that|pending|not until|once we|if (marcus|priya|david|elena)|with (a |the )?(phased|staffing|budget|runway)|support.{0,40}if)\b/.test(
      tail,
    )
  ) {
    return "conditional";
  }

  return null;
}

function computeVoteBreakdown(votes: Record<PersonaId, VoteStance>): VoteBreakdown {
  let yes = 0;
  let no = 0;
  let conditional = 0;
  for (const id of PERSONA_IDS) {
    const v = votes[id];
    if (v === "yes") yes++;
    else if (v === "no") no++;
    else conditional++;
  }
  const total = yes + no + conditional || 1;
  const yes_pct = Math.round((yes / total) * 100);
  const no_pct = Math.round((no / total) * 100);
  const conditional_pct = Math.round((conditional / total) * 100);

  let lean: VoteStance | "split" = "split";
  const max = Math.max(yes, no, conditional);
  if (max === yes && yes > no && yes > conditional) lean = "yes";
  else if (max === no && no > yes && no > conditional) lean = "no";
  else if (max === conditional && conditional >= yes && conditional >= no) lean = "conditional";

  const tally = `${yes_pct}% Yes · ${conditional_pct}% Conditional · ${no_pct}% No (${yes}Y / ${conditional}C / ${no}N)`;

  return {
    yes_pct,
    no_pct,
    conditional_pct,
    counts: { yes, no, conditional },
    lean,
    tally,
  };
}

async function simulateStreamDeltas(
  text: string,
  personaId: PersonaId,
  enqueue: Enqueue,
): Promise<void> {
  const words = text.split(/(\s+)/);
  for (const chunk of words) {
    if (!chunk) continue;
    enqueue({ type: "delta", persona: personaId, text: chunk });
    await new Promise((r) => setTimeout(r, 14));
  }
}

async function autoToolsForPersona(
  personaId: PersonaId,
  question: string,
  ctx: ToolContext,
  enqueue: Enqueue,
): Promise<string> {
  const parts: string[] = [];
  const keywords = extractQuestionKeywords(question);

  if (personaId === "marcus" || personaId === "david") {
    enqueue({ type: "tool", persona: personaId, tool: "get_financial_snapshot", args: {} });
    const fin = await executeTool("get_financial_snapshot", {}, ctx);
    parts.push(`FINANCIAL DATA (live DB):\n${JSON.stringify(fin, null, 2)}`);
  }
  if (personaId === "priya" || personaId === "elena") {
    enqueue({ type: "tool", persona: personaId, tool: "get_program_metrics", args: {} });
    const prog = await executeTool("get_program_metrics", {}, ctx);
    parts.push(`PROGRAM METRICS (live DB):\n${JSON.stringify(prog, null, 2)}`);
  }
  if (personaId === "elena" || personaId === "david") {
    enqueue({ type: "tool", persona: personaId, tool: "search_org_knowledge", args: { query: keywords } });
    const kb = await executeTool("search_org_knowledge", { query: keywords }, ctx);
    parts.push(`KNOWLEDGE BASE (query: "${keywords}"):\n${JSON.stringify(kb, null, 2)}`);
  }
  return parts.join("\n\n");
}

async function runPersonaTurn(
  supabase: ReturnType<typeof makeServiceClient>,
  persona: Persona,
  question: string,
  transcript: Turn[],
  ctx: ToolContext,
  orgBrief: string,
  enqueue: Enqueue,
): Promise<string> {
  const toolContext = await autoToolsForPersona(persona.id, question, ctx, enqueue);

  const userContent = [
    `BOARD QUESTION:\n${question}`,
    `ORG DATA (use these real numbers — do not invent):\n${orgBrief}`,
    toolContext ? `ROLE-SPECIFIC DATA PULL:\n${toolContext}` : "",
    `DISCUSSION SO FAR:\n${transcriptForPrompt(transcript)}`,
    "It is now your turn. One natural paragraph — speak like a human board member. Use real org numbers in context.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await chatCompletion(supabase, {
    model: MODEL,
    messages: [
      { role: "system", content: persona.prompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 400,
    temperature: 0.72,
  });

  const full = (result.content ?? "").trim();
  await simulateStreamDeltas(full, persona.id, enqueue);
  return full;
}

function extractVotesFromTranscript(transcript: Turn[]): Record<PersonaId, VoteStance> {
  const votes = {} as Record<PersonaId, VoteStance>;
  for (const id of PERSONA_IDS) {
    const turn = [...transcript].reverse().find((t) => t.persona === id);
    votes[id] = turn ? (parsePositionFromTurn(turn.text) ?? "conditional") : "conditional";
  }
  return votes;
}

async function generateFinalMemo(
  supabase: ReturnType<typeof makeServiceClient>,
  question: string,
  transcript: Turn[],
  orgBrief: string,
): Promise<BoardroomFinalDoc> {
  const parsedVotes = extractVotesFromTranscript(transcript);
  const breakdown = computeVoteBreakdown(parsedVotes);

  const result = await chatCompletion(supabase, {
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are the board meeting secretary. Synthesize the debate into a comprehensive decision package. Return ONLY valid minified JSON — no prose, no code fences.",
      },
      {
        role: "user",
        content: `BOARD QUESTION:\n${question}\n\nORG DATA USED IN DEBATE:\n${orgBrief.slice(0, 3000)}\n\nDEBATE TRANSCRIPT:\n${transcriptForPrompt(transcript)}\n\nPARSED VOTES: ${JSON.stringify(parsedVotes)}\nVOTE BREAKDOWN: ${JSON.stringify(breakdown)}\n\nReturn JSON with this exact shape:\n{\n  "persona_votes": {\n    "elena": {"vote":"yes|no|conditional","rationale":"1-2 sentences citing their data-backed view"},\n    "marcus": {"vote":"yes|no|conditional","rationale":"..."},\n    "david": {"vote":"yes|no|conditional","rationale":"..."},\n    "priya": {"vote":"yes|no|conditional","rationale":"..."}\n  },\n  "memo": "4-6 sentence executive recommendation synthesizing all views with specific numbers from the data",\n  "analysis": {\n    "financial": "2-3 sentences on financial implications with cited numbers",\n    "programs": "2-3 sentences on program/community impact with cited numbers",\n    "growth": "2-3 sentences on growth/pipeline implications",\n    "governance": "2-3 sentences on mission/governance alignment",\n    "summary": "2 sentences — the full picture for the chair, no open questions left"\n  },\n  "conditions": ["specific prerequisite 1 if conditional support", "prerequisite 2"],\n  "chair_guidance": "Clear actionable guidance: Approve / Reject / Approve with conditions — and what the chair should decide",\n  "data_used": ["fact 1 from org data", "fact 2", "fact 3"],\n  "risks": ["specific risk 1", "risk 2", "risk 3"],\n  "dissent": "one sentence on strongest dissenting view or empty string"\n}\n\nUse the parsed votes as baseline but refine rationale from transcript. Conditions array should be empty if unanimous yes/no.`,
      },
    ],
    max_tokens: 1200,
    temperature: 0.25,
  });

  const text = (result.content ?? "").trim();
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/m, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as Partial<BoardroomFinalDoc>;
    const personaVotes = mergePersonaVotes(parsed.persona_votes, parsedVotes, transcript);
    const finalVotes = {} as Record<PersonaId, VoteStance>;
    for (const id of PERSONA_IDS) {
      finalVotes[id] = personaVotes[id]?.vote ?? parsedVotes[id];
    }
    const finalBreakdown = computeVoteBreakdown(finalVotes);

    const voteRecord: Record<string, string> = {
      elena: finalVotes.elena,
      marcus: finalVotes.marcus,
      david: finalVotes.david,
      priya: finalVotes.priya,
      tally: finalBreakdown.tally,
      yes_pct: String(finalBreakdown.yes_pct),
      no_pct: String(finalBreakdown.no_pct),
      conditional_pct: String(finalBreakdown.conditional_pct),
      lean: finalBreakdown.lean,
    };

    return {
      vote: voteRecord,
      vote_breakdown: finalBreakdown,
      persona_votes: personaVotes,
      memo: String(parsed.memo ?? "").slice(0, 1200),
      analysis: {
        financial: String(parsed.analysis?.financial ?? ""),
        programs: String(parsed.analysis?.programs ?? ""),
        growth: String(parsed.analysis?.growth ?? ""),
        governance: String(parsed.analysis?.governance ?? ""),
        summary: String(parsed.analysis?.summary ?? ""),
      },
      conditions: Array.isArray(parsed.conditions)
        ? parsed.conditions.filter((c): c is string => typeof c === "string").slice(0, 8)
        : [],
      chair_guidance: String(parsed.chair_guidance ?? ""),
      data_used: Array.isArray(parsed.data_used)
        ? parsed.data_used.filter((d): d is string => typeof d === "string").slice(0, 10)
        : [],
      risks: Array.isArray(parsed.risks)
        ? parsed.risks.filter((r): r is string => typeof r === "string").slice(0, 6)
        : [],
      dissent: String(parsed.dissent ?? ""),
    };
  } catch {
    const personaVotes = buildFallbackPersonaVotes(parsedVotes, transcript);
    const voteRecord: Record<string, string> = {
      elena: parsedVotes.elena,
      marcus: parsedVotes.marcus,
      david: parsedVotes.david,
      priya: parsedVotes.priya,
      tally: breakdown.tally,
      yes_pct: String(breakdown.yes_pct),
      no_pct: String(breakdown.no_pct),
      conditional_pct: String(breakdown.conditional_pct),
      lean: breakdown.lean,
    };
    return {
      vote: voteRecord,
      vote_breakdown: breakdown,
      persona_votes: personaVotes,
      memo: text.slice(0, 800) || "The board reached a mixed view. Review individual positions below.",
      analysis: {
        financial: "",
        programs: "",
        growth: "",
        governance: "",
        summary: "",
      },
      conditions: [],
      chair_guidance: breakdown.lean === "conditional"
        ? "Board leans conditional — approve only if listed conditions are met."
        : breakdown.lean === "yes"
          ? "Board majority supports proceeding."
          : breakdown.lean === "no"
            ? "Board majority recommends deferring or rejecting."
            : "Board is split — chair should weigh dissent and conditions before deciding.",
      data_used: [],
      risks: [],
      dissent: "",
    };
  }
}

function mergePersonaVotes(
  fromAi: Partial<Record<PersonaId, PersonaVoteDetail>> | undefined,
  parsed: Record<PersonaId, VoteStance>,
  transcript: Turn[],
): Record<PersonaId, PersonaVoteDetail> {
  const out = {} as Record<PersonaId, PersonaVoteDetail>;
  for (const id of PERSONA_IDS) {
    const aiVote = fromAi?.[id];
    const vote = aiVote?.vote ? normalizeVote(aiVote.vote) : parsed[id];
    const turn = transcript.find((t) => t.persona === id);
    const rationale = aiVote?.rationale?.trim()
      || turn?.text?.slice(0, 280).trim()
      || `Position: ${vote}`;
    out[id] = { vote, rationale };
  }
  return out;
}

function buildFallbackPersonaVotes(
  parsed: Record<PersonaId, VoteStance>,
  transcript: Turn[],
): Record<PersonaId, PersonaVoteDetail> {
  const out = {} as Record<PersonaId, PersonaVoteDetail>;
  for (const id of PERSONA_IDS) {
    const turn = transcript.find((t) => t.persona === id);
    out[id] = {
      vote: parsed[id],
      rationale: turn?.text?.slice(0, 280).trim() || `Position: ${parsed[id]}`,
    };
  }
  return out;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return handleCorsPreflight(origin);
  const cors = getCorsHeaders(origin);

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const question = String(body?.question ?? "").trim();
  if (!question || question.length > 600) {
    return new Response(JSON.stringify({ error: "question required (max 600 chars)" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const supabase = makeServiceClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  let sessionId: string | null = null;
  const { data: session, error: sessErr } = await supabase
    .from("boardroom_sessions")
    .insert({ user_id: userId, question, transcript: [], status: "running" })
    .select("id")
    .single();

  if (!sessErr && session?.id) {
    sessionId = session.id;
  }

  const ctx: ToolContext = { supabase, userId };
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue: Enqueue = (obj) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        enqueue({ type: "session", session_id: sessionId });

        const orgBrief = await buildOrgBrief(ctx, question);
        const transcript: Turn[] = [];

        for (let round = 0; round < ROUNDS; round++) {
          for (const pid of TURN_ORDER) {
            const persona = PERSONAS.find((p) => p.id === pid)!;
            enqueue({ type: "turn_start", persona: pid, round });
            const text = await runPersonaTurn(
              supabase,
              persona,
              question,
              transcript,
              ctx,
              orgBrief,
              enqueue,
            );
            transcript.push({ persona: pid, text });
            enqueue({ type: "turn_end", persona: pid, full_text: text });
          }
        }

        const finalDoc = await generateFinalMemo(supabase, question, transcript, orgBrief);
        enqueue({ type: "final", ...finalDoc });

        if (sessionId) {
          const completePayload = {
            transcript: transcript as unknown as Record<string, unknown>[],
            vote: {
              ...finalDoc.vote,
              persona_votes: finalDoc.persona_votes,
              vote_breakdown: finalDoc.vote_breakdown,
              analysis: finalDoc.analysis,
              conditions: finalDoc.conditions,
              chair_guidance: finalDoc.chair_guidance,
              data_used: finalDoc.data_used,
            },
            memo: finalDoc.memo,
            risks: finalDoc.risks,
            dissent: finalDoc.dissent,
            status: "complete",
            source: "live",
            completed_at: new Date().toISOString(),
          };
          const { error: updateErr } = await supabase
            .from("boardroom_sessions")
            .update(completePayload)
            .eq("id", sessionId);
          if (updateErr) {
            console.error("boardroom session update failed:", updateErr.message);
          }
        }
      } catch (e) {
        const message = friendlyAiError(e);
        enqueue({ type: "error", message });
        if (sessionId) {
          await supabase.from("boardroom_sessions").update({ status: "error" }).eq("id", sessionId);
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...cors,
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
});

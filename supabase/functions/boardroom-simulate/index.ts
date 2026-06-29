// Boardroom Simulator — multi-persona debate orchestrator with NDJSON streaming.
// Uses ai-provider-routing (OpenAI / Lovable / configured models), not Lovable-only.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { chatCompletion } from "../_shared/ai-provider-routing.ts";
import { PERSONAS, TURN_ORDER, type Persona, type PersonaId } from "./personas.ts";
import { executeTool, makeServiceClient, type ToolContext } from "./tools.ts";

const MODEL = "google/gemini-3-flash-preview";
/** Hackathon default: 1 round (4 turns). Set BOARDROOM_ROUNDS=2 for full debate. */
const ROUNDS = Math.min(2, Math.max(1, parseInt(Deno.env.get("BOARDROOM_ROUNDS") ?? "1", 10) || 1));

interface Turn {
  persona: PersonaId;
  text: string;
}

type Enqueue = (obj: unknown) => void;

function transcriptForPrompt(transcript: Turn[]): string {
  if (transcript.length === 0) return "(no prior turns — you are opening)";
  return transcript
    .map((t) => {
      const p = PERSONAS.find((x) => x.id === t.persona)!;
      return `${p.name} (${p.role}): ${t.text}`;
    })
    .join("\n\n");
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

async function simulateStreamDeltas(
  text: string,
  personaId: PersonaId,
  enqueue: Enqueue,
): Promise<void> {
  const words = text.split(/(\s+)/);
  for (const chunk of words) {
    if (!chunk) continue;
    enqueue({ type: "delta", persona: personaId, text: chunk });
    await new Promise((r) => setTimeout(r, 18));
  }
}

async function autoToolsForPersona(
  personaId: PersonaId,
  ctx: ToolContext,
  enqueue: Enqueue,
): Promise<string> {
  const parts: string[] = [];
  if (personaId === "marcus") {
    enqueue({ type: "tool", persona: personaId, tool: "get_financial_snapshot", args: {} });
    const fin = await executeTool("get_financial_snapshot", {}, ctx);
    parts.push(`FINANCIAL DATA (from live DB):\n${JSON.stringify(fin, null, 2)}`);
  }
  if (personaId === "priya") {
    enqueue({ type: "tool", persona: personaId, tool: "get_program_metrics", args: {} });
    const prog = await executeTool("get_program_metrics", {}, ctx);
    parts.push(`PROGRAM METRICS (from live DB):\n${JSON.stringify(prog, null, 2)}`);
  }
  if (personaId === "elena") {
    enqueue({ type: "tool", persona: personaId, tool: "search_org_knowledge", args: { query: "mission charter governance" } });
    const kb = await executeTool("search_org_knowledge", { query: "mission charter governance" }, ctx);
    parts.push(`KNOWLEDGE BASE:\n${JSON.stringify(kb, null, 2)}`);
  }
  return parts.join("\n\n");
}

async function runPersonaTurn(
  supabase: ReturnType<typeof makeServiceClient>,
  persona: Persona,
  question: string,
  transcript: Turn[],
  ctx: ToolContext,
  orgContext: string,
  enqueue: Enqueue,
): Promise<string> {
  const toolContext = await autoToolsForPersona(persona.id, ctx, enqueue);

  const userContent = [
    `BOARD QUESTION:\n${question}`,
    orgContext ? `ORG SNAPSHOT:\n${orgContext}` : "",
    toolContext,
    `DISCUSSION SO FAR:\n${transcriptForPrompt(transcript)}`,
    "It is now your turn to speak. Stay in character. Plain prose only, under 90 words.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await chatCompletion(supabase, {
    model: MODEL,
    messages: [
      { role: "system", content: persona.prompt },
      { role: "user", content: userContent },
    ],
    max_tokens: 350,
    temperature: 0.75,
  });

  const full = (result.content ?? "").trim();
  await simulateStreamDeltas(full, persona.id, enqueue);
  return full;
}

async function generateFinalMemo(
  supabase: ReturnType<typeof makeServiceClient>,
  question: string,
  transcript: Turn[],
): Promise<{ vote: Record<string, string>; memo: string; risks: string[]; dissent: string }> {
  const result = await chatCompletion(supabase, {
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are the meeting secretary. From the board debate transcript, produce a one-page decision memo. Return ONLY valid minified JSON, no prose, no code fences.",
      },
      {
        role: "user",
        content: `BOARD QUESTION:\n${question}\n\nDEBATE TRANSCRIPT:\n${transcriptForPrompt(transcript)}\n\nReturn JSON with this exact shape:\n{\n  "vote": {"elena":"yes|no|conditional","marcus":"yes|no|conditional","david":"yes|no|conditional","priya":"yes|no|conditional","tally":"e.g. 3 Yes / 1 Conditional"},\n  "memo": "3-5 sentence executive recommendation, plain prose",\n  "risks": ["risk 1", "risk 2", "risk 3"],\n  "dissent": "one sentence summarizing the dissenting view, or empty string"\n}`,
      },
    ],
    max_tokens: 700,
    temperature: 0.3,
  });

  const text = (result.content ?? "").trim();
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/m, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      vote: {
        elena: "conditional",
        marcus: "conditional",
        david: "conditional",
        priya: "conditional",
        tally: "Inconclusive",
      },
      memo: text.slice(0, 600),
      risks: [],
      dissent: "",
    };
  }
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

        const [finSnap, progSnap] = await Promise.all([
          executeTool("get_financial_snapshot", {}, ctx),
          executeTool("get_program_metrics", {}, ctx),
        ]);
        const orgContext = `YTD raised: $${(finSnap as { year_to_date?: { total_raised_usd?: number } })?.year_to_date?.total_raised_usd ?? 0}; active members: ${(progSnap as { active_members?: number })?.active_members ?? 0}; volunteers: ${(progSnap as { volunteer_count?: number })?.volunteer_count ?? 0}`;

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
              orgContext,
              enqueue,
            );
            transcript.push({ persona: pid, text });
            enqueue({ type: "turn_end", persona: pid, full_text: text });
          }
        }

        const finalDoc = await generateFinalMemo(supabase, question, transcript);
        enqueue({ type: "final", ...finalDoc });

        if (sessionId) {
          await supabase
            .from("boardroom_sessions")
            .update({
              transcript: transcript as unknown as Record<string, unknown>[],
              vote: finalDoc.vote,
              memo: finalDoc.memo,
              risks: finalDoc.risks,
              dissent: finalDoc.dissent,
              status: "complete",
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionId);
        }
      } catch (e) {
        const message = friendlyAiError(e);
        enqueue({ type: "error", message });
        if (sessionId) {
          await supabase
            .from("boardroom_sessions")
            .update({ status: "error", updated_at: new Date().toISOString() })
            .eq("id", sessionId);
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

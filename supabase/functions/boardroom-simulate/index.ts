// Boardroom Simulator — multi-persona debate orchestrator with streaming.
// Streams NDJSON events to the client, one JSON object per line:
//   { type: "session", session_id }
//   { type: "turn_start", persona }
//   { type: "tool", persona, tool, args }
//   { type: "delta", persona, text }
//   { type: "turn_end", persona, full_text }
//   { type: "final", vote, memo, risks, dissent }
//   { type: "error", message }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCorsPreflight } from "../_shared/cors.ts";
import { PERSONAS, TURN_ORDER, type Persona, type PersonaId } from "./personas.ts";
import { TOOL_DEFS, executeTool, makeServiceClient, type ToolContext } from "./tools.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const ROUNDS = 2;

interface Turn {
  persona: PersonaId;
  text: string;
}

async function callGateway(body: unknown): Promise<Response> {
  return await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY") ?? "",
    },
    body: JSON.stringify(body),
  });
}

function transcriptForPrompt(transcript: Turn[]): string {
  if (transcript.length === 0) return "(no prior turns — you are opening)";
  return transcript
    .map((t) => {
      const p = PERSONAS.find((x) => x.id === t.persona)!;
      return `${p.name} (${p.role}): ${t.text}`;
    })
    .join("\n\n");
}

async function runPersonaTurn(
  persona: Persona,
  question: string,
  transcript: Turn[],
  ctx: ToolContext,
  enqueue: (obj: unknown) => void,
): Promise<string> {
  // First pass: maybe tool calls.
  const messages: any[] = [
    { role: "system", content: persona.prompt },
    {
      role: "user",
      content: `BOARD QUESTION:\n${question}\n\nDISCUSSION SO FAR:\n${transcriptForPrompt(transcript)}\n\nIt is now your turn to speak. Stay in character.`,
    },
  ];

  // Up to 2 tool-call rounds, then a final streaming response.
  for (let i = 0; i < 2; i++) {
    const res = await callGateway({
      model: MODEL,
      messages,
      tools: TOOL_DEFS,
      tool_choice: "auto",
      max_tokens: 400,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`gateway ${res.status}: ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    if (!msg) throw new Error("no choice from gateway");

    const toolCalls = msg.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      // We got direct text — but we wanted streaming. Fall through to streamed call.
      break;
    }

    messages.push(msg);
    for (const call of toolCalls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch { /* ignore */ }
      enqueue({ type: "tool", persona: persona.id, tool: call.function.name, args });
      const result = await executeTool(call.function.name, args, ctx);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  // Streaming final answer.
  const streamRes = await callGateway({
    model: MODEL,
    messages: [
      ...messages,
      { role: "system", content: "Now deliver your spoken turn. Plain prose only. No markdown. Under 90 words." },
    ],
    max_tokens: 350,
    stream: true,
  });

  if (!streamRes.ok || !streamRes.body) {
    const errText = await streamRes.text();
    throw new Error(`stream gateway ${streamRes.status}: ${errText.slice(0, 200)}`);
  }

  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        const delta = evt.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          full += delta;
          enqueue({ type: "delta", persona: persona.id, text: delta });
        }
      } catch { /* ignore */ }
    }
  }
  return full.trim();
}

async function generateFinalMemo(
  question: string,
  transcript: Turn[],
): Promise<{ vote: any; memo: string; risks: string[]; dissent: string }> {
  const res = await callGateway({
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
  });
  if (!res.ok) throw new Error(`memo gateway ${res.status}`);
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      vote: { elena: "conditional", marcus: "conditional", david: "conditional", priya: "conditional", tally: "Inconclusive" },
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

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid JSON" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const question = String(body?.question ?? "").trim();
  if (!question || question.length > 600) {
    return new Response(JSON.stringify({ error: "question required (max 600 chars)" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Auth: get user from JWT.
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const supabase = makeServiceClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  // Create session row up front.
  const { data: session, error: sessErr } = await supabase
    .from("boardroom_sessions")
    .insert({ user_id: userId, question, transcript: [], status: "running" })
    .select("id")
    .single();
  if (sessErr || !session) {
    return new Response(JSON.stringify({ error: `session insert failed: ${sessErr?.message}` }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const sessionId = session.id;

  const ctx: ToolContext = { supabase, userId };
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      try {
        enqueue({ type: "session", session_id: sessionId });
        const transcript: Turn[] = [];

        for (let round = 0; round < ROUNDS; round++) {
          for (const pid of TURN_ORDER) {
            const persona = PERSONAS.find((p) => p.id === pid)!;
            enqueue({ type: "turn_start", persona: pid, round });
            const text = await runPersonaTurn(persona, question, transcript, ctx, enqueue);
            transcript.push({ persona: pid, text });
            enqueue({ type: "turn_end", persona: pid, full_text: text });
          }
        }

        const finalDoc = await generateFinalMemo(question, transcript);
        enqueue({ type: "final", ...finalDoc });

        await supabase
          .from("boardroom_sessions")
          .update({
            transcript: transcript as any,
            vote: finalDoc.vote,
            memo: finalDoc.memo,
            risks: finalDoc.risks as any,
            dissent: finalDoc.dissent,
            status: "complete",
          })
          .eq("id", sessionId);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        enqueue({ type: "error", message });
        await supabase.from("boardroom_sessions").update({ status: "error" }).eq("id", sessionId);
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

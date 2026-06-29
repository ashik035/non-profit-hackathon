import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PersonaId = "elena" | "marcus" | "david" | "priya";

export interface ToolEvent {
  persona: PersonaId;
  tool: string;
  args: Record<string, unknown>;
  at: number;
}

export interface PersonaTurn {
  persona: PersonaId;
  round: number;
  text: string;
  status: "speaking" | "done";
  tools: ToolEvent[];
}

export interface BoardroomFinal {
  vote: Record<string, string> & { tally?: string };
  memo: string;
  risks: string[];
  dissent: string;
}

export interface BoardroomState {
  sessionId: string | null;
  status: "idle" | "running" | "complete" | "error";
  question: string;
  turns: PersonaTurn[];
  activePersona: PersonaId | null;
  final: BoardroomFinal | null;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const INITIAL: BoardroomState = {
  sessionId: null,
  status: "idle",
  question: "",
  turns: [],
  activePersona: null,
  final: null,
  error: null,
};

export function useBoardroom() {
  const [state, setState] = useState<BoardroomState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const startSimulation = useCallback(async (question: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...INITIAL, question, status: "running" });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("You must be signed in.");

      const res = await fetch(`${SUPABASE_URL}/functions/v1/boardroom-simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(`Simulation failed (${res.status}): ${text.slice(0, 200)}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          let evt: any;
          try { evt = JSON.parse(line); } catch { continue; }
          applyEvent(setState, evt);
        }
      }
    } catch (e: unknown) {
      if ((e as Error)?.name === "AbortError") return;
      const message = e instanceof Error ? e.message : String(e);
      setState((s) => ({ ...s, status: "error", error: message }));
    }
  }, []);

  return { state, startSimulation, reset };
}

function applyEvent(
  setState: React.Dispatch<React.SetStateAction<BoardroomState>>,
  evt: any,
) {
  setState((s) => {
    switch (evt.type) {
      case "session":
        return { ...s, sessionId: evt.session_id };
      case "turn_start":
        return {
          ...s,
          activePersona: evt.persona,
          turns: [
            ...s.turns,
            { persona: evt.persona, round: evt.round ?? 0, text: "", status: "speaking", tools: [] },
          ],
        };
      case "tool": {
        const turns = [...s.turns];
        const idx = lastIndex(turns, evt.persona);
        if (idx >= 0) {
          turns[idx] = {
            ...turns[idx],
            tools: [...turns[idx].tools, { persona: evt.persona, tool: evt.tool, args: evt.args ?? {}, at: Date.now() }],
          };
        }
        return { ...s, turns };
      }
      case "delta": {
        const turns = [...s.turns];
        const idx = lastIndex(turns, evt.persona);
        if (idx >= 0) {
          turns[idx] = { ...turns[idx], text: turns[idx].text + evt.text };
        }
        return { ...s, turns };
      }
      case "turn_end": {
        const turns = [...s.turns];
        const idx = lastIndex(turns, evt.persona);
        if (idx >= 0) {
          turns[idx] = { ...turns[idx], text: evt.full_text ?? turns[idx].text, status: "done" };
        }
        return { ...s, turns, activePersona: null };
      }
      case "final":
        return {
          ...s,
          status: "complete",
          activePersona: null,
          final: { vote: evt.vote, memo: evt.memo, risks: evt.risks ?? [], dissent: evt.dissent ?? "" },
        };
      case "error":
        return { ...s, status: "error", error: evt.message ?? "Unknown error" };
      default:
        return s;
    }
  });
}

function lastIndex(turns: PersonaTurn[], persona: PersonaId): number {
  for (let i = turns.length - 1; i >= 0; i--) if (turns[i].persona === persona) return i;
  return -1;
}

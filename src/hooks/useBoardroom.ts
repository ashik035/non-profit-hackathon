import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  buildTurnsFromFallback,
  getBoardroomFallbackEvents,
} from "@/lib/boardroomFallback";

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
  usedFallback: boolean;
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
  usedFallback: false,
};

export function useBoardroom() {
  const [state, setState] = useState<BoardroomState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const runFallback = useCallback(async (question: string) => {
    const events = getBoardroomFallbackEvents(question);
    for (const evt of events) {
      await new Promise((r) => setTimeout(r, evt.type === "delta" ? 12 : evt.type === "turn_start" ? 200 : 40));
      applyEvent(setState, evt);
    }
    setState((s) => ({ ...s, status: "complete", usedFallback: true, activePersona: null }));
  }, []);

  const startSimulation = useCallback(
    async (question: string) => {
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
          const isAiOrServer =
            res.status >= 500 ||
            res.status === 402 ||
            res.status === 429 ||
            text.toLowerCase().includes("credit") ||
            text.toLowerCase().includes("gateway");
          if (isAiOrServer) {
            await runFallback(question);
            return;
          }
          throw new Error(`Simulation failed (${res.status}): ${text.slice(0, 200)}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let gotContent = false;
        let streamError: string | null = null;
        let gotFinal = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const raw of lines) {
            const line = raw.trim();
            if (!line) continue;
            let evt: Record<string, unknown>;
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "error") {
              streamError = String(evt.message ?? "AI unavailable");
              break;
            }
            if (evt.type === "delta" || evt.type === "turn_end" || evt.type === "final") {
              gotContent = true;
            }
            applyEvent(setState, evt);
            if (evt.type === "final") {
              gotFinal = true;
              break;
            }
          }
          if (streamError || gotFinal) break;
        }

        if (streamError) {
          await runFallback(question);
          return;
        }

        if (buffer.trim()) {
          try {
            applyEvent(setState, JSON.parse(buffer.trim()));
            gotContent = true;
          } catch {
            /* ignore partial line */
          }
        }

        setState((s) => {
          if (s.status === "running" && s.final) {
            return { ...s, status: "complete", activePersona: null };
          }
          if (s.status === "running" && !gotContent) {
            return s;
          }
          return s.status === "running" ? { ...s, status: "complete", activePersona: null } : s;
        });
      } catch (e: unknown) {
        if ((e as Error)?.name === "AbortError") return;
        const message = e instanceof Error ? e.message : String(e);
        const useFallback =
          message.toLowerCase().includes("fetch") ||
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("failed") ||
          message.toLowerCase().includes("credit");
        if (useFallback) {
          const { turns, final } = buildTurnsFromFallback(question);
          setState({
            sessionId: null,
            status: "complete",
            question,
            turns,
            activePersona: null,
            final,
            error: null,
            usedFallback: true,
          });
          return;
        }
        setState((s) => ({ ...s, status: "error", error: message }));
      }
    },
    [runFallback],
  );

  return { state, startSimulation, reset };
}

function applyEvent(
  setState: React.Dispatch<React.SetStateAction<BoardroomState>>,
  evt: Record<string, unknown>,
) {
  setState((s) => {
    switch (evt.type) {
      case "session":
        return { ...s, sessionId: (evt.session_id as string | null) ?? null };
      case "turn_start":
        return {
          ...s,
          activePersona: evt.persona as PersonaId,
          turns: [
            ...s.turns,
            {
              persona: evt.persona as PersonaId,
              round: (evt.round as number) ?? 0,
              text: "",
              status: "speaking",
              tools: [],
            },
          ],
        };
      case "tool": {
        const turns = [...s.turns];
        const idx = lastIndex(turns, evt.persona as PersonaId);
        if (idx >= 0) {
          turns[idx] = {
            ...turns[idx],
            tools: [
              ...turns[idx].tools,
              {
                persona: evt.persona as PersonaId,
                tool: evt.tool as string,
                args: (evt.args as Record<string, unknown>) ?? {},
                at: Date.now(),
              },
            ],
          };
        }
        return { ...s, turns };
      }
      case "delta": {
        const turns = [...s.turns];
        const idx = lastIndex(turns, evt.persona as PersonaId);
        if (idx >= 0) {
          turns[idx] = { ...turns[idx], text: turns[idx].text + (evt.text as string) };
        }
        return { ...s, turns };
      }
      case "turn_end": {
        const turns = [...s.turns];
        const idx = lastIndex(turns, evt.persona as PersonaId);
        if (idx >= 0) {
          turns[idx] = {
            ...turns[idx],
            text: (evt.full_text as string) ?? turns[idx].text,
            status: "done",
          };
        }
        return { ...s, turns, activePersona: null };
      }
      case "final":
        return {
          ...s,
          status: "complete",
          activePersona: null,
          final: {
            vote: evt.vote as BoardroomFinal["vote"],
            memo: evt.memo as string,
            risks: (evt.risks as string[]) ?? [],
            dissent: (evt.dissent as string) ?? "",
          },
        };
      case "error":
        return { ...s, status: "error", error: (evt.message as string) ?? "Unknown error" };
      default:
        return s;
    }
  });
}

function lastIndex(turns: PersonaTurn[], persona: PersonaId): number {
  for (let i = turns.length - 1; i >= 0; i--) if (turns[i].persona === persona) return i;
  return -1;
}

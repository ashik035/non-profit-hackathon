import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { invalidateKeys } from "@/lib/cache";
import { logActivity } from "@/lib/activity-logger";
import {
  buildSessionInsert,
  buildSessionUpdate,
  sessionRowToState,
  type BoardroomSessionRow,
} from "@/lib/boardroomSessionMapper";
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

export interface BoardroomAnalysis {
  financial: string;
  programs: string;
  growth: string;
  governance: string;
  summary: string;
}

export interface BoardroomFinal {
  vote: Record<string, string> & { tally?: string };
  vote_breakdown?: import("@/lib/boardroomVote").VoteBreakdown;
  persona_votes?: Partial<Record<PersonaId, import("@/lib/boardroomVote").PersonaVoteDetail>>;
  memo: string;
  analysis?: BoardroomAnalysis;
  conditions?: string[];
  chair_guidance?: string;
  data_used?: string[];
  risks: string[];
  dissent: string;
}

export type BoardroomViewMode = "live" | "history";

export interface BoardroomState {
  sessionId: string | null;
  status: "idle" | "running" | "complete" | "error";
  question: string;
  turns: PersonaTurn[];
  activePersona: PersonaId | null;
  final: BoardroomFinal | null;
  error: string | null;
  usedFallback: boolean;
  viewMode: BoardroomViewMode;
  viewedAt: string | null;
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
  viewMode: "live",
  viewedAt: null,
};

async function persistFallbackSession(
  userId: string,
  question: string,
  turns: PersonaTurn[],
  final: BoardroomFinal,
): Promise<string | null> {
  const row = buildSessionInsert(userId, { question, turns, final, usedFallback: true });
  const { data, error } = await supabase
    .from("boardroom_sessions")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    console.warn("Failed to save fallback boardroom session:", error.message);
    return null;
  }
  return data.id as string;
}

async function persistLiveSession(
  userId: string,
  sessionId: string,
  question: string,
  turns: PersonaTurn[],
  final: BoardroomFinal,
): Promise<boolean> {
  const row = buildSessionUpdate({ question, turns, final, usedFallback: false });
  const { error } = await supabase
    .from("boardroom_sessions")
    .update(row)
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.warn("Failed to sync live boardroom session:", error.message);
    return false;
  }
  return true;
}

export function useBoardroom() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<BoardroomState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const invalidateHistory = useCallback(() => {
    invalidateKeys.boardroomSessions(queryClient);
  }, [queryClient]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const hydrateSession = useCallback((row: BoardroomSessionRow) => {
    abortRef.current?.abort();
    abortRef.current = null;
    const hydrated = sessionRowToState(row);
    setState({
      ...hydrated,
      viewMode: "history",
      viewedAt: row.created_at,
    });
  }, []);

  const runFallback = useCallback(
    async (question: string) => {
      const events = getBoardroomFallbackEvents(question);
      for (const evt of events) {
        await new Promise((r) =>
          setTimeout(r, evt.type === "delta" ? 12 : evt.type === "turn_start" ? 200 : 40),
        );
        applyEvent(setState, evt);
      }

      const { turns, final } = buildTurnsFromFallback(question);
      let sessionId: string | null = null;
      if (user?.id) {
        sessionId = await persistFallbackSession(user.id, question, turns, final);
        if (sessionId) {
          invalidateHistory();
          void logActivity({
            action: "create",
            resourceType: "boardroom_session",
            resourceId: sessionId,
            details: { question: question.slice(0, 120), source: "fallback" },
          });
        }
      }

      setState({
        sessionId,
        status: "complete",
        question,
        turns,
        activePersona: null,
        final,
        error: null,
        usedFallback: true,
        viewMode: "live",
        viewedAt: null,
      });
    },
    [user?.id, invalidateHistory],
  );

  const startSimulation = useCallback(
    async (question: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        ...INITIAL,
        question,
        status: "running",
        viewMode: "live",
      });

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
        let capturedSessionId: string | null = null;
        let capturedTurns: PersonaTurn[] = [];
        let capturedFinal: BoardroomFinal | null = null;
        let currentRound = 0;

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
            if (evt.type === "session") {
              capturedSessionId = (evt.session_id as string | null) ?? null;
            }
            if (evt.type === "turn_start") {
              currentRound = (evt.round as number) ?? 0;
            }
            if (evt.type === "turn_end") {
              capturedTurns = [
                ...capturedTurns,
                {
                  persona: evt.persona as PersonaId,
                  round: currentRound,
                  text: String(evt.full_text ?? ""),
                  status: "done" as const,
                  tools: [],
                },
              ];
            }
            if (evt.type === "final") {
              capturedFinal = parseFinalEvent(evt);
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
            return { ...s, status: "complete", activePersona: null, viewMode: "live" };
          }
          if (s.status === "running" && !gotContent) {
            return s;
          }
          return s.status === "running"
            ? { ...s, status: "complete", activePersona: null, viewMode: "live" }
            : s;
        });

        if (gotContent && gotFinal && capturedFinal) {
          if (user?.id && capturedSessionId) {
            const saved = await persistLiveSession(
              user.id,
              capturedSessionId,
              question,
              capturedTurns,
              capturedFinal,
            );
            if (saved) {
              void logActivity({
                action: "update",
                resourceType: "boardroom_session",
                resourceId: capturedSessionId,
                details: { question: question.slice(0, 120), source: "live" },
              });
            }
          }
          invalidateHistory();
        }
      } catch (e: unknown) {
        if ((e as Error)?.name === "AbortError") return;
        const message = e instanceof Error ? e.message : String(e);
        const useFallback =
          message.toLowerCase().includes("fetch") ||
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("failed") ||
          message.toLowerCase().includes("credit");
        if (useFallback) {
          await runFallback(question);
          return;
        }
        setState((s) => ({ ...s, status: "error", error: message }));
      }
    },
    [runFallback, invalidateHistory, user?.id],
  );

  return { state, startSimulation, reset, hydrateSession };
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
          final: parseFinalEvent(evt),
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

function parseFinalEvent(evt: Record<string, unknown>): BoardroomFinal {
  const vote = (evt.vote as BoardroomFinal["vote"]) ?? { tally: "Unknown" };
  const analysisRaw = evt.analysis as Record<string, string> | undefined;

  return {
    vote,
    vote_breakdown: evt.vote_breakdown as BoardroomFinal["vote_breakdown"],
    persona_votes: evt.persona_votes as BoardroomFinal["persona_votes"],
    memo: String(evt.memo ?? ""),
    analysis: analysisRaw
      ? {
          financial: String(analysisRaw.financial ?? ""),
          programs: String(analysisRaw.programs ?? ""),
          growth: String(analysisRaw.growth ?? ""),
          governance: String(analysisRaw.governance ?? ""),
          summary: String(analysisRaw.summary ?? ""),
        }
      : undefined,
    conditions: Array.isArray(evt.conditions)
      ? evt.conditions.filter((c): c is string => typeof c === "string")
      : [],
    chair_guidance: String(evt.chair_guidance ?? ""),
    data_used: Array.isArray(evt.data_used)
      ? evt.data_used.filter((d): d is string => typeof d === "string")
      : [],
    risks: Array.isArray(evt.risks)
      ? evt.risks.filter((r): r is string => typeof r === "string")
      : [],
    dissent: String(evt.dissent ?? ""),
  };
}

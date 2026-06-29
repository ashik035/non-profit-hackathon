import type {
  BoardroomFinal,
  BoardroomState,
  PersonaId,
  PersonaTurn,
} from "@/hooks/useBoardroom";
import type { Database } from "@/integrations/supabase/types";

export type BoardroomSessionRow = Database["public"]["Tables"]["boardroom_sessions"]["Row"];

export type BoardroomSessionSummary = Pick<
  BoardroomSessionRow,
  "id" | "question" | "status" | "memo" | "vote" | "created_at" | "updated_at"
>;

interface StoredTranscriptTurn {
  persona?: string;
  text?: string;
  round?: number;
}

function parseVote(vote: BoardroomSessionRow["vote"]): BoardroomFinal["vote"] {
  if (!vote || typeof vote !== "object" || Array.isArray(vote)) {
    return { tally: "Unknown" };
  }
  return vote as BoardroomFinal["vote"];
}

function parseRisks(risks: BoardroomSessionRow["risks"]): string[] {
  if (!Array.isArray(risks)) return [];
  return risks.filter((r): r is string => typeof r === "string");
}

export function transcriptToTurns(transcript: BoardroomSessionRow["transcript"]): PersonaTurn[] {
  if (!Array.isArray(transcript)) return [];
  return transcript
    .filter((t): t is StoredTranscriptTurn => t != null && typeof t === "object")
    .map((t) => ({
      persona: (t.persona ?? "elena") as PersonaId,
      round: typeof t.round === "number" ? t.round : 0,
      text: String(t.text ?? ""),
      status: "done" as const,
      tools: [],
    }));
}

export function turnsToTranscript(turns: PersonaTurn[]): StoredTranscriptTurn[] {
  return turns.map((t) => ({
    persona: t.persona,
    text: t.text,
    round: t.round,
  }));
}

export function sessionRowToState(row: BoardroomSessionRow): BoardroomState {
  const vote = parseVote(row.vote);
  const final: BoardroomFinal | null =
    row.memo || row.vote
      ? {
          vote,
          memo: row.memo ?? "",
          risks: parseRisks(row.risks),
          dissent: row.dissent ?? "",
        }
      : null;

  return {
    sessionId: row.id,
    status: row.status === "complete" ? "complete" : row.status === "error" ? "error" : "complete",
    question: row.question,
    turns: transcriptToTurns(row.transcript),
    activePersona: null,
    final,
    error: row.status === "error" ? "Simulation ended with an error" : null,
    usedFallback: false,
  };
}

export interface SaveBoardroomSessionInput {
  question: string;
  turns: PersonaTurn[];
  final: BoardroomFinal;
  usedFallback?: boolean;
}

function sessionPayloadFromInput(input: SaveBoardroomSessionInput) {
  return {
    transcript: turnsToTranscript(input.turns) as unknown as Database["public"]["Tables"]["boardroom_sessions"]["Update"]["transcript"],
    vote: input.final.vote as unknown as Database["public"]["Tables"]["boardroom_sessions"]["Update"]["vote"],
    memo: input.final.memo,
    risks: input.final.risks as unknown as Database["public"]["Tables"]["boardroom_sessions"]["Update"]["risks"],
    dissent: input.final.dissent,
    status: "complete" as const,
    source: input.usedFallback ? "fallback" : "live",
    completed_at: new Date().toISOString(),
  };
}

export function buildSessionInsert(
  userId: string,
  input: SaveBoardroomSessionInput,
): Database["public"]["Tables"]["boardroom_sessions"]["Insert"] {
  return {
    user_id: userId,
    question: input.question,
    ...sessionPayloadFromInput(input),
  };
}

export function buildSessionUpdate(
  input: SaveBoardroomSessionInput,
): Database["public"]["Tables"]["boardroom_sessions"]["Update"] {
  return sessionPayloadFromInput(input);
}

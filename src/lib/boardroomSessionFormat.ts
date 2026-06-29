import { format } from "date-fns";
import type { BoardroomSessionRow } from "@/lib/boardroomSessionMapper";

type VoteJson = BoardroomSessionRow["vote"];

export function getVoteTally(vote: VoteJson): string {
  if (!vote || typeof vote !== "object" || Array.isArray(vote)) return "—";
  const tally = (vote as { tally?: string }).tally;
  if (typeof tally === "string" && tally.trim()) return tally.trim();
  return "—";
}

export function getMemoExcerpt(memo: string | null | undefined, max = 100): string {
  const text = (memo ?? "").trim();
  if (!text) return "No memo recorded";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function getTurnCount(transcript: BoardroomSessionRow["transcript"]): number {
  if (!Array.isArray(transcript)) return 0;
  return transcript.filter(
    (t) => t != null && typeof t === "object" && String((t as { text?: string }).text ?? "").trim(),
  ).length;
}

export function formatSessionStatus(status: string | null | undefined): {
  label: string;
  tone: "complete" | "error" | "running" | "unknown";
} {
  const s = (status ?? "").toLowerCase();
  if (s === "complete") return { label: "Complete", tone: "complete" };
  if (s === "error") return { label: "Error", tone: "error" };
  if (s === "running") return { label: "Incomplete", tone: "running" };
  return { label: status?.trim() || "Unknown", tone: "unknown" };
}

export function formatSessionDate(iso: string | null | undefined): string {
  if (!iso) return "Unknown date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function getListSubtitle(session: {
  vote?: VoteJson;
  memo?: string | null;
  transcript?: BoardroomSessionRow["transcript"];
}): string {
  const tally = getVoteTally(session.vote ?? null);
  if (tally !== "—") return `Vote: ${tally}`;
  const excerpt = getMemoExcerpt(session.memo, 80);
  if (excerpt !== "No memo recorded") return excerpt;
  const turns = getTurnCount(session.transcript ?? []);
  return turns > 0 ? `${turns} board turns` : "No transcript saved";
}

export function shortSessionId(id: string): string {
  if (!id) return "—";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

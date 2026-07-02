import type { PersonaId } from "@/hooks/useBoardroom";

export type VoteStance = "yes" | "no" | "conditional";

export interface VoteBreakdown {
  yes_pct: number;
  no_pct: number;
  conditional_pct: number;
  counts: { yes: number; no: number; conditional: number };
  lean: VoteStance | "split";
  tally: string;
}

export interface PersonaVoteDetail {
  vote: VoteStance;
  rationale: string;
}

const PERSONA_IDS: PersonaId[] = ["elena", "marcus", "david", "priya"];

function normalizeVote(raw: string): VoteStance {
  const v = raw.toLowerCase().trim();
  if (v.startsWith("yes")) return "yes";
  if (v.startsWith("no")) return "no";
  return "conditional";
}

/** Compute vote percentages from individual persona votes. */
export function computeVoteBreakdown(
  votes: Partial<Record<PersonaId | string, string>>,
): VoteBreakdown {
  let yes = 0;
  let no = 0;
  let conditional = 0;

  for (const id of PERSONA_IDS) {
    const v = normalizeVote(String(votes[id] ?? "conditional"));
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

  return { yes_pct, no_pct, conditional_pct, counts: { yes, no, conditional }, lean, tally };
}

/** Parse extended vote fields stored in vote jsonb. */
export function parseVoteBreakdown(vote: Record<string, string> | undefined): VoteBreakdown | null {
  if (!vote) return null;

  const yes_pct = parseInt(vote.yes_pct ?? "", 10);
  const no_pct = parseInt(vote.no_pct ?? "", 10);
  const conditional_pct = parseInt(vote.conditional_pct ?? "", 10);

  if (!Number.isNaN(yes_pct) && !Number.isNaN(no_pct) && !Number.isNaN(conditional_pct)) {
    const lean = (vote.lean as VoteStance | "split") ?? "split";
    return {
      yes_pct,
      no_pct,
      conditional_pct,
      counts: computeVoteBreakdown(vote).counts,
      lean,
      tally: vote.tally ?? `${yes_pct}% Yes · ${conditional_pct}% Conditional · ${no_pct}% No`,
    };
  }

  return computeVoteBreakdown(vote);
}

export const LEAN_LABEL: Record<VoteStance | "split", string> = {
  yes: "Board leans Yes",
  no: "Board leans No",
  conditional: "Board leans Conditional",
  split: "Board is split",
};

export const LEAN_GUIDANCE: Record<VoteStance | "split", string> = {
  yes: "Majority supports proceeding. Review risks before final approval.",
  no: "Majority recommends deferring or rejecting. Address dissenting growth views if revisiting.",
  conditional: "Support is conditional. Approve only when prerequisites below are met.",
  split: "No clear majority. Chair should weigh each domain analysis and conditions before deciding.",
};

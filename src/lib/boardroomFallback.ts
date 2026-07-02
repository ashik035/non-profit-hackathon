import type { BoardroomFinal, PersonaId, PersonaTurn } from "@/hooks/useBoardroom";
import { computeVoteBreakdown } from "@/lib/boardroomVote";

export const BOARDROOM_PREP_STORAGE_KEY = "boardroom_prep_memo";

export interface BoardroomPrepPayload {
  question: string;
  memo: string;
  vote: BoardroomFinal["vote"];
  risks: string[];
  dissent: string;
  savedAt: string;
}

/** Canned debate for demo when edge function / AI is unavailable */
export function getBoardroomFallbackEvents(question: string): Array<Record<string, unknown>> {
  const q = question || "Should we launch the youth mentorship program in Q3?";
  const turns: Array<{ persona: PersonaId; round: number; text: string }> = [
    {
      persona: "elena",
      round: 0,
      text:
        "Thank you, everyone. Our mission points toward stronger youth outcomes, but I want us honest about sequencing — with the active programs and member base we have today, we cannot treat this as a slide-deck exercise. Marcus, I need you on runway; Priya, I need you on whether staff can absorb this without breaking what's already working. I'm open to a careful Q3 start, but only if governance and community voice are in the room before we vote.",
    },
    {
      persona: "marcus",
      round: 0,
      text:
        "Elena, I pulled our numbers — YTD giving and the last ninety days tell me we're healthier than last year, but campaign goal progress still leaves a gap, and unrestricted cash is tighter once you carve out restricted grants. A full Q3 build-out isn't something I can sign off on; a capped pilot with monthly cash checkpoints is the fiscally responsible path. I'd support that version, not an open-ended launch.",
    },
    {
      persona: "david",
      round: 0,
      text:
        "Marcus, I hear you, but our pipeline and upcoming event registrants show real appetite — waiting six months costs us donor momentum and a fall appeal story. What if we pilot in one neighborhood, chase a corporate underwrite for year one, and use campaign completion rates to prove demand? The risk of standing still is invisible on the balance sheet but it's still real. I'm ready to move on a pilot now.",
    },
    {
      persona: "priya",
      round: 0,
      text:
        "David, members are asking for mentorship — I see that in our program load and volunteer hours — but our active programs are already running hot on budget utilization. If we launch, it has to come out of community co-design, not another decision made only around this table. Give me two member sessions and protected staff hours in the budget, and I can support a limited pilot; without that, I'd ask us to wait.",
    },
  ];

  const events: Array<Record<string, unknown>> = [
    { type: "session", session_id: null },
  ];

  for (const t of turns) {
    events.push({ type: "turn_start", persona: t.persona, round: t.round });
    if (t.persona === "marcus" || t.persona === "david") {
      events.push({ type: "tool", persona: t.persona, tool: "get_financial_snapshot", args: {} });
    }
    if (t.persona === "priya" || t.persona === "elena") {
      events.push({ type: "tool", persona: t.persona, tool: "get_program_metrics", args: {} });
    }
    if (t.persona === "elena" || t.persona === "david") {
      events.push({ type: "tool", persona: t.persona, tool: "search_org_knowledge", args: { query: "mission strategy" } });
    }
    for (const word of t.text.split(/(\s+)/)) {
      if (word) events.push({ type: "delta", persona: t.persona, text: word });
    }
    events.push({ type: "turn_end", persona: t.persona, full_text: t.text });
  }

  const vote = {
    elena: "conditional",
    marcus: "conditional",
    david: "yes",
    priya: "conditional",
  };
  const vote_breakdown = computeVoteBreakdown(vote);

  events.push({
    type: "final",
    vote: {
      ...vote,
      tally: vote_breakdown.tally,
      yes_pct: String(vote_breakdown.yes_pct),
      no_pct: String(vote_breakdown.no_pct),
      conditional_pct: String(vote_breakdown.conditional_pct),
      lean: vote_breakdown.lean,
    },
    vote_breakdown,
    persona_votes: {
      elena: { vote: "conditional", rationale: "Mission-aligned only with staffing plan and runway confirmed." },
      marcus: { vote: "conditional", rationale: "Phased pilot with capped budget — full Q3 launch is not fiscally sound." },
      david: { vote: "yes", rationale: "Pipeline momentum favors a regional pilot with corporate underwriting." },
      priya: { vote: "conditional", rationale: "Community demand exists but staff capacity requires co-design first." },
    },
    memo: `Regarding "${q}": the board supports a limited Q3 pilot if Marcus confirms 6-month cash runway, Priya signs off on a staffing plan with protected hours, and David secures pilot underwriting. Defer full multi-site expansion until Q1 after fall campaign revenue is booked.`,
    analysis: {
      financial: "YTD giving and campaign pipeline progress suggest a capped pilot is affordable; full launch risks unrestricted cash strain.",
      programs: "Active programs and beneficiary counts indicate existing load — new mentorship must not add net staff burden without budget.",
      growth: "Event registrants and campaign momentum support a visible pilot before fall appeal season.",
      governance: "Mission alignment is strong; governance requires co-design and phased approval gates.",
      summary: "Proceed with a regional Q3 pilot under strict financial caps and community co-design — not full expansion.",
    },
    conditions: [
      "6-month unrestricted cash runway confirmed by Treasurer",
      "Staffing plan with protected hours approved by Community Director",
      "Two member co-design sessions completed",
      "Pilot budget capped at 15% of YTD raised",
    ],
    chair_guidance: "Approve a regional Q3 pilot with conditions above. Reject full multi-site launch until Q1 review.",
    data_used: [
      "YTD donations and last-90-day giving trend",
      "Active campaign goal progress",
      "Program budget utilization and beneficiary counts",
      "Upcoming event registrant totals",
    ],
    risks: [
      "Unrestricted cash may not cover full program staffing in Q3",
      "Frontline capacity without protected hours risks burnout",
      "Donor expectations if pilot outcomes are not measured clearly",
    ],
    dissent: "David would proceed faster with corporate underwriting; Marcus wants audited budget scenarios before any launch.",
  });

  return events;
}

export function buildTurnsFromFallback(question: string): {
  turns: PersonaTurn[];
  final: BoardroomFinal;
} {
  const events = getBoardroomFallbackEvents(question);
  const turns: PersonaTurn[] = [];
  let final: BoardroomFinal | null = null;

  for (const evt of events) {
    const type = evt.type as string;
    if (type === "turn_start") {
      turns.push({
        persona: evt.persona as PersonaId,
        round: (evt.round as number) ?? 0,
        text: "",
        status: "speaking",
        tools: [],
      });
    } else if (type === "tool") {
      const idx = turns.length - 1;
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
    } else if (type === "delta") {
      const idx = turns.length - 1;
      if (idx >= 0) {
        turns[idx] = {
          ...turns[idx],
          text: turns[idx].text + (evt.text as string),
        };
      }
    } else if (type === "turn_end") {
      const idx = turns.length - 1;
      if (idx >= 0) {
        turns[idx] = {
          ...turns[idx],
          text: (evt.full_text as string) ?? turns[idx].text,
          status: "done",
        };
      }
    } else if (type === "final") {
      final = {
        vote: evt.vote as BoardroomFinal["vote"],
        vote_breakdown: evt.vote_breakdown as BoardroomFinal["vote_breakdown"],
        persona_votes: evt.persona_votes as BoardroomFinal["persona_votes"],
        memo: evt.memo as string,
        analysis: evt.analysis as BoardroomFinal["analysis"],
        conditions: (evt.conditions as string[]) ?? [],
        chair_guidance: String(evt.chair_guidance ?? ""),
        data_used: (evt.data_used as string[]) ?? [],
        risks: (evt.risks as string[]) ?? [],
        dissent: String(evt.dissent ?? ""),
      };
    }
  }

  return {
    turns,
    final: final ?? {
      vote: { tally: "Demo mode" },
      memo: "Demo board memo unavailable.",
      risks: [],
      dissent: "",
    },
  };
}

export function saveBoardroomPrep(payload: BoardroomPrepPayload): void {
  try {
    localStorage.setItem(BOARDROOM_PREP_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
}

export function loadBoardroomPrep(): BoardroomPrepPayload | null {
  try {
    const raw = localStorage.getItem(BOARDROOM_PREP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BoardroomPrepPayload;
  } catch {
    return null;
  }
}

export function clearBoardroomPrep(): void {
  try {
    localStorage.removeItem(BOARDROOM_PREP_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

import type { BoardroomFinal, PersonaId, PersonaTurn } from "@/hooks/useBoardroom";

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
        "Thank you all. Our mission charter commits us to youth outcomes — but we must sequence this against governance readiness. I want to hear Marcus on runway before we vote.",
    },
    {
      persona: "marcus",
      round: 0,
      text:
        "I pulled our financials — YTD giving is solid, but unrestricted cash is tighter than it looks once restricted grants are carved out. A Q3 launch needs a phased budget, not a full build-out.",
    },
    {
      persona: "david",
      round: 0,
      text:
        "Marcus, the cost of waiting is donor fatigue in the pipeline. A pilot in one neighborhood de-risks the bet and gives us a story for the fall appeal.",
    },
    {
      persona: "priya",
      round: 0,
      text:
        "Our program metrics show members asking for mentorship — but frontline staff are at capacity. If we launch, we need community co-design and protected staff time, not another boardroom-only plan.",
    },
  ];

  const events: Array<Record<string, unknown>> = [
    { type: "session", session_id: null },
  ];

  for (const t of turns) {
    events.push({ type: "turn_start", persona: t.persona, round: t.round });
    if (t.persona === "marcus") {
      events.push({ type: "tool", persona: "marcus", tool: "get_financial_snapshot", args: {} });
    }
    if (t.persona === "priya") {
      events.push({ type: "tool", persona: "priya", tool: "get_program_metrics", args: {} });
    }
    for (const word of t.text.split(/(\s+)/)) {
      if (word) events.push({ type: "delta", persona: t.persona, text: word });
    }
    events.push({ type: "turn_end", persona: t.persona, full_text: t.text });
  }

  events.push({
    type: "final",
    vote: {
      elena: "conditional",
      marcus: "conditional",
      david: "yes",
      priya: "conditional",
      tally: "1 Yes / 3 Conditional",
    },
    memo: `Regarding "${q}": the board supports a limited Q3 pilot if Marcus confirms 6-month cash runway and Priya signs off on a staffing plan. Defer full multi-site expansion until Q1 after gala revenue is booked.`,
    risks: [
      "Unrestricted cash may not cover full program staffing in Q3",
      "Frontline capacity without protected hours risks burnout",
      "Donor expectations if pilot outcomes are not measured clearly",
    ],
    dissent: "David would proceed faster with corporate underwriting; Marcus wants audited budget scenarios first.",
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
        memo: evt.memo as string,
        risks: (evt.risks as string[]) ?? [],
        dissent: (evt.dissent as string) ?? "",
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

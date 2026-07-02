/** Sample board questions tied to org campaigns, programs, grants, members, and volunteers. */
export const BOARDROOM_STARTER_QUESTIONS = [
  "Should we pilot youth mentorship expansion in Q3?",
  "Should we push a $50k Spring Annual Fund match before July?",
  "Should we scale Digital Literacy with Technology Access funds?",
  "Should we improve Kresge grant utilization before the report?",
  "Should we add Food Security Network volunteer shifts this quarter?",
  "Should we defer a grant writer hire until runway hits six months?",
  "Should we increase capacity for our next community event?",
  "Should we launch a premium membership tier?",
  "Should we accept a restricted gift for a new program line?",
  "Should we fund the mentorship waitlist from a completed program?",
] as const;

interface Props {
  disabled?: boolean;
  onSelect: (question: string) => void;
}

export function QuestionChips({ disabled, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Suggested questions for the board</p>
      <div className="flex flex-wrap gap-1.5">
        {BOARDROOM_STARTER_QUESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s)}
            className="rounded-full border bg-muted/40 px-3 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

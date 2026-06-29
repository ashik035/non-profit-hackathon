export const BOARDROOM_STARTER_QUESTIONS = [
  "Should we launch the youth mentorship program in Q3?",
  "Should we launch a $250k year-end matching campaign in Q4?",
  "Should we hire a full-time grant writer this fiscal year?",
  "Should we expand our flagship program into a second city?",
  "Should we reduce overhead by closing our smallest regional office?",
  "Should we accept a restricted $500k foundation grant with new reporting requirements?",
  "Should we increase board giving expectations for directors this year?",
  "Should we partner with a corporate sponsor for our annual gala?",
] as const;

interface Props {
  disabled?: boolean;
  onSelect: (question: string) => void;
}

export function QuestionChips({ disabled, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {BOARDROOM_STARTER_QUESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(s)}
          className="rounded-full border bg-muted/40 px-3 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

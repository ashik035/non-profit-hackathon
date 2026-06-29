import type { PersonaTurn } from "@/hooks/useBoardroom";

const DISAGREEMENT_MARKERS = [
  "however",
  "disagree",
  "concern",
  "risk",
  "but ",
  "push back",
  "cautious",
  "worried",
  "cannot support",
  "not yet",
];

export function computeTension(turns: PersonaTurn[]): number {
  const text = turns.map((t) => t.text.toLowerCase()).join(" ");
  if (!text.trim()) return 0;
  let hits = 0;
  for (const m of DISAGREEMENT_MARKERS) {
    const re = new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(re);
    hits += matches?.length ?? 0;
  }
  const base = Math.min(100, hits * 12);
  const speaking = turns.some((t) => t.status === "speaking");
  return speaking ? Math.min(100, base + 8) : base;
}

interface Props {
  turns: PersonaTurn[];
}

export function TensionMeter({ turns }: Props) {
  const level = computeTension(turns);
  const label =
    level >= 70 ? "High tension" : level >= 35 ? "Active debate" : level > 0 ? "Collegial" : "Awaiting debate";

  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">Board tension</span>
        <span className="text-muted-foreground">{label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${level}%`,
            background:
              level >= 70
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : level >= 35
                  ? "linear-gradient(90deg, #8b5cf6, #f59e0b)"
                  : "linear-gradient(90deg, #10b981, #8b5cf6)",
          }}
        />
      </div>
    </div>
  );
}

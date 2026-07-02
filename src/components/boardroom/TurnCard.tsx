import { forwardRef } from "react";
import { PERSONA_BY_ID } from "./personas";
import { PersonaAvatar } from "./PersonaAvatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import type { PersonaTurn } from "@/hooks/useBoardroom";
import { useSpeakingReveal } from "@/hooks/useSpeakingReveal";
import type { TurnDisplayMode } from "@/hooks/useSequentialTurnDisplay";

interface Props {
  turn: PersonaTurn;
  displayMode?: TurnDisplayMode;
  instant?: boolean;
  isActive?: boolean;
  onRevealProgress?: () => void;
  onRevealComplete?: () => void;
}

export const TurnCard = forwardRef<HTMLDivElement, Props>(function TurnCard(
  {
    turn,
    displayMode = "revealing",
    instant = false,
    isActive = false,
    onRevealProgress,
    onRevealComplete,
  },
  ref,
) {
  const meta = PERSONA_BY_ID[turn.persona];
  const effectiveMode = instant ? "complete" : displayMode;
  const streamSpeaking = turn.status === "speaking";
  const isRevealing = effectiveMode === "revealing";
  const isComplete = effectiveMode === "complete";
  const isWaiting = effectiveMode === "waiting";

  const revealedText = useSpeakingReveal(turn.text, streamSpeaking, {
    instant: instant || isComplete,
    enabled: isRevealing,
    onProgress: isActive ? onRevealProgress : undefined,
    onComplete: isRevealing ? onRevealComplete : undefined,
  });

  const displayText = isComplete ? turn.text : isWaiting ? "" : revealedText;
  const stillRevealing = isRevealing && revealedText.length < turn.text.length;
  const showSpeakingBadge = isRevealing && (streamSpeaking || stillRevealing || turn.text.length === 0);

  return (
    <Card
      ref={isActive ? ref : undefined}
      className="overflow-hidden border-l-4 transition-shadow"
      style={{
        borderLeftColor: meta.accent,
        boxShadow: showSpeakingBadge ? `0 6px 30px ${meta.accent}22` : undefined,
        opacity: isWaiting ? 0.65 : 1,
      }}
    >
      <div className="flex gap-4 p-4">
        <PersonaAvatar persona={turn.persona} active={showSpeakingBadge} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-semibold leading-tight">{meta.name}</div>
              <div className="text-xs text-muted-foreground">{meta.role} · Round {turn.round + 1}</div>
            </div>
            {showSpeakingBadge ? (
              <Badge variant="secondary" className="animate-pulse">Speaking…</Badge>
            ) : isWaiting ? (
              <Badge variant="outline" className="text-muted-foreground">Up next</Badge>
            ) : (
              <Badge variant="outline">Done</Badge>
            )}
          </div>

          {turn.tools.length > 0 && !isWaiting && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {turn.tools.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  title={JSON.stringify(t.args)}
                >
                  <Wrench className="h-3 w-3" />
                  {humanizeTool(t.tool)}
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
            {isWaiting ? (
              <span className="italic text-muted-foreground/60">Waiting to speak…</span>
            ) : (
              <>
                {displayText}
                {showSpeakingBadge && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-foreground/70 align-baseline" />
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
});

function humanizeTool(name: string): string {
  switch (name) {
    case "get_financial_snapshot": return "pulled financials";
    case "get_program_metrics": return "checked programs";
    case "search_org_knowledge": return "searched knowledge base";
    default: return name;
  }
}

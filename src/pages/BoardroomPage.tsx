import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Gavel, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useBoardroom } from "@/hooks/useBoardroom";
import { PERSONAS } from "@/components/boardroom/personas";
import { PersonaAvatar } from "@/components/boardroom/PersonaAvatar";
import { TurnCard } from "@/components/boardroom/TurnCard";
import { DecisionMemo } from "@/components/boardroom/DecisionMemo";
import { TensionMeter } from "@/components/boardroom/TensionMeter";
import { QuestionChips } from "@/components/boardroom/QuestionChips";
import { cn } from "@/lib/utils";

export default function BoardroomPage() {
  const { state, startSimulation, reset } = useBoardroom();
  const [draft, setDraft] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  const isRunning = state.status === "running";
  const canRun = draft.trim().length > 8 && !isRunning;

  useEffect(() => {
    document.title = "AI Boardroom | Brightside Foundation";
  }, []);

  const lastTurnText = state.turns[state.turns.length - 1]?.text ?? "";

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [state.turns.length, lastTurnText]);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Boardroom Simulator</h1>
            <p className="text-sm text-muted-foreground">
              Stress-test any strategic decision against four AI board members grounded in your live org data.
            </p>
          </div>
        </div>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PERSONAS.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-card/50 p-3 transition-shadow",
                state.activePersona === p.id && "ring-2 ring-offset-2 ring-offset-background",
              )}
              style={
                state.activePersona === p.id
                  ? ({ "--tw-ring-color": p.accent } as CSSProperties)
                  : undefined
              }
            >
              <PersonaAvatar persona={p.id} active={state.activePersona === p.id} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
                <div className="text-[11px] text-muted-foreground/80">{p.blurb}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(isRunning || state.turns.length > 0) && (
        <TensionMeter turns={state.turns} />
      )}

      {state.status !== "complete" && (
        <Card className="space-y-3 p-4">
          <label className="text-sm font-medium">Bring a question to the board</label>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Should we launch the youth mentorship program in Q3?"
            rows={3}
            disabled={isRunning}
            maxLength={600}
          />
          <div className="space-y-3">
            <QuestionChips disabled={isRunning} onSelect={setDraft} />
            <div className="flex flex-wrap items-center justify-end gap-2">
              {state.status === "error" && (
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>
              )}
              <Button onClick={() => startSimulation(draft.trim())} disabled={!canRun}>
                {isRunning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isRunning ? "Board is debating…" : "Convene the board"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {state.usedFallback && state.status === "complete" && (
        <Alert>
          <AlertDescription className="text-sm">
            Demo mode — live AI unavailable. Showing a scripted board debate so you can still preview the flow.
          </AlertDescription>
        </Alert>
      )}

      {state.status === "error" && state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.question && state.status !== "idle" && (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs uppercase tracking-wide text-primary/80">On the floor</div>
            {isRunning && (
              <Badge variant="secondary" className="animate-pulse text-[10px]">
                Live debate
              </Badge>
            )}
          </div>
          <div className="mt-1 text-base font-medium">{state.question}</div>
        </Card>
      )}

      {state.turns.length > 0 && (
        <div ref={transcriptRef} className="max-h-[min(70vh,640px)] space-y-3 overflow-y-auto pr-1">
          {state.turns.map((t, i) => (
            <TurnCard key={`${t.persona}-${t.round}-${i}`} turn={t} />
          ))}
        </div>
      )}

      {state.final && (
        <DecisionMemo final={state.final} question={state.question} />
      )}

      {state.status === "complete" && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Ask another question
          </Button>
        </div>
      )}
    </div>
  );
}

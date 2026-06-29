import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gavel, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useBoardroom } from "@/hooks/useBoardroom";
import { PERSONAS } from "@/components/boardroom/personas";
import { PersonaAvatar } from "@/components/boardroom/PersonaAvatar";
import { TurnCard } from "@/components/boardroom/TurnCard";
import { DecisionMemo } from "@/components/boardroom/DecisionMemo";

const SUGGESTED = [
  "Should we launch a $250k year-end matching campaign in Q4?",
  "Should we hire a full-time grant writer this fiscal year?",
  "Should we expand our flagship program into a second city?",
  "Should we reduce overhead by closing our smallest regional office?",
];

export default function BoardroomPage() {
  const { state, startSimulation, reset } = useBoardroom();
  const [draft, setDraft] = useState("");

  const isRunning = state.status === "running";
  const canRun = draft.trim().length > 8 && !isRunning;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Gavel className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Boardroom Simulator</h1>
            <p className="text-sm text-muted-foreground">
              Stress-test any strategic decision against four AI board members grounded in your live org data.
            </p>
          </div>
        </div>
      </header>

      {/* Persona strip */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {PERSONAS.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-card/50 p-3">
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

      {/* Question form */}
      {state.status !== "complete" && (
        <Card className="space-y-3 p-4">
          <label className="text-sm font-medium">Bring a question to the board</label>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Should we launch a $250k year-end matching campaign in Q4?"
            rows={3}
            disabled={isRunning}
            maxLength={600}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setDraft(s)}
                  className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {state.status === "error" && (
                <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-1 h-4 w-4" />Reset</Button>
              )}
              <Button onClick={() => startSimulation(draft.trim())} disabled={!canRun}>
                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isRunning ? "Board is debating…" : "Convene the board"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {state.status === "error" && state.error && (
        <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>
      )}

      {/* Active question banner */}
      {state.question && state.status !== "idle" && (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="text-xs uppercase tracking-wide text-primary/80">On the floor</div>
          <div className="mt-1 text-base font-medium">{state.question}</div>
        </Card>
      )}

      {/* Transcript */}
      {state.turns.length > 0 && (
        <div className="space-y-3">
          {state.turns.map((t, i) => <TurnCard key={i} turn={t} />)}
        </div>
      )}

      {/* Final memo */}
      {state.final && <DecisionMemo final={state.final} />}

      {state.status === "complete" && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Ask another question</Button>
        </div>
      )}
    </div>
  );
}

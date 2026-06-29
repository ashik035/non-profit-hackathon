import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Gavel,
  RotateCcw,
  FileJson,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TurnCard } from "@/components/boardroom/TurnCard";
import { TensionMeter } from "@/components/boardroom/TensionMeter";
import { DecisionMemo } from "@/components/boardroom/DecisionMemo";
import { useBoardroomSession } from "@/hooks/useBoardroomSessions";
import { sessionRowToState } from "@/lib/boardroomSessionMapper";
import {
  formatSessionDate,
  formatSessionStatus,
  getTurnCount,
  getVoteTally,
  shortSessionId,
} from "@/lib/boardroomSessionFormat";
import { logActivity } from "@/lib/activity-logger";

function PageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function BoardroomSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: row, isLoading, isError, error } = useBoardroomSession(sessionId);

  useEffect(() => {
    document.title = "Boardroom session | Brightside Foundation";
  }, []);

  useEffect(() => {
    if (!row || !sessionId) return;
    void logActivity({
      action: "view",
      resourceType: "boardroom_session",
      resourceId: sessionId,
      details: { question: row.question?.slice(0, 120) ?? "" },
    });
  }, [row, sessionId]);

  if (isLoading) return <PageSkeleton />;

  if (isError || !row) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 p-4 md:p-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/boardroom">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Boardroom
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "This simulation could not be found or you do not have access."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const state = sessionRowToState(row);
  const statusMeta = formatSessionStatus(row.status);
  const turnCount = getTurnCount(row.transcript);
  const voteTally = getVoteTally(row.vote);

  const handleCopyId = () => {
    void navigator.clipboard.writeText(row.id).then(
      () => toast.success("Session ID copied"),
      () => toast.error("Could not copy session ID"),
    );
  };

  const handleCopyAudit = () => {
    const bundle = {
      id: row.id,
      question: row.question,
      status: row.status,
      source: row.source ?? "live",
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
      vote: row.vote,
      memo: row.memo,
      risks: row.risks,
      dissent: row.dissent,
      transcript: row.transcript,
      turn_count: turnCount,
    };
    void navigator.clipboard.writeText(JSON.stringify(bundle, null, 2)).then(
      () => toast.success("Audit record copied as JSON"),
      () => toast.error("Could not copy audit record"),
    );
  };

  const statusTone =
    statusMeta.tone === "complete"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : statusMeta.tone === "error"
        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
        : "bg-amber-500/15 text-amber-700 dark:text-amber-300";

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/boardroom" className="hover:text-foreground">
          AI Boardroom
        </Link>
        <span>/</span>
        <span className="text-foreground">Past simulation</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Board simulation record</h1>
            <p className="text-sm text-muted-foreground">Read-only audit view</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyAudit}>
            <FileJson className="mr-2 h-4 w-4" />
            Copy audit JSON
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/boardroom">
              <RotateCcw className="mr-2 h-4 w-4" />
              New simulation
            </Link>
          </Button>
        </div>
      </header>

      <Card className="space-y-4 border-primary/20 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={statusTone}>
            {statusMeta.label}
          </Badge>
          <Badge variant="secondary">{turnCount} turns</Badge>
          {voteTally !== "—" && <Badge variant="outline">Vote: {voteTally}</Badge>}
          {row.source && (
            <Badge variant="outline" className="capitalize">
              {row.source}
            </Badge>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Board question</div>
          <p className="mt-1 text-lg font-medium leading-snug">{row.question}</p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Convened</dt>
            <dd className="font-medium">{formatSessionDate(row.created_at)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Last updated</dt>
            <dd className="font-medium">{formatSessionDate(row.updated_at)}</dd>
          </div>
          {row.completed_at && (
            <div>
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="font-medium">{formatSessionDate(row.completed_at)}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Session ID (audit)</dt>
            <dd className="flex items-center gap-2 font-mono text-xs">
              <span>{shortSessionId(row.id)}</span>
              <span className="text-muted-foreground">{row.id}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyId} aria-label="Copy session ID">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </dd>
          </div>
        </dl>
      </Card>

      {state.turns.length > 0 ? (
        <>
          <TensionMeter turns={state.turns} />
          <div className="space-y-3">
            {state.turns.map((t, i) => (
              <TurnCard key={`${t.persona}-${t.round}-${i}`} turn={t} />
            ))}
          </div>
        </>
      ) : (
        <Alert>
          <AlertDescription className="flex items-center gap-2 text-sm">
            No transcript was saved for this session.
            {row.status === "running" && " It may still have been in progress when interrupted."}
          </AlertDescription>
        </Alert>
      )}

      {state.final ? (
        <DecisionMemo final={state.final} question={row.question} />
      ) : (
        <Alert>
          <AlertDescription>No decision memo was recorded for this session.</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-start">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/boardroom">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Boardroom
          </Link>
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { History, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { HistoryScrollArea } from "@/components/boardroom/HistoryScrollArea";
import { cn } from "@/lib/utils";
import {
  useBoardroomSessions,
  type BoardroomSessionSummary,
} from "@/hooks/useBoardroomSessions";
import {
  formatSessionStatus,
  getListSubtitle,
  getTurnCount,
} from "@/lib/boardroomSessionFormat";

const STORAGE_KEY = "boardroom_history_open";

interface Props {
  activeSessionId?: string | null;
  onNewSimulation: () => void;
  disabled?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function StatusBadge({ status }: { status: string }) {
  const { label, tone } = formatSessionStatus(status);
  const toneClass =
    tone === "complete"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : tone === "error"
        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
        : tone === "running"
          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
          : "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("text-[10px]", toneClass)}>
      {label}
    </Badge>
  );
}

function SessionList({
  sessions,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  activeSessionId,
  onSelect,
}: {
  sessions: BoardroomSessionSummary[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  activeSessionId?: string | null;
  onSelect: (session: BoardroomSessionSummary) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mx-1">
        <AlertDescription className="space-y-2 text-sm">
          <p>Could not load past simulations.</p>
          {errorMessage && <p className="text-xs opacity-90">{errorMessage}</p>}
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        No past simulations yet — convene the board to start.
      </p>
    );
  }

  return (
    <div className="space-y-2 pb-1">
      {sessions.map((session) => {
        const isActive = activeSessionId === session.id;
        const question = (session.question ?? "").trim() || "Untitled board question";
        const turns = getTurnCount(session.transcript);
        const createdAt = session.created_at
          ? formatDistanceToNow(new Date(session.created_at), { addSuffix: true })
          : "Unknown time";

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelect(session)}
            className={cn(
              "w-full rounded-lg border border-border/70 bg-card/40 p-3 text-left shadow-sm transition-all hover:border-border hover:bg-muted/40 hover:shadow",
              isActive && "border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/20",
            )}
          >
            <p className="line-clamp-2 text-sm font-medium leading-snug">{question}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={session.status ?? "unknown"} />
              <span className="text-[11px] text-muted-foreground">{createdAt}</span>
              {turns > 0 && (
                <span className="text-[11px] text-muted-foreground">{turns} turns</span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
              {getListSubtitle(session)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function useHistoryOpen() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "false") setOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  const setOpenPersisted = (value: boolean) => {
    setOpen(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
  };

  return { open, setOpen: setOpenPersisted };
}

export function BoardroomHistoryPanel({
  activeSessionId,
  onNewSimulation,
  disabled,
  onCollapsedChange,
}: Props) {
  const navigate = useNavigate();
  const { open, setOpen } = useHistoryOpen();
  const { data: sessions = [], isLoading, isError, error, refetch } = useBoardroomSessions();

  useEffect(() => {
    onCollapsedChange?.(!open);
  }, [open, onCollapsedChange]);

  const handleSelect = (session: BoardroomSessionSummary) => {
    navigate(`/boardroom/sessions/${session.id}`);
  };

  const list = (
    <SessionList
      sessions={sessions}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      onRetry={() => void refetch()}
      activeSessionId={activeSessionId}
      onSelect={handleSelect}
    />
  );

  return (
    <>
      {/* Desktop collapsible sidebar */}
      <div className="hidden lg:flex">
        {!open ? (
          <Card className="flex w-12 shrink-0 flex-col items-center gap-2 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(true)}
              aria-label="Expand past simulations"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground [writing-mode:vertical-rl] rotate-180">
              History ({sessions.length})
            </span>
          </Card>
        ) : (
          <Collapsible open={open} onOpenChange={setOpen} className="w-[280px] shrink-0">
            <CollapsibleContent forceMount className="data-[state=closed]:hidden">
              <Card className="flex h-[min(640px,calc(100vh-10rem))] flex-col overflow-hidden border-border/70 p-0 shadow-sm">
                <div className="shrink-0 border-b border-border/60 px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      <History className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">Past simulations ({sessions.length})</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setOpen(false)}
                        aria-label="Collapse past simulations"
                      >
                        <PanelLeftClose className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onNewSimulation} disabled={disabled}>
                        New
                      </Button>
                    </div>
                  </div>
                </div>
                <HistoryScrollArea className="min-h-0 flex-1 px-2 py-2">{list}</HistoryScrollArea>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Mobile sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
              <History className="h-4 w-4" />
              History ({sessions.length})
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,320px)]">
            <SheetHeader>
              <SheetTitle>Past simulations ({sessions.length})</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="mb-3 w-full" onClick={onNewSimulation}>
                New simulation
              </Button>
              <HistoryScrollArea className="h-[calc(100vh-10rem)] min-h-0 pr-1">{list}</HistoryScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

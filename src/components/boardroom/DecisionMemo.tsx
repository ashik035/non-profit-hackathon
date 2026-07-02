import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PERSONAS, type PersonaId } from "./personas";
import { PersonaAvatar } from "./PersonaAvatar";
import { AlertTriangle, Copy, FileText, MessagesSquare, FileCheck, Scale, ShieldAlert } from "lucide-react";
import type { BoardroomFinal } from "@/hooks/useBoardroom";
import { saveBoardroomPrep } from "@/lib/boardroomFallback";
import { cn } from "@/lib/utils";

interface Props {
  final: BoardroomFinal;
  question: string;
}

const VOTE_TONE: Record<string, string> = {
  yes: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  no: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  conditional: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

const VOTE_LABEL: Record<string, string> = {
  yes: "Yes",
  no: "No",
  conditional: "Conditional",
};

function tallyTone(tally?: string): string {
  const t = (tally ?? "").toLowerCase();
  if (t.includes("no") && !t.includes("conditional")) return "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/40";
  if (t.includes("conditional")) return "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40";
  if (t.includes("yes")) return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/40";
  return "bg-primary/10 text-primary border-primary/30";
}

export function DecisionMemo({ final, question }: Props) {
  const navigate = useNavigate();

  const handleCopy = () => {
    const body = [
      `Board Decision Memo`,
      final.vote?.tally ? `Vote: ${final.vote.tally}` : "",
      "",
      final.memo,
      "",
      final.risks?.length ? `Risks:\n${final.risks.map((r) => `• ${r}`).join("\n")}` : "",
      final.dissent ? `Dissent: ${final.dissent}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(body).then(
      () => toast.success("Memo copied to clipboard"),
      () => toast.success("Memo copied to clipboard"),
    );
  };

  const handleAdopt = () => {
    saveBoardroomPrep({
      question,
      memo: final.memo,
      vote: final.vote,
      risks: final.risks ?? [],
      dissent: final.dissent ?? "",
      savedAt: new Date().toISOString(),
    });
    toast.success("Saved as board prep document");
    navigate("/board-reports?from=boardroom");
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-primary/15 bg-primary/5 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Board Decision Memo</h3>
          </div>
          {final.vote?.tally && (
            <Badge
              variant="outline"
              className={cn("ml-auto px-3 py-1 text-sm font-semibold", tallyTone(final.vote.tally))}
            >
              {final.vote.tally}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        <section>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Scale className="h-3.5 w-3.5" />
            Board decision
          </div>
          <div className="rounded-lg border border-border/80 bg-card/80 px-4 py-4">
            <p className="text-base leading-relaxed text-foreground">{final.memo}</p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vote record
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PERSONAS.map((p) => {
              const vote = (final.vote?.[p.id] ?? "").toLowerCase();
              const tone = VOTE_TONE[vote] ?? "bg-muted text-muted-foreground border-border";
              const label = VOTE_LABEL[vote] ?? (vote || "—");
              return (
                <div key={p.id} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5", tone)}>
                  <PersonaAvatar persona={p.id as PersonaId} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold">{p.name.split(" ")[0]}</div>
                    <div className="truncate text-[10px] opacity-80">{p.role}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wide">{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {final.risks?.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              Risk analysis
            </div>
            <ol className="space-y-2">
              {final.risks.map((r, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm leading-relaxed"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {final.dissent && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <MessagesSquare className="h-3.5 w-3.5" />
              Dissenting view
            </div>
            <blockquote className="border-l-4 border-primary/40 bg-muted/30 py-3 pl-4 pr-3 text-sm leading-relaxed text-muted-foreground italic">
              {final.dissent}
            </blockquote>
          </section>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy memo
          </Button>
          <Button size="sm" onClick={handleAdopt}>
            <FileCheck className="mr-2 h-4 w-4" />
            Adopt as Board Prep Doc
          </Button>
        </div>
      </div>
    </Card>
  );
}

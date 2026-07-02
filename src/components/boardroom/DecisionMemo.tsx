import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PERSONAS, type PersonaId } from "./personas";
import { PersonaAvatar } from "./PersonaAvatar";
import {
  Copy,
  FileText,
  MessagesSquare,
  FileCheck,
  Scale,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  Database,
  Gavel,
  TrendingUp,
  Users,
  Landmark,
} from "lucide-react";
import type { BoardroomFinal } from "@/hooks/useBoardroom";
import { saveBoardroomPrep } from "@/lib/boardroomFallback";
import {
  LEAN_GUIDANCE,
  LEAN_LABEL,
  parseVoteBreakdown,
} from "@/lib/boardroomVote";
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

const BAR_COLORS = {
  yes: "bg-emerald-500",
  conditional: "bg-amber-500",
  no: "bg-rose-500",
};

function tallyTone(lean?: string): string {
  const t = (lean ?? "").toLowerCase();
  if (t === "no") return "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/40";
  if (t === "conditional") return "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40";
  if (t === "yes") return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/40";
  return "bg-primary/10 text-primary border-primary/30";
}

export function DecisionMemo({ final, question }: Props) {
  const navigate = useNavigate();
  const breakdown = final.vote_breakdown ?? parseVoteBreakdown(final.vote);
  const lean = breakdown?.lean ?? "split";

  const handleCopy = () => {
    const body = [
      `Board Decision Memo`,
      breakdown?.tally ?? final.vote?.tally ?? "",
      "",
      final.memo,
      "",
      final.chair_guidance ? `Chair guidance: ${final.chair_guidance}` : "",
      final.analysis?.summary ? `Summary: ${final.analysis.summary}` : "",
      final.conditions?.length ? `Conditions:\n${final.conditions.map((c) => `• ${c}`).join("\n")}` : "",
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
          {breakdown && (
            <Badge
              variant="outline"
              className={cn("ml-auto px-3 py-1 text-sm font-semibold", tallyTone(lean))}
            >
              {LEAN_LABEL[lean]}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6">
        {breakdown && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              Vote breakdown (4 board members)
            </div>
            <div className="rounded-lg border border-border/80 bg-card/80 p-4 space-y-4">
              <div className="flex h-4 overflow-hidden rounded-full bg-muted">
                {breakdown.yes_pct > 0 && (
                  <div
                    className={cn("h-full transition-all", BAR_COLORS.yes)}
                    style={{ width: `${breakdown.yes_pct}%` }}
                    title={`Yes ${breakdown.yes_pct}%`}
                  />
                )}
                {breakdown.conditional_pct > 0 && (
                  <div
                    className={cn("h-full transition-all", BAR_COLORS.conditional)}
                    style={{ width: `${breakdown.conditional_pct}%` }}
                    title={`Conditional ${breakdown.conditional_pct}%`}
                  />
                )}
                {breakdown.no_pct > 0 && (
                  <div
                    className={cn("h-full transition-all", BAR_COLORS.no)}
                    style={{ width: `${breakdown.no_pct}%` }}
                    title={`No ${breakdown.no_pct}%`}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {breakdown.yes_pct}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Yes ({breakdown.counts.yes})
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {breakdown.conditional_pct}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Conditional ({breakdown.counts.conditional})
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {breakdown.no_pct}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    No ({breakdown.counts.no})
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{LEAN_GUIDANCE[lean]}</p>
            </div>
          </section>
        )}

        {final.chair_guidance && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Gavel className="h-3.5 w-3.5 text-primary" />
              Your decision as chair
            </div>
            <div className="rounded-lg border-2 border-primary/25 bg-primary/5 px-4 py-4">
              <p className="text-base font-medium leading-relaxed text-foreground">
                {final.chair_guidance}
              </p>
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Scale className="h-3.5 w-3.5" />
            Executive recommendation
          </div>
          <div className="rounded-lg border border-border/80 bg-card/80 px-4 py-4">
            <p className="text-base leading-relaxed text-foreground">{final.memo}</p>
          </div>
        </section>

        {final.analysis && hasAnalysis(final.analysis) && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Full picture — domain analysis
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {final.analysis.financial && (
                <AnalysisCard icon={TrendingUp} title="Financial" text={final.analysis.financial} />
              )}
              {final.analysis.programs && (
                <AnalysisCard icon={Users} title="Programs & community" text={final.analysis.programs} />
              )}
              {final.analysis.growth && (
                <AnalysisCard icon={BarChart3} title="Growth & pipeline" text={final.analysis.growth} />
              )}
              {final.analysis.governance && (
                <AnalysisCard icon={Landmark} title="Governance & mission" text={final.analysis.governance} />
              )}
            </div>
            {final.analysis.summary && (
              <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed">
                <span className="font-semibold">Summary: </span>
                {final.analysis.summary}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Individual positions
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERSONAS.map((p) => {
              const detail = final.persona_votes?.[p.id as PersonaId];
              const vote = (detail?.vote ?? final.vote?.[p.id] ?? "").toLowerCase();
              const tone = VOTE_TONE[vote] ?? "bg-muted text-muted-foreground border-border";
              const label = VOTE_LABEL[vote] ?? (vote || "—");
              return (
                <div key={p.id} className={cn("rounded-lg border p-3", tone)}>
                  <div className="flex items-start gap-2">
                    <PersonaAvatar persona={p.id as PersonaId} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-xs font-semibold">{p.name}</div>
                        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
                      </div>
                      <div className="truncate text-[10px] opacity-80">{p.role}</div>
                      {detail?.rationale && (
                        <p className="mt-2 text-xs leading-relaxed opacity-90">{detail.rationale}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {final.conditions && final.conditions.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
              Conditions for approval
            </div>
            <ul className="space-y-2">
              {final.conditions.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-sm leading-relaxed"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {final.data_used && final.data_used.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              Data cited in this debate
            </div>
            <ul className="flex flex-wrap gap-2">
              {final.data_used.map((d, i) => (
                <li
                  key={i}
                  className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {d}
                </li>
              ))}
            </ul>
          </section>
        )}

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

function AnalysisCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/60 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function hasAnalysis(analysis: NonNullable<BoardroomFinal["analysis"]>): boolean {
  return Boolean(
    analysis.financial || analysis.programs || analysis.growth || analysis.governance || analysis.summary,
  );
}

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERSONAS, type PersonaId } from "./personas";
import { PersonaAvatar } from "./PersonaAvatar";
import { AlertTriangle, Copy, FileText, MessagesSquare, FileCheck } from "lucide-react";
import type { BoardroomFinal } from "@/hooks/useBoardroom";
import { saveBoardroomPrep } from "@/lib/boardroomFallback";

interface Props {
  final: BoardroomFinal;
  question: string;
}

const VOTE_TONE: Record<string, string> = {
  yes: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  no: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  conditional: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

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
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-background to-primary/5 p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Board Decision Memo</h3>
        {final.vote?.tally && (
          <Badge variant="secondary" className="ml-auto">{final.vote.tally}</Badge>
        )}
      </div>

      <p className="mb-5 text-sm leading-relaxed">{final.memo}</p>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PERSONAS.map((p) => {
          const vote = (final.vote?.[p.id] ?? "").toLowerCase();
          const tone = VOTE_TONE[vote] ?? "bg-muted text-muted-foreground border-border";
          return (
            <div key={p.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${tone}`}>
              <PersonaAvatar persona={p.id as PersonaId} size="sm" />
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{p.name.split(" ")[0]}</div>
                <div className="text-[11px] uppercase tracking-wide opacity-80">{vote || "—"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {final.risks?.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Key risks
          </div>
          <ul className="space-y-1 text-sm">
            {final.risks.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {final.dissent && (
        <div className="mb-5 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm">
          <div className="mb-1 flex items-center gap-1.5 font-medium">
            <MessagesSquare className="h-4 w-4" />
            Dissenting view
          </div>
          <p className="text-muted-foreground">{final.dissent}</p>
        </div>
      )}

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
    </Card>
  );
}

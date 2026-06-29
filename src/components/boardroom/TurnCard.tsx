import { PERSONA_BY_ID } from "./personas";
import { PersonaAvatar } from "./PersonaAvatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import type { PersonaTurn } from "@/hooks/useBoardroom";

interface Props {
  turn: PersonaTurn;
}

export function TurnCard({ turn }: Props) {
  const meta = PERSONA_BY_ID[turn.persona];
  const speaking = turn.status === "speaking";
  return (
    <Card
      className="overflow-hidden border-l-4 transition-shadow"
      style={{ borderLeftColor: meta.accent, boxShadow: speaking ? `0 6px 30px ${meta.accent}22` : undefined }}
    >
      <div className="flex gap-4 p-4">
        <PersonaAvatar persona={turn.persona} active={speaking} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-semibold leading-tight">{meta.name}</div>
              <div className="text-xs text-muted-foreground">{meta.role} · Round {turn.round + 1}</div>
            </div>
            {speaking ? (
              <Badge variant="secondary" className="animate-pulse">Speaking…</Badge>
            ) : (
              <Badge variant="outline">Done</Badge>
            )}
          </div>

          {turn.tools.length > 0 && (
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

          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
            {turn.text}
            {speaking && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-foreground/70 align-baseline" />}
          </p>
        </div>
      </div>
    </Card>
  );
}

function humanizeTool(name: string): string {
  switch (name) {
    case "get_financial_snapshot": return "pulled financials";
    case "get_program_metrics": return "checked programs";
    case "search_org_knowledge": return "searched knowledge base";
    default: return name;
  }
}

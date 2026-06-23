import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  MISSION_CONTROL_AGENTS,
  useMissionControl,
  type MCFinding,
} from "@/hooks/useMissionControl";

const SEVERITY_STYLES: Record<MCFinding["severity"], string> = {
  red: "border-l-red-500 bg-red-50/40 dark:bg-red-950/20",
  amber: "border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20",
  green: "border-l-green-500 bg-green-50/40 dark:bg-green-950/20",
  info: "border-l-blue-500 bg-blue-50/40 dark:bg-blue-950/20",
};

const SEVERITY_BADGE: Record<MCFinding["severity"], string> = {
  red: "bg-red-500 text-white",
  amber: "bg-amber-500 text-white",
  green: "bg-green-500 text-white",
  info: "bg-blue-500 text-white",
};

export default function MissionControlPage() {
  const { run, findings, running, error, startScan } = useMissionControl();

  const findingsByAgent = new Map<string, MCFinding[]>();
  for (const f of findings) {
    const list = findingsByAgent.get(f.source_agent) ?? [];
    list.push(f);
    findingsByAgent.set(f.source_agent, list);
  }

  const health = run?.health_score ?? null;
  const healthColor = health == null ? "text-muted-foreground"
    : health >= 80 ? "text-green-600"
    : health >= 60 ? "text-amber-600"
    : "text-red-600";

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            Mission Control
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Run a full org scan</h1>
          <p className="text-muted-foreground mt-1">
            6 AI agents run in parallel across donations, members, grants, meetings, and operations.
            Synthesized into one priority briefing.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => startScan()}
          disabled={running}
          className="h-14 px-8 text-base"
        >
          {running ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Agents working...</>
          ) : (
            <><Play className="w-5 h-5 mr-2" /> Run Full Org Scan</>
          )}
        </Button>
      </div>

      {/* Top row: health + synthesis */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Org Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-6xl font-bold ${healthColor}`}>
              {health ?? "—"}
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {run?.completed_at
                ? `Last scan: ${new Date(run.completed_at).toLocaleString()}`
                : "Run a scan to compute live score."}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4" /> Executive Briefing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {run?.synthesis?.summary ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {run.synthesis.summary}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {running ? "Synthesizing findings..." : "Run a scan to generate a briefing."}
              </p>
            )}
            {run?.synthesis?.top_priorities && run.synthesis.top_priorities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {run.synthesis.top_priorities.map((p, i) => (
                  <Badge key={i} variant="destructive">{p}</Badge>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/board-reports">Generate Board Report</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent grid */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Agents</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MISSION_CONTROL_AGENTS.map((agent) => {
            const agentFindings = findingsByAgent.get(agent.slug) ?? [];
            const worst = agentFindings.reduce<MCFinding["severity"]>((acc, f) => {
              if (f.severity === "red") return "red";
              if (f.severity === "amber" && acc !== "red") return "amber";
              return acc;
            }, "green");
            const isActive = running && agentFindings.length === 0;
            return (
              <Card key={agent.slug} className={isActive ? "ring-2 ring-primary animate-pulse" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div>
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {isActive ? "Working..." : agentFindings.length ? `${agentFindings.length} finding${agentFindings.length === 1 ? "" : "s"}` : "Idle"}
                        </div>
                      </div>
                    </div>
                    {agentFindings.length > 0 && (
                      <Badge className={SEVERITY_BADGE[worst]}>{worst}</Badge>
                    )}
                    {isActive && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Findings feed */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Findings</h2>
        {findings.length === 0 && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">
            {running ? "Waiting for first finding..." : "No findings yet. Hit Run Full Org Scan."}
          </CardContent></Card>
        )}
        <div className="space-y-3">
          {findings.map((f) => (
            <Card key={f.id} className={`border-l-4 ${SEVERITY_STYLES[f.severity]}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={SEVERITY_BADGE[f.severity]}>{f.severity}</Badge>
                      <span className="text-xs text-muted-foreground">{f.source_agent}</span>
                    </div>
                    <h3 className="font-semibold">{f.title}</h3>
                    {f.detail && <p className="text-sm text-muted-foreground mt-1">{f.detail}</p>}
                    {f.recommended_action && (
                      <p className="text-sm mt-2"><span className="font-medium">→ Recommended:</span> {f.recommended_action}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}
    </div>
  );
}

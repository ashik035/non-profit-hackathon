import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Play, Radio, Sparkles, CheckCircle2, FileText, Wand2, ListPlus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MISSION_CONTROL_AGENTS,
  useMissionControl,
  type MCFinding,
} from "@/hooks/useMissionControl";
import { useCreateTaskFromFinding } from "@/hooks/useCreateTaskFromFinding";
import { useMissionControlActions } from "@/hooks/useMissionControlActions";
import ActionDraftCard from "@/components/mission-control/ActionDraftCard";
import HealthTrendChart from "@/components/mission-control/HealthTrendChart";
import DiffView from "@/components/mission-control/DiffView";
import LiveActivityTicker from "@/components/mission-control/LiveActivityTicker";

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
  const { run, runId, findings, running, error, startScan } = useMissionControl();
  const { createTask, creating } = useCreateTaskFromFinding();
  const { actions, draftAction, executeAction, dismissAction, drafting, executing, actionForFinding } =
    useMissionControlActions(runId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("findings");

  useEffect(() => {
    if (searchParams.get("autorun") === "1" && !running) {
      startScan();
      searchParams.delete("autorun");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const agentsCompleted = run?.agents_completed ?? 0;
  const agentsTotal = run?.agents_total ?? MISSION_CONTROL_AGENTS.length;
  const isComplete = run?.status === "completed";
  const redCount = findings.filter((f) => f.severity === "red").length;
  const amberCount = findings.filter((f) => f.severity === "amber").length;
  const greenCount = findings.filter((f) => f.severity === "green").length;

  const diff = (run?.synthesis as any)?.diff ?? null;
  const actionableFindings = findings.filter((f) => f.severity === "red" || f.severity === "amber");
  const sortedActions = [...actions].sort((a, b) => {
    if (a.status === b.status) return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    const order = { draft: 0, approved: 1, executed: 2, dismissed: 3 } as Record<string, number>;
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  const draftAllActionable = async () => {
    for (const f of actionableFindings) {
      if (!actionForFinding(f.id)) {
        await draftAction(f.id);
      }
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Live ticker */}
      <LiveActivityTicker />

      {/* Hero */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Radio className={`w-4 h-4 text-primary ${running ? "animate-pulse" : ""}`} />
            Mission Control · Autonomous Action Layer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Detect. Draft. Execute.</h1>
          <p className="text-muted-foreground mt-1">
            6 AI agents scan your org in parallel, then draft ready-to-execute actions waiting for your approval.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => startScan()}
          disabled={running}
          className="h-14 px-8 text-base"
        >
          {running ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {agentsCompleted}/{agentsTotal} agents complete</>
          ) : (
            <><Play className="w-5 h-5 mr-2" /> Run Full Org Scan</>
          )}
        </Button>
      </div>

      {/* Counters */}
      {(running || findings.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{findings.length}</div>
            <div className="text-xs text-muted-foreground">Findings</div>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{redCount}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{amberCount}</div>
            <div className="text-xs text-muted-foreground">Watch</div>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{greenCount}</div>
            <div className="text-xs text-muted-foreground">Healthy</div>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{actions.filter((a) => a.status === "executed").length}/{actions.length || 0}</div>
            <div className="text-xs text-muted-foreground">Executed</div>
          </CardContent></Card>
        </div>
      )}

      {/* Health + briefing */}
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
                : running ? "Scanning..." : "Run a scan to compute live score."}
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
                {running ? "Agents working — synthesis will appear when all 6 complete..." : "Run a scan to generate a briefing."}
              </p>
            )}
            {run?.synthesis?.top_priorities && run.synthesis.top_priorities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {run.synthesis.top_priorities.map((p, i) => (
                  <Badge key={i} variant="destructive">{p}</Badge>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={draftAllActionable}
                disabled={!isComplete || actionableFindings.length === 0 || drafting !== null}
              >
                {drafting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Draft all {actionableFindings.length} actions
              </Button>
              <Button asChild variant="outline" size="sm" disabled={!isComplete}>
                <Link to={`/board-reports${run?.id ? `?mc=${run.id}` : ""}`}>
                  <FileText className="w-4 h-4 mr-2" /> Generate Board Report
                </Link>
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
            const isDone = agentFindings.length > 0 || isComplete;
            const isActive = running && agentFindings.length === 0;
            return (
              <Card
                key={agent.slug}
                className={`transition-all ${isActive ? "ring-2 ring-primary shadow-md" : ""} ${isDone && !isActive ? "border-green-500/30" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{agent.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {isActive ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Scanning live data…</>
                          ) : agentFindings.length ? (
                            <><CheckCircle2 className="w-3 h-3 text-green-600" /> {agentFindings.length} finding{agentFindings.length === 1 ? "" : "s"}</>
                          ) : (
                            "Idle"
                          )}
                        </div>
                      </div>
                    </div>
                    {agentFindings.length > 0 && (
                      <Badge className={SEVERITY_BADGE[worst]}>{worst}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs: Findings | Drafts | Diff | Trend */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="findings">Findings {findings.length > 0 && <Badge variant="secondary" className="ml-2">{findings.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="actions">AI Drafts {actions.length > 0 && <Badge variant="secondary" className="ml-2">{actions.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="diff">What Changed</TabsTrigger>
          <TabsTrigger value="trend">Health Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="mt-4">
          {findings.length === 0 && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">
              {running ? "Waiting for first finding..." : "No findings yet. Hit Run Full Org Scan."}
            </CardContent></Card>
          )}
          <div className="space-y-3">
            {findings.map((f) => {
              const existing = actionForFinding(f.id);
              const isDrafting = drafting === f.id;
              return (
                <Card key={f.id} className={`border-l-4 ${SEVERITY_STYLES[f.severity]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={SEVERITY_BADGE[f.severity]}>{f.severity}</Badge>
                          <span className="text-xs text-muted-foreground">{f.source_agent}</span>
                          {existing && (
                            <Badge variant="outline" className="text-[10px]">
                              {existing.status === "executed" ? "✓ Executed" : existing.status === "dismissed" ? "Dismissed" : "Drafted"}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{f.title}</h3>
                        {f.detail && <p className="text-sm text-muted-foreground mt-1">{f.detail}</p>}
                        {f.recommended_action && (
                          <p className="text-sm mt-2"><span className="font-medium">→ Recommended:</span> {f.recommended_action}</p>
                        )}
                      </div>
                      {f.severity !== "green" && !existing && (
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => draftAction(f.id)}
                            disabled={isDrafting}
                          >
                            {isDrafting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1.5" />}
                            Draft action
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => createTask(f)}
                            disabled={creating === f.id}
                          >
                            <ListPlus className="w-3.5 h-3.5 mr-1.5" />
                            Quick task
                          </Button>
                        </div>
                      )}
                      {existing && (
                        <Button size="sm" variant="outline" onClick={() => setTab("actions")}>
                          View draft →
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          {actions.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground space-y-3">
              <p>No AI drafts yet. Click <strong>Draft action</strong> on any finding (or <strong>Draft all</strong> in the briefing) to have AI generate a ready-to-execute artifact.</p>
              {actionableFindings.length > 0 && isComplete && (
                <Button size="sm" onClick={draftAllActionable} disabled={drafting !== null}>
                  {drafting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Draft all {actionableFindings.length} actionable findings
                </Button>
              )}
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {sortedActions.map((a) => (
                <ActionDraftCard
                  key={a.id}
                  action={a}
                  onExecute={executeAction}
                  onDismiss={dismissAction}
                  executing={executing}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="diff" className="mt-4">
          <DiffView diff={diff} currentHealth={health} />
        </TabsContent>

        <TabsContent value="trend" className="mt-4">
          <HealthTrendChart />
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}
    </div>
  );
}

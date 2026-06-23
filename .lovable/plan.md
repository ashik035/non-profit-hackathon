# Mission Control — Hackathon Build Plan

Build a "Mission Control" page that fires 6 AI agents in parallel across the whole org, streams their findings live, and synthesizes a priority briefing — supported by a live Org Health Score on the dashboard and live data in the Board Report. All three share the same underlying agent runs so the demo tells one story.

## What you already have (reuse, don't rebuild)

- `supabase/functions/orchestrate-agent-team/index.ts` — parallel/sequential agent execution
- 5 agent edge functions + hooks: `donor-churn-risk`, `executive-daily-briefer`, `strategic-insights`, `action-item-tracker`, `compile-meeting-summary`
- `src/components/dashboard/OrgHealthScore.tsx` — UI built, takes props
- `src/pages/BoardReportsPage.tsx` — UI + PDF export wired to demo data
- 97 imported tables in Supabase (donations, members, grants, meetings, tasks, etc.)
- `ai-chat-assistant` edge function for the final synthesis LLM call

## What's missing (what we build)

### 1. Mission Control feature (Days 1–4) — the headline

- **New page** `src/pages/MissionControlPage.tsx` at route `/mission-control`, added to sidebar under "Reporting + AI"
- **New edge function** `supabase/functions/mission-control-scan/index.ts`
  - Accepts `{ user_id, scope? }`
  - Creates a `mission_control_runs` row, returns `run_id` immediately
  - Fires 6 agent calls in parallel using `Promise.allSettled` and `supabase.functions.invoke`:
    1. Donor Churn Risk (`donor-churn-risk`)
    2. Executive Daily Briefer (`executive-daily-briefer`)
    3. Strategic Insights (`strategic-insights`)
    4. Action Item Tracker (`action-item-tracker`)
    5. Grant Deadline Watcher (new lightweight call to `ai-chat-assistant` over `nonprofit_campaigns` + grants data)
    6. Data Health Scanner (new lightweight call over `nonprofit_donations`, `nonprofit_members`, missing-fields detection)
  - Each finished agent writes a row to `mission_control_findings` with `severity`, `title`, `detail`, `source_agent`, `recommended_action`
  - After all settle, calls `ai-chat-assistant` to synthesize a single executive briefing → stored on the run row
- **New tables** (migration):
  - `mission_control_runs (id, user_id, status, started_at, completed_at, synthesis, health_score)`
  - `mission_control_findings (id, run_id, source_agent, severity, title, detail, recommended_action, created_at)`
  - RLS: authenticated users see their own runs; GRANTS to authenticated + service_role
  - Enable realtime on both tables
- **New hook** `src/hooks/useMissionControl.ts` — start run + realtime subscribe to findings as they arrive
- **UI components** under `src/components/mission-control/`:
  - `AgentRunGrid` — 6 cards showing each agent's status (pending → running → done/failed) with spinner + finding count
  - `FindingsFeed` — live-streaming list grouped by severity (red/amber/green)
  - `SynthesisBriefing` — final priority briefing card with "Generate Board Report" CTA
  - Big "Run Full Org Scan" hero button

### 2. Org Health Score — live (Day 5)

- **New hook** `src/hooks/useOrgHealthScore.ts` that aggregates from live tables:
  - Donor retention % (`nonprofit_donations` repeat donors / total)
  - Volunteer engagement (`nonprofit_volunteer_shifts` last 30 days)
  - Grant pipeline health (`nonprofit_campaigns` active vs at-risk)
  - Data completeness (% members/donations with required fields)
  - Meeting follow-through (`meeting_action_items` completed %)
- Compute weighted 0–100 score + breakdown + color
- Wire into `ExecutiveDirectorDashboard` replacing demo props
- Mission Control writes its computed score onto `mission_control_runs.health_score` so the dashboard refreshes after a scan

### 3. Board Report — live data (Day 6)

- **New hook** `src/hooks/useBoardReportData.ts` pulling live numbers:
  - Financials from `nonprofit_donations` grouped by quarter
  - Program metrics from `nonprofit_programs`
  - Membership growth from `nonprofit_members`
  - Top findings from latest `mission_control_runs.synthesis`
- Replace `DEMO_BOARD_REPORT` consumption in `BoardReportsPage.tsx` with the hook (keep demo as fallback if no data)
- PDF export already works — it just receives the live sections object
- Add "Generated from Mission Control run #X" footer

### 4. Polish + demo (Days 7–8)

- Loading shimmer + agent avatar animations on the grid
- Demo seed script (`scripts/seed-mission-control-demo.ts`) to ensure visible findings during the demo
- Empty-state CTA on dashboard: "Run your first org scan"
- 5-minute demo script: dashboard score → click Mission Control → watch 6 agents fire → synthesis appears → click "Generate Board Report" → PDF downloads

## Technical details

**Edge function pattern (parallel fan-out):**
```ts
const agents = ['donor-churn-risk','executive-daily-briefer', ...];
const results = await Promise.allSettled(
  agents.map(name => supabase.functions.invoke(name, { body: { run_id, user_id } }))
);
// each invoked function inserts into mission_control_findings itself
// then call ai-chat-assistant for synthesis
```

**Realtime streaming UI:**
```ts
supabase.channel(`mc:${runId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mission_control_findings', filter: `run_id=eq.${runId}` }, ...)
  .subscribe();
```

**Migration outline:**
```sql
CREATE TABLE public.mission_control_runs (...);
GRANT SELECT, INSERT, UPDATE ON public.mission_control_runs TO authenticated;
GRANT ALL ON public.mission_control_runs TO service_role;
ALTER TABLE public.mission_control_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own runs" ON public.mission_control_runs FOR ALL TO authenticated USING (user_id = auth.uid());
-- same shape for mission_control_findings
ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_control_findings;
```

## What I need from you

1. **Confirm scope** — build all 3 (Mission Control + live Health Score + live Board Report), or Mission Control first then decide?
2. **Auth** — is there a signed-in test user already, or should I make Mission Control work for any authenticated user with the demo data we imported?
3. **Synthesis model** — OK to use Lovable AI Gateway (`google/gemini-3-flash-preview` via existing `ai-chat-assistant`)? It's already wired.
4. **Agent #5 + #6** (Grant Deadline Watcher, Data Health Scanner) don't exist yet — OK if I implement them as lightweight new edge functions sharing the `ai-chat-assistant` LLM, rather than full standalone agents?

Approve and I'll start with the migration + `mission-control-scan` edge function + page scaffold on Day 1.

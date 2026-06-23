# Mission Control — Hackathon Winning Build (One Prompt)

Good news: ~80% is already in your codebase. This plan **finishes** Mission Control, **upgrades** Org Health Score and Board Report to demo-quality, and **wires the 3 into a single narrative** judges can follow in 5 minutes.

## What already exists (verified)

- `mission_control_runs` + `mission_control_findings` tables (RLS + realtime) ✓
- Edge function `mission-control-scan` (6 agents in parallel + Gemini synthesis) ✓
- `MissionControlPage`, `useMissionControl`, route `/mission-control` ✓
- `useOrgHealthScore` (donor retention, volunteer engagement, grant pipeline, data completeness) ✓
- `useBoardReportLive` (live financial + membership totals) ✓
- PDF export `boardReportPdf.ts` ✓
- `orchestrate-agent-team` edge function ✓

## What's missing for a winning demo

1. **The 6 agents don't visibly "fire live"** — UI updates only at completion, not while each agent runs. Judges need to *see* parallel execution.
2. **No streaming progress** — `mission-control-scan` returns one final payload.
3. **Org Health Score isn't linked to Mission Control** — needs a "Show me how we got this" CTA that triggers a scan.
4. **Board Report PDF uses static demo data** — must consume `useBoardReportLive` numbers.
5. **No "Take Action" on findings** — judges expect findings → tasks/board items.
6. **Demo polish**: hero numbers, agent avatars firing, severity counts, synthesis briefing prominent.

---

## Build Plan (one prompt)

### 1. Stream agent progress (Mission Control core)
- Refactor `mission-control-scan` to **write each agent's finding to `mission_control_findings` as it completes** (instead of batched at end). Each agent's `Promise.allSettled` branch inserts immediately on resolve.
- Update `mission_control_runs.agents_completed` after each agent finishes so the UI shows `3/6 agents complete` live.
- Keep final Gemini synthesis step that writes `executive_briefing` + `health_score` to the run row at the end.

### 2. Mission Control UI upgrades (`MissionControlPage.tsx`)
- **Agent grid**: 6 cards showing each agent with status pill (`idle` → `running` (spinner) → `complete` (check) → `error`). Drives off realtime subscription to the run row + per-agent finding count.
- **Live findings feed**: realtime stream of findings as they arrive, severity color-coded, agent badge.
- **Executive Briefing card** (top): big Gemini-synthesized summary + health score gauge, appears after synthesis.
- **Action buttons on each finding**: "Create Task" (insert into `tasks`) and "Add to Board Report" (insert into `meeting_action_items` or a `board_report_items` flag).
- **Header**: "Run Full Org Scan" button, last-run timestamp, total findings counter.

### 3. Org Health Score → Mission Control hook
- On `ExecutiveDirectorDashboard`, the Org Health card gets a **"How did we get this? → Run Scan"** button that navigates to `/mission-control` and auto-triggers a scan via query param `?autorun=1`.
- Health score on Mission Control page reuses `useOrgHealthScore` for the pre-scan baseline, then shows the post-scan AI-computed score for comparison.

### 4. Board Report live data + PDF
- Update `BoardReportsPage` to use `useBoardReportLive` numbers everywhere (replace remaining demo constants).
- `boardReportPdf.ts`: accept live data prop, render real totals (donations MTD/YTD, member counts, grant pipeline, volunteer hours, top findings from latest Mission Control run).
- Add "Pull from latest Mission Control scan" toggle that injects red/amber findings as board discussion items.

### 5. Demo narrative wiring
- Dashboard hero: Org Health Score big number with "Run Mission Control Scan" CTA
- Mission Control: 6 agents fire live → findings stream in → executive briefing + new health score appear
- "Generate Board Report" button on Mission Control jumps to `/board-reports` pre-filled with scan findings → one-click PDF

### 6. Quality + polish
- Loading skeletons on all 3 pages
- Empty states ("No scan yet — run your first")
- Error toasts on edge function failures
- Add "Mission Control" link prominent in sidebar AI group (already exists, verify visibility)

---

## Technical Details

**Tables** (already exist, no migration needed):
- `mission_control_runs` — add `agents_completed int default 0` if not present (verify; add migration if missing)
- `mission_control_findings` — already realtime-enabled

**Edge functions**:
- Modify `mission-control-scan` for incremental writes (no new function needed)
- Reuse `LOVABLE_API_KEY` for Gemini synthesis (already configured)

**Data sources for the 6 agents** (all live tables):
1. Donor Risk → `nonprofit_donations` (lapsed donor detection)
2. Volunteer Pulse → `nonprofit_volunteers`, `nonprofit_volunteer_shifts`
3. Grant Watcher → `nonprofit_programs` (deadline scan)
4. Task Backlog → `tasks` (overdue/stalled)
5. Data Health → cross-table completeness scan
6. Meeting Action Items → `meeting_action_items` (overdue commitments)

**New files** (~3):
- `src/components/mission-control/AgentCard.tsx`
- `src/components/mission-control/FindingCard.tsx`
- `src/hooks/useCreateTaskFromFinding.ts`

**Edited files** (~6):
- `supabase/functions/mission-control-scan/index.ts` (incremental writes)
- `src/pages/MissionControlPage.tsx` (live agent grid + actions)
- `src/hooks/useMissionControl.ts` (track per-agent status)
- `src/components/dashboard/ExecutiveDirectorDashboard.tsx` (Health → Scan CTA)
- `src/pages/BoardReportsPage.tsx` (full live data)
- `src/lib/boardReportPdf.ts` (live data + findings injection)

## Out of scope
- New auth/roles (existing Ashik test accounts work)
- New tables beyond verifying `agents_completed` column
- Replacing demo data on unrelated pages

## Risk / mitigation
- **Gemini rate limits during demo** → cache last synthesis; show cached briefing if 429
- **Realtime lag** → also poll every 2s as fallback while `running`
- **Edge function timeout** → 6 agents in parallel keep total runtime < 30s

Approve and I'll build everything in one shot in build mode.

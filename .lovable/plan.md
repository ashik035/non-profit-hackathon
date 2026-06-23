# 🏆 Hackathon Winner: Mission Control → Autonomous Action Layer

You already have Mission Control detecting problems. **Detection alone doesn't win.** The winning leap is going from *"6 agents found 12 problems"* to *"6 agents found 12 problems, drafted the responses, and are waiting for your one-click approval to execute."* That's the moment judges remember.

This plan is 100% scoped to what's achievable in this codebase + Supabase + Lovable AI Gateway. Anything that would need new infrastructure (email sending domains, payment rails, external CRM writes) is deliberately excluded.

---

## The Pitch (memorize this for the demo)

> "Most AI dashboards tell you *what's wrong*. Mission Control tells you what's wrong, **drafts the fix in your voice**, and executes it with one click. 6 agents, 1 click, full audit trail."

5 hackathon categories hit in one feature: **Multi-Agent · AI Agent · Workflow Automation · Productivity · Analytics**.

---

## What already exists (don't rebuild)

✓ `mission_control_runs` + `mission_control_findings` tables, RLS, realtime
✓ `mission-control-scan` edge function (6 parallel agents + Gemini synthesis)
✓ Live Org Health Score → MC deep link
✓ Board Report PDF with live MC briefing
✓ "Create task" action on findings
✓ Ashik test users for demo

## What we add (the winning layer)

### 1. AI Action Drafts — the headline upgrade
Every finding gets a **"Draft Action"** button. Clicking it calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with a finding-type-specific prompt and produces a concrete artifact:

| Finding type | AI-drafted artifact |
|---|---|
| At-risk donor (red) | Personalized re-engagement email (subject + body, ~150 words) |
| Lapsed grant deadline | Internal Slack/email reminder + suggested next-step checklist |
| Overdue meeting action items | Reassignment plan with new owner suggestions + due-date proposal |
| Giving decline | Mid-month appeal email + 3 segment suggestions |
| Data health gaps | CSV cleanup checklist + auto-generated SQL preview |
| Healthy / green | Celebration message for next board meeting |

Drafts are stored in a new `mission_control_actions` table with status `draft → approved → executed → archived`.

### 2. One-Click Approve & Execute
Each draft has **Approve** + **Edit & Approve** + **Dismiss** buttons:
- Approve → write to the appropriate destination table (tasks, board_report_items, communications_log) + log to `activity_logs`
- Edit → opens textarea, user tweaks, then approves
- Dismiss → archives with reason

This is the "agentic loop" — agents propose, human approves, system executes. Judges love this pattern because it's *responsible* AI, not autopilot.

### 3. Health Score Trend Chart
Add a small `recharts` line chart on the Mission Control page showing health score over the last 10 runs. Proves the system creates measurable improvement.

### 4. "What Changed Since Yesterday" Diff View
When a new scan completes, compare findings against the previous run and show:
- 🆕 New issues
- ✅ Resolved (present yesterday, gone today)
- ⚠️ Still open

This is the killer feature for daily standups and demos a clear narrative arc.

### 5. Live Activity Ticker (demo mode)
Top-of-page strip that streams every agent action across the org in realtime ("Donor Churn Agent flagged 3 at-risk donors · 14s ago"). Reads from `mission_control_findings` + `mission_control_actions` realtime channels. Pure visual candy — judges *see* the system working.

### 6. Demo-Mode "Replay" Button
A subtle button that re-runs the last scan with artificial 600ms delay between agents so the demo always looks great even on slow networks. Critical for live judging.

---

## Demo Script (3 minutes, memorized)

| Time | Action | Judges see |
|---|---|---|
| 0:00 | Open Dashboard | Org Health Score: 72/100 (red), "Run Mission Control Scan" CTA |
| 0:15 | Click CTA | Page transitions, 6 agent cards animate "Scanning live data…" |
| 0:30 | Watch live | Counters tick: 3 urgent, 5 watch, 4 healthy. Findings stream in card-by-card |
| 1:00 | Synthesis appears | Gemini executive briefing populates. Health score jumps to a new number |
| 1:15 | Click "Draft Action" on at-risk donor | AI generates personalized email in ~2s |
| 1:30 | Click Approve | Toast: "Task created + email saved to communications log" |
| 1:45 | Show "What changed since yesterday" tab | 2 new urgent, 1 resolved |
| 2:00 | Show health score trend chart | 65 → 71 → 78 line going up |
| 2:15 | Click "Generate Board Report" | PDF downloads with live numbers + AI briefing baked in |
| 2:30 | Pause for applause | 🎤 |

---

## Technical Plan

### A. Database (1 migration)
```sql
create table public.mission_control_actions (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.mission_control_findings(id) on delete cascade,
  run_id uuid not null references public.mission_control_runs(id) on delete cascade,
  user_id uuid,
  action_type text not null,        -- 'donor_email' | 'task_reassign' | 'grant_reminder' | 'board_memo' | etc
  status text not null default 'draft',  -- draft | approved | executed | dismissed
  title text not null,
  draft_content text not null,      -- the AI-generated artifact
  edited_content text,              -- user edits
  destination jsonb,                -- where it landed (task_id, etc) when executed
  dismissed_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  approved_at timestamptz,
  executed_at timestamptz
);

grant select, insert, update on public.mission_control_actions to authenticated;
grant all on public.mission_control_actions to service_role;
alter table public.mission_control_actions enable row level security;

create policy "auth read" on public.mission_control_actions
  for select to authenticated using (true);
create policy "auth write" on public.mission_control_actions
  for insert to authenticated with check (true);
create policy "auth update" on public.mission_control_actions
  for update to authenticated using (true);

alter publication supabase_realtime add table public.mission_control_actions;
```

### B. Edge Functions (2 new + 1 modified)

**New: `mission-control-draft-action`**
- Input: `{ finding_id }`
- Pulls the finding, picks a prompt template by `source_agent`, calls Lovable AI Gateway
- Inserts row into `mission_control_actions` with `status='draft'`
- Returns the draft for immediate display

**New: `mission-control-execute-action`**
- Input: `{ action_id, edited_content?, destination_type }`
- Materializes the action:
  - `task_reassign` / `donor_email` / `grant_reminder` → insert into `tasks`
  - `board_memo` → set a flag/field so Board Report PDF picks it up
  - `comms_draft` → insert into existing communications table if present, else into `notifications`
- Updates the action row to `status='executed'` with destination metadata
- Logs to `activity_logs`

**Modified: `mission-control-scan`**
- After insert of findings, compute a **diff vs previous run** and store in `mission_control_runs.synthesis.diff = { new: [...], resolved: [...], persisted: [...] }`

### C. Frontend (new + edited files)

**New components**
- `src/components/mission-control/ActionDraftCard.tsx` — shows AI draft + Approve/Edit/Dismiss
- `src/components/mission-control/HealthTrendChart.tsx` — recharts line chart from last 10 runs
- `src/components/mission-control/DiffView.tsx` — new/resolved/persisted tabs
- `src/components/mission-control/LiveActivityTicker.tsx` — top strip realtime feed

**New hooks**
- `src/hooks/useMissionControlActions.ts` — list/create/approve/execute
- `src/hooks/useMissionControlHistory.ts` — last 10 runs for trend chart
- `src/hooks/useMissionControlDiff.ts` — compute diff vs prior run

**Edited**
- `src/pages/MissionControlPage.tsx` — add ticker, tabs (Findings | Drafts | Diff | Trend), Draft Action button on each finding
- `src/components/dashboard/OrgHealthScore.tsx` — small sparkline of last 5 scores

### D. Polish for the demo
- Loading skeletons everywhere
- Toast notifications on every action ("Email drafted in 1.4s")
- Smooth `framer-motion` fade-in on finding cards (already partially styled)
- Empty states with friendly copy
- Error fallbacks if Lovable AI returns 429 (cached sample drafts so demo never breaks)

---

## What I'm explicitly NOT building (out of scope)

- Real email sending (no SendGrid/SES domain configured for the test users)
- External CRM writes (Salesforce/HubSpot)
- Voice/audio agents
- Mobile-native UI
- Scheduled cron jobs via pg_cron (use a "Run Now" button instead — demo doesn't need real schedules)
- Auth/role overhaul (existing Ashik users are sufficient)

These would be cool but they're risk for hackathon timeline. The plan above is fully achievable in **one prompt** because every primitive (edge functions, AI gateway, tables, realtime, recharts) already exists in this project.

---

## Risk Mitigation
| Risk | Mitigation |
|---|---|
| Lovable AI rate limit during demo | Cache last 3 drafts per finding type; show cached if 429 |
| Edge function cold start | Pre-warm by hitting `/mission-control` before demo starts |
| Realtime lag | Keep the 1.5s polling fallback already in place |
| Empty data (no donors lapsed) | Seed 2 demo at-risk donors in `nonprofit_donations` if missing |
| Browser cache showing stale findings | Hard refresh between demo runs; "Demo Replay" button bypasses cache |

---

## Why this wins

| Judge thought | Why we win |
|---|---|
| "AI does something real" | 6 agents firing live + AI drafting personalized emails on screen |
| "Real product?" | Live DB everywhere, full audit trail, RLS-protected |
| "Would I use it?" | One-click approval saves hours of weekly ops |
| "Category-defining?" | Multi-agent + human-in-the-loop execution for nonprofits doesn't exist |
| "Memorable demo?" | The "Approve → executed in 0.4s" moment is the clip that goes in the highlight reel |

Approve this plan and I'll build all of it in one shot when you switch to build mode.

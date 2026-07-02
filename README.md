# Nonprofit Control Tower

An operational intelligence layer for modern nonprofits, built with React, TypeScript, and Supabase.

## Quick Start

Choose your deployment path:

| I want to... | Go here |
|--------------|---------|
| **Deploy with Lovable (10 min)** | [Lovable Quickstart](./docs/00-getting-started/lovable-quickstart.md) |
| **Self-host on my infrastructure** | [Self-Host Guide](./docs/00-getting-started/self-host-quickstart.md) |
| **Browse all documentation** | [Documentation](./docs/README.md) |

## Features

- 📊 **Dashboard** — Role-specific analytics (Executive Director, Development Director, Finance Manager, Operations Manager)
- 💰 **Grants Management** — Track grant lifecycle, deadlines, and fund utilization
- ✍️ **Grant Writer** — AI-assisted section-by-section grant draft generation
- 🎪 **Events** — Post-event engagement intelligence and follow-up automation
- 📋 **Board Reports** — Generate board-ready KPI summaries and financial snapshots
- 🏛️ **AI Boardroom** — Live four-persona board simulation with streaming debate, decision memo, session history, and Board Reports handoff (see [AI Boardroom](#ai-boardroom) below)
- 🔍 **Data Health** — Surface CRM data quality issues (duplicates, incomplete profiles)
- 💱 **Reconciliation** — Match transactions across payment processors and CRM/finance systems
- 🪪 **Membership Management** — Member directory, tier/status tracking, renewals, onboarding
- 🤝 **Volunteer Management** — Roster, shift tracking, skills, economic value reporting
- 📅 **Event Management** — Full event lifecycle: create, capacity, speakers, registrations, tickets
- 💳 **Donation Center** — Campaign management, fund tracking, donation history, record donations
- 🌐 **Public Presence** — Website visibility controls, embed codes, social sharing
- 📈 **Impact Dashboard** — Program outcomes, milestones, AI-drafted annual report
- 🎯 **AI Engagement Scoring** — 0–100 member scores, at-risk detection, AI next-best-action
- 🤖 **AI Agent Teams** — 16 specialized agents across 4 teams (Donor, Meeting, Strategy, Project)
- 📚 **Knowledge Base** — Semantic search across documents
- 🔐 **Role-Based Access** — Admin, moderator, and user roles
- 🔑 **SSO Authentication** — Google and Microsoft sign-in

## AI Boardroom

Stress-test strategic decisions before a real board meeting. Ask a question, watch four AI directors debate in character using **live org data**, then review a structured decision memo. Every simulation is saved per user and can be reopened from history or sent to Board Reports.

Architecture diagram: [`docs/01-architecture/boardroom-architecture-diagram.png`](docs/01-architecture/boardroom-architecture-diagram.png)

### Live simulation (`/boardroom`)

| Capability | Description |
|------------|-------------|
| **Board question** | Free-text question or one-click **10 sample chips** tied to campaigns, programs, grants, volunteers, events, and members in your database |
| **Convene the board** | Starts an NDJSON stream from the `boardroom-simulate` edge function |
| **Four personas** | Elena (Chair), Marcus (CFO), David (Growth), Priya (Community) — each with accent-colored roster cards |
| **Sequential debate** | One speaker at a time with a readable typewriter reveal; next persona starts only after the previous finishes |
| **Live org tools** | Personas pull real data before speaking: financial snapshot, program metrics, knowledge-base search |
| **Tension meter** | Visual gauge of debate intensity based on transcript language |
| **Auto-scroll** | Page scrolls to the debate on convene, follows the active speaker, and scrolls to the memo when complete |
| **Decision memo** | Appears after all turns finish: board decision, vote record (Yes / No / Conditional per director), numbered risk analysis, dissenting view |
| **Board prep handoff** | **Adopt as Board Prep Doc** saves the memo and opens `/board-reports?from=boardroom` |
| **Demo fallback** | If AI or the edge function is unavailable, a scripted debate runs so the flow is still demoable |

### Session history

| Capability | Description |
|------------|-------------|
| **Past simulations sidebar** | Collapsible panel (desktop) or sheet (mobile) listing your last 50 sessions |
| **Scrollable list** | Fixed-height panel with professional scrollbar for older sessions |
| **Session detail** | `/boardroom/sessions/:sessionId` — full audit: metadata, transcript, memo, copy memo, **copy audit JSON** |
| **Board Reports link** | Recent simulations also surface on `/board-reports` with links back to detail pages |
| **Activity logging** | Session create, update, and view events logged for audit |

### Persistence & security

- Table: `boardroom_sessions` — `question`, `transcript`, `vote`, `memo`, `risks`, `dissent`, `status`, `source` (`live` \| `fallback`), `completed_at`
- **Row Level Security** — users only see and write their own sessions
- **Dual save** — edge function persists on completion; client syncs as backup and refreshes the history list

### Board personas

| Persona | Role | Lens |
|---------|------|------|
| Elena Vasquez | Board Chair | Mission alignment, governance, charter fidelity |
| Marcus Chen | Treasurer / CFO | Cash runway, restricted funds, audit risk (pulls financials) |
| David Okafor | Vice Chair, Growth | Partnerships, bold pilots, donor pipeline |
| Priya Raman | Community Director | Equity, program quality, beneficiary voice (pulls program metrics) |

### Routes

| Path | Description |
|------|-------------|
| `/boardroom` | Run a new simulation; persona roster, question form, live debate, memo |
| `/boardroom/sessions/:sessionId` | Read-only audit view for a saved session |
| `/board-reports?from=boardroom` | Board prep doc after adopting a memo |

### Key files

| Path | Purpose |
|------|---------|
| `src/pages/BoardroomPage.tsx` | Main simulator UI |
| `src/pages/BoardroomSessionPage.tsx` | Session audit detail |
| `src/hooks/useBoardroom.ts` | Stream consumer + fallback |
| `src/hooks/useBoardroomSessions.ts` | History list and detail queries |
| `src/hooks/useSequentialTurnDisplay.ts` | One-speaker-at-a-time display queue |
| `supabase/functions/boardroom-simulate/` | Edge orchestrator (personas, tools, memo) |

### Deploy (self-host / Supabase CLI)

```bash
npm run boardroom:migrate      # apply boardroom_sessions migrations
npm run deploy:boardroom       # deploy boardroom-simulate edge function
npm run boardroom:verify       # smoke-check table + function
```

**Lovable Cloud** — run SQL in order in the SQL Editor:

1. `supabase/migrations/20260629120000_boardroom_sessions.sql`
2. `supabase/migrations/20260630120000_boardroom_sessions_audit.sql`
3. `supabase/migrations/20260630130000_boardroom_sessions_repair.sql`

Then deploy the `boardroom-simulate` function from the repo.

### Try it

1. Log in at `/login` — demo: `director@nonprofitai.software` / `Demo@123`
2. Sidebar → **Reporting + AI** → **AI Boardroom**
3. Pick a sample question or type your own → **Convene the board**
4. After the memo, use **Adopt as Board Prep Doc** or open **Past simulations** to revisit a session

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Edge Functions + Auth) |
| **Deployment** | Lovable.dev or Self-hosted |
| **AI** | Lovable AI (included) or OpenAI/Anthropic |

## Documentation

See [docs/README.md](./docs/README.md) for complete documentation including:

- Architecture overview
- Module documentation (nonprofit operations + AI agents)
- Deployment guides
- Integration setup
- Admin configuration

## Roadmap

See [docs/nonprofit-control-tower-roadmap.md](./docs/nonprofit-control-tower-roadmap.md) for the living roadmap.

## License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Built with ❤️ using [Lovable.dev](https://lovable.dev) + [Supabase](https://supabase.com)**

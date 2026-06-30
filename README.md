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
- 🏛️ **AI Boardroom** — Live multi-persona board simulation: four AI directors debate a strategic question, produce a vote tally, decision memo, risks, and dissent; sessions auto-save and appear in a collapsible history sidebar
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

Simulate a nonprofit board meeting before the real one. Ask a strategic question (e.g. *Should we pilot youth mentorship in Q3?*); four AI personas debate in rounds, grounding claims in live org data (financials, programs, knowledge base), then deliver a structured decision memo.

| Persona | Role |
|---------|------|
| Elena Vasquez | Board Chair — mission alignment, governance |
| Marcus Chen | Treasurer / CFO — runway, restricted funds, audit risk |
| David Okafor | Vice Chair, Growth — partnerships, bold pilots, donor pipeline |
| Priya Raman | Community Director — equity, program quality, beneficiary voice |

**Routes**

| Path | Description |
|------|-------------|
| `/boardroom` | Run a new simulation; past sessions in the sidebar |
| `/boardroom/sessions/:sessionId` | Full audit view (transcript, memo, vote, copy JSON) |

**Persistence** — Completed sessions are stored in `boardroom_sessions` (transcript, vote, memo, risks, dissent). The edge function saves on completion; the client syncs as a backup and refreshes the history list.

**Deploy (self-host / Supabase CLI)**

```bash
npm run boardroom:migrate      # apply boardroom_sessions migrations
npm run deploy:boardroom       # deploy boardroom-simulate edge function
npm run boardroom:verify       # smoke-check table + function
```

On Lovable Cloud, run the SQL from `supabase/migrations/20260629120000_boardroom_sessions.sql` and the audit/repair migrations in the SQL Editor, then deploy the `boardroom-simulate` function from the repo.

**Try it** — Log in at `/login` (demo: `director@nonprofitai.software` / `Demo@123`), open **AI Boardroom** in the sidebar under Reporting + AI, and click **Convene the board**.

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

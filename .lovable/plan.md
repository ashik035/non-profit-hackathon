# AI Boardroom Simulator — Hackathon Plan

## The pitch (one line)
Pick any strategic question your nonprofit faces, and watch a **simulated board meeting** unfold live: four AI board-member personas debate it using your real data, vote, and hand you a one-page decision memo.

## Why this wins
- **Nobody has seen it before.** Every hackathon has "AI chat" and "AI summary". A multi-agent, persona-driven debate that streams in real time is theatrical and instantly understandable to non-technical judges.
- **Demos in 90 seconds.** Click a question → four avatars start typing → vote tally → memo. Pure visual payload.
- **Solves a real nonprofit pain.** Real boards meet quarterly and EDs are stuck guessing how directors will react. This rehearses the room.
- **Uses every buzzword judges score on:** multi-agent orchestration, role-play prompting, tool-use/RAG over org data, structured output, streaming, human-in-the-loop ("Adopt as Board Prep Doc").
- **Built fresh** — no overlap with Mission Control, Chief of Staff, or the existing agents.

## The 90-second demo
1. Open `/boardroom`. See four empty board seats with persona cards: **Marcus (Skeptical CFO)**, **Elena (Mission-First Chair)**, **David (Growth-Hungry Vice Chair)**, **Priya (Community-Voice Director)**.
2. Pick a question chip: *"Should we launch the youth mentorship program in Q3?"*
3. Hit **Convene Board**. Each persona's bubble streams in turn:
   - Elena opens: *"Our mission charter explicitly..."*
   - Marcus pushes back with **a number pulled from the live DB**: *"We're at 95% of revenue target, but unrestricted cash is..."*
   - David counters, Priya grounds it in community data.
   - Two rounds of debate.
4. **Vote tally** animates in: 3 Yes / 1 Conditional.
5. **One-page decision memo** generates: recommendation, risks, required follow-ups, dissenting view. Button: **Save to Board Reports**.

## What makes it feel real (the polish that wins)
- Each persona has a distinct **tone, vocabulary, and concern lens** baked into their system prompt.
- Personas **cite live data** via tool calls — Marcus literally queries `nonprofit_donations` for cash position before objecting.
- Debate runs as **sequential streams** with typing indicators, not one big blob.
- A small **"Tension Meter"** rises during disagreement, falls at consensus.
- Generated **avatar portraits** (one-time imagegen, stored as assets) — not generic icons.

## Scope

**Build:**
- New page `/boardroom` with persona seats, question composer, debate transcript, vote panel, decision memo.
- One edge function `boardroom-simulate` that orchestrates the multi-persona loop server-side and streams persona-tagged chunks.
- 4 hardcoded persona system prompts (you can tweak in code, not DB — faster).
- 3 shared tools the personas call: `get_financial_snapshot`, `get_program_metrics`, `search_org_knowledge` (semantic over `knowledge_entries`).
- `boardroom_sessions` table to persist questions + transcripts + memos.
- "Adopt as Board Prep Doc" → writes a row into existing board-reports surface.
- 8 curated starter question chips covering finance, programs, fundraising, governance.

**Explicitly skip:**
- Letting users edit personas (v2).
- Audio/voice for personas (cool, but eats your session — use text-only with typing animation, looks just as good on a projector).
- Real-time multi-user co-watching.
- More than 4 personas (4 is the sweet spot — 5+ makes the debate noisy).

## Files to create
```
supabase/functions/boardroom-simulate/index.ts        # orchestrator, streams persona-tagged parts
supabase/functions/_shared/boardroom-personas.ts      # 4 system prompts + voice rules
supabase/functions/_shared/boardroom-tools.ts         # 3 shared data tools
supabase/migrations/<ts>_boardroom_sessions.sql
src/pages/BoardroomPage.tsx
src/components/boardroom/PersonaSeat.tsx              # avatar + name + role + typing state
src/components/boardroom/DebateTranscript.tsx         # streamed bubbles by persona
src/components/boardroom/TensionMeter.tsx
src/components/boardroom/VoteTally.tsx
src/components/boardroom/DecisionMemo.tsx
src/components/boardroom/QuestionChips.tsx
src/hooks/useBoardroomSession.ts                      # SSE consumer, persona routing
src/assets/personas/marcus.png .. priya.png           # imagegen, 4 portraits
```

## Files to edit
- `src/App.tsx` — register `/boardroom`.
- `src/shared/data/navigationStructure.ts` — add **Boardroom Simulator** under Reporting + AI with a gavel icon.
- `supabase/config.toml` — register the edge function.

## Technical design

### Orchestration loop (edge function)
Server-side loop, **not** a single `streamText` call:
```
for round in 1..2:
  for persona in [Elena, Marcus, David, Priya]:
    chunk = streamText({ model: gemini-3-flash-preview,
                         system: persona.prompt + sharedContext,
                         tools: { ...3 tools },
                         messages: transcriptSoFar,
                         stopWhen: stepCountIs(8) })
    forEachChunk → enqueue({ persona: persona.id, type: 'text-delta', delta })
    transcriptSoFar.push({ role: 'assistant', name: persona.id, content: full })
# final call: structured output for vote + memo
voteAndMemo = generateText({ output: Output.object({ vote, memo, risks, dissent }) })
enqueue({ type: 'final', voteAndMemo })
```
Stream to client as a custom SSE with `persona` field on every event so the UI knows which bubble to grow.

### Frontend consumption
- `useBoardroomSession` opens an `EventSource`-style stream (fetch + ReadableStream reader since edge functions don't do real SSE — manual newline-delimited JSON works fine).
- A `Map<personaId, draftText>` updates as chunks arrive; React re-renders only the active bubble.
- Typing indicator = whichever persona currently has an open stream.
- Tension meter = simple heuristic: count disagreement markers ("however", "I disagree", "concern") in the rolling transcript.

### Personas (one-line voice rules — full prompts in code)
- **Marcus, CFO** — numbers-first, asks for cash runway, hates restricted-fund confusion. Always calls `get_financial_snapshot` before speaking.
- **Elena, Chair** — mission and charter, long-term reputation, governance hygiene.
- **David, Vice Chair** — growth, donor pipeline expansion, willing to take risks.
- **Priya, Community Voice** — beneficiary impact, equity, calls `get_program_metrics`.

## Database

```sql
CREATE TABLE public.boardroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  vote jsonb,
  memo text,
  risks jsonb,
  dissent text,
  status text NOT NULL DEFAULT 'running',
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.boardroom_sessions TO authenticated;
GRANT ALL ON public.boardroom_sessions TO service_role;
ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions" ON public.boardroom_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

## Build order (one Cursor session)
1. Migration + 4 portrait images (imagegen, transparent PNG on white).
2. Personas file + tools file.
3. Edge function: get one persona streaming end-to-end first.
4. Loop over 4 personas, 2 rounds.
5. Final structured vote+memo call.
6. Frontend: stream consumer + bubble routing.
7. PersonaSeat avatars + typing dots + TensionMeter.
8. VoteTally + DecisionMemo + "Save to Board Reports".
9. 8 starter question chips + empty-state polish.
10. Rehearse demo twice; cut anything that takes >3s without visible feedback.

## Risks & mitigations
- **Total latency** of 8 streamed turns can hit 30–40s. Mitigate by capping each persona at ~120 tokens with a strict prompt rule, and showing typing dots so it *feels* alive.
- **Personas going off-character** → put voice rules and forbidden phrases in each system prompt; add a one-line reminder before every turn.
- **Tool-call schema blowing up on Gemini** → keep each tool's Zod input flat, 1–2 fields max.
- **Gateway 402 mid-demo** → pre-warm before judging, catch and show "Reconvening..." toast.

This is the feature judges will be repeating to each other in the hallway.
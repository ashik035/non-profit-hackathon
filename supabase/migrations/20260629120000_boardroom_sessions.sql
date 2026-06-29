-- Boardroom Simulator session persistence
CREATE TABLE IF NOT EXISTS public.boardroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  vote jsonb,
  memo text,
  risks jsonb,
  dissent text,
  status text NOT NULL DEFAULT 'running',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boardroom_sessions_own" ON public.boardroom_sessions;
CREATE POLICY "boardroom_sessions_own"
  ON public.boardroom_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.boardroom_sessions TO authenticated;
GRANT ALL ON public.boardroom_sessions TO service_role;

CREATE INDEX IF NOT EXISTS idx_boardroom_sessions_user_created
  ON public.boardroom_sessions (user_id, created_at DESC);

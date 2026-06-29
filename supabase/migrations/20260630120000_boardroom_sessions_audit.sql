-- Boardroom session audit columns: source + completed_at
ALTER TABLE public.boardroom_sessions
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'boardroom_sessions_source_check'
  ) THEN
    ALTER TABLE public.boardroom_sessions
      ADD CONSTRAINT boardroom_sessions_source_check
      CHECK (source IN ('live', 'fallback'));
  END IF;
END $$;

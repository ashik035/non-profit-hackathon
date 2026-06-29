-- Repair boardroom_sessions schema on Lovable-hosted DB (table may predate full migration).
ALTER TABLE public.boardroom_sessions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Backfill updated_at for existing rows
UPDATE public.boardroom_sessions
SET updated_at = COALESCE(updated_at, created_at, now())
WHERE updated_at IS NULL;

ALTER TABLE public.boardroom_sessions
  ALTER COLUMN updated_at SET DEFAULT now();

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

DROP TRIGGER IF EXISTS update_boardroom_sessions_updated_at ON public.boardroom_sessions;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    CREATE TRIGGER update_boardroom_sessions_updated_at
      BEFORE UPDATE ON public.boardroom_sessions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

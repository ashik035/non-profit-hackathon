-- Ensure nonprofit seed tables have primary keys on id (required for upserts / PostgREST).
-- Safe when tables were created via CREATE TABLE IF NOT EXISTS without PK on remote.

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'nonprofit_members',
    'nonprofit_volunteers',
    'nonprofit_volunteer_shifts',
    'nonprofit_campaigns',
    'nonprofit_donations',
    'nonprofit_events',
    'nonprofit_event_ticket_types',
    'nonprofit_event_speakers',
    'nonprofit_event_agenda_items',
    'nonprofit_event_registrants',
    'nonprofit_programs'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NULL THEN
      CONTINUE;
    END IF;
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = 'public'
        AND rel.relname = tbl
        AND c.contype = 'p'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD PRIMARY KEY (id)', tbl);
      RAISE NOTICE 'Added PRIMARY KEY on public.%', tbl;
    END IF;
  END LOOP;
END $$;

#!/usr/bin/env bash
# Deploy boardroom-simulate edge function to linked Supabase project.
# Requires: npx supabase login  OR  SUPABASE_ACCESS_TOKEN in environment.
set -euo pipefail
cd "$(dirname "$0")/.."

# Load SUPABASE_ACCESS_TOKEN from .env if not already exported
if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ] && [ -f .env ]; then
  _line="$(grep -E '^SUPABASE_ACCESS_TOKEN=' .env | tail -1 || true)"
  if [ -n "$_line" ]; then
    SUPABASE_ACCESS_TOKEN="${_line#SUPABASE_ACCESS_TOKEN=}"
    SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN%\"}"
    SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN#\"}"
    SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN%\'}"
    SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN#\'}"
    export SUPABASE_ACCESS_TOKEN
  fi
fi

REF="${SUPABASE_PROJECT_REF:-pvpopofbqoysxkthznox}"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  if ! npx supabase projects list &>/dev/null; then
    echo "ERROR: Not logged in to Supabase CLI."
    echo "Run once:  npx supabase login"
    echo "Then rerun: npm run deploy:boardroom"
    exit 1
  fi
fi

echo "Deploying boardroom-simulate to project ${REF}..."
npx supabase functions deploy boardroom-simulate --project-ref "$REF"
echo "Done. Optional secrets (Supabase Dashboard → Edge Functions → Secrets):"
echo "  OPENAI_API_KEY=sk-...   (if Lovable credits exhausted)"

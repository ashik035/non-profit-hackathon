## Goal
Create one test account per `app_role` (`admin`, `moderator`, `user`) in Supabase Auth, with first/last name = "Ashik", and a known plaintext password. Supabase manages password hashing (bcrypt) automatically when accounts are created via the Auth Admin API — we don't hash manually.

## Accounts to create

| Role | Email (username) | Password |
|------|------------------|----------|
| admin | ashik.admin@nonprofitai.test | Ashik@Admin#2026 |
| moderator | ashik.moderator@nonprofitai.test | Ashik@Mod#2026 |
| user | ashik.user@nonprofitai.test | Ashik@User#2026 |

All accounts: `first_name = "Ashik"`, `last_name = "Ashik"`, email auto-confirmed.

## Implementation

1. **New edge function** `supabase/functions/seed-ashik-roles/index.ts`
   - Uses `SUPABASE_SERVICE_ROLE_KEY` (already in secrets)
   - For each of the 3 accounts:
     - `supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: 'Ashik', last_name: 'Ashik', full_name: 'Ashik Ashik' } })`
     - If user already exists, look up id and continue (idempotent)
     - Upsert `profiles` row (`id`, `full_name='Ashik Ashik'`)
     - Insert into `user_roles` (`user_id`, `role`) with `ON CONFLICT DO NOTHING`
   - Returns JSON listing each account's email, role, user_id, and status (created/existed)

2. **Invoke it once** via `supabase--curl_edge_functions` (POST, no auth needed since service role is server-side).

3. **Report back** the 3 email/password pairs in plain text in chat.

## Notes
- No schema migration needed — `profiles`, `user_roles`, and the `app_role` enum already exist.
- Passwords are stored as bcrypt hashes by `auth.admin.createUser`; we never touch `auth.users.encrypted_password` directly.
- Function is one-shot/idempotent; safe to re-run.
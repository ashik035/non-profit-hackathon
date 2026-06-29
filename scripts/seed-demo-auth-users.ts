/**
 * Ensure demo Quick Login users exist in Supabase Auth.
 * Run: npx tsx scripts/seed-demo-auth-users.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(import.meta.dirname, "..");
const PASSWORD = "Demo@123";

const DEMO_USERS = [
  { email: "director@nonprofitai.software", role: "executive_director" },
  { email: "development@nonprofitai.software", role: "development_director" },
  { email: "finance@nonprofitai.software", role: "finance_manager" },
  { email: "operations@nonprofitai.software", role: "operations_manager" },
] as const;

function loadEnvFile(): void {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnvFile();
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw new Error(listErr.message);

  const byEmail = new Map((list.users ?? []).map((u) => [u.email?.toLowerCase(), u]));

  for (const demo of DEMO_USERS) {
    const existing = byEmail.get(demo.email.toLowerCase());
    if (existing) {
      console.log(`✓ ${demo.email} already exists`);
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: demo.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { agency_role: demo.role, full_name: demo.role.replace(/_/g, " ") },
    });

    if (error) {
      console.warn(`✗ ${demo.email}: ${error.message}`);
    } else {
      console.log(`✓ Created ${demo.email} (${data.user?.id})`);
    }
  }

  console.log("\nQuick Login password:", PASSWORD);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

/**
 * Verify nonprofit seed row counts match expected demo data.
 * Run: npx tsx scripts/verify-nonprofit-seed.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  DEMO_MEMBERS,
  DEMO_VOLUNTEERS,
  DEMO_CAMPAIGNS,
  DEMO_DONATIONS_RECENT,
  DEMO_MANAGED_EVENTS,
  DEMO_PROGRAMS,
} from "../src/shared/data/nonprofitDemoData.ts";

const ROOT = join(import.meta.dirname, "..");

const EXPECTED = {
  nonprofit_members: DEMO_MEMBERS.length,
  nonprofit_volunteers: DEMO_VOLUNTEERS.length,
  nonprofit_volunteer_shifts: DEMO_VOLUNTEERS.reduce((n, v) => n + v.shifts.length, 0),
  nonprofit_campaigns: DEMO_CAMPAIGNS.length,
  nonprofit_donations: DEMO_DONATIONS_RECENT.length,
  nonprofit_events: DEMO_MANAGED_EVENTS.length,
  nonprofit_event_registrants: DEMO_MANAGED_EVENTS.reduce((n, e) => n + e.registrants.length, 0),
  nonprofit_programs: DEMO_PROGRAMS.length,
} as const;

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
  const supabase = createClient(url, serviceKey);

  let failed = false;
  for (const [table, expected] of Object.entries(EXPECTED)) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    const ok = !error && count !== null && count >= expected;
    console.log(
      `${table}: ${error ? `FAIL ${error.message}` : count} (expected >= ${expected}) ${ok ? "OK" : "MISSING"}`,
    );
    if (!ok) failed = true;
  }

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const { data: donations } = await supabase
    .from("nonprofit_donations")
    .select("amount")
    .gte("created_at", yearStart);
  const ytd = donations?.reduce((s, d) => s + Number(d.amount ?? 0), 0) ?? 0;
  console.log(`YTD donations total: $${Math.round(ytd)} ${ytd > 0 ? "OK" : "ZERO"}`);

  const { count: activeMembers } = await supabase
    .from("nonprofit_members")
    .select("id", { count: "exact", head: true })
    .eq("status", "Active");
  console.log(`Active members (boardroom tools): ${activeMembers ?? 0}`);

  if (failed || ytd === 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

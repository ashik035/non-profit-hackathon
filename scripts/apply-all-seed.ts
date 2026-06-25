/**
 * Apply all seed SQL files to the linked Supabase project.
 *
 * Path A (preferred): SUPABASE_SERVICE_ROLE_KEY + admin_exec_sql RPC
 * Path B: Admin login + run-seed edge function (must be deployed)
 *
 * Run: npm run seed:all
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ROOT = join(import.meta.dirname, "..");

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

const SEED_FILES = [
  "00-platform-core.sql",
  "01-actions.sql",
  "03-meetings.sql",
  "04-knowledge.sql",
  "05-projects.sql",
  "05b-project-client-access.sql",
  "05c-project-module-settings.sql",
  "06-business-dev.sql",
  "03b-meetings-extended.sql",
  "08-ai-agents.sql",
  "09-feedback-bugs.sql",
  "10-nonprofit-members.sql",
  "11-nonprofit-volunteers.sql",
  "12-nonprofit-donations.sql",
  "13-nonprofit-events.sql",
  "14-nonprofit-programs.sql",
] as const;

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@nonprofitai.software";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Demo@123";

function getConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const anonKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return { url, anonKey, serviceKey };
}

async function execSqlViaRpc(
  supabase: SupabaseClient,
  sql: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("admin_exec_sql", {
    sql_content: sql,
  });
  if (error) return { success: false, error: error.message };
  const result = data as { success?: boolean; error?: string };
  if (!result?.success) {
    return { success: false, error: result?.error ?? "admin_exec_sql failed" };
  }
  return { success: true };
}

async function runSeedViaEdgeFunction(
  supabase: SupabaseClient,
  token: string,
  fileName: string,
  sql: string
): Promise<{ success: boolean; durationMs: number; error?: string }> {
  const { data, error } = await supabase.functions.invoke("run-seed", {
    body: { sql, fileName },
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error)
        : null) || error.message;
    return {
      success: false,
      durationMs: (data as { durationMs?: number })?.durationMs ?? 0,
      error: message,
    };
  }

  return {
    success: Boolean((data as { success?: boolean })?.success),
    durationMs: (data as { durationMs?: number })?.durationMs ?? 0,
    error:
      (data as { error?: string })?.error != null
        ? String((data as { error?: string }).error)
        : undefined,
  };
}

async function applyNonprofitViaApi(url: string, serviceKey: string): Promise<void> {
  console.log("Falling back to REST API for nonprofit tables (10-14)...\n");
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync("npm", ["run", "seed:nonprofit:apply"], {
    cwd: ROOT,
    env: { ...process.env, SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey },
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error("seed:nonprofit:apply failed");
  }
}

async function applyViaServiceRole(url: string, serviceKey: string): Promise<number> {
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Drop legacy agency_role constraint if present (nonprofit role names)
  const { error: constraintErr } = await supabase.rpc("admin_exec_sql", {
    sql_content:
      "ALTER TABLE public.user_role_preferences DROP CONSTRAINT IF EXISTS user_role_preferences_agency_role_check;",
  });
  if (constraintErr && !constraintErr.message.includes("Could not find the function")) {
    console.warn("Note: could not drop agency_role constraint:", constraintErr.message);
  }

  console.log("Using SUPABASE_SERVICE_ROLE_KEY + admin_exec_sql\n");

  let failed = 0;
  let usedRpc = true;

  for (const fileName of SEED_FILES) {
    const filePath = join(ROOT, "supabase/seed", fileName);
    if (!existsSync(filePath)) {
      console.warn(`SKIP ${fileName} (file not found)`);
      continue;
    }

    const sql = readFileSync(filePath, "utf8");
    process.stdout.write(`Running ${fileName} ... `);
    const start = Date.now();

    const result = await execSqlViaRpc(supabase, sql);
    const durationMs = Date.now() - start;

    if (result.success) {
      console.log(`OK (${durationMs}ms)`);
      continue;
    }

    if (result.error?.includes("Could not find the function")) {
      usedRpc = false;
      break;
    }

    failed += 1;
    console.log(`FAILED (${durationMs}ms)`);
    console.error(`  ${result.error ?? "unknown error"}`);
  }

  if (!usedRpc) {
    console.warn(
      "\nadmin_exec_sql RPC not found — skipping platform seed files 00-09.\n" +
        "To enable full seed: run supabase/migrations/RUN_IF_admin_exec_sql_MISSING.sql in Lovable SQL Editor, then re-run npm run seed:all\n"
    );
    await applyNonprofitViaApi(url, serviceKey);
    return 0;
  }

  return failed;
}

async function applyViaRunSeed(url: string, anonKey: string): Promise<number> {
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Using admin login (${ADMIN_EMAIL}) + run-seed edge function\n`);

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

  if (signInError || !signInData.session?.access_token) {
    throw new Error(
      `Admin sign-in failed: ${signInError?.message ?? "no session"}. ` +
        "Create the demo admin (migration 20260422171406), deploy run-seed, or add SUPABASE_SERVICE_ROLE_KEY to .env."
    );
  }

  const token = signInData.session.access_token;
  console.log("Signed in as admin.\n");

  let failed = 0;
  for (const fileName of SEED_FILES) {
    const filePath = join(ROOT, "supabase/seed", fileName);
    if (!existsSync(filePath)) {
      console.warn(`SKIP ${fileName} (file not found)`);
      continue;
    }

    const sql = readFileSync(filePath, "utf8");
    process.stdout.write(`Running ${fileName} ... `);
    const result = await runSeedViaEdgeFunction(supabase, token, fileName, sql);

    if (result.success) {
      console.log(`OK (${result.durationMs}ms)`);
    } else {
      failed += 1;
      console.log(`FAILED (${result.durationMs}ms)`);
      console.error(`  ${result.error ?? "unknown error"}`);
    }
  }
  return failed;
}

async function main(): Promise<void> {
  loadEnvFile();
  const { url, anonKey, serviceKey } = getConfig();

  if (!url) {
    throw new Error("Missing SUPABASE_URL or VITE_SUPABASE_URL in .env");
  }

  console.log(`Target: ${url}\n`);

  let failed: number;
  if (serviceKey) {
    failed = await applyViaServiceRole(url, serviceKey);
  } else if (anonKey) {
    failed = await applyViaRunSeed(url, anonKey);
  } else {
    throw new Error(
      "Missing credentials. Add SUPABASE_SERVICE_ROLE_KEY to .env (recommended), " +
        "or VITE_SUPABASE_PUBLISHABLE_KEY with a working admin account + deployed run-seed function."
    );
  }

  console.log("");
  if (failed > 0) {
    console.error(`${failed} seed file(s) failed.`);
    process.exit(1);
  }
  console.log("All seed files applied successfully.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

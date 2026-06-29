/**
 * Apply a SQL migration file via admin_exec_sql RPC or apply-seed-sql edge function.
 * Run: npx tsx scripts/apply-sql-file.ts supabase/migrations/20260629140000_nonprofit_primary_keys_repair.sql
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

async function main(): Promise<void> {
  loadEnvFile();
  const relPath = process.argv[2];
  if (!relPath) {
    throw new Error("Usage: npx tsx scripts/apply-sql-file.ts <path-to.sql>");
  }

  const filePath = join(ROOT, relPath);
  const sql = readFileSync(filePath, "utf8");
  const fileName = relPath.split(/[/\\]/).pop() ?? relPath;

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Applying ${fileName}...`);

  const { data, error } = await supabase.rpc("admin_exec_sql", { sql_content: sql });
  if (!error) {
    const result = data as { success?: boolean; error?: string };
    if (result?.success) {
      console.log(`✓ Applied via admin_exec_sql`);
      return;
    }
    console.warn("admin_exec_sql returned:", result?.error);
  } else {
    console.warn("admin_exec_sql RPC:", error.message);
  }

  console.log("Trying apply-seed-sql edge function...");
  const { data: fnData, error: fnError } = await supabase.functions.invoke("apply-seed-sql", {
    body: { sql, fileName },
  });

  if (fnError) {
    throw new Error(`apply-seed-sql failed: ${fnError.message}`);
  }

  const payload = fnData as { success?: boolean; error?: string };
  if (!payload?.success) {
    throw new Error(payload?.error ?? "apply-seed-sql failed");
  }

  console.log(`✓ Applied via apply-seed-sql`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

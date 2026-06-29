/**
 * Verify boardroom deployment: table + edge function smoke test.
 * Run: npx tsx scripts/verify-boardroom-deploy.ts
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
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: tblErr } = await admin.from("boardroom_sessions").select("id").limit(1);
  console.log("boardroom_sessions table:", tblErr ? `FAIL ${tblErr.message}` : "OK");

  const opt = await fetch(`${url}/functions/v1/boardroom-simulate`, { method: "OPTIONS" });
  console.log("boardroom-simulate OPTIONS:", opt.status);

  const anon = createClient(url, anonKey);
  const { data: auth, error: authErr } = await anon.auth.signInWithPassword({
    email: "director@nonprofitai.software",
    password: "Demo@123",
  });
  if (authErr || !auth.session?.access_token) {
    throw new Error(`ED login failed: ${authErr?.message ?? "no token"}`);
  }

  const token = auth.session.access_token;
  const post = await fetch(`${url}/functions/v1/boardroom-simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question: "Should we pilot youth mentorship in Q3?",
    }),
  });

  console.log("POST status:", post.status, post.headers.get("content-type") ?? "");

  if (!post.ok || !post.body) {
    const text = await post.text().catch(() => "");
    throw new Error(`Function call failed: ${text.slice(0, 300)}`);
  }

  const reader = post.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const types = new Set<string>();
  const deadline = Date.now() + 90_000;

  while (Date.now() < deadline) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      try {
        const evt = JSON.parse(line) as { type?: string; message?: string };
        if (evt.type) types.add(evt.type);
        if (evt.type === "error") {
          throw new Error(evt.message ?? "stream error");
        }
        if (evt.type === "final") {
          console.log("Stream complete. Event types:", [...types].join(", "));
          return;
        }
      } catch (e) {
        if (e instanceof Error && e.message !== "stream error" && !e.message.includes("AI")) throw e;
      }
    }
  }

  console.log("Partial stream. Event types so far:", [...types].join(", "));
  if (!types.has("final") && !types.has("turn_start")) {
    throw new Error("No stream events — edge function may need redeploy with latest code");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

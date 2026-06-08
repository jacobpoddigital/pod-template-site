#!/usr/bin/env node
// Starts Next.js dev server, registers ports with Hub, heartbeats every 30s.
// Run via "pnpm dev" — not directly.
//
// When NEXT_PUBLIC_HUB_URL is unset (local-only dev without the Hub), the
// script falls through silently — all Hub calls are no-ops.

import { spawn } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "package.json");

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL;
const SLUG = JSON.parse(readFileSync(pkgPath, "utf8")).name.replace("pod-site-", "");

// Parse ports from env or use defaults
const WP_PORT = process.env.WP_PORT ?? "8081";
const NEXT_PORT = process.env.PORT ?? "3000";

async function register() {
  if (!HUB_URL) return;
  try {
    await fetch(`${HUB_URL}/api/dev/ports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_slug: SLUG, wp_port: WP_PORT, next_port: NEXT_PORT }),
    });
  } catch {
    // Hub unreachable locally — silent
  }
}

async function heartbeat() {
  if (!HUB_URL) return;
  try {
    await fetch(`${HUB_URL}/api/dev/ports/${SLUG}/heartbeat`, { method: "POST" });
  } catch {
    // silent
  }
}

await register();
const interval = setInterval(heartbeat, 30_000);

const proc = spawn("next", ["dev", "--port", NEXT_PORT], { stdio: "inherit" });
proc.on("exit", async (code) => {
  clearInterval(interval);
  if (HUB_URL) {
    try {
      await fetch(`${HUB_URL}/api/dev/ports/${SLUG}`, { method: "DELETE" });
    } catch {
      // silent
    }
  }
  process.exit(code ?? 0);
});

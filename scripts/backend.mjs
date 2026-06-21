#!/usr/bin/env node
// One-command local backend switch: flip `pnpm dev` between the local Docker WP,
// the hosted WP Engine Atlas backend, and the mock CMS — without editing any
// dotenv file. Profiles live in backend.config.json (non-secret URLs + a flag).
//
//   pnpm backend local     # → local Docker WP (default)
//   pnpm backend atlas     # → hosted Atlas WP (read live content locally)
//   pnpm backend mock      # → mock CMS, no WordPress needed
//   pnpm backend status    # → print the resolved profiles, launch nothing
//   pnpm dev:local | dev:atlas | dev:mock   # shorthands
//
// HOW IT WORKS: the chosen profile's WPGRAPHQL_URL / CMS_MODE are set in the CHILD
// process env before spawning scripts/dev.mjs. Next.js's @next/env does NOT override
// variables already present in process.env, so these win over .env.local with zero
// file mutation — switch back by just running a different profile. The CMS layer
// (src/lib/cms/client.ts) resolves: no URL || CMS_MODE==="mock" → mock; else live.

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const config = JSON.parse(readFileSync(join(root, "backend.config.json"), "utf8"));
const profiles = config.profiles ?? {};

const arg = process.argv[2];
const passthrough = process.argv.slice(3); // forwarded to dev.mjs (e.g. extra flags)

function usage(stream = process.stderr, code = 1) {
  stream.write(`\nUsage: pnpm backend <profile|status>\n\nProfiles:\n`);
  for (const [name, p] of Object.entries(profiles)) {
    const target = p.mock
      ? "mock CMS (no WordPress)"
      : p.wpgraphqlUrl || "(unset — add wpgraphqlUrl in backend.config.json)";
    const star = name === config.default ? " (default)" : "";
    stream.write(`  ${name.padEnd(8)} ${p.label ?? ""}${star}\n           → ${target}\n`);
  }
  stream.write(`\nstatus     print the above and exit (launch nothing)\n\n`);
  process.exit(code);
}

if (!arg || arg === "--help" || arg === "-h") usage(process.stdout, 0);
if (arg === "status") usage(process.stdout, 0);

const profile = profiles[arg];
if (!profile) {
  process.stderr.write(`\n✗ Unknown backend profile: "${arg}"\n`);
  usage();
}

// Build the child env from the chosen profile. Only WPGRAPHQL_URL + CMS_MODE differ.
const env = { ...process.env };
if (profile.mock) {
  env.CMS_MODE = "mock"; // wins even if WPGRAPHQL_URL is set in .env.local
  delete env.WPGRAPHQL_URL; // belt-and-braces (mock check is OR'd anyway)
} else {
  if (!profile.wpgraphqlUrl) {
    process.stderr.write(`\n✗ Profile "${arg}" has no wpgraphqlUrl in backend.config.json\n\n`);
    process.exit(1);
  }
  env.WPGRAPHQL_URL = profile.wpgraphqlUrl;
  env.CMS_MODE = "live"; // override any CMS_MODE=mock from .env.local
  if (profile.wpPort) env.WP_PORT = profile.wpPort; // keep Hub port-registration accurate
}

const target = profile.mock ? "mock CMS (no WordPress)" : env.WPGRAPHQL_URL;
process.stdout.write(`\n▸ backend: ${arg.toUpperCase()} — ${profile.label ?? ""}\n  → ${target}\n\n`);

const proc = spawn("node", [join(__dirname, "dev.mjs"), ...passthrough], {
  stdio: "inherit",
  env,
});
proc.on("exit", (code) => process.exit(code ?? 0));

import { readFileSync } from "node:fs";
import { join } from "node:path";

// Redirects loader (boilerplate §13). Two sources, merged at BUILD/DEPLOY time:
//   1. redirects.json — the committed inventory (migration URL map; edit in the repo).
//   2. WP_REDIRECTS_URL — optional: a WordPress redirects plugin's export endpoint, so
//      editors keep managing 301s in the familiar WP UI and they sync into Next on deploy.
//      Enforcement moves from the WP server to the edge (Vercel); the WP plugin is just
//      the data store. A new WP redirect applies on the next deploy (wire a publish→deploy
//      webhook for immediacy). On free Yoast there's no redirect manager — use a dedicated
//      plugin (e.g. "Redirection"); see docs/seo.md §Redirects.
//
// Redirects NEVER fail the build: a malformed file row or an unreachable WP endpoint is
// logged and skipped.

export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

function isRule(x: unknown): x is RedirectRule {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return typeof r.source === "string" && typeof r.destination === "string";
}

// Normalize one raw entry from any source to a RedirectRule. Accepts our native shape
// ({source,destination,permanent}) and the common {from,to,status} variant a WP plugin
// export might use. Returns null for anything unusable.
function normalize(raw: unknown): RedirectRule | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const source = (r.source ?? r.from ?? r.url) as unknown;
  const destination = (r.destination ?? r.to ?? r.target) as unknown;
  if (typeof source !== "string" || typeof destination !== "string") return null;
  const status = r.status ?? r.code;
  const permanent = typeof r.permanent === "boolean" ? r.permanent : status === undefined ? true : Number(status) !== 302;
  return { source, destination, permanent };
}

function fromFile(): RedirectRule[] {
  try {
    const parsed: unknown = JSON.parse(readFileSync(join(process.cwd(), "redirects.json"), "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRule).map((r) => ({ ...r, permanent: r.permanent ?? true }));
  } catch (err) {
    console.warn("[redirects] could not read redirects.json:", (err as Error).message);
    return [];
  }
}

async function fromWp(): Promise<RedirectRule[]> {
  const url = process.env.WP_REDIRECTS_URL;
  if (!url) return [];
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    const rows = Array.isArray(data) ? data : Array.isArray((data as { items?: unknown[] })?.items) ? (data as { items: unknown[] }).items : [];
    return rows.map(normalize).filter((r): r is RedirectRule => r !== null);
  } catch (err) {
    console.warn("[redirects] WP_REDIRECTS_URL fetch failed, using file only:", (err as Error).message);
    return [];
  }
}

export async function loadRedirects(): Promise<RedirectRule[]> {
  const [file, wp] = await Promise.all([Promise.resolve(fromFile()), fromWp()]);
  // File rules win on a source collision (the committed inventory is authoritative).
  const bySource = new Map<string, RedirectRule>();
  for (const r of [...wp, ...file]) bySource.set(r.source, r);
  return [...bySource.values()];
}

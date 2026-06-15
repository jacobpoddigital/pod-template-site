import { headers } from "next/headers";

// In-memory fixed-window rate limiter for the auth actions — brute-force / credential-stuffing
// defence (workflow/36 Phase 3, docs/auth.md §Security). Keyed by client IP per action.
//
// SCOPE LIMIT (read before relying on this in prod): the store is a per-PROCESS Map. On a
// single long-lived instance it's a hard cap. On serverless / multi-instance (Vercel), each
// lambda has its own Map, so this raises an attacker's cost but is NOT a global limit. Before a
// real login launch, swap `checkRateLimit` for a shared store (Upstash Redis / Vercel KV) — the
// call sites only need a boolean back. Same trade-off the Hub accepts with hono-rate-limiter.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimit {
  /** Window length in ms. */ windowMs: number;
  /** Max attempts allowed within the window. */ max: number;
}

/** Login: 10 attempts / 15 min per IP (a legit user fat-fingering won't hit it; a bot will). */
export const LOGIN_LIMIT: RateLimit = { windowMs: 15 * 60_000, max: 10 };
/** Password-reset trigger: tighter — it sends email, so it's a spam/enumeration vector. */
export const RESET_LIMIT: RateLimit = { windowMs: 15 * 60_000, max: 5 };

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for / x-real-ip). Falls
 *  back to a constant so a missing header fails CLOSED into one shared bucket, not wide open. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** Record an attempt against `key`; returns true if still within the limit, false if over.
 *  Opportunistically sweeps expired buckets so the Map can't grow unbounded. */
export function checkRateLimit(key: string, limit: RateLimit, now: number = Date.now()): boolean {
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
    sweep(now);
    return true;
  }
  b.count += 1;
  return b.count <= limit.max;
}

/** Clear a bucket after a SUCCESSFUL auth so earlier typos don't penalise a legitimate user. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}

let lastSweep = 0;
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return; // at most once a minute
  lastSweep = now;
  for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
}

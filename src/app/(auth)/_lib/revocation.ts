import { createHash } from "crypto";

// Server-side refresh-token revocation for logout (workflow/36 Phase 3, docs/auth.md §Go-live).
//
// WHY a denylist and NOT the JWT plugin's secret-revoke (verified against
// wp-graphql-jwt-authentication 0.7 / WPGraphQL 2.16, 2026-06-15):
//   • `revokeJwtUserSecret: true` DOES kill outstanding refresh tokens — but it also BANS the
//     user (no new tokens issued until an admin un-revokes). It's an account kill switch, not a
//     "log out here" lever.
//   • `refreshJwtUserSecret: true` (rotate) does NOT invalidate old refresh tokens at all — the
//     plugin never compares the token's embedded secret to the stored one; it only checks the
//     revoked flag.
// So per-session logout revocation has to live on the Next side: on logout we denylist THIS
// refresh token until its natural expiry, and `refreshAccessToken` refuses a denylisted token.
// Access tokens are short-lived (≤5 min) and stateless, so they're left to expire (the window).
//
// STORE SCOPE: the default is IN-PROCESS — effective on a single long-lived instance, but each
// serverless lambda / instance has its own Map. Before a multi-instance launch, call
// `setRevocationStore()` with a shared store (Upstash Redis / Vercel KV). Only a SHA-256 hash of
// the token + its expiry is ever stored — never the token itself. See docs/auth.md §Go-live.

export interface RevocationStore {
  revoke(tokenHash: string, expiresAtMs: number): Promise<void> | void;
  isRevoked(tokenHash: string): Promise<boolean> | boolean;
}

const tokenHash = (token: string): string => createHash("sha256").update(token).digest("hex");

// Default in-memory store: hash → expiry(ms). Self-pruning on read + on write.
const memory = new Map<string, number>();
const memoryStore: RevocationStore = {
  revoke(h, expiresAtMs) {
    memory.set(h, expiresAtMs);
    const now = Date.now();
    for (const [k, exp] of memory) if (now >= exp) memory.delete(k);
  },
  isRevoked(h) {
    const exp = memory.get(h);
    if (exp === undefined) return false;
    if (Date.now() >= exp) {
      memory.delete(h);
      return false;
    }
    return true;
  },
};

let store: RevocationStore = memoryStore;

/** Swap the in-memory default for a shared store (Upstash/KV) before a multi-instance launch. */
export function setRevocationStore(s: RevocationStore): void {
  store = s;
}

/** Read a JWT's `exp` (seconds → ms) WITHOUT verifying — only to bound how long we keep the hash.
 *  Falls back to the 14-day refresh TTL if the token can't be parsed. */
function jwtExpiryMs(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
    if (typeof payload.exp === "number") return payload.exp * 1000;
  } catch {
    /* malformed — fall through to default */
  }
  return Date.now() + 14 * 24 * 60 * 60_000;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await store.revoke(tokenHash(token), jwtExpiryMs(token));
}

export async function isRefreshTokenRevoked(token: string): Promise<boolean> {
  return store.isRevoked(tokenHash(token));
}

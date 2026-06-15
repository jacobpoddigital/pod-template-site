// Auth scaffolding config (opt-in module — docs/auth.md). One place for the cookie
// names, attributes and token lifetimes so they can't drift across the session/action
// files. No secrets here — the JWT signing secret lives WP-side (GRAPHQL_JWT_AUTH_SECRET_KEY).

/** httpOnly cookie names. The browser never reads these (XSS-resistant); only the
 *  Next server reads them to attach the Bearer header to WP requests. */
export const ACCESS_COOKIE = "pod_at"; // short-lived JWT access token
export const REFRESH_COOKIE = "pod_rt"; // long-lived refresh token

/** Where to send a user after login, and where login lives. */
export const LOGIN_PATH = "/login";
export const AFTER_LOGIN_PATH = "/account";

/** Refresh-cookie lifetime (seconds). The access token carries its own short exp from WP;
 *  we keep the access cookie session-scoped and lean on refresh. 14 days is a sane default. */
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 14;

/** Cookie attributes — Secure in production, httpOnly always, Lax to allow top-level
 *  nav while still defeating cross-site POST CSRF (paired with an origin check on actions). */
export function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

/** Dev/offline mode — the CMS mock answers auth mutations so the scaffolding runs with no
 *  WordPress + no JWT plugin (mirrors src/lib/cms/client.ts). The GO-LIVE GATE is wiring a
 *  real wp-graphql-jwt-authentication endpoint (docs/auth.md §Go-live). */
export const useAuthMock = !process.env.WPGRAPHQL_URL || process.env.CMS_MODE === "mock";

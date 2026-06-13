// Content-Security-Policy builder (checklist §21 — Frontend & API Layer).
//
// Why this exists: a correct CSP is per-site (the allowed origins differ — each
// client has its own WP media host and may add embeds), so the template can't ship
// one fixed enforced policy. But "add a CSP per project" was a manual step everyone
// forgets. This ships a sensible default that covers the agency's standard stack
// (GTM/GA4, Google Ads, the Cookiebot CMP) and is **report-only by default** — it
// emits `Content-Security-Policy-Report-Only`, which the browser evaluates and logs
// but never enforces, so it CANNOT break a site. Per project you (1) set the WP media
// host, (2) add any embeds, (3) flip to enforce once the report console is clean.
//
// Flip-on per site:  set CSP_MODE=enforce  (after verifying no violations are reported)
// Add the media host: NEXT_PUBLIC_WP_MEDIA_HOST=https://cms.client.com
// Add embeds/extra:   CSP_EXTRA_HOSTS=https://www.youtube.com,https://js.stripe.com
// Optional reporting: CSP_REPORT_URI=https://<sentry-or-collector>/csp

const env = (k: string) => process.env[k]?.trim() || "";

// Hosts for the agency's standard third-party stack. These are the well-known origins
// for GTM + GA4 + Google Ads conversions + the Cookiebot CMP (all of which load via the
// measurement-first floor — see docs/measurement-and-consent.md). Kept here, not per-site,
// because they're the same for every client that runs the standard stack.
const GTM = ["https://www.googletagmanager.com", "https://*.googletagmanager.com"];
const GA4 = ["https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com"];
const GADS = ["https://www.googleadservices.com", "https://googleads.g.doubleclick.net", "https://*.g.doubleclick.net"];
const COOKIEBOT = ["https://consent.cookiebot.com", "https://consentcdn.cookiebot.com", "https://*.cookiebot.com"];

function dedupe(...lists: string[][]): string[] {
  return [...new Set(lists.flat().filter(Boolean))];
}

/** Builds the CSP directive string. Exported for testing/inspection. */
export function buildCsp(): string {
  const mediaHost = env("NEXT_PUBLIC_WP_MEDIA_HOST"); // the client's WP/Atlas media origin
  const extra = env("CSP_EXTRA_HOSTS").split(",").map((s) => s.trim()).filter(Boolean);
  const reportUri = env("CSP_REPORT_URI");

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-ancestors": ["'self'"], // belt-and-braces with X-Frame-Options
    // GTM's bootstrap is an inline script → 'unsafe-inline' is required without nonce
    // infra (which static export can't carry). Acceptable because the default is
    // report-only; tighten with a nonce per site if a build needs strict enforcement.
    "script-src": dedupe(["'self'", "'unsafe-inline'"], GTM, GA4, GADS, COOKIEBOT, extra),
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": dedupe(["'self'", "data:", "blob:", mediaHost], GTM, GA4, GADS),
    "font-src": ["'self'", "data:"],
    "connect-src": dedupe(["'self'", mediaHost], GA4, GTM, COOKIEBOT, extra),
    "frame-src": dedupe(["'self'"], GTM, COOKIEBOT, extra),
  };
  if (reportUri) directives["report-uri"] = [reportUri];

  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
}

/**
 * The CSP header to add to next.config.ts → headers(). Report-only unless
 * `CSP_MODE=enforce`. Returns the correct header name for the mode.
 */
export function cspHeader(): { key: string; value: string } {
  const enforce = env("CSP_MODE").toLowerCase() === "enforce";
  return {
    key: enforce ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    value: buildCsp(),
  };
}

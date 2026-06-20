import type { NextConfig } from "next";
import os from "node:os";
import { loadRedirects } from "./redirects.config";
import { cspHeader } from "./csp.config";

// Next dev blocks cross-origin requests to its dev resources (/_next/*, HMR) by default, so loading
// the dev server from a phone via the Mac's LAN IP serves the HTML but BLOCKS the client JS → the
// page looks right but nothing is interactive. Auto-allow this machine's LAN IPv4s so on-device
// testing (iPhone Safari etc. on the same Wi-Fi) just works. Dev-only; ignored in production.
function lanDevOrigins(): string[] {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((n): n is os.NetworkInterfaceInfo => n != null && n.family === "IPv4" && !n.internal)
    .map((n) => n.address);
}

// Security headers applied to every route (checklist §21 — Frontend & API Layer).
// CSP ships as a sensible default that covers the standard stack (GTM/GA4/Ads + the
// Cookiebot CMP) but is **report-only** until `CSP_MODE=enforce` — so it can't break a
// site. Per project: set NEXT_PUBLIC_WP_MEDIA_HOST + CSP_EXTRA_HOSTS, check the report
// console is clean, then flip to enforce. See csp.config.ts + docs/security.md.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  cspHeader(),
];

const nextConfig: NextConfig = {
  // Pin the project root — a stray lockfile elsewhere on the machine must not
  // change Turbopack's root inference.
  turbopack: { root: __dirname },
  // Allow on-device dev testing over the LAN (see lanDevOrigins above).
  allowedDevOrigins: lanDevOrigins(),
  images: {
    // Remote hosts allowed for next/image. Per project, ADD the client's WordPress /
    // Atlas media host here, e.g. { protocol: "https", hostname: "*.wpenginepowered.com" }
    // or the client's domain. picsum is the dev/gallery sample placeholder only.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Redirects from old URLs (checklist §13). Sourced from redirects.json (committed
  // migration map) + an optional WP redirects plugin (WP_REDIRECTS_URL) so editors keep
  // managing 301s in WordPress. Losing these on a migration loses ranking. Applied at
  // build/deploy — see redirects.config.ts + docs/seo.md §Redirects.
  async redirects() {
    // /blog/page/1 is a duplicate of /blog — collapse it (research 2026-06-13 §1.4).
    const blogPageOne = [{ source: "/blog/page/1", destination: "/blog", permanent: true }];
    return [...blogPageOne, ...(await loadRedirects())];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// Security headers applied to every route (checklist §21 — Frontend & API Layer).
// CSP is intentionally omitted here as a default: a correct CSP is per-site (it must
// allow the client's WP media host, GTM/GA4, the CMP, any embeds). Add a Content-Security-Policy
// entry below per project once the third-party origins are known — do NOT ship a permissive
// `default-src *` CSP. See docs/go-live-checklist.md.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Pin the project root — a stray lockfile elsewhere on the machine must not
  // change Turbopack's root inference.
  turbopack: { root: __dirname },
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
  // Redirects from old URLs (checklist §13). When migrating an existing site, map every
  // changed URL here so its SEO value 301s to the new path — losing these on a migration
  // loses ranking. Keep this list in sync with the client's pre-migration URL inventory.
  async redirects() {
    return [
      // { source: "/old-path", destination: "/new-path", permanent: true },
    ];
  },
};

export default nextConfig;

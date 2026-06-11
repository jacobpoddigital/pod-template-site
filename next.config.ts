import type { NextConfig } from "next";

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
};

export default nextConfig;

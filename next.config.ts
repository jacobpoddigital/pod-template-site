import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root — a stray lockfile elsewhere on the machine must not
  // change Turbopack's root inference.
  turbopack: { root: __dirname },
};

export default nextConfig;

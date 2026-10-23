import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Chrome in this environment opens the dev server at 127.0.0.1. Without this
  // allowlist Next blocks the HMR socket, and the page never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;

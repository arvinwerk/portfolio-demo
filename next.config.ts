import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // One self-contained server for the Docker image. `next start` from a full
  // checkout still works.
  output: "standalone",
  // Chrome in this environment opens the dev server at 127.0.0.1. Without this
  // allowlist Next blocks the HMR socket, and the page never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
  // JSON and the corpus are read from disk at request time. The corpus file is
  // chosen at deploy time, so the tracer cannot see which text files belong
  // to the route. Include the folder explicitly.
  outputFileTracingIncludes: {
    "/": ["./content/**/*"],
    "/api/chat": ["./content/**/*"],
  },
};

export default nextConfig;

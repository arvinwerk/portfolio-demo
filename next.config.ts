import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  { key: "Strict-Transport-Security", value: "max-age=15552000" },
];

const imageHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'none'; style-src 'unsafe-inline'; sandbox; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/images/:path*", headers: imageHeaders },
    ];
  },
};

export default nextConfig;

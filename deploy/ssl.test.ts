// @vitest-environment node

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const script = path.join(process.cwd(), "deploy", "ssl");
const roots: string[] = [];

describe("deploy/ssl", () => {
  afterEach(() => {
    for (const root of roots.splice(0)) {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("zet TLS voor de app en laat de chat ongebuffert", () => {
    const root = mkdtempSync(path.join(tmpdir(), "portfolio-ssl-"));
    roots.push(root);
    const result = run(["install"], {
      PORTFOLIO_SSL_DRY_RUN: "1",
      PORTFOLIO_SSL_ROOT: root,
      PORTFOLIO_SSL_IP: "203.0.113.10",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("site-url=https://203.0.113.10/");
    expect(result.stdout).toContain("--preferred-profile\nshortlived\n");
    expect(result.stdout).toContain("--ip-address\n203.0.113.10\n");
    expect(result.stdout).not.toContain("-d\n");

    const bootstrap = readFileSync(path.join(root, "bootstrap.conf"), "utf8");
    const tls = readFileSync(path.join(root, "tls.conf"), "utf8");
    expect(bootstrap).not.toContain("listen 443");
    expect(bootstrap).not.toContain("return 301");
    expect(bootstrap).toContain("proxy_pass http://127.0.0.1:3000;");
    expect(chatBlock(bootstrap)).toContain("proxy_buffering off;");
    expect(chatBlock(bootstrap)).toContain("proxy_set_header X-Real-IP $remote_addr;");

    expect(tls).toContain("listen 443 ssl default_server;");
    expect(tls).toContain("ssl_certificate     /etc/letsencrypt/live/portfolio/fullchain.pem;");
    expect(tls).toContain("ssl_certificate_key /etc/letsencrypt/live/portfolio/privkey.pem;");
    expect(tls).toContain("ssl_protocols TLSv1.2 TLSv1.3;");
    const challenge = tls.indexOf("location ^~ /.well-known/acme-challenge/");
    const redirect = tls.indexOf("return 301 https://$host$request_uri;");
    expect(challenge).toBeGreaterThan(-1);
    expect(redirect).toBeGreaterThan(challenge);
    expect(chatBlock(tls)).toContain("proxy_buffering off;");
    expect(chatBlock(tls)).toContain("gzip off;");
    expect(tls).not.toContain("proxy_set_header X-Real-IP $http_x_real_ip;");
  });

  it("vraagt een hostnaamcertificaat als SITE_ADDRESS gezet is", () => {
    const result = run(["plan"], { SITE_ADDRESS: "portfolio.example.nl", CERTBOT_EMAIL: "beheer@example.nl" });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("-d\nportfolio.example.nl\n");
    expect(result.stdout).toContain("--email\nbeheer@example.nl\n");
    expect(result.stdout).not.toContain("shortlived");
    expect(result.stdout).not.toContain("--ip-address");
  });

  it("weigert een privaat adres, een schema en een upstream zonder poort", () => {
    expect(run(["check-ip", "172.17.0.1"]).status).not.toBe(0);
    expect(run(["check-ip", "10.1.2.3"]).status).not.toBe(0);
    expect(run(["check-ip", "192.168.0.1"]).status).not.toBe(0);
    expect(run(["check-ip", "127.0.0.1"]).status).not.toBe(0);
    expect(run(["check-ip", "169.254.1.1"]).status).not.toBe(0);
    expect(run(["check-ip", "172.16.0.1"]).status).not.toBe(0);
    expect(run(["check-ip", "172.31.255.255"]).status).not.toBe(0);
    expect(run(["check-ip", "224.0.0.1"]).status).not.toBe(0);
    expect(run(["check-ip", "203.0.113.10"]).status).toBe(0);
    expect(run(["check-ip", "172.32.0.1"]).status).toBe(0);
    expect(run(["check-ip", "8.8.8.8"]).status).toBe(0);

    const schema = run(["plan"], { SITE_ADDRESS: "https://portfolio.example.nl" });
    expect(schema.status).not.toBe(0);
    expect(schema.stderr).toContain("SITE_ADDRESS moet een hostnaam zijn");

    const upstream = run(["render", "tls", "portfolio", "127.0.0.1"]);
    expect(upstream.status).not.toBe(0);
    expect(upstream.stderr).toContain("upstream");

    const root = mkdtempSync(path.join(tmpdir(), "portfolio-ssl-private-"));
    roots.push(root);
    const privateAddress = run(["install"], {
      PORTFOLIO_SSL_DRY_RUN: "1",
      PORTFOLIO_SSL_ROOT: root,
      PORTFOLIO_SSL_IP: "172.17.0.1",
    });
    expect(privateAddress.status).not.toBe(0);
    expect(privateAddress.stderr).toContain("publiek IPv4-adres");
  });
});

function run(args: string[], env: NodeJS.ProcessEnv = {}): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(script, args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function chatBlock(config: string): string {
  const start = config.indexOf("location /api/chat");
  const end = config.indexOf("location /", start + 1);
  return config.slice(start, end);
}

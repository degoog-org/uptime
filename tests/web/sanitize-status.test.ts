import { describe, expect, test } from "bun:test";
import type { StatusDocument } from "../../src/shared/status";
import { sanitizeStatus } from "../../web/lib/sanitize-status";

const withUrls = (urls: string[]): StatusDocument => ({
  version: 1,
  generatedAt: 1,
  intervalMinutes: 10,
  historyDays: 90,
  instances: [
    {
      id: "a",
      name: "a",
      country: null,
      cloudflare: null,
      appearance: "default",
      theme: null,
      current: "up",
      lastCheckedAt: 1,
      urls: urls.map((url) => ({
        url,
        status: "up",
        httpStatus: 200,
        latencyMs: 1,
        error: null,
        checkedAt: 1,
      })),
      uptime: { "24h": 100, "7d": 100, "30d": 100, "90d": 100 },
      avgLatency24h: 1,
      latency24h: [],
      daily: [],
    },
  ],
});

const keptUrls = (urls: string[]): string[] =>
  sanitizeStatus(withUrls(urls)).instances[0]?.urls.map((entry) => entry.url) ??
  [];

describe("sanitizeStatus", () => {
  test("links that would run script never reach an href", () => {
    expect(
      keptUrls([
        "https://ok.example",
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "not a url",
      ]),
    ).toEqual(["https://ok.example"]);
  });
});

import { describe, expect, test } from "bun:test";
import type { CheckStatus, UrlStatus } from "../../src/shared/status";
import { describeIssue } from "../../web/lib/describe-issue";

const check = (
  status: CheckStatus,
  httpStatus: number | null,
  error: string | null = null,
): UrlStatus => ({
  url: "https://a.example",
  status,
  httpStatus,
  latencyMs: null,
  error,
  checkedAt: 1,
});

describe("describeIssue", () => {
  test("a healthy instance has no issue to show", () => {
    expect(describeIssue(check("up", 200))).toBeNull();
  });

  test("http failures show the status code", () => {
    expect(describeIssue(check("down", 502))).toBe("HTTP 502");
    expect(describeIssue(check("starting", 503))).toBe("HTTP 503");
  });

  test("network failures name the cause instead of a code", () => {
    expect(describeIssue(check("down", null, "timeout"))).toBe("Timeout");
    expect(
      describeIssue(
        check("down", null, "getaddrinfo ENOTFOUND search.example.org"),
      ),
    ).toBe("DNS error");
    expect(describeIssue(check("down", null, "something odd"))).toBe(
      "Unreachable",
    );
    expect(
      describeIssue(
        check("blocked", null, "ECONNRESET: The socket connection was closed"),
      ),
    ).toBe("Connection reset");
  });

  test("a 200 that fails the whodis check is not reported as HTTP 200", () => {
    expect(
      describeIssue(check("unverified", 200, "whodis mismatch at /api/whodis")),
    ).toBe("Not degoog");
  });
});

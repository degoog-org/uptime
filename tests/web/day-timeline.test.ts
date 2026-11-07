import { describe, expect, test } from "bun:test";
import type { CheckStatus, UrlStatus } from "../../src/shared/status";
import {
  dayStartOf,
  groupIncidents,
  summariseDay,
  toSlots,
} from "../../web/lib/day-timeline";

const DAY = dayStartOf("2026-11-07");
const MINUTE = 60_000;

const check = (
  minute: number,
  status: CheckStatus,
  latencyMs: number | null = status === "up" ? 100 : null,
): UrlStatus => ({
  url: "https://a.example",
  status,
  httpStatus: status === "up" ? 200 : null,
  latencyMs,
  error: status === "down" ? "timeout" : null,
  checkedAt: DAY + minute * MINUTE,
});

describe("day timeline", () => {
  test("consecutive failures become one incident and an up check ends it", () => {
    const incidents = groupIncidents([
      check(0, "up"),
      check(15, "down"),
      check(30, "down"),
      check(45, "up"),
      check(60, "down"),
    ]);
    expect(incidents).toEqual([
      {
        start: DAY + 15 * MINUTE,
        end: DAY + 30 * MINUTE,
        label: "Timeout",
        tone: "danger",
        checks: 2,
      },
      {
        start: DAY + 60 * MINUTE,
        end: DAY + 60 * MINUTE,
        label: "Timeout",
        tone: "danger",
        checks: 1,
      },
    ]);
  });

  test("blocked checks are neither failures nor counted in uptime", () => {
    const checks = [
      check(0, "up", 100),
      check(15, "blocked"),
      check(30, "down"),
    ];
    expect(groupIncidents([check(0, "blocked")])).toEqual([]);
    expect(summariseDay(checks)).toEqual({
      checks: 3,
      failures: 1,
      uptime: 50,
      avgLatencyMs: 100,
      maxLatencyMs: 100,
    });
  });

  test("slots sit at their time of day and span the gap to the next check", () => {
    const [first, last] = toSlots([check(720, "up"), check(735, "up")], DAY);
    expect(first?.start).toBe(0.5);
    expect(first?.width).toBeCloseTo(15 / 1440);
    expect(last?.width).toBeCloseTo(15 / 1440);
  });
});

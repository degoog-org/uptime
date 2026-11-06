import { describe, expect, test } from "bun:test";
import { openDatabase } from "../src/db/client";
import { syncInstances } from "../src/db/instances-repository";
import { recordRun } from "../src/db/runs-repository";
import { buildStatus } from "../src/export/build-status";
import type { CheckStatus } from "../src/shared/status";
import type { CheckResult, Instance } from "../src/types";

const NOW = Date.UTC(2026, 10, 6, 12, 0, 0);
const HOUR = 3_600_000;

const INSTANCE: Instance = {
  id: "mirror",
  name: "mirror",
  clearnet: ["https://b.example", "https://a.example"],
  tor: [],
  i2p: [],
  appearance: "default",
  theme: null,
  country: "DE",
  cloudflare: true,
};

const check = (
  url: string,
  status: CheckStatus,
  checkedAt: number,
): CheckResult => ({
  instanceId: INSTANCE.id,
  url,
  status,
  httpStatus: status === "up" ? 200 : null,
  latencyMs: status === "up" ? 100 : null,
  error: null,
  checkedAt,
});

const seed = (
  runs: { at: number; discarded?: boolean; statuses: CheckStatus[] }[],
): ReturnType<typeof openDatabase> => {
  const db = openDatabase(":memory:");
  syncInstances(db, [INSTANCE], NOW - 100 * 24 * HOUR);
  for (const run of runs) {
    recordRun(db, {
      startedAt: run.at,
      finishedAt: run.at,
      discarded: run.discarded ?? false,
      results: run.statuses.map((status) =>
        check("https://b.example", status, run.at),
      ),
    });
  }
  return db;
};

const build = (
  db: ReturnType<typeof openDatabase>,
): ReturnType<typeof buildStatus> =>
  buildStatus(db, { now: NOW, intervalMinutes: 10, historyDays: 90 });

describe("buildStatus", () => {
  test("blocked and rate limited checks do not count against uptime", () => {
    const db = seed([
      { at: NOW - 3 * HOUR, statuses: ["up"] },
      { at: NOW - 2 * HOUR, statuses: ["blocked"] },
      { at: NOW - HOUR, statuses: ["rate_limited"] },
    ]);
    expect(build(db).instances[0]?.uptime["24h"]).toBe(100);
  });

  test("discarded runs are excluded from uptime and current status", () => {
    const db = seed([
      { at: NOW - 2 * HOUR, statuses: ["up"] },
      { at: NOW - HOUR, discarded: true, statuses: ["down"] },
    ]);
    const [instance] = build(db).instances;
    expect(instance?.uptime["24h"]).toBe(100);
    expect(instance?.current).toBe("up");
  });

  test("uptime windows only include checks inside them", () => {
    const db = seed([
      { at: NOW - 2 * 24 * HOUR, statuses: ["down"] },
      { at: NOW - HOUR, statuses: ["up"] },
    ]);
    const [instance] = build(db).instances;
    expect(instance?.uptime["24h"]).toBe(100);
    expect(instance?.uptime["7d"]).toBe(50);
  });

  test("daily history covers every day with null for days without data", () => {
    const db = seed([{ at: NOW - HOUR, statuses: ["up"] }]);
    const daily = build(db).instances[0]?.daily ?? [];
    expect(daily).toHaveLength(90);
    expect(daily.at(-1)).toEqual({
      date: "2026-11-06",
      uptime: 100,
      checks: 1,
    });
    expect(daily.at(-2)?.uptime).toBeNull();
  });

  test("urls follow the order in instances.json and skip unchecked ones", () => {
    const db = seed([{ at: NOW - HOUR, statuses: ["up"] }]);
    expect(build(db).instances[0]?.urls.map((url) => url.url)).toEqual([
      "https://b.example",
    ]);
  });

  test("instance with no checks yet has no current status", () => {
    const [instance] = build(seed([])).instances;
    expect(instance?.current).toBeNull();
    expect(instance?.uptime["90d"]).toBeNull();
  });
});

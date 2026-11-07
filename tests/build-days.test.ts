import { describe, expect, test } from "bun:test";
import { openDatabase } from "../src/db/client";
import { syncInstances } from "../src/db/instances-repository";
import { recordRun } from "../src/db/runs-repository";
import { buildDays } from "../src/export/build-days";
import type { CheckStatus } from "../src/shared/status";
import type { CheckResult, Instance } from "../src/types";

const NOW = Date.UTC(2026, 10, 7, 12, 0, 0);
const HOUR = 3_600_000;

const instance = (id: string): Instance => ({
  id,
  name: id,
  clearnet: [`https://${id}.example`],
  tor: [],
  i2p: [],
  appearance: "default",
  theme: null,
  country: null,
  cloudflare: null,
});

const check = (
  instanceId: string,
  status: CheckStatus,
  checkedAt: number,
): CheckResult => ({
  instanceId,
  url: `https://${instanceId}.example`,
  status,
  httpStatus: status === "up" ? 200 : null,
  latencyMs: status === "up" ? 100 : null,
  error: status === "up" ? null : "timeout",
  checkedAt,
});

describe("buildDays", () => {
  test("groups checks by UTC day and instance, oldest first, skipping discarded runs and unlisted instances", () => {
    const db = openDatabase(":memory:");
    syncInstances(db, [instance("a"), instance("gone")], NOW - 48 * HOUR);
    const record = (at: number, results: CheckResult[], discarded = false) =>
      recordRun(db, { startedAt: at, finishedAt: at, discarded, results });

    record(NOW - 13 * HOUR, [check("a", "up", NOW - 13 * HOUR)]);
    record(NOW - 2 * HOUR, [check("a", "down", NOW - 2 * HOUR)]);
    record(NOW - HOUR, [check("a", "up", NOW - HOUR)]);
    record(NOW - 30 * 60_000, [check("a", "down", NOW - 30 * 60_000)], true);
    record(NOW - 20 * 60_000, [check("gone", "up", NOW - 20 * 60_000)]);
    syncInstances(db, [instance("a")], NOW);

    const days = buildDays(db, NOW, 90);
    expect(days.map((day) => day.date)).toEqual(["2026-11-06", "2026-11-07"]);
    expect(days[1]?.instances.gone).toBeUndefined();
    expect(days[1]?.instances.a?.map((entry) => entry.status)).toEqual([
      "down",
      "up",
    ]);
    expect(days[0]?.instances.a?.[0]).toEqual({
      url: "https://a.example",
      status: "up",
      httpStatus: 200,
      latencyMs: 100,
      error: null,
      checkedAt: NOW - 13 * HOUR,
    });
  });
});

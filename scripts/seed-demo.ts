import { rmSync } from "fs";
import { CHECK_INTERVAL_MINUTES, HISTORY_DAYS } from "../src/config";
import { openDatabase } from "../src/db/client";
import { syncInstances } from "../src/db/instances-repository";
import { recordRun } from "../src/db/runs-repository";
import { buildStatus } from "../src/export/build-status";
import { writeStatus } from "../src/export/write-status";
import { loadInstances } from "../src/instances/load-instances";
import type { CheckStatus } from "../src/shared/status";
import type { CheckResult, Instance } from "../src/types";

const DEMO_DB_PATH = "data/demo.sqlite";
const DEMO_STATUS_PATH = "data/demo-status.json";
const DAY_MS = 86_400_000;
const INTERVAL_MS = CHECK_INTERVAL_MINUTES * 60_000;

const _createRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const random = _createRandom(42);

const _pickStatus = (reliability: number, outage: boolean): CheckStatus => {
  if (outage) return "down";
  const roll = random();
  if (roll > reliability) return "down";
  if (roll > reliability - 0.002) return "blocked";
  return "up";
};

const _simulate = (
  instance: Instance,
  index: number,
  at: number,
  outage: boolean,
): CheckResult[] => {
  const reliability = 0.999 - index * 0.004;
  const baseLatency = 120 + index * 90;
  return instance.clearnet.map((url) => {
    const status = _pickStatus(reliability, outage);
    return {
      instanceId: instance.id,
      url,
      status,
      httpStatus:
        status === "up"
          ? 200
          : status === "blocked"
            ? 403
            : outage
              ? null
              : 502,
      latencyMs:
        status === "up"
          ? Math.round(baseLatency + random() * baseLatency * 0.6)
          : null,
      error: outage ? "timeout" : null,
      checkedAt: at,
    };
  });
};

const main = async (): Promise<void> => {
  rmSync(DEMO_DB_PATH, { force: true });
  const instances = await loadInstances();
  const db = openDatabase(DEMO_DB_PATH);
  const now = Date.now();
  const start = now - HISTORY_DAYS * DAY_MS;
  const outages = new Map(
    instances.map((instance, index) => [
      instance.id,
      index === 3 ? now - 3_600_000 : now - random() * HISTORY_DAYS * DAY_MS,
    ]),
  );

  syncInstances(db, instances, start);
  db.transaction(() => {
    for (let at = start; at <= now; at += INTERVAL_MS) {
      const results = instances.flatMap((instance, index) => {
        const outageStart = outages.get(instance.id) ?? 0;
        const outage =
          (index % 2 === 1 || index === 3) &&
          at >= outageStart &&
          at < outageStart + 4 * 3_600_000;
        return _simulate(instance, index, at, outage);
      });
      recordRun(db, {
        startedAt: at,
        finishedAt: at,
        discarded: false,
        results,
      });
    }
  })();

  await writeStatus(
    DEMO_STATUS_PATH,
    buildStatus(db, {
      now,
      intervalMinutes: CHECK_INTERVAL_MINUTES,
      historyDays: HISTORY_DAYS,
    }),
  );
  db.close();
  console.log(
    `wrote ${DEMO_STATUS_PATH}, preview with UPTIME_STATUS_PATH=${DEMO_STATUS_PATH} bun run dev`,
  );
};

await main();

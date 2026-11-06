import { DB_PATH } from "../config";
import { isCheckerFault, runChecks } from "../checker/run-checks";
import { openDatabase } from "../db/client";
import { syncInstances } from "../db/instances-repository";
import { recordRun } from "../db/runs-repository";
import { loadInstances } from "../instances/load-instances";
import type { CheckResult } from "../types";
import { logger } from "../utils/logger";

const _formatResult = (result: CheckResult): string =>
  [
    `instance=${result.instanceId}`,
    `url=${result.url}`,
    `status=${result.status}`,
    `http=${result.httpStatus ?? "-"}`,
    `latency=${result.latencyMs ?? "-"}ms`,
    result.error ? `error="${result.error}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

const main = async (): Promise<void> => {
  const startedAt = Date.now();
  const instances = await loadInstances();
  logger.info("check", `loaded instances=${instances.length}`);

  const results = await runChecks(instances);
  const discarded = isCheckerFault(results);
  const finishedAt = Date.now();

  const db = openDatabase(DB_PATH);
  try {
    syncInstances(db, instances, startedAt);
    const runId = recordRun(db, { startedAt, finishedAt, discarded, results });
    for (const result of results) logger.info("check", _formatResult(result));
    if (discarded) {
      logger.warn(
        "check",
        `run=${runId} discarded, every probe failed at network level`,
      );
    }
    logger.info(
      "check",
      `run=${runId} checks=${results.length} duration=${finishedAt - startedAt}ms`,
    );
  } finally {
    db.close();
  }
};

main().catch((error: unknown) => {
  logger.error("check", error instanceof Error ? error.message : String(error));
  process.exit(1);
});

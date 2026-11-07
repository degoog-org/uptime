import {
  CHECK_INTERVAL_MINUTES,
  DAYS_DIR,
  DB_PATH,
  HISTORY_DAYS,
  STATUS_PATH,
} from "../config";
import { openDatabase } from "../db/client";
import { buildDays } from "../export/build-days";
import { buildStatus } from "../export/build-status";
import { writeJson } from "../export/write-json";
import { logger } from "../utils/logger";

const main = async (): Promise<void> => {
  const now = Date.now();
  const db = openDatabase(DB_PATH);
  try {
    const status = buildStatus(db, {
      now,
      intervalMinutes: CHECK_INTERVAL_MINUTES,
      historyDays: HISTORY_DAYS,
    });
    const days = buildDays(db, now, HISTORY_DAYS);
    await writeJson(STATUS_PATH, status);
    await Promise.all(
      days.map((day) => writeJson(`${DAYS_DIR}/${day.date}.json`, day)),
    );
    logger.info(
      "export",
      `wrote path=${STATUS_PATH} instances=${status.instances.length} days=${days.length}`,
    );
  } finally {
    db.close();
  }
};

main().catch((error: unknown) => {
  logger.error(
    "export",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});

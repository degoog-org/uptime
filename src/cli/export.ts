import {
  CHECK_INTERVAL_MINUTES,
  DB_PATH,
  HISTORY_DAYS,
  STATUS_PATH,
} from "../config";
import { openDatabase } from "../db/client";
import { buildStatus } from "../export/build-status";
import { writeStatus } from "../export/write-status";
import { logger } from "../utils/logger";

const main = async (): Promise<void> => {
  const db = openDatabase(DB_PATH);
  try {
    const status = buildStatus(db, {
      now: Date.now(),
      intervalMinutes: CHECK_INTERVAL_MINUTES,
      historyDays: HISTORY_DAYS,
    });
    await writeStatus(STATUS_PATH, status);
    logger.info(
      "export",
      `wrote path=${STATUS_PATH} instances=${status.instances.length}`,
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

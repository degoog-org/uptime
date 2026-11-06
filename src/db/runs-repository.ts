import type { Database } from "bun:sqlite";
import type { RunRecord } from "../types";

interface InsertedRow {
  id: number;
}

export const recordRun = (db: Database, run: RunRecord): number => {
  const insertRun = db.query<InsertedRow, Record<string, number>>(
    `INSERT INTO runs (started_at, finished_at, discarded)
     VALUES ($startedAt, $finishedAt, $discarded)
     RETURNING id`,
  );
  const insertCheck = db.prepare(`
    INSERT INTO checks (run_id, instance_id, url, status, http_status, latency_ms, error, checked_at)
    VALUES ($runId, $instanceId, $url, $status, $httpStatus, $latencyMs, $error, $checkedAt)
  `);

  return db.transaction(() => {
    const row = insertRun.get({
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      discarded: Number(run.discarded),
    });
    if (!row) throw new Error("run insert returned no id");
    for (const result of run.results) {
      insertCheck.run({
        runId: row.id,
        instanceId: result.instanceId,
        url: result.url,
        status: result.status,
        httpStatus: result.httpStatus,
        latencyMs: result.latencyMs,
        error: result.error,
        checkedAt: result.checkedAt,
      });
    }
    return row.id;
  })();
};

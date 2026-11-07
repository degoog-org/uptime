import type { Database } from "bun:sqlite";
import { COUNTED_STATUSES, type CheckStatus } from "../shared/status";

const COUNTED_JSON = JSON.stringify(COUNTED_STATUSES);

export interface ListedInstanceRow {
  id: string;
  name: string;
  clearnet: string;
  appearance: "default" | "custom";
  theme: string | null;
  country: string | null;
  cloudflare: number | null;
}

export interface CheckRow {
  instanceId: string;
  url: string;
  status: CheckStatus;
  httpStatus: number | null;
  latencyMs: number | null;
  error: string | null;
  checkedAt: number;
}

export interface UptimeCountRow {
  instanceId: string;
  up: number;
  counted: number;
}

export interface DailyCountRow extends UptimeCountRow {
  date: string;
}

export interface HourlyLatencyRow {
  instanceId: string;
  hour: number;
  avgLatencyMs: number;
}

export const selectListedInstances = (db: Database): ListedInstanceRow[] =>
  db
    .query<ListedInstanceRow, []>(
      `SELECT id, name, clearnet, appearance, theme, country, cloudflare
       FROM instances
       WHERE listed = 1
       ORDER BY position, id`,
    )
    .all();

export const selectLatestChecks = (db: Database): CheckRow[] =>
  db
    .query<CheckRow, []>(
      `SELECT c.instance_id AS instanceId, c.url, c.status, c.http_status AS httpStatus,
              c.latency_ms AS latencyMs, c.error, c.checked_at AS checkedAt
       FROM checks c
       WHERE c.id IN (
         SELECT MAX(inner_check.id)
         FROM checks inner_check
         JOIN runs r ON r.id = inner_check.run_id
         WHERE r.discarded = 0
         GROUP BY inner_check.instance_id, inner_check.url
       )`,
    )
    .all();

export const selectUptimeCounts = (
  db: Database,
  since: number,
): UptimeCountRow[] =>
  db
    .query<UptimeCountRow, { since: number; counted: string }>(
      `SELECT c.instance_id AS instanceId,
              SUM(c.status = 'up') AS up,
              SUM(c.status IN (SELECT value FROM json_each($counted))) AS counted
       FROM checks c
       JOIN runs r ON r.id = c.run_id
       WHERE r.discarded = 0 AND c.checked_at >= $since
       GROUP BY c.instance_id`,
    )
    .all({ since, counted: COUNTED_JSON });

export const selectDailyCounts = (
  db: Database,
  since: number,
): DailyCountRow[] =>
  db
    .query<DailyCountRow, { since: number; counted: string }>(
      `SELECT c.instance_id AS instanceId,
              strftime('%Y-%m-%d', c.checked_at / 1000, 'unixepoch') AS date,
              SUM(c.status = 'up') AS up,
              SUM(c.status IN (SELECT value FROM json_each($counted))) AS counted
       FROM checks c
       JOIN runs r ON r.id = c.run_id
       WHERE r.discarded = 0 AND c.checked_at >= $since
       GROUP BY c.instance_id, date`,
    )
    .all({ since, counted: COUNTED_JSON });

export const selectHourlyLatency = (
  db: Database,
  since: number,
): HourlyLatencyRow[] =>
  db
    .query<HourlyLatencyRow, { since: number }>(
      `SELECT c.instance_id AS instanceId,
              (c.checked_at - $since) / 3600000 AS hour,
              AVG(c.latency_ms) AS avgLatencyMs
       FROM checks c
       JOIN runs r ON r.id = c.run_id
       WHERE r.discarded = 0 AND c.status = 'up' AND c.checked_at >= $since
       GROUP BY c.instance_id, hour`,
    )
    .all({ since });

export const selectChecksSince = (db: Database, since: number): CheckRow[] =>
  db
    .query<CheckRow, { since: number }>(
      `SELECT c.instance_id AS instanceId, c.url, c.status, c.http_status AS httpStatus,
              c.latency_ms AS latencyMs, c.error, c.checked_at AS checkedAt
       FROM checks c
       JOIN runs r ON r.id = c.run_id
       JOIN instances i ON i.id = c.instance_id
       WHERE r.discarded = 0 AND i.listed = 1 AND c.checked_at >= $since
       ORDER BY c.checked_at, c.id`,
    )
    .all({ since });

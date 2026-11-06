import type { Database } from "bun:sqlite";
import {
  type DailyUptime,
  type InstanceStatus,
  type StatusDocument,
  type UptimeWindow,
  type UrlStatus,
} from "../shared/status";
import {
  selectDailyCounts,
  selectHourlyLatency,
  selectLatestChecks,
  selectListedInstances,
  selectUptimeCounts,
  type ListedInstanceRow,
  type UptimeCountRow,
} from "./status-queries";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const HOURS_IN_DAY = 24;

const WINDOW_MS: Record<UptimeWindow, number> = {
  "24h": DAY_MS,
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
  "90d": 90 * DAY_MS,
};

export interface BuildStatusOptions {
  now: number;
  intervalMinutes: number;
  historyDays: number;
}

const _byWindow = <T>(
  build: (window: UptimeWindow) => T,
): Record<UptimeWindow, T> => ({
  "24h": build("24h"),
  "7d": build("7d"),
  "30d": build("30d"),
  "90d": build("90d"),
});

const _toUptimePercent = (
  row: Pick<UptimeCountRow, "up" | "counted"> | undefined,
): number | null =>
  row && row.counted > 0
    ? Math.round((row.up / row.counted) * 10_000) / 100
    : null;

const _groupBy = <T>(
  rows: readonly T[],
  key: (row: T) => string,
): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const bucket = grouped.get(key(row));
    if (bucket) bucket.push(row);
    else grouped.set(key(row), [row]);
  }
  return grouped;
};

const _utcDayStart = (timestamp: number): number =>
  Math.floor(timestamp / DAY_MS) * DAY_MS;

const _dateKeys = (now: number, days: number): string[] => {
  const today = _utcDayStart(now);
  return Array.from({ length: days }, (_, index) =>
    new Date(today - (days - 1 - index) * DAY_MS).toISOString().slice(0, 10),
  );
};

const _parseClearnet = (raw: string): string[] => {
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed)
    ? parsed.filter((url): url is string => typeof url === "string")
    : [];
};

const _orderUrls = (
  clearnet: readonly string[],
  latest: readonly UrlStatus[],
): UrlStatus[] =>
  clearnet.flatMap((url) => latest.find((check) => check.url === url) ?? []);

export const buildStatus = (
  db: Database,
  options: BuildStatusOptions,
): StatusDocument => {
  const { now, intervalMinutes, historyDays } = options;
  const dayKeys = _dateKeys(now, historyDays);
  const latencySince = now - DAY_MS;

  const latestByInstance = _groupBy(
    selectLatestChecks(db),
    (row) => row.instanceId,
  );
  const windowCounts = _byWindow(
    (window) =>
      new Map(
        selectUptimeCounts(db, now - WINDOW_MS[window]).map((row) => [
          row.instanceId,
          row,
        ]),
      ),
  );
  const dailyByInstance = _groupBy(
    selectDailyCounts(db, _utcDayStart(now) - (historyDays - 1) * DAY_MS),
    (row) => row.instanceId,
  );
  const latencyByInstance = _groupBy(
    selectHourlyLatency(db, latencySince),
    (row) => row.instanceId,
  );

  const toInstanceStatus = (instance: ListedInstanceRow): InstanceStatus => {
    const urls = _orderUrls(
      _parseClearnet(instance.clearnet),
      (latestByInstance.get(instance.id) ?? []).map(
        ({ instanceId: _, ...check }) => check,
      ),
    );
    const primary = urls[0] ?? null;

    const dailyRows = new Map(
      (dailyByInstance.get(instance.id) ?? []).map((row) => [row.date, row]),
    );
    const daily: DailyUptime[] = dayKeys.map((date) => {
      const row = dailyRows.get(date);
      return { date, uptime: _toUptimePercent(row), checks: row?.counted ?? 0 };
    });

    const hourly = new Map(
      (latencyByInstance.get(instance.id) ?? []).map((row) => [
        row.hour,
        Math.round(row.avgLatencyMs),
      ]),
    );
    const latency24h = Array.from(
      { length: HOURS_IN_DAY },
      (_, hour) => hourly.get(hour) ?? null,
    );
    const measured = latency24h.filter(
      (value): value is number => value !== null,
    );

    return {
      id: instance.id,
      name: instance.name,
      country: instance.country,
      cloudflare:
        instance.cloudflare === null ? null : instance.cloudflare === 1,
      appearance: instance.appearance,
      theme: instance.theme,
      current: primary?.status ?? null,
      lastCheckedAt: primary?.checkedAt ?? null,
      urls,
      uptime: _byWindow((window) =>
        _toUptimePercent(windowCounts[window].get(instance.id)),
      ),
      avgLatency24h: measured.length
        ? Math.round(
            measured.reduce((sum, value) => sum + value, 0) / measured.length,
          )
        : null,
      latency24h,
      daily,
    };
  };

  return {
    version: 1,
    generatedAt: now,
    intervalMinutes,
    historyDays,
    instances: selectListedInstances(db).map(toInstanceStatus),
  };
};

import type { Database } from "bun:sqlite";
import type { DayDocument, UrlStatus } from "../shared/status";
import { historyStart, toDateKey } from "./history-window";
import { selectChecksSince } from "./status-queries";

export const buildDays = (
  db: Database,
  now: number,
  historyDays: number,
): DayDocument[] => {
  const days = new Map<string, Record<string, UrlStatus[]>>();
  for (const { instanceId, ...check } of selectChecksSince(
    db,
    historyStart(now, historyDays),
  )) {
    const date = toDateKey(check.checkedAt);
    const instances = days.get(date) ?? {};
    (instances[instanceId] ??= []).push(check);
    days.set(date, instances);
  }
  return [...days].map(([date, instances]) => ({
    version: 1,
    date,
    instances,
  }));
};

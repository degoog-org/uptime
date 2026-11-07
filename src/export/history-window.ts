export const DAY_MS = 86_400_000;

export const utcDayStart = (timestamp: number): number =>
  Math.floor(timestamp / DAY_MS) * DAY_MS;

export const historyStart = (now: number, historyDays: number): number =>
  utcDayStart(now) - (historyDays - 1) * DAY_MS;

export const toDateKey = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

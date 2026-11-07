const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - "A".charCodeAt(0);

export const formatPercent = (value: number | null): string =>
  value === null ? "-" : `${value.toFixed(value === 100 ? 0 : 2)}%`;

export const formatLatency = (value: number | null): string =>
  value === null ? "-" : `${value} ms`;

export const formatRelativeTime = (timestamp: number, now: number): string => {
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)} h ago`;
  return `${Math.floor(elapsed / DAY_MS)} d ago`;
};

export const formatDay = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const toFlagEmoji = (countryCode: string): string =>
  String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map(
      (char) => char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET,
    ),
  );

export const toHost = (url: string): string => new URL(url).host;

export const formatUtcTime = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(11, 16);

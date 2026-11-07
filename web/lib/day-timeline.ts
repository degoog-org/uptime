import type { UrlStatus } from "../../src/shared/status";
import { describeIssue } from "./describe-issue";
import { metaFor, type StatusTone } from "./status-meta";

const DAY_MS = 86_400_000;
const MAX_SLOT_MS = 30 * 60_000;
const MIN_SLOT_FRACTION = 0.003;

export interface TimelineSlot {
  check: UrlStatus;
  start: number;
  width: number;
}

export interface DaySummary {
  checks: number;
  failures: number;
  uptime: number | null;
  avgLatencyMs: number | null;
  maxLatencyMs: number | null;
}

export interface Incident {
  start: number;
  end: number;
  label: string;
  tone: StatusTone;
  checks: number;
}

export const dayStartOf = (date: string): number =>
  Date.parse(`${date}T00:00:00Z`);

export const toDayFraction = (timestamp: number, dayStart: number): number =>
  Math.min(1, Math.max(0, (timestamp - dayStart) / DAY_MS));

export const isFailure = (check: UrlStatus): boolean => {
  const tone = metaFor(check.status).tone;
  return tone === "danger" || tone === "warning";
};

export const toSlots = (
  checks: readonly UrlStatus[],
  dayStart: number,
): TimelineSlot[] =>
  checks.map((check, index) => {
    const next = checks[index + 1]?.checkedAt;
    const previous = checks[index - 1]?.checkedAt;
    const gap = next
      ? next - check.checkedAt
      : previous
        ? check.checkedAt - previous
        : MAX_SLOT_MS;
    return {
      check,
      start: toDayFraction(check.checkedAt, dayStart),
      width: Math.max(MIN_SLOT_FRACTION, Math.min(gap, MAX_SLOT_MS) / DAY_MS),
    };
  });

export const summariseDay = (checks: readonly UrlStatus[]): DaySummary => {
  const counted = checks.filter(
    (check) => metaFor(check.status).tone !== "muted",
  );
  const latencies = checks
    .map((check) => check.latencyMs)
    .filter((value): value is number => value !== null);
  const up = counted.filter((check) => check.status === "up").length;
  return {
    checks: checks.length,
    failures: checks.filter(isFailure).length,
    uptime: counted.length
      ? Math.round((up / counted.length) * 10_000) / 100
      : null,
    avgLatencyMs: latencies.length
      ? Math.round(
          latencies.reduce((sum, value) => sum + value, 0) / latencies.length,
        )
      : null,
    maxLatencyMs: latencies.length ? Math.max(...latencies) : null,
  };
};

export const groupIncidents = (checks: readonly UrlStatus[]): Incident[] => {
  const incidents: Incident[] = [];
  let current: Incident | null = null;
  for (const check of checks) {
    if (!isFailure(check)) {
      current = null;
      continue;
    }
    if (current) {
      current.end = check.checkedAt;
      current.checks += 1;
      continue;
    }
    current = {
      start: check.checkedAt,
      end: check.checkedAt,
      label: describeIssue(check) ?? "Down",
      tone: metaFor(check.status).tone,
      checks: 1,
    };
    incidents.push(current);
  }
  return incidents;
};

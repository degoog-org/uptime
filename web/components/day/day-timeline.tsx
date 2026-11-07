import type { JSX } from "react";
import type { UrlStatus } from "../../../src/shared/status";
import { describeIssue } from "../../lib/describe-issue";
import {
  dayStartOf,
  isFailure,
  toSlots,
  type TimelineSlot,
} from "../../lib/day-timeline";
import { formatLatency, formatUtcTime } from "../../lib/format";
import { metaFor, type StatusTone } from "../../lib/status-meta";

const HOUR_LABELS = ["00:00", "06:00", "12:00", "18:00", "24:00"];
const CHART_WIDTH = 1000;
const CHART_HEIGHT = 100;
const FAILURE_MARK_HEIGHT = 6;
const LATENCY_STEP_MS = 100;

const SLOT_TONE: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  muted: "bg-border",
};

const FAILURE_FILL: Record<StatusTone, string> = {
  success: "fill-success",
  warning: "fill-warning",
  danger: "fill-danger",
  muted: "fill-border",
};

interface DayTimelineProps {
  date: string;
  checks: readonly UrlStatus[];
}

const _tooltip = (check: UrlStatus): string =>
  `${formatUtcTime(check.checkedAt)} · ${describeIssue(check) ?? formatLatency(check.latencyMs)}`;

const _latencyCeiling = (slots: readonly TimelineSlot[]): number => {
  const highest = Math.max(
    0,
    ...slots.map((slot) => slot.check.latencyMs ?? 0),
  );
  return Math.max(
    LATENCY_STEP_MS,
    Math.ceil(highest / LATENCY_STEP_MS) * LATENCY_STEP_MS,
  );
};

const _latencyLines = (
  slots: readonly TimelineSlot[],
  ceiling: number,
): string[] => {
  const lines: string[][] = [[]];
  for (const { check, start, width } of slots) {
    if (check.latencyMs === null) {
      lines.push([]);
      continue;
    }
    const x = (start + width / 2) * CHART_WIDTH;
    const y = CHART_HEIGHT - (check.latencyMs / ceiling) * CHART_HEIGHT;
    lines.at(-1)?.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return lines.filter((line) => line.length > 0).map((line) => line.join(" "));
};

export const DayTimeline = ({
  date,
  checks,
}: DayTimelineProps): JSX.Element => {
  const slots = toSlots(checks, dayStartOf(date));
  const ceiling = _latencyCeiling(slots);

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Status of ${checks.length} checks across the day`}
        className="relative h-8 rounded-xs bg-border/30"
      >
        {slots.map((slot) => (
          <span
            key={slot.check.checkedAt}
            className="absolute inset-y-0"
            style={{
              left: `${slot.start * 100}%`,
              width: `max(2px, calc(${slot.width * 100}% - 1px))`,
            }}
          >
            <span
              data-tooltip={_tooltip(slot.check)}
              data-tooltip-start={slot.start < 0.5 ? "" : undefined}
              data-tooltip-end={slot.start >= 0.5 ? "" : undefined}
              className={`block h-full rounded-xs hover:opacity-60 ${SLOT_TONE[metaFor(slot.check.status).tone]}`}
            />
          </span>
        ))}
      </div>

      <div className="degoog-text degoog-text--sm degoog-text--secondary mt-2 flex justify-between">
        <span>Latency</span>
        <span>{ceiling} ms</span>
      </div>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-20 w-full overflow-visible text-primary"
        aria-hidden="true"
      >
        {_latencyLines(slots, ceiling).map((points) => (
          <polyline
            key={points}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {slots
          .filter((slot) => isFailure(slot.check))
          .map((slot) => (
            <rect
              key={slot.check.checkedAt}
              x={slot.start * CHART_WIDTH}
              y={CHART_HEIGHT - FAILURE_MARK_HEIGHT}
              width={slot.width * CHART_WIDTH}
              height={FAILURE_MARK_HEIGHT}
              className={FAILURE_FILL[metaFor(slot.check.status).tone]}
            />
          ))}
      </svg>

      <div className="degoog-text degoog-text--sm degoog-text--secondary flex justify-between tabular-nums">
        {HOUR_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
};

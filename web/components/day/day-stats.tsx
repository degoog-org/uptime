import type { JSX } from "react";
import type { DaySummary } from "../../lib/day-timeline";
import { formatLatency, formatPercent } from "../../lib/format";
import { TONE_CLASSES, uptimeTone } from "../../lib/status-meta";
import { Stat } from "../ui/stat";

interface DayStatsProps {
  summary: DaySummary;
}

export const DayStats = ({ summary }: DayStatsProps): JSX.Element => (
  <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
    <Stat label="Checks">{summary.checks}</Stat>
    <Stat
      label="Uptime"
      className={TONE_CLASSES[uptimeTone(summary.uptime)].text}
    >
      {formatPercent(summary.uptime)}
    </Stat>
    <Stat label="Avg latency">{formatLatency(summary.avgLatencyMs)}</Stat>
    <Stat label="Slowest">{formatLatency(summary.maxLatencyMs)}</Stat>
    <Stat
      label="Failures"
      className={summary.failures > 0 ? "text-danger" : ""}
    >
      {summary.failures}
    </Stat>
  </dl>
);

import type { JSX } from "react";
import type { DailyUptime } from "../../../src/shared/status";
import { formatDay, formatPercent } from "../../lib/format";
import { uptimeTone, type StatusTone } from "../../lib/status-meta";

const BAR_TONE: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  muted: "bg-border/50",
};

interface UptimeBarsProps {
  days: readonly DailyUptime[];
  className: string;
}

const _tooltip = (day: DailyUptime): string =>
  `${formatDay(day.date)} · ${day.checks > 0 ? formatPercent(day.uptime) : "no data"}`;

export const UptimeBars = ({
  days,
  className,
}: UptimeBarsProps): JSX.Element => {
  const middle = days.length / 2;
  return (
    <div
      role="img"
      aria-label={`Daily uptime over the last ${days.length} days`}
      className={`h-8 items-stretch ${className}`}
    >
      {days.map((day, index) => (
        <span
          key={day.date}
          data-tooltip={_tooltip(day)}
          data-tooltip-start={index < middle ? "" : undefined}
          data-tooltip-end={index >= middle ? "" : undefined}
          className={`min-w-0 flex-1 rounded-xs hover:opacity-60 ${BAR_TONE[uptimeTone(day.uptime)]}`}
        />
      ))}
    </div>
  );
};

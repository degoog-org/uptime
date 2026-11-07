import type { JSX, KeyboardEvent } from "react";
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
  onSelect: (day: DailyUptime) => void;
}

const _tooltip = (day: DailyUptime): string =>
  `${formatDay(day.date)} · ${day.checks > 0 ? formatPercent(day.uptime) : "no data"}`;

const _moveFocus = (event: KeyboardEvent<HTMLButtonElement>): void => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const bars = [
    ...(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    ) ?? []),
  ];
  const index = bars.indexOf(event.currentTarget);
  bars[index + (event.key === "ArrowRight" ? 1 : -1)]?.focus();
  event.preventDefault();
};

export const UptimeBars = ({
  days,
  className,
  onSelect,
}: UptimeBarsProps): JSX.Element => {
  const middle = days.length / 2;
  const latestWithData = days.findLastIndex((day) => day.checks > 0);
  return (
    <div
      role="group"
      aria-label={`Daily uptime over the last ${days.length} days`}
      className={`h-8 items-stretch ${className}`}
    >
      {days.map((day, index) => (
        <button
          key={day.date}
          type="button"
          aria-label={_tooltip(day)}
          data-tooltip={_tooltip(day)}
          data-tooltip-start={index < middle ? "" : undefined}
          data-tooltip-end={index >= middle ? "" : undefined}
          disabled={day.checks === 0}
          tabIndex={index === latestWithData ? 0 : -1}
          onClick={() => onSelect(day)}
          onKeyDown={_moveFocus}
          className={`min-w-0 flex-1 cursor-pointer appearance-none rounded-xs border-0 p-0 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:hover:opacity-100 ${BAR_TONE[uptimeTone(day.uptime)]}`}
        />
      ))}
    </div>
  );
};

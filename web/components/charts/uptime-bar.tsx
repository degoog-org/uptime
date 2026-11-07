import type { JSX } from "react";
import type { DailyUptime } from "../../../src/shared/status";
import { MOBILE_HISTORY_DAYS } from "../../config";
import { UptimeBars } from "./uptime-bars";

interface UptimeBarProps {
  daily: readonly DailyUptime[];
  onSelectDay: (day: DailyUptime) => void;
}

export const UptimeBar = ({
  daily,
  onSelectDay,
}: UptimeBarProps): JSX.Element => {
  const recent = daily.slice(-MOBILE_HISTORY_DAYS);
  return (
    <div>
      <UptimeBars
        days={daily}
        className="hidden gap-0.5 sm:flex"
        onSelect={onSelectDay}
      />
      <UptimeBars
        days={recent}
        className="flex gap-px sm:hidden"
        onSelect={onSelectDay}
      />
      <div className="degoog-text degoog-text--sm degoog-text--secondary mt-1 flex justify-between">
        <span className="sm:hidden">{recent.length} days ago</span>
        <span className="hidden sm:inline">{daily.length} days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

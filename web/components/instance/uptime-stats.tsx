import type { JSX } from "react";
import {
  UPTIME_WINDOWS,
  type InstanceStatus,
} from "../../../src/shared/status";
import { formatLatency, formatPercent } from "../../lib/format";
import { TONE_CLASSES, uptimeTone } from "../../lib/status-meta";
import { LatencySparkline } from "../charts/latency-sparkline";
import { Stat } from "../ui/stat";

interface UptimeStatsProps {
  instance: InstanceStatus;
}

export const UptimeStats = ({ instance }: UptimeStatsProps): JSX.Element => (
  <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.5fr)]">
    {UPTIME_WINDOWS.map((window) => {
      const value = instance.uptime[window];
      return (
        <Stat
          key={window}
          label={`Uptime ${window}`}
          className={TONE_CLASSES[uptimeTone(value)].text}
        >
          {formatPercent(value)}
        </Stat>
      );
    })}
    <Stat
      label="Latency 24h"
      className="col-span-2 flex items-center gap-3 sm:col-span-1"
    >
      <span className="shrink-0">{formatLatency(instance.avgLatency24h)}</span>
      <LatencySparkline values={instance.latency24h} />
    </Stat>
  </dl>
);

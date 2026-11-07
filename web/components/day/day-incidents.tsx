import type { JSX } from "react";
import type { Incident } from "../../lib/day-timeline";
import { formatUtcTime } from "../../lib/format";
import { TONE_CLASSES } from "../../lib/status-meta";
import { StatusDot } from "../ui/status-dot";

interface DayIncidentsProps {
  incidents: readonly Incident[];
}

const _span = (incident: Incident): string =>
  incident.start === incident.end
    ? formatUtcTime(incident.start)
    : `${formatUtcTime(incident.start)} to ${formatUtcTime(incident.end)}`;

export const DayIncidents = ({ incidents }: DayIncidentsProps): JSX.Element =>
  incidents.length === 0 ? (
    <p className="ext-field-desc">No failures.</p>
  ) : (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {incidents.map((incident) => (
        <li
          key={incident.start}
          className="degoog-text degoog-text--sm flex items-center gap-2"
        >
          <StatusDot tone={incident.tone} />
          <span className="tabular-nums">{_span(incident)}</span>
          <span className={TONE_CLASSES[incident.tone].text}>
            {incident.label}
          </span>
          <span className="degoog-text--secondary ml-auto">
            {incident.checks} {incident.checks === 1 ? "check" : "checks"}
          </span>
        </li>
      ))}
    </ul>
  );

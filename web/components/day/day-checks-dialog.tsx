import type { JSX } from "react";
import type { DailyUptime, InstanceStatus } from "../../../src/shared/status";
import { useDayChecks } from "../../hooks/use-day-checks";
import { groupIncidents, summariseDay } from "../../lib/day-timeline";
import { formatDay } from "../../lib/format";
import { Modal } from "../ui/modal";
import { DayIncidents } from "./day-incidents";
import { DayStats } from "./day-stats";
import { DayTimeline } from "./day-timeline";

interface DayChecksDialogProps {
  instance: InstanceStatus;
  day: DailyUptime;
  onClose: () => void;
}

export const DayChecksDialog = ({
  instance,
  day,
  onClose,
}: DayChecksDialogProps): JSX.Element => {
  const state = useDayChecks(day.date, instance.id);

  return (
    <Modal
      id="day-checks"
      title={`${instance.name} · ${formatDay(day.date)}`}
      status="Times are UTC"
      onClose={onClose}
    >
      {state.phase === "loading" && (
        <p className="ext-field-desc">Loading checks…</p>
      )}
      {state.phase === "error" && (
        <p className="ext-field-desc">
          <span className="text-danger">{state.message}.</span>
        </p>
      )}
      {state.phase === "ready" && state.checks.length === 0 && (
        <p className="ext-field-desc">No checks stored for this day.</p>
      )}
      {state.phase === "ready" && state.checks.length > 0 && (
        <>
          <DayStats summary={summariseDay(state.checks)} />
          <DayTimeline date={day.date} checks={state.checks} />
          <div className="ext-field">
            <span className="ext-field-label">Incidents</span>
            <DayIncidents incidents={groupIncidents(state.checks)} />
          </div>
        </>
      )}
    </Modal>
  );
};

import { useEffect, useState } from "react";
import type { DayDocument, UrlStatus } from "../../src/shared/status";
import { dayUrl } from "../lib/day-url";
import { isWebUrl } from "../lib/sanitize-status";

export type DayChecksState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; checks: UrlStatus[] };

const _isDayDocument = (value: unknown, date: string): value is DayDocument =>
  typeof value === "object" &&
  value !== null &&
  "version" in value &&
  value.version === 1 &&
  "date" in value &&
  value.date === date &&
  "instances" in value &&
  typeof value.instances === "object" &&
  value.instances !== null;

const _fetchChecks = async (
  date: string,
  instanceId: string,
  signal: AbortSignal,
): Promise<UrlStatus[]> => {
  const response = await fetch(dayUrl(date), { cache: "no-store", signal });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Server answered HTTP ${response.status}`);
  const body: unknown = await response.json();
  if (!_isDayDocument(body, date)) throw new Error("Unexpected file format");
  return (body.instances[instanceId] ?? []).filter((check) =>
    isWebUrl(check.url),
  );
};

export const useDayChecks = (
  date: string,
  instanceId: string,
): DayChecksState => {
  const [state, setState] = useState<DayChecksState>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ phase: "loading" });
    _fetchChecks(date, instanceId, controller.signal)
      .then((checks) => setState({ phase: "ready", checks }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          phase: "error",
          message: error instanceof Error ? error.message : "Request failed",
        });
      });
    return () => controller.abort();
  }, [date, instanceId]);

  return state;
};

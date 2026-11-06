import { useCallback, useEffect, useState } from "react";
import type { StatusDocument } from "../../src/shared/status";
import { REFRESH_INTERVAL_MS, STATUS_URL } from "../config";
import { sanitizeStatus } from "../lib/sanitize-status";

export type StatusState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; data: StatusDocument };

const _isStatusDocument = (value: unknown): value is StatusDocument =>
  typeof value === "object" &&
  value !== null &&
  "version" in value &&
  value.version === 1 &&
  "instances" in value &&
  Array.isArray(value.instances);

const _fetchStatus = async (signal: AbortSignal): Promise<StatusDocument> => {
  const response = await fetch(STATUS_URL, { cache: "no-store", signal }).catch(
    (error: unknown) => {
      if (signal.aborted) throw error;
      throw new Error("the request failed");
    },
  );
  if (!response.ok)
    throw new Error(`the server answered HTTP ${response.status}`);
  const body: unknown = await response.json();
  if (!_isStatusDocument(body))
    throw new Error("the file isn't in the expected format");
  return sanitizeStatus(body);
};

export const useStatus = (): StatusState => {
  const [state, setState] = useState<StatusState>({ phase: "loading" });

  const load = useCallback(async (signal: AbortSignal): Promise<void> => {
    try {
      const data = await _fetchStatus(signal);
      setState({ phase: "ready", data });
    } catch (error) {
      if (signal.aborted) return;
      const message =
        error instanceof Error ? error.message : "the request failed";
      setState((previous) =>
        previous.phase === "ready" ? previous : { phase: "error", message },
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = setInterval(
      () => void load(controller.signal),
      REFRESH_INTERVAL_MS,
    );
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [load]);

  return state;
};

import { READY_PATH, WHODIS_PATH } from "../config";
import type { ProbeResult } from "../types";
import {
  classifyNetworkError,
  classifyReadiness,
  isDegoogWhodis,
} from "./classify";
import { httpGet } from "./http";

export const probeInstanceUrl = async (
  baseUrl: string,
): Promise<ProbeResult> => {
  const readiness = await httpGet(`${baseUrl}${READY_PATH}`);
  if (!readiness.ok) {
    return {
      status: classifyNetworkError(readiness.error),
      httpStatus: null,
      latencyMs: null,
      error: readiness.error,
    };
  }

  const { snapshot, latencyMs } = readiness;
  const status = classifyReadiness(snapshot);
  if (status !== "up") {
    return { status, httpStatus: snapshot.status, latencyMs, error: null };
  }

  const whodis = await httpGet(`${baseUrl}${WHODIS_PATH}`);
  const verified = whodis.ok && isDegoogWhodis(whodis.snapshot);
  return {
    status: verified ? "up" : "unverified",
    httpStatus: snapshot.status,
    latencyMs,
    error: verified ? null : `whodis mismatch at ${WHODIS_PATH}`,
  };
};

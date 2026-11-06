import { PROBE_CONCURRENCY, RETRY_DELAY_MS } from "../config";
import type { CheckStatus } from "../shared/status";
import type { CheckResult, Instance, ProbeResult } from "../types";
import { mapWithConcurrency } from "../utils/map-with-concurrency";
import { probeInstanceUrl } from "./probe";

const RETRYABLE_STATUSES: ReadonlySet<CheckStatus> = new Set([
  "down",
  "unverified",
]);

interface ProbeTarget {
  instanceId: string;
  url: string;
}

const _toTargets = (instances: readonly Instance[]): ProbeTarget[] =>
  instances.flatMap((instance) =>
    instance.clearnet.map((url) => ({ instanceId: instance.id, url })),
  );

const _probeWithRetry = async (url: string): Promise<ProbeResult> => {
  const first = await probeInstanceUrl(url);
  if (!RETRYABLE_STATUSES.has(first.status)) return first;
  await Bun.sleep(RETRY_DELAY_MS);
  return probeInstanceUrl(url);
};

export const runChecks = (
  instances: readonly Instance[],
): Promise<CheckResult[]> =>
  mapWithConcurrency(
    _toTargets(instances),
    PROBE_CONCURRENCY,
    async (target) => {
      const result = await _probeWithRetry(target.url);
      return { ...result, ...target, checkedAt: Date.now() };
    },
  );

export const isCheckerFault = (results: readonly CheckResult[]): boolean =>
  results.length > 1 &&
  results.every(
    (result) => result.status === "down" && result.httpStatus === null,
  );

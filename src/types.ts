import type { CheckStatus } from "./shared/status";

export type InstanceAppearance = "default" | "custom";

export interface Instance {
  id: string;
  name: string;
  clearnet: string[];
  tor: string[];
  i2p: string[];
  appearance: InstanceAppearance;
  theme: string | null;
  country: string | null;
  cloudflare: boolean | null;
}

export interface HttpSnapshot {
  status: number;
  headers: Headers;
  body: string;
}

export interface ProbeResult {
  status: CheckStatus;
  httpStatus: number | null;
  latencyMs: number | null;
  error: string | null;
}

export interface CheckResult extends ProbeResult {
  instanceId: string;
  url: string;
  checkedAt: number;
}

export interface RunRecord {
  startedAt: number;
  finishedAt: number;
  discarded: boolean;
  results: CheckResult[];
}

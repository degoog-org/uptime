export type CheckStatus =
  | "up"
  | "starting"
  | "down"
  | "blocked"
  | "rate_limited"
  | "no_health_endpoint"
  | "unverified";

export const COUNTED_STATUSES: readonly CheckStatus[] = [
  "up",
  "starting",
  "down",
  "no_health_endpoint",
  "unverified",
];

export type UptimeWindow = "24h" | "7d" | "30d" | "90d";

export const UPTIME_WINDOWS: readonly UptimeWindow[] = [
  "24h",
  "7d",
  "30d",
  "90d",
];

export interface UrlStatus {
  url: string;
  status: CheckStatus;
  httpStatus: number | null;
  latencyMs: number | null;
  error: string | null;
  checkedAt: number;
}

export interface DailyUptime {
  date: string;
  uptime: number | null;
  checks: number;
}

export interface InstanceStatus {
  id: string;
  name: string;
  country: string | null;
  cloudflare: boolean | null;
  appearance: "default" | "custom";
  theme: string | null;
  current: CheckStatus | null;
  lastCheckedAt: number | null;
  urls: UrlStatus[];
  uptime: Record<UptimeWindow, number | null>;
  avgLatency24h: number | null;
  latency24h: (number | null)[];
  daily: DailyUptime[];
}

export interface StatusDocument {
  version: 1;
  generatedAt: number;
  intervalMinutes: number;
  historyDays: number;
  instances: InstanceStatus[];
}

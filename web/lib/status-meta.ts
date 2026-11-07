import type { CheckStatus } from "../../src/shared/status";

export type StatusTone = "success" | "warning" | "danger" | "muted";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
  description: string;
}

export const STATUS_META: Record<CheckStatus, StatusMeta> = {
  up: {
    label: "Up",
    tone: "success",
    description: "Ready.",
  },
  starting: {
    label: "Starting",
    tone: "warning",
    description: "Still starting up.",
  },
  unverified: {
    label: "Unverified",
    tone: "warning",
    description: "/api/whodis didn't answer like degoog.",
  },
  down: {
    label: "Down",
    tone: "danger",
    description: "Unreachable or returning errors.",
  },
  no_health_endpoint: {
    label: "No /readyz",
    tone: "danger",
    description: "No /readyz. Probably an old degoog.",
  },
  blocked: {
    label: "Unknown",
    tone: "muted",
    description: "A firewall blocked the checker.",
  },
  rate_limited: {
    label: "Unknown",
    tone: "muted",
    description: "Rate limited the checker.",
  },
};

export const NO_DATA_META: StatusMeta = {
  label: "No data",
  tone: "muted",
  description: "Not checked yet.",
};

export const TONE_CLASSES: Record<StatusTone, { dot: string; text: string }> = {
  success: { dot: "bg-success", text: "text-success" },
  warning: { dot: "bg-warning", text: "text-warning" },
  danger: { dot: "bg-danger", text: "text-danger" },
  muted: { dot: "bg-border", text: "text-text-secondary" },
};

export const metaFor = (status: CheckStatus | null): StatusMeta =>
  status ? STATUS_META[status] : NO_DATA_META;

export const uptimeTone = (uptime: number | null): StatusTone => {
  if (uptime === null) return "muted";
  if (uptime >= 99) return "success";
  if (uptime >= 95) return "warning";
  return "danger";
};

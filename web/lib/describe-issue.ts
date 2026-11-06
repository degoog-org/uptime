import type { UrlStatus } from "../../src/shared/status";

const NETWORK_ERRORS: readonly { pattern: RegExp; label: string }[] = [
  { pattern: /timeout/i, label: "Timeout" },
  { pattern: /ENOTFOUND|EAI_AGAIN|getaddrinfo/i, label: "DNS error" },
  { pattern: /ECONNREFUSED/i, label: "Connection refused" },
  { pattern: /ECONNRESET|socket hang up/i, label: "Connection reset" },
  { pattern: /certificate|CERT_|SSL|TLS/i, label: "TLS error" },
];

export const describeIssue = (check: UrlStatus | undefined): string | null => {
  if (!check || check.status === "up") return null;
  if (check.status === "unverified") return "Not degoog";
  if (check.httpStatus !== null) return `HTTP ${check.httpStatus}`;
  const known = NETWORK_ERRORS.find(
    ({ pattern }) => check.error && pattern.test(check.error),
  );
  return known?.label ?? "Unreachable";
};

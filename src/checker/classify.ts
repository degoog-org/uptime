import { WHODIS_RESPONSE } from "../config";
import type { CheckStatus } from "../shared/status";
import type { HttpSnapshot } from "../types";

const CLOUDFLARE_CHALLENGE_MARKERS = [
  "challenge-platform",
  "cf-chl-",
  "Just a moment...",
];

const _hasOkFlag = (body: string, expected: boolean): boolean => {
  try {
    const parsed: unknown = JSON.parse(body);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "ok" in parsed &&
      parsed.ok === expected
    );
  } catch {
    return false;
  }
};

export const isCloudflareChallenge = (snapshot: HttpSnapshot): boolean => {
  if (snapshot.headers.get("cf-mitigated") === "challenge") return true;
  const server = snapshot.headers.get("server")?.toLowerCase() ?? "";
  if (server !== "cloudflare") return false;
  if (snapshot.status !== 403 && snapshot.status !== 503) return false;
  return CLOUDFLARE_CHALLENGE_MARKERS.some((marker) =>
    snapshot.body.includes(marker),
  );
};

export const classifyReadiness = (snapshot: HttpSnapshot): CheckStatus => {
  if (snapshot.status === 200 && _hasOkFlag(snapshot.body, true)) return "up";
  if (snapshot.status === 503 && _hasOkFlag(snapshot.body, false))
    return "starting";
  if (snapshot.status === 429) return "rate_limited";
  if (isCloudflareChallenge(snapshot)) return "blocked";
  if (snapshot.status === 404) return "no_health_endpoint";
  return "down";
};

export const isDegoogWhodis = (snapshot: HttpSnapshot): boolean =>
  snapshot.status === 200 && snapshot.body.trim() === WHODIS_RESPONSE;

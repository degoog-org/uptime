export const INSTANCES_URL =
  "https://raw.githubusercontent.com/degoog-org/degoog/main/instances.json";
export const INSTANCES_FILE = process.env.INSTANCES_FILE ?? "";
export const REPO_URL = "https://github.com/degoog-org/uptime";
export const USER_AGENT = `official-degoog-uptime/1.0 (+${REPO_URL})`;
export const DB_PATH = process.env.UPTIME_DB_PATH ?? "data/uptime.sqlite";

export const READY_PATH = "/readyz";
export const WHODIS_PATH = "/api/whodis";
export const WHODIS_RESPONSE = "deez nuts";

export const PROBE_TIMEOUT_MS = 10_000;
export const RETRY_DELAY_MS = 5_000;
export const PROBE_CONCURRENCY = 8;
export const MAX_BODY_BYTES = 64 * 1024;

export const STATUS_PATH = process.env.UPTIME_STATUS_PATH ?? "data/status.json";
export const DAYS_DIR = process.env.UPTIME_DAYS_DIR ?? "data/days";
export const CHECK_INTERVAL_MINUTES = 15;
export const HISTORY_DAYS = 90;

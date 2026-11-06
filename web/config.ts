declare const __STATUS_URL__: string | undefined;

export const STATUS_URL =
  typeof __STATUS_URL__ === "string" ? __STATUS_URL__ : "./status.json";
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
export const CLOCK_TICK_MS = 30 * 1000;
export const MOBILE_HISTORY_DAYS = 30;
export const DEGOOG_URL = "https://github.com/degoog-org/degoog";

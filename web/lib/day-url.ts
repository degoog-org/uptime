import { STATUS_URL } from "../config";

export const dayUrl = (date: string): string =>
  new URL(
    `days/${date}.json`,
    new URL(STATUS_URL, window.location.href),
  ).toString();

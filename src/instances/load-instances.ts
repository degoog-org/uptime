import {
  INSTANCES_FILE,
  INSTANCES_URL,
  PROBE_TIMEOUT_MS,
  USER_AGENT,
} from "../config";
import type { Instance } from "../types";
import { parseInstances } from "./parse-instances";

const _readRemote = async (): Promise<unknown> => {
  const response = await fetch(INSTANCES_URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  });
  if (!response.ok)
    throw new Error(`instances fetch failed status=${response.status}`);
  return response.json();
};

const _readLocal = (path: string): Promise<unknown> => Bun.file(path).json();

export const loadInstances = async (): Promise<Instance[]> => {
  const raw = INSTANCES_FILE
    ? await _readLocal(INSTANCES_FILE)
    : await _readRemote();
  return parseInstances(raw);
};

import { MAX_BODY_BYTES, PROBE_TIMEOUT_MS, USER_AGENT } from "../config";
import type { HttpSnapshot } from "../types";

export type HttpOutcome =
  | { ok: true; snapshot: HttpSnapshot; latencyMs: number }
  | { ok: false; error: string };

const _readCappedBody = async (response: Response): Promise<string> => {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder().decode(
    Buffer.concat(chunks).subarray(0, MAX_BODY_BYTES),
  );
};

const _describeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.name === "TimeoutError" ? "timeout" : error.message;
  }
  return String(error);
};

export const httpGet = async (url: string): Promise<HttpOutcome> => {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, text/plain",
      },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - startedAt);
    const body = await _readCappedBody(response);
    return {
      ok: true,
      latencyMs,
      snapshot: { status: response.status, headers: response.headers, body },
    };
  } catch (error) {
    return { ok: false, error: _describeError(error) };
  }
};

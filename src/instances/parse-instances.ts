import type { Instance, InstanceAppearance } from "../types";
import { logger } from "../utils/logger";

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BASE_URL_PATTERN = /^https?:\/\/[^/]+$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const SUPPORTED_VERSION = 1;

const _isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const _toUrlList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (url): url is string =>
          typeof url === "string" && BASE_URL_PATTERN.test(url),
      )
    : [];

const _toNullableString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const _toAppearance = (value: unknown): InstanceAppearance | null =>
  value === "default" || value === "custom" ? value : null;

const _parseInstance = (raw: unknown): Instance | null => {
  if (!_isRecord(raw)) return null;
  const { id, name } = raw;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return null;
  if (typeof name !== "string" || name.length === 0) return null;
  const appearance = _toAppearance(raw.appearance);
  if (!appearance) return null;
  const country = _toNullableString(raw.country);

  return {
    id,
    name,
    clearnet: _toUrlList(raw.clearnet),
    tor: _toUrlList(raw.tor),
    i2p: _toUrlList(raw.i2p),
    appearance,
    theme: _toNullableString(raw.theme),
    country: country && COUNTRY_PATTERN.test(country) ? country : null,
    cloudflare: typeof raw.cloudflare === "boolean" ? raw.cloudflare : null,
  };
};

export const parseInstances = (raw: unknown): Instance[] => {
  if (!_isRecord(raw)) throw new Error("instances file is not an object");
  if (raw.version !== SUPPORTED_VERSION) {
    throw new Error(`unsupported instances version=${String(raw.version)}`);
  }
  if (!Array.isArray(raw.instances))
    throw new Error("instances is not an array");

  const seen = new Set<string>();
  const instances: Instance[] = [];
  for (const entry of raw.instances) {
    const instance = _parseInstance(entry);
    if (!instance) {
      logger.warn(
        "instances",
        `skipping invalid entry=${JSON.stringify(entry)}`,
      );
      continue;
    }
    if (seen.has(instance.id)) {
      logger.warn("instances", `skipping duplicate id=${instance.id}`);
      continue;
    }
    seen.add(instance.id);
    instances.push(instance);
  }
  return instances;
};

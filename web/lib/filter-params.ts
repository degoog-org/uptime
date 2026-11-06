import {
  APPEARANCE_FILTERS,
  CLOUDFLARE_FILTERS,
  DEFAULT_FILTERS,
  FILTER_KEYS,
  STATUS_FILTERS,
  type InstanceFilters,
} from "./filter-instances";

const COUNTRY_PATTERN = /^[A-Z]{2}$/;

const PARAM_NAMES: Record<keyof InstanceFilters, string> = {
  query: "q",
  status: "status",
  country: "country",
  appearance: "theme",
  cloudflare: "cloudflare",
};

const _pick = <T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T => allowed.find((option) => option === value) ?? fallback;

export const readFilters = (search: string): InstanceFilters => {
  const params = new URLSearchParams(search);
  const country = params.get(PARAM_NAMES.country)?.toUpperCase() ?? "";
  return {
    query: params.get(PARAM_NAMES.query) ?? DEFAULT_FILTERS.query,
    status: _pick(
      params.get(PARAM_NAMES.status),
      STATUS_FILTERS,
      DEFAULT_FILTERS.status,
    ),
    country: COUNTRY_PATTERN.test(country) ? country : DEFAULT_FILTERS.country,
    appearance: _pick(
      params.get(PARAM_NAMES.appearance),
      APPEARANCE_FILTERS,
      DEFAULT_FILTERS.appearance,
    ),
    cloudflare: _pick(
      params.get(PARAM_NAMES.cloudflare),
      CLOUDFLARE_FILTERS,
      DEFAULT_FILTERS.cloudflare,
    ),
  };
};

export const writeFilters = (
  filters: InstanceFilters,
  search: string,
): string => {
  const params = new URLSearchParams(search);
  for (const key of FILTER_KEYS) {
    const value = filters[key].trim();
    if (value && value !== DEFAULT_FILTERS[key])
      params.set(PARAM_NAMES[key], value);
    else params.delete(PARAM_NAMES[key]);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

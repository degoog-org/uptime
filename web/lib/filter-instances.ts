import type { InstanceStatus } from "../../src/shared/status";
import { toHost } from "./format";
import { metaFor } from "./status-meta";

export const STATUS_FILTERS = ["all", "operational", "issues"] as const;
export const APPEARANCE_FILTERS = ["any", "default", "custom"] as const;
export const CLOUDFLARE_FILTERS = ["any", "yes", "no"] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];
export type AppearanceFilter = (typeof APPEARANCE_FILTERS)[number];
export type CloudflareFilter = (typeof CLOUDFLARE_FILTERS)[number];

export interface InstanceFilters {
  query: string;
  status: StatusFilter;
  country: string;
  appearance: AppearanceFilter;
  cloudflare: CloudflareFilter;
}

export const FILTER_KEYS: readonly (keyof InstanceFilters)[] = [
  "query",
  "status",
  "country",
  "appearance",
  "cloudflare",
];

export const DEFAULT_FILTERS: InstanceFilters = {
  query: "",
  status: "all",
  country: "",
  appearance: "any",
  cloudflare: "any",
};

export const matchesStatus = (
  instance: InstanceStatus,
  filter: StatusFilter,
): boolean => {
  if (filter === "all") return true;
  if (filter === "operational") return instance.current === "up";
  const tone = metaFor(instance.current).tone;
  return tone === "danger" || tone === "warning";
};

const _searchText = (instance: InstanceStatus): string =>
  [
    instance.name,
    instance.id,
    instance.country ?? "",
    instance.theme ?? "",
    ...instance.urls.map((entry) => toHost(entry.url)),
  ]
    .join(" ")
    .toLowerCase();

const _matchesQuery = (instance: InstanceStatus, query: string): boolean => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = _searchText(instance);
  return terms.every((term) => haystack.includes(term));
};

export const filterInstances = (
  instances: readonly InstanceStatus[],
  filters: InstanceFilters,
): InstanceStatus[] =>
  instances.filter(
    (instance) =>
      matchesStatus(instance, filters.status) &&
      (!filters.country || instance.country === filters.country) &&
      (filters.appearance === "any" ||
        instance.appearance === filters.appearance) &&
      (filters.cloudflare === "any" ||
        (instance.cloudflare === true) === (filters.cloudflare === "yes")) &&
      _matchesQuery(instance, filters.query),
  );

export const listCountries = (instances: readonly InstanceStatus[]): string[] =>
  [
    ...new Set(
      instances.flatMap((instance) =>
        instance.country ? [instance.country] : [],
      ),
    ),
  ].sort();

export const isFiltered = (filters: InstanceFilters): boolean =>
  FILTER_KEYS.some((key) => filters[key] !== DEFAULT_FILTERS[key]);

export const countByStatus = (
  instances: readonly InstanceStatus[],
  filters: InstanceFilters,
): Record<StatusFilter, number> => {
  const candidates = filterInstances(instances, { ...filters, status: "all" });
  const count = (status: StatusFilter): number =>
    candidates.filter((instance) => matchesStatus(instance, status)).length;
  return {
    all: count("all"),
    operational: count("operational"),
    issues: count("issues"),
  };
};

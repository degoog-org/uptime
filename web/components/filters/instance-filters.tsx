import { useState, type JSX } from "react";
import type { InstanceStatus } from "../../../src/shared/status";
import type { FiltersApi } from "../../hooks/use-filters";
import {
  STATUS_FILTERS,
  countByStatus,
  isFiltered,
  listCountries,
  type AppearanceFilter,
  type CloudflareFilter,
  type StatusFilter,
} from "../../lib/filter-instances";
import { toFlagEmoji } from "../../lib/format";
import { FilterSearch } from "./filter-search";
import { FilterSelect, type SelectOption } from "./filter-select";
import { FilterSummary } from "./filter-summary";
import { FilterTabs } from "./filter-tabs";
import { FilterToggle } from "./filter-toggle";

const SEARCH_ID = "instances-q";
const TABS_ID = "instances-status";
const SELECTS_ID = "instances-selects";

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  operational: "Operational",
  issues: "Issues",
};

const APPEARANCE_OPTIONS: readonly SelectOption<AppearanceFilter>[] = [
  { value: "any", label: "Any theme" },
  { value: "default", label: "Default theme" },
  { value: "custom", label: "Custom theme" },
];

const CLOUDFLARE_OPTIONS: readonly SelectOption<CloudflareFilter>[] = [
  { value: "any", label: "Any proxy" },
  { value: "yes", label: "Cloudflare" },
  { value: "no", label: "No Cloudflare" },
];

interface InstanceFiltersProps {
  api: FiltersApi;
  instances: readonly InstanceStatus[];
  shown: number;
}

export const InstanceFilters = ({
  api,
  instances,
  shown,
}: InstanceFiltersProps): JSX.Element => {
  const { filters, update, reset } = api;
  const [open, setOpen] = useState(false);
  const counts = countByStatus(instances, filters);
  const activeSelects = [
    filters.country,
    filters.appearance !== "any",
    filters.cloudflare !== "any",
  ].filter(Boolean).length;
  const query = filters.query.trim();

  const countryOptions: SelectOption<string>[] = [
    { value: "", label: "Any country" },
    ...listCountries(instances).map((code) => ({
      value: code,
      label: `${toFlagEmoji(code)} ${code}`,
    })),
  ];

  return (
    <div className="filter-bar-wrap">
      <div className={open ? "filter-bar filter-bar--open" : "filter-bar"}>
        <div className="filter-bar-top">
          <FilterSearch
            id={SEARCH_ID}
            placeholder="Search instances"
            value={filters.query}
            onInput={(value) => update("query", value)}
          />
          <FilterToggle
            active={activeSelects}
            open={open}
            controls={SELECTS_ID}
            onToggle={() => setOpen(!open)}
          />
          <div className="filter-selects" id={SELECTS_ID}>
            <FilterSelect
              label="Country"
              value={filters.country}
              isSet={!!filters.country}
              options={countryOptions}
              onChange={(value) => update("country", value)}
            />
            <FilterSelect
              label="Theme"
              value={filters.appearance}
              isSet={filters.appearance !== "any"}
              options={APPEARANCE_OPTIONS}
              onChange={(value) => update("appearance", value)}
            />
            <FilterSelect
              label="Cloudflare"
              value={filters.cloudflare}
              isSet={filters.cloudflare !== "any"}
              options={CLOUDFLARE_OPTIONS}
              onChange={(value) => update("cloudflare", value)}
            />
          </div>
        </div>
        <FilterTabs
          id={TABS_ID}
          label="Status"
          value={filters.status}
          onSelect={(value) => update("status", value)}
          tabs={STATUS_FILTERS.map((status) => ({
            value: status,
            label: STATUS_LABELS[status],
            count: counts[status],
          }))}
        />
        {isFiltered(filters) && (
          <FilterSummary onClear={reset}>
            <b>{shown.toLocaleString()}</b> of{" "}
            {instances.length.toLocaleString()} instances
            {query ? ` matching "${query}"` : ""}
          </FilterSummary>
        )}
      </div>
    </div>
  );
};

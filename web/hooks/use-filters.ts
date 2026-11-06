import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FILTERS, type InstanceFilters } from "../lib/filter-instances";
import { readFilters, writeFilters } from "../lib/filter-params";

export interface FiltersApi {
  filters: InstanceFilters;
  update: <K extends keyof InstanceFilters>(
    key: K,
    value: InstanceFilters[K],
  ) => void;
  reset: () => void;
}

export const useFilters = (): FiltersApi => {
  const [filters, setFilters] = useState<InstanceFilters>(() =>
    readFilters(window.location.search),
  );

  useEffect(() => {
    const search = writeFilters(filters, window.location.search);
    if (search === window.location.search) return;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search}${window.location.hash}`,
    );
  }, [filters]);

  const update = useCallback(
    <K extends keyof InstanceFilters>(
      key: K,
      value: InstanceFilters[K],
    ): void => {
      setFilters((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const reset = useCallback((): void => setFilters(DEFAULT_FILTERS), []);

  return { filters, update, reset };
};

import type { JSX, KeyboardEvent } from "react";

export interface FilterTab<T extends string> {
  value: T;
  label: string;
  count: number;
}

interface FilterTabsProps<T extends string> {
  id: string;
  label: string;
  tabs: readonly FilterTab<T>[];
  value: T;
  onSelect: (value: T) => void;
}

export const FilterTabs = <T extends string>({
  id,
  label,
  tabs,
  value,
  onSelect,
}: FilterTabsProps<T>): JSX.Element => {
  const step = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const enabled = tabs.filter((tab) => tab.count > 0 || tab.value === value);
    const index = enabled.findIndex((tab) => tab.value === value);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = enabled[(index + delta + enabled.length) % enabled.length];
    if (!next) return;
    onSelect(next.value);
    document
      .getElementById(id)
      ?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)
      ?.focus();
  };

  return (
    <div className="filter-tabs" id={id} role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            className="filter-tab"
            data-value={tab.value}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={tab.count === 0 && !active}
            onClick={() => onSelect(tab.value)}
            onKeyDown={step}
          >
            {tab.label}
            <span className="filter-tab-count">
              {tab.count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

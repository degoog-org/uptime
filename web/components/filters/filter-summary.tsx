import type { JSX, ReactNode } from "react";

interface FilterSummaryProps {
  onClear: () => void;
  children: ReactNode;
}

export const FilterSummary = ({
  onClear,
  children,
}: FilterSummaryProps): JSX.Element => (
  <div className="filter-summary">
    <span className="filter-summary-text">{children}</span>
    <button type="button" className="settings-linkish" onClick={onClear}>
      Clear filters
    </button>
  </div>
);

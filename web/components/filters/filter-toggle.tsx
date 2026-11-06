import type { JSX } from "react";
import { Icon } from "../ui/icon";

interface FilterToggleProps {
  active: number;
  open: boolean;
  controls: string;
  onToggle: () => void;
}

export const FilterToggle = ({
  active,
  open,
  controls,
  onToggle,
}: FilterToggleProps): JSX.Element => (
  <button
    type="button"
    className={active ? "filter-toggle filter-toggle--set" : "filter-toggle"}
    aria-expanded={open}
    aria-controls={controls}
    onClick={onToggle}
  >
    <Icon name="fa-solid fa-sliders" />
    <span>Filters</span>
    <span className="filter-toggle-n">{active ? String(active) : ""}</span>
  </button>
);

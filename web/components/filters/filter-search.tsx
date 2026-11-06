import type { JSX } from "react";
import { Icon } from "../ui/icon";

interface FilterSearchProps {
  id: string;
  placeholder: string;
  value: string;
  onInput: (value: string) => void;
}

export const FilterSearch = ({
  id,
  placeholder,
  value,
  onInput,
}: FilterSearchProps): JSX.Element => (
  <label className="filter-search">
    <Icon name="fa-solid fa-magnifying-glass" />
    <input
      type="search"
      className="degoog-input"
      id={id}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      aria-label={placeholder}
      value={value}
      onChange={(event) => onInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !value) return;
        event.stopPropagation();
        onInput("");
      }}
    />
    <button
      type="button"
      className="filter-search-clear"
      aria-label="Clear search"
      hidden={!value}
      onClick={() => onInput("")}
    >
      <Icon name="fa-solid fa-xmark" />
    </button>
  </label>
);

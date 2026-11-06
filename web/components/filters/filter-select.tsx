import type { JSX } from "react";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  isSet: boolean;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
}

export const FilterSelect = <T extends string>({
  label,
  value,
  isSet,
  options,
  onChange,
}: FilterSelectProps<T>): JSX.Element => (
  <span
    className={
      isSet
        ? "degoog-select-wrap filter-select filter-select--set"
        : "degoog-select-wrap filter-select"
    }
  >
    <select
      className="degoog-select"
      aria-label={label}
      value={value}
      onChange={(event) =>
        onChange(
          options.find((option) => option.value === event.target.value)
            ?.value ?? value,
        )
      }
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </span>
);

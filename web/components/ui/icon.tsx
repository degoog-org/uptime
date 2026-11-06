import type { JSX } from "react";

interface IconProps {
  name: string;
  label?: string;
}

export const Icon = ({ name, label }: IconProps): JSX.Element =>
  label ? (
    <i className={name} aria-label={label} />
  ) : (
    <i className={name} aria-hidden="true" />
  );

import type { JSX, ReactNode } from "react";

interface StatProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const Stat = ({
  label,
  children,
  className = "",
}: StatProps): JSX.Element => (
  <div className="flex flex-col gap-0.5">
    <dt className="degoog-text degoog-text--sm degoog-text--secondary">
      {label}
    </dt>
    <dd className={`m-0 text-md font-medium tabular-nums ${className}`}>
      {children}
    </dd>
  </div>
);

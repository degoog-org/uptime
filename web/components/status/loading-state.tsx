import type { JSX } from "react";

const PLACEHOLDER_COUNT = 3;

export const LoadingState = (): JSX.Element => (
  <div
    className="flex flex-col gap-3"
    aria-busy="true"
    aria-label="Loading status"
  >
    {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
      <div
        key={index}
        className="degoog-panel degoog-panel--ext-card flex flex-col gap-3"
      >
        <div className="skeleton-line w-1/3" />
        <div className="skeleton-line h-8" />
      </div>
    ))}
  </div>
);

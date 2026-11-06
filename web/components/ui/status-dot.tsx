import type { JSX } from "react";
import { TONE_CLASSES, type StatusTone } from "../../lib/status-meta";

interface StatusDotProps {
  tone: StatusTone;
  size?: "sm" | "lg";
}

export const StatusDot = ({
  tone,
  size = "sm",
}: StatusDotProps): JSX.Element => {
  const dimensions = size === "lg" ? "size-3" : "size-2";
  return (
    <span
      className={`relative inline-flex shrink-0 ${dimensions}`}
      aria-hidden="true"
    >
      {tone === "success" && (
        <span
          className={`absolute inset-0 animate-ping rounded-full opacity-40 ${TONE_CLASSES[tone].dot}`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full ${dimensions} ${TONE_CLASSES[tone].dot}`}
      />
    </span>
  );
};

import type { JSX } from "react";
import type { UrlStatus } from "../../../src/shared/status";
import { describeIssue } from "../../lib/describe-issue";
import { TONE_CLASSES, metaFor } from "../../lib/status-meta";
import { StatusDot } from "../ui/status-dot";

interface IssueBadgeProps {
  check: UrlStatus | undefined;
}

export const IssueBadge = ({ check }: IssueBadgeProps): JSX.Element | null => {
  const issue = describeIssue(check);
  if (!issue || !check) return null;
  const meta = metaFor(check.status);
  return (
    <span
      className="degoog-badge degoog-badge--deps"
      data-tooltip={meta.description}
      data-tooltip-below=""
      data-tooltip-end=""
    >
      <span className="inline-flex items-center gap-1.5">
        <StatusDot tone={meta.tone} />
        <span className={TONE_CLASSES[meta.tone].text}>{issue}</span>
      </span>
    </span>
  );
};

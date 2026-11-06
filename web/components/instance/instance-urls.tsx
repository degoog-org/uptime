import type { JSX } from "react";
import type { UrlStatus } from "../../../src/shared/status";
import { describeIssue } from "../../lib/describe-issue";
import { formatLatency, toHost } from "../../lib/format";
import { TONE_CLASSES, metaFor } from "../../lib/status-meta";
import { StatusDot } from "../ui/status-dot";

interface InstanceUrlsProps {
  urls: readonly UrlStatus[];
}

export const InstanceUrls = ({ urls }: InstanceUrlsProps): JSX.Element => (
  <ul className="m-0 flex list-none flex-col gap-1 p-0">
    {urls.map((entry) => {
      const meta = metaFor(entry.status);
      const issue = describeIssue(entry);
      return (
        <li
          key={entry.url}
          className="degoog-text degoog-text--sm flex items-center gap-2"
        >
          <StatusDot tone={meta.tone} />
          <a href={entry.url} className="degoog-link truncate">
            {toHost(entry.url)}
          </a>
          <span
            className={`ml-auto shrink-0 tabular-nums ${issue ? TONE_CLASSES[meta.tone].text : "degoog-text--secondary"}`}
          >
            {issue ?? formatLatency(entry.latencyMs)}
          </span>
        </li>
      );
    })}
  </ul>
);

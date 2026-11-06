import type { JSX } from "react";
import type { InstanceStatus } from "../../../src/shared/status";
import { formatRelativeTime } from "../../lib/format";
import { UptimeBar } from "../charts/uptime-bar";
import { IssueBadge } from "../status/issue-badge";
import { InstanceTags } from "./instance-tags";
import { InstanceUrls } from "./instance-urls";
import { UptimeStats } from "./uptime-stats";

interface InstanceCardProps {
  instance: InstanceStatus;
  now: number;
}

export const InstanceCard = ({
  instance,
  now,
}: InstanceCardProps): JSX.Element => {
  const primaryUrl = instance.urls[0]?.url;

  return (
    <article className="degoog-panel degoog-panel--ext-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="settings-section-heading truncate">
            {primaryUrl ? (
              <a href={primaryUrl} className="degoog-link">
                {instance.name}
              </a>
            ) : (
              instance.name
            )}
          </h2>
          <InstanceTags instance={instance} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <IssueBadge check={instance.urls[0]} />
          {instance.lastCheckedAt && (
            <span className="degoog-text degoog-text--sm degoog-text--secondary">
              {formatRelativeTime(instance.lastCheckedAt, now)}
            </span>
          )}
        </div>
      </div>

      {instance.urls.length > 1 && <InstanceUrls urls={instance.urls} />}
      <UptimeBar daily={instance.daily} />
      <UptimeStats instance={instance} />
    </article>
  );
};

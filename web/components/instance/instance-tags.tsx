import type { JSX } from "react";
import type { InstanceStatus } from "../../../src/shared/status";
import { toFlagEmoji } from "../../lib/format";

interface InstanceTagsProps {
  instance: InstanceStatus;
}

export const InstanceTags = ({ instance }: InstanceTagsProps): JSX.Element => (
  <div className="flex flex-wrap gap-1.5">
    {instance.country && (
      <span className="degoog-badge degoog-badge--engine-type">
        {toFlagEmoji(instance.country)} {instance.country}
      </span>
    )}
    <span className="degoog-badge degoog-badge--engine-type">
      {instance.appearance === "custom"
        ? (instance.theme ?? "Custom theme")
        : "Default theme"}
    </span>
    {instance.cloudflare && (
      <span className="degoog-badge degoog-badge--engine-type">Cloudflare</span>
    )}
  </div>
);

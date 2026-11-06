import type { JSX } from "react";
import type { InstanceStatus } from "../../../src/shared/status";
import { InstanceCard } from "./instance-card";

interface InstanceListProps {
  instances: readonly InstanceStatus[];
  now: number;
}

export const InstanceList = ({
  instances,
  now,
}: InstanceListProps): JSX.Element => (
  <div className="flex flex-col gap-3">
    {instances.map((instance) => (
      <InstanceCard key={instance.id} instance={instance} now={now} />
    ))}
  </div>
);

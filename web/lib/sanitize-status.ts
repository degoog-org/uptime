import type { InstanceStatus, StatusDocument } from "../../src/shared/status";

const WEB_PROTOCOLS: ReadonlySet<string> = new Set(["http:", "https:"]);

export const isWebUrl = (value: string): boolean =>
  URL.canParse(value) && WEB_PROTOCOLS.has(new URL(value).protocol);

const _sanitizeInstance = (instance: InstanceStatus): InstanceStatus => ({
  ...instance,
  urls: instance.urls.filter((entry) => isWebUrl(entry.url)),
});

export const sanitizeStatus = (status: StatusDocument): StatusDocument => ({
  ...status,
  instances: status.instances.map(_sanitizeInstance),
});

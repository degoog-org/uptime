import { mkdirSync, renameSync } from "fs";
import { dirname } from "path";
import type { StatusDocument } from "../shared/status";

export const writeStatus = async (
  path: string,
  status: StatusDocument,
): Promise<void> => {
  mkdirSync(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await Bun.write(temporaryPath, JSON.stringify(status));
  renameSync(temporaryPath, path);
};

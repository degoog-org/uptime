import { mkdirSync, renameSync } from "fs";
import { dirname } from "path";

export const writeJson = async (
  path: string,
  value: unknown,
): Promise<void> => {
  mkdirSync(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await Bun.write(temporaryPath, JSON.stringify(value));
  renameSync(temporaryPath, path);
};

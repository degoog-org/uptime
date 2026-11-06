type LogLevel = "info" | "warn" | "error";

const _write = (level: LogLevel, scope: string, message: string): void => {
  const line = `${new Date().toISOString()} ${level.toUpperCase()} [${scope}] ${message}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

export const logger = {
  info: (scope: string, message: string): void =>
    _write("info", scope, message),
  warn: (scope: string, message: string): void =>
    _write("warn", scope, message),
  error: (scope: string, message: string): void =>
    _write("error", scope, message),
};

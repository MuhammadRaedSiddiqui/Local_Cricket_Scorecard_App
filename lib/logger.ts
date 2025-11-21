type LogLevel = "info" | "warn" | "error";

type Logger = {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

const logAtLevel: Record<LogLevel, (...args: unknown[]) => void> = {
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

export const logger: Logger = {
  info: (...args) => logAtLevel.info("[app]", ...args),
  warn: (...args) => logAtLevel.warn("[app]", ...args),
  error: (...args) => logAtLevel.error("[app]", ...args),
};

export function createLogger(prefix: string): Logger {
  const label = prefix ? `[${prefix}]` : "[app]";
  return {
    info: (...args) => logAtLevel.info(label, ...args),
    warn: (...args) => logAtLevel.warn(label, ...args),
    error: (...args) => logAtLevel.error(label, ...args),
  };
}

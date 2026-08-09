import pino, { Logger } from "pino";
import { PINO_TO_OTEL_SEVERITY } from "./constant";
import os from "node:os";

const isProduction = process.env.NODE_ENV === "production";

function buildDestination() {
  return pino.destination(1);
}

// ── Logger singleton ────────────────────────────────────────────────────────
const logger: Logger = pino(
  {
    // No logging at all in production — silent disables every level.
    level: isProduction ? "silent" : (process.env.LOG_LEVEL ?? "info"),
    base: {
      env: process.env.NODE_ENV,
      appId: "driftcharge-admin",
      hostname: os.hostname(),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label }; // ← add this
      },
      log(object) {
        return {
          ...object,
          createdAt: new Date((object as { time?: string }).time ?? Date.now()).toLocaleString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            },
          ),
        };
      },
    },
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "secret"],
      censor: "[REDACTED]",
    },
    mixin(_context, level) {
      return {
        severityNumber: PINO_TO_OTEL_SEVERITY[logger.levels.labels[level]] ?? 0,
        levelNumber: level,
      };
    },
  },
  buildDestination(),
);

export default logger;

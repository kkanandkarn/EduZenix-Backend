export interface LogPayload {
  message?: string;
  [key: string]: unknown;
}

export type LogArg = LogPayload | string;

export interface ChildLogger {
  debug(payload: LogArg, message?: string): void;
  info(payload: LogArg, message?: string): void;
  warn(payload: LogArg, message?: string): void;
  error(payload: LogArg, message?: string): void;
  child(bindings: LogPayload): ChildLogger;
}

export type ChildLog = ChildLogger;

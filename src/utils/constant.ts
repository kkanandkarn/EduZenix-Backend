export const SUCCESS = "success";
export const FAILURE = "failure";

export const DEFAULT_PAGE_NO = 1;
export const DEFAULT_PER_PAGE = 10;
export const MAX_PER_PAGE = 100;
export const INVITATION_LINK_EXPIRY_MS = 48 * 60 * 60 * 1000; // 24 hours

export const PINO_TO_OTEL_SEVERITY: Record<string, number> = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21,
};

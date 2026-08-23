import camelcaseKeys, { type ObjectLike } from "camelcase-keys";
import { ErrorHandler } from "../helper";
import logger from "./logger";
import { SERVER_ERROR } from "./status-codes";

export const camelize = <T = unknown>(obj: unknown): T => {
  const cloned = structuredClone(obj) as ObjectLike | readonly ObjectLike[];
  return camelcaseKeys(cloned, { deep: true }) as T;
};
export const throwError = (error: unknown): never => {
  const { statusCode, message, type } = extractErrorDetails(error);
  throw new ErrorHandler(statusCode, message, type);
};

export const extractErrorDetails = (
  error: unknown,
): { message: string; statusCode: number; type?: string } => {
  if (error instanceof ErrorHandler) {
    return {
      message: error.message,
      statusCode: error.statusCode ?? SERVER_ERROR,
      type: error.type ?? "apiError",
    };
  }

  if (error instanceof Error) {
    console.log("❌ SERVER ERROR: ", error);
    logger.error({ error });
    return {
      message: "Something went wrong. Please try again later",
      statusCode: SERVER_ERROR,
      type: "serverError",
    };
  }

  if (typeof error === "string") {
    logger.error({ error }, "❌ SERVER ERROR");
    return {
      message: "Something went wrong. Please try again later",
      statusCode: SERVER_ERROR,
      type: "serverError",
    };
  }
  logger.error({ error }, "❌ SERVER ERROR");
  return {
    message: "Something went wrong. Please try again later",
    statusCode: SERVER_ERROR,
    type: "serverError",
  };
};

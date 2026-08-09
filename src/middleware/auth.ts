import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ErrorHandler } from "../helper";
import { UNAUTHORIZED } from "../utils/status-codes";
import { RequestUser } from "../types/express";

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "";
};

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  let user: RequestUser = {
    isAuth: false,
    ip,
    userId: "",
    roleId: "",
  };
  req.user = user;
  const token = req.cookies?.access_token;
  if (!token || token == "null" || token == null) return next();

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(err);
  }

  if (!decoded) return next();

  user = { ...user, isAuth: true, ...decoded };
  req.user = user;
  return next();
};

export const authValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAuth) {
    throw new ErrorHandler(UNAUTHORIZED, "You are not authenticated", "tokenExpiredError");
  }
  return next();
};

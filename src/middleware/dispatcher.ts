import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../helper";
import { FORBIDDEN, OK } from "../utils/status-codes";
import { SUCCESS } from "../utils/constant";
import { camelize } from "../utils/helper";

export type ControllerFunc = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Record<string, any> | void> | Record<string, any> | void;

const checkPermission = async (
  user: any,
  resource: string | null,
  perm: string | null,
): Promise<void> => {
  if (!resource || !perm) return;

  //   const enforcer = await casbinEnforcer;
  //   const allowed = await enforcer.enforce(
  //     user.userId,
  //     resource,
  //     perm,
  //     user.roleKey,
  //   );

  //   if (!allowed) {
  //     throw new ErrorHandler(
  //       FORBIDDEN,
  //       "You do not have permission for this Action",
  //     );
  //   }
};

const sendExport = (req: Request, res: Response, data: Record<string, any>) => {
  const fileName = req.body?.fileName || "report.xlsx";
  const payload = data.data ?? data;
  return (res as any).xls(fileName, payload);
};

const sendSuccess = (res: Response, data: Record<string, any>) => {
  return res.status(OK).json({ status: SUCCESS, data: camelize(data) });
};

const dispatcher = async (
  req: Request,
  res: Response,
  next: NextFunction,
  func: ControllerFunc,
  resource: string | null = null,
  perm: string | null = null,
): Promise<Response | void> => {
  try {
    const { user } = req as Request & { user: any };

    await checkPermission(user, resource, perm);

    const data = await func(req, res, next);

    if (!data) return;

    if (req?.body?.export) {
      return sendExport(req, res, data);
    }

    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export default dispatcher;

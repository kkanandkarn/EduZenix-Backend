import type { NextFunction, Request, Response } from "express";
import { FORBIDDEN, OK } from "../utils/status-codes";
import { SUCCESS } from "../utils/constant";
import { camelize } from "../utils/helper";
import { RequestUser } from "../types/express";
import { prisma } from "../config";
import { ErrorHandler } from "../helper";

export type ControllerFunc = (
  req: Request,
  res: Response,
  next: NextFunction,
) =>
  Promise<Record<string, unknown> | unknown[] | void> | Record<string, unknown> | unknown[] | void;

interface DispatcherRequestBody {
  fileName?: string;
  export?: boolean;
  [key: string]: unknown;
}

interface ExportableResponse extends Response {
  xls: (fileName: string, payload: unknown) => Response;
}

const sendExport = (req: Request, res: Response, data: Record<string, unknown> | unknown[]) => {
  const body = req.body as DispatcherRequestBody | undefined;
  const fileName = body?.fileName || "report.xlsx";
  const payload = Array.isArray(data)
    ? data
    : ((data.data as Record<string, unknown> | undefined) ?? data);
  return (res as ExportableResponse).xls(fileName, payload);
};

const sendSuccess = (res: Response, data: Record<string, unknown> | unknown[]) => {
  return res.status(OK).json({ status: SUCCESS, data: camelize(data) });
};
const checkPermission = async (
  user: RequestUser,
  resource: string,
  perm: string,
): Promise<boolean> => {
  const rolePermission = await prisma.globalRolePermissions.findFirst({
    where: {
      roleId: user.roleId,
      status: "ACTIVE", // role-permission mapping active honi chahiye
      permission: {
        permissionName: perm,
        parent: resource,
        status: "ACTIVE", // permission master me bhi active honi chahiye
      },
    },
    select: { id: true },
  });

  return rolePermission !== null;
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
    if (resource && perm) {
      const isPermitted = await checkPermission(req.user, resource, perm);
      if (!isPermitted)
        throw new ErrorHandler(FORBIDDEN, "You do not have permission to perform this action");
    }
    const data = await func(req, res, next);

    if (!data) return;

    const body = req.body as DispatcherRequestBody | undefined;

    if (body?.export) {
      return sendExport(req, res, data);
    }

    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export default dispatcher;

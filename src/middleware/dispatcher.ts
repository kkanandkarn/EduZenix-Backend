import type { NextFunction, Request, Response } from "express";
import { OK } from "../utils/status-codes";
import { SUCCESS } from "../utils/constant";
import { camelize } from "../utils/helper";

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
const dispatcher = async (
  req: Request,
  res: Response,
  next: NextFunction,
  func: ControllerFunc,
  _resource: string | null = null,
  _perm: string | null = null,
): Promise<Response | void> => {
  try {
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

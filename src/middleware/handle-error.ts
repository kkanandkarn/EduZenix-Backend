import { Response } from "express";
import { BAD_REQUEST } from "../utils/status-codes";
import { FAILURE } from "../utils/constant";
import { ErrorHandler } from "../helper";

const handleError = (err: ErrorHandler, res: Response): void => {
  const { statusCode = BAD_REQUEST, message, type } = err;
  res.status(statusCode).json({
    status: FAILURE,
    statusCode,
    message,
    type,
  });
};

export default handleError;

import { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "../utils/constants";
import { logger } from "../configs/logger";
import { CustomError } from "../utils/CustomError";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let customError: CustomError;

  if (error instanceof CustomError) {
    customError = error;
  } else {
    customError = new CustomError(
      ResponseStatus.InternalServerError,
      error.message || "Internal Server Error"
    );
  }

  logger.error(customError.message);

  res.status(customError.statusCode).json({
    statusCode: customError.statusCode,
    message: customError.message,
    data: customError.data,
    success: customError.success,
  });
};

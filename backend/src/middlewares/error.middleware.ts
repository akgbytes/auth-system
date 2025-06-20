import { Request, Response, NextFunction } from "express";
import { logger } from "../configs/logger";
import { CustomError } from "../utils/CustomError";
import { Prisma } from "../generated/prisma";
import { MulterError } from "multer";

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  let customError: CustomError;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        customError = new CustomError(
          409,
          `${(error.meta?.target as string[] | undefined)?.join(", ") || "Field"} already exists`,
        );
        break;

      case "P2025":
        customError = new CustomError(404, `${error.meta?.modelName || "Resource"} not found`);
        break;

      case "P2003":
        customError = new CustomError(
          400,
          `Foreign key constraint failed on ${error.meta?.field_name || "a related field"}.`,
        );
        break;
      default:
        customError = new CustomError(400, "Database request error");
        break;
    }
  } else if (error instanceof MulterError) {
    let message = "File upload error";
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File too large. Maximum size allowed is 2MB.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Too many files. Only 1 file is allowed.";
        break;
    }

    customError = new CustomError(400, message);
  } else if (error instanceof CustomError) {
    customError = error;
  } else {
    customError = new CustomError(500, error.message || "Internal Server Error");
  }

  logger.error(customError.message, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: customError.stack || "",
  });

  res.status(customError.statusCode).json({
    code: customError.statusCode,
    message: customError.message,
    data: customError.data,
    success: customError.success,
  });
};

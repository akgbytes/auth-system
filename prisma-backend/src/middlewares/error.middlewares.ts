import { Request, Response, NextFunction } from "express";
import { ResponseStatus } from "../utils/constants";
import { logger } from "../configs/logger";
import { CustomError } from "../utils/CustomError";
import { Prisma } from "../generated/prisma";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let customError: CustomError;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        customError = new CustomError(
          ResponseStatus.Conflict,
          `${
            (error.meta?.target as string[] | undefined)?.join(", ") || "Field"
          } already exists`
        );
        break;

      case "P2025":
        console.log(error);
        customError = new CustomError(
          ResponseStatus.NotFound,
          `${error.meta?.modelName || "Resource"} not found`
        );
        break;

      case "P2003":
        customError = new CustomError(
          ResponseStatus.BadRequest,
          `Foreign key constraint failed on ${
            error.meta?.field_name || "a related field"
          }.`
        );
        break;
      default:
        customError = new CustomError(
          ResponseStatus.BadRequest,
          "Database request error"
        );
        break;
    }
  } else if (error instanceof CustomError) {
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

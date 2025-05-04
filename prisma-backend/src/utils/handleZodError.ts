import { SafeParseReturnType } from "zod";
import { CustomError } from "./CustomError";
import { ResponseStatus } from "./constants";

export const handleZodError = <T>(
  result: SafeParseReturnType<unknown, T>
): T => {
  if (!result.success) {
    const missing =
      result.error.issues[0].code === "invalid_type" &&
      result.error.issues[0].received === "undefined";

    if (missing) {
      if (result.error.issues[0].path.length) {
        throw new CustomError(
          ResponseStatus.InternalServerError,
          `Missing ${result.error.issues[0].path} field`
        );
      } else {
        throw new CustomError(
          ResponseStatus.InternalServerError,
          `Missing required field`
        );
      }
    }

    throw new CustomError(
      ResponseStatus.BadRequest,
      result.error.issues[0].message
    );
  }

  return result.data;
};

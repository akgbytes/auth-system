import { SafeParseReturnType } from "zod";
import { CustomError } from "./CustomError";
import { ResponseStatus } from "./constants";

export const handleZodError = <T>(result: SafeParseReturnType<unknown, T>): T => {
  if (!result.success) {
    const firstIssue = result.error.issues[0];

    if (firstIssue.code === "invalid_type" && firstIssue.received === "undefined") {
      if (firstIssue.path.length) {
        throw new CustomError(ResponseStatus.BadRequest, `Missing ${firstIssue.path} field`);
      } else {
        throw new CustomError(ResponseStatus.BadRequest, "Missing required field");
      }
    }

    throw new CustomError(ResponseStatus.UnprocessableEntity, firstIssue.message);
  }

  return result.data;
};

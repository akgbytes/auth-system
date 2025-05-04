import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ResponseStatus } from "../utils/constants";

export const healthCheck = (req: Request, res: Response) => {
  res
    .status(ResponseStatus.Success)
    .json(new ApiResponse(ResponseStatus.Success, "Health check passed", null));
};

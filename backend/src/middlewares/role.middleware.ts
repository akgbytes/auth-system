import asyncHandler from "../utils/asyncHandler";
import { CustomError } from "../utils/CustomError";

export const isAdmin = asyncHandler(async (req, res, next) => {
  const { role } = req.user;

  if (role !== "admin") {
    throw new CustomError(403, "Access denied. Admins only.");
  }

  next();
});

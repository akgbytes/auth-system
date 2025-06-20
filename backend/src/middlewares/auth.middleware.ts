import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { env } from "../configs/env";
import { decodedUser } from "../types";

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const { accessToken } = req.cookies;

  if (!accessToken) throw new CustomError(401, "Access token missing");

  try {
    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
    req.user = decoded as decodedUser;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new CustomError(401, error.name);
    }
    throw new CustomError(401, "Invalid or expired access token");
  }
};

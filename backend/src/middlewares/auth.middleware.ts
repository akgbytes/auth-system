import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/CustomError";
import jwt from "jsonwebtoken";
import { env } from "../configs/env";
import { decodedUser } from "../types";

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies?.accessToken ?? req.headers.authorization?.split(" ")[1];

  if (!accessToken) throw new CustomError(401, "Access token missing");

  try {
    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
    req.user = decoded as decodedUser;
    next();
  } catch (error) {
    throw new CustomError(401, "Invalid or expired access token");
  }
};

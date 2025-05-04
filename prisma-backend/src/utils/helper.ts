import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../configs/env";
import { StringValue } from "ms";

export const hashPassword = async (password: string) =>
  await bcrypt.hash(password, 10);

export const isPasswordCorrect = async (
  enteredPassword: string,
  storedPassword: string
) => bcrypt.compare(enteredPassword, storedPassword);

export const generateAccessToken = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY as StringValue }
  );

export const generateRefreshToken = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY as StringValue }
  );

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateToken = () => {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(unHashedToken);
  const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

  return { unHashedToken, hashedToken, tokenExpiry };
};

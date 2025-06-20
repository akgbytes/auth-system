import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../configs/env";
import { StringValue } from "ms";
import { decodedUser } from "../types";

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

export const passwordMatch = async (enteredPassword: string, storedPassword: string) =>
  bcrypt.compare(enteredPassword, storedPassword);

export const generateAccessToken = (user: decodedUser) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY as StringValue },
  );

export const generateRefreshToken = (user: decodedUser) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY as StringValue },
  );

export const createHash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateToken = () => {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = createHash(unHashedToken);
  const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const capitalize = (name: string) =>
  name
    .toLowerCase()
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
    .join(" ");

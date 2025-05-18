import ms, { StringValue } from "ms";
import { env } from "./env";

export const accessTokenOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: ms(env.ACCESS_TOKEN_EXPIRY as StringValue),
};

export const refreshTokenOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: ms(env.REFRESH_TOKEN_EXPIRY as StringValue),
};

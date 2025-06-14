import ms, { StringValue } from "ms";
import { env } from "./env";

interface CookieOptionsArgs {
  rememberMe?: boolean;
  type: "access" | "refresh";
}

export function generateCookieOptions({ type, rememberMe = false }: CookieOptionsArgs) {
  const expiry =
    type === "access"
      ? env.ACCESS_TOKEN_EXPIRY
      : rememberMe
        ? env.REFRESH_TOKEN_EXPIRY_REMEMBER_ME
        : env.REFRESH_TOKEN_EXPIRY;

  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: ms(expiry as StringValue),
  };
}
